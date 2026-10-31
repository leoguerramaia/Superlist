// ======================================================
// SUPERLIST - INTEGRAÇÃO COM SUPABASE
// Utilize somente a chave pública (anon/publishable).
// Nunca coloque a service_role key neste arquivo.
// ======================================================

window.SUPERLIST_CONFIG = {
  supabaseUrl: "https://frhbocaxymxviltuvmox.supabase.co",
  supabaseAnonKey: "sb_publishable_v0q_4StRh2H7b9M1pLVZ3w_4xUQKZUP",
};

(function () {
  "use strict";

  const cfg = window.SUPERLIST_CONFIG;

  let client = null;
  let householdId = null;
  let timer = null;
  let callback = null;
  let app = null;
  let channel = null;
  let syncing = false;
  let onlineMembers = 0;
  let currentUser = null;
  let authListener = null;

  const localKey = "superlist-v1";

  // ------------------------------------------------------
  // CONFIGURAÇÃO
  // ------------------------------------------------------

  function configured() {
    return Boolean(
      cfg &&
      cfg.supabaseUrl &&
      cfg.supabaseUrl.startsWith("https://") &&
      cfg.supabaseAnonKey &&
      cfg.supabaseAnonKey.length > 20 &&
      !cfg.supabaseAnonKey.includes("COLE_AQUI")
    );
  }

  function emit(label, state = "") {
    if (typeof callback === "function") {
      callback({
        label,
        state,
        onlineMembers,
        userEmail: currentUser ? currentUser.email : null
      });
    }
  }

  function status() {
    if (!client) {
      return "Configure o Supabase para ativar a nuvem";
    }

    if (currentUser) {
      return "Conectado como " + currentUser.email;
    }

    return "Supabase conectado — entre para sincronizar";
  }

  function onStatus(fn) {
    callback = fn;

    emit(
      currentUser
        ? "Conectado como " + currentUser.email
        : "Entre para sincronizar",
      currentUser ? "online" : ""
    );
  }

  // ------------------------------------------------------
  // IDENTIFICAÇÃO DO USUÁRIO
  // ------------------------------------------------------

  async function refreshUser() {
    if (!client) {
      currentUser = null;
      return null;
    }

    const {
      data: { user },
      error
    } = await client.auth.getUser();

    if (error) throw error;

    currentUser = user || null;

    return currentUser;
  }

  // ------------------------------------------------------
  // IDENTIFICAÇÃO DO ESPAÇO DA FAMÍLIA
  // ------------------------------------------------------

  async function requireHousehold() {
    const user = await refreshUser();

    if (!user) {
      throw new Error("Faça login primeiro.");
    }

    const { data: members, error } = await client
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .limit(1);

    if (error) throw error;

    if (members && members.length > 0) {
      householdId = members[0].household_id;
      return householdId;
    }

    const { data: house, error: houseError } = await client
      .from("households")
      .insert({
        name: "Minha casa",
        owner_id: user.id
      })
      .select("id")
      .single();

    if (houseError) throw houseError;

    const { error: memberError } = await client
      .from("household_members")
      .insert({
        household_id: house.id,
        user_id: user.id,
        role: "owner"
      });

    if (memberError) throw memberError;

    householdId = house.id;

    return householdId;
  }

  // ------------------------------------------------------
  // CARREGAR DADOS DA NUVEM
  // ------------------------------------------------------

  async function loadIntoApp() {
    if (!client) return;

    const {
      data: { session },
      error: sessionError
    } = await client.auth.getSession();

    if (sessionError) throw sessionError;

    if (!session) {
      currentUser = null;
      householdId = null;

      emit("Entre para sincronizar", "");

      return;
    }

    currentUser = session.user;

    emit("Preparando sincronização", "pending");

    try {
      await requireHousehold();

      const { data, error } = await client
        .from("household_snapshots")
        .select("data,updated_at")
        .eq("household_id", householdId)
        .maybeSingle();

      if (error) throw error;

      if (data && data.data && app && app.setData) {
        app.setData(data.data);

        emit("Sincronizado", "online");

      } else {
        emit("Preparando primeira sincronização", "pending");

        await syncNow();
      }

      await subscribe();

      emit("Sincronizado", "online");

    } catch (error) {
      emit("Erro na sincronização", "pending");

      console.error("Erro ao carregar dados:", error);

      throw error;
    }
  }

  // ------------------------------------------------------
  // SINCRONIZAÇÃO
  // ------------------------------------------------------

  async function syncNow(data) {
    if (!client || !householdId || syncing) return;

    const {
      data: { session },
      error: sessionError
    } = await client.auth.getSession();

    if (sessionError) throw sessionError;

    if (!session) return;

    syncing = true;

    emit("Sincronizando…", "pending");

    try {
      const snapshot = data ||
        (
          app && app.getData
            ? app.getData()
            : JSON.parse(
                localStorage.getItem(localKey) || "{}"
              )
        );

      const { error } = await client
        .from("household_snapshots")
        .upsert(
          {
            household_id: householdId,
            data: snapshot,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: "household_id"
          }
        );

      if (error) throw error;

      if (channel) {
        await channel.send({
          type: "broadcast",
          event: "snapshot",
          payload: {
            data: snapshot,
            updated_at: new Date().toISOString()
          }
        });
      }

      emit(
        onlineMembers > 1
          ? `Compartilhado · ${onlineMembers} online`
          : "Sincronizado",
        "online"
      );

    } catch (error) {
      emit("Erro ao sincronizar", "pending");

      console.error("Erro na sincronização:", error);

    } finally {
      syncing = false;
    }
  }

  function scheduleSync(data) {
    if (!client || !householdId) return;

    emit("Alterações pendentes…", "pending");

    clearTimeout(timer);

    timer = setTimeout(() => {
      syncNow(data);
    }, 900);
  }

  // ------------------------------------------------------
  // SINCRONIZAÇÃO EM TEMPO REAL
  // ------------------------------------------------------

  async function subscribe() {
    if (!client || !householdId) return;

    if (channel) {
      await client.removeChannel(channel);
      channel = null;
    }

    const user = await refreshUser();

    channel = client.channel(
      "household-" + householdId,
      {
        config: {
          presence: {
            key: user?.id || "member"
          }
        }
      }
    );

    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "household_snapshots",
          filter: "household_id=eq." + householdId
        },
        payload => {
          if (syncing) return;

          const remote = payload.new && payload.new.data;

          if (remote && app && app.setData) {
            app.setData(remote);

            emit("Atualizado em tempo real", "online");
          }
        }
      )

      .on(
        "broadcast",
        {
          event: "snapshot"
        },
        payload => {
          if (syncing) return;

          const remote =
            payload.payload && payload.payload.data;

          if (remote && app && app.setData) {
            app.setData(remote);

            emit("Lista atualizada ao vivo", "online");
          }
        }
      )

      .on(
        "presence",
        {
          event: "sync"
        },
        () => {
          const state = channel.presenceState();

          onlineMembers = Object.keys(state).length;

          emit(
            onlineMembers > 1
              ? `Compartilhado · ${onlineMembers} online`
              : "Sincronizado · só você online",
            "online"
          );
        }
      );

    channel.subscribe(async status => {
      if (status === "SUBSCRIBED") {
        const user = await refreshUser();

        await channel.track({
          user_id: user?.id || "member",
          online_at: new Date().toISOString()
        });
      }

      if (status === "CHANNEL_ERROR") {
        console.error("Erro no canal de sincronização.");
      }
    });
  }

  // ------------------------------------------------------
  // AUTENTICAÇÃO
  // ------------------------------------------------------

  async function signIn(email, password) {
    if (!client) {
      throw new Error("Supabase não está inicializado.");
    }

    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) throw error;

    currentUser = data.user;

    emit("Login realizado", "online");

    await loadIntoApp();

    return data;
  }

  async function signUp(email, password) {
    if (!client) {
      throw new Error("Supabase não está inicializado.");
    }

    if (!email || !password) {
      throw new Error("Informe o e-mail e a senha.");
    }

    if (password.length < 6) {
      throw new Error("A senha precisa ter pelo menos 6 caracteres.");
    }

    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password
    });

    if (error) throw error;

    if (data.user && data.session) {
      currentUser = data.user;
      await loadIntoApp();
    }

    return data;
  }

  async function signOut() {
    if (!client) return;

    const { error } = await client.auth.signOut();

    if (error) throw error;

    currentUser = null;
    householdId = null;
    onlineMembers = 0;

    clearTimeout(timer);

    if (channel) {
      await client.removeChannel(channel);
      channel = null;
    }

    emit("Somente neste dispositivo", "");
  }

  // ------------------------------------------------------
  // CONVITES E COMPARTILHAMENTO
  // ------------------------------------------------------

  async function getInviteCode() {
    if (!client || !householdId) {
      throw new Error("Entre em um espaço primeiro.");
    }

    const { data, error } = await client
      .from("households")
      .select("invite_code")
      .eq("id", householdId)
      .single();

    if (error) throw error;

    return data.invite_code;
  }

  async function join(code) {
    if (!client) {
      throw new Error("Supabase não está inicializado.");
    }

    const user = await refreshUser();

    if (!user) {
      throw new Error("Faça login primeiro.");
    }

    const { data, error } = await client.rpc(
      "join_household",
      {
        invite_code_input: code
      }
    );

    if (error) throw error;

    householdId = data;

    // O app.js chama loadIntoApp() depois de join().
    return data;
  }

  // ======================================================
  // FOTOS DOS PRODUTOS - SUPABASE STORAGE
  // ======================================================

  async function uploadProductPhoto(file) {
    if (!client) {
      throw new Error("Supabase não inicializado.");
    }

    if (!file || !file.type.startsWith("image/")) {
      throw new Error("Selecione uma imagem válida.");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("A imagem deve ter no máximo 5 MB.");
    }

    const house = await requireHousehold();
    const user = await refreshUser();

    const extension = (
      file.type.split("/")[1] || "jpg"
    ).replace("jpeg", "jpg");

    const filePath =
      `${house}/${user.id}/${Date.now()}-${Math.random()
        .toString(36).slice(2)}.${extension}`;

    const { data, error } = await client.storage
      .from("produtos")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) throw error;

    return data.path;
  }

  async function getProductPhotoUrl(path) {
    if (!client || !path) return "";

    const { data, error } = await client.storage
      .from("produtos")
      .createSignedUrl(path, 3600);

    if (error) {
      console.error("Erro ao carregar foto:", error);
      return "";
    }

    return data.signedUrl;
  }

  async function deleteProductPhoto(path) {
    if (!client || !path) return;

    const { error } = await client.storage
      .from("produtos")
      .remove([path]);

    if (error) throw error;
  }

  // ------------------------------------------------------
  // INICIALIZAÇÃO
  // ------------------------------------------------------

  async function boot(appApi) {
    app = appApi;

    if (!configured()) {
      emit("Somente neste dispositivo", "");
      return;
    }

    if (
      !window.supabase ||
      !window.supabase.createClient
    ) {
      emit("Biblioteca Supabase indisponível", "pending");

      console.error("Biblioteca Supabase não foi carregada.");

      return;
    }

    try {
      client = window.supabase.createClient(
        cfg.supabaseUrl,
        cfg.supabaseAnonKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      );

      // Atualiza o estado visual quando a sessão muda.
      // O carregamento inicial é feito logo abaixo,
      // evitando duas cargas simultâneas no início.

      authListener = client.auth.onAuthStateChange(
        (event, session) => {
          currentUser = session?.user || null;

          if (event === "SIGNED_OUT" || !session) {
            householdId = null;
            onlineMembers = 0;
            clearTimeout(timer);

            if (channel) {
              client.removeChannel(channel);
              channel = null;
            }

            emit("Entre para sincronizar", "");

            return;
          }

          emit(
            currentUser
              ? "Conectado como " + currentUser.email
              : "Entre para sincronizar",
            currentUser ? "online" : ""
          );
        }
      );

      const {
        data: { session },
        error
      } = await client.auth.getSession();

      if (error) throw error;

      if (session) {
        currentUser = session.user;
        await loadIntoApp();

      } else {
        currentUser = null;
        emit("Entre para sincronizar", "");
      }

      window.addEventListener("online", () => {
        if (app && householdId) {
          syncNow().catch(console.error);
        }
      });

      window.addEventListener("offline", () => {
        emit("Offline — dados salvos neste dispositivo", "pending");
      });

      console.log("Superlist Cloud inicializado.");

    } catch (error) {
      client = null;
      currentUser = null;

      emit("Erro ao conectar ao Supabase", "pending");

      console.error(
        "Falha na inicialização do Supabase:",
        error
      );
    }
  }

  // ------------------------------------------------------
  // API DISPONÍVEL PARA O APP.JS
  // ------------------------------------------------------

  window.SuperlistCloud = {
    boot,
    status,
    signIn,
    signUp,
    signOut,
    join,
    getInviteCode,
    scheduleSync,
    onStatus,
    loadIntoApp,

    getCurrentUser() {
      return currentUser;
    }
  };

})();
