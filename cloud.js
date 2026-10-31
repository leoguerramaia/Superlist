
// SUPERLIST - Configuração Supabase
// Utilize somente a chave pública (anon).
// Nunca coloque a service_role key neste arquivo.

window.SUPERLIST_CONFIG = {
  supabaseUrl: "https://frhbocaxymviltuvmox.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyaGJvY2F4eW14dmlsdHV2b3giLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc5MzQzMTM3OCwiZXhwIjoyMTA5MDA3Mzc4fQ.qjbLMwYzDOi3fqItGyL2yT2SX9E4YsylSvMD3yrFsgs"
};

(function () {
  const cfg = window.SUPERLIST_CONFIG;

  let client = null;
  let householdId = null;
  let timer = null;
  let callback = null;
  let app = null;
  let channel = null;
  let syncing = false;
  let onlineMembers = 0;

  const configured = () =>
    cfg.supabaseUrl &&
    cfg.supabaseUrl.startsWith("https://") &&
    cfg.supabaseAnonKey &&
    cfg.supabaseAnonKey.length > 30;

  const emit = (label, state = "") => {
    if (callback) callback({ label, state, onlineMembers });
  };

  const localKey = "superlist-v1";

  function status() {
    return client
      ? "Supabase conectado — entre para sincronizar"
      : "Configure o Supabase para ativar a nuvem";
  }

  async function requireHousehold() {
    const { data: { user } } = await client.auth.getUser();

    if (!user) throw new Error("Faça login primeiro.");

    const { data: members, error } = await client
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .limit(1);

    if (error) throw error;

    if (members && members.length) {
      householdId = members[0].household_id;
      return householdId;
    }

    const { data: house, error: e1 } = await client
      .from("households")
      .insert({
        name: "Minha casa",
        owner_id: user.id
      })
      .select("id")
      .single();

    if (e1) throw e1;

    const { error: e2 } = await client
      .from("household_members")
      .insert({
        household_id: house.id,
        user_id: user.id,
        role: "owner"
      });

    if (e2) throw e2;

    householdId = house.id;
    return householdId;
  }

  async function loadIntoApp() {
    if (!client) return;

    const { data: { session } } = await client.auth.getSession();

    if (!session) {
      emit("Entre para sincronizar", "");
      return;
    }

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
        emit("Preparando sincronização", "pending");
        await syncNow();
      }

      subscribe();
      emit("Sincronizado", "online");

    } catch (e) {
      emit("Erro na sincronização", "pending");
      console.error(e);
    }
  }

  async function syncNow(data) {
    if (!client || !householdId || syncing) return;

    const { data: { session } } = await client.auth.getSession();

    if (!session) return;

    syncing = true;
    emit("Sincronizando…", "pending");

    try {
      const snapshot = data ||
        (app && app.getData
          ? app.getData()
          : JSON.parse(localStorage.getItem(localKey) || "{}"));

      const { error } = await client
        .from("household_snapshots")
        .upsert({
          household_id: householdId,
          data: snapshot,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "household_id"
        });

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

    } catch (e) {
      emit("Offline — aguardando conexão", "pending");
      console.warn(e);

    } finally {
      syncing = false;
    }
  }

  function scheduleSync(data) {
    if (!client || !householdId) return;

    emit("Alterações pendentes…", "pending");

    clearTimeout(timer);

    timer = setTimeout(() => syncNow(data), 900);
  }

  async function subscribe() {
    if (!client || !householdId) return;

    if (channel) {
      client.removeChannel(channel);
    }

    const { data: { user: currentUser } } =
      await client.auth.getUser();

    channel = client
      .channel("household-" + householdId, {
        config: {
          presence: {
            key: currentUser?.id ||
              ("guest-" + Math.random().toString(36).slice(2))
          }
        }
      })

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
        { event: "snapshot" },
        payload => {
          if (syncing) return;

          const remote = payload.payload && payload.payload.data;

          if (remote && app && app.setData) {
            app.setData(remote);
            emit("Lista atualizada ao vivo", "online");
          }
        }
      )

      .on(
        "presence",
        { event: "sync" },
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
      )

      .subscribe(async status => {
        if (status === "SUBSCRIBED") {
          const { data: { user } } = await client.auth.getUser();

          await channel.track({
            user_id: user?.id || "member",
            online_at: new Date().toISOString()
          });
        }
      });
  }

  async function signIn(email, password) {
    if (!client) {
      throw new Error("Configure o Supabase primeiro.");
    }

    const { error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    await loadIntoApp();
  }

  async function signUp(email, password) {
    if (!client) {
      throw new Error("Configure o Supabase primeiro.");
    }

    const { error } = await client.auth.signUp({
      email,
      password
    });

    if (error) throw error;
  }

  async function signOut() {
    if (!client) return;

    await client.auth.signOut();

    householdId = null;

    if (channel) {
      client.removeChannel(channel);
    }

    emit("Somente neste dispositivo", "");
  }

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
      throw new Error("Configure o Supabase primeiro.");
    }

    const { data, error } = await client.rpc(
      "join_household",
      { invite_code_input: code }
    );

    if (error) throw error;

    householdId = data;

    await loadIntoApp();
  }

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
      return;
    }

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

    const { data: { session } } = await client.auth.getSession();

    if (session) {
      await loadIntoApp();
    } else {
      emit("Entre para sincronizar", "");
    }

    client.auth.onAuthStateChange((event, session) => {
      if (session && event !== "TOKEN_REFRESHED") {
        setTimeout(loadIntoApp, 0);
      } else if (!session) {
        householdId = null;
        emit("Entre para sincronizar", "");
      }
    });

    window.addEventListener("online", () => {
      if (app && householdId) syncNow();
    });

    window.addEventListener("offline", () => {
      emit("Offline — dados salvos neste dispositivo", "pending");
    });
  }

  window.SuperlistCloud = {
    boot,
    status,
    signIn,
    signUp,
    signOut,
    join,
    getInviteCode,
    scheduleSync,
    onStatus(fn) {
      callback = fn;
    },
    loadIntoApp
  };

})();
// Configure these values with your Supabase project (Project Settings > API).
// Never place the service_role key in browser code. Use only the anon/public key.
window.SUPERLIST_CONFIG = window.SUPERLIST_CONFIG || {
  supabaseUrl: "https://frhbocaxymxviltuvmox.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyaGJvY2F4eW14dmlsdHV2bW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MzEzNzgsImV4cCI6MjEwOTAwNzM3OH0.qjbLMwYzDOi3fqItGyL2yT2SX9E4YsylSvMD3yrFsgs",
};

(function(){
  const cfg=window.SUPERLIST_CONFIG;
  let client=null, householdId=null, timer=null, callback=null, app=null, channel=null, syncing=false, onlineMembers=0;
  const configured=()=>cfg.supabaseUrl&&!cfg.supabaseUrl.includes('YOUR_PROJECT')&&cfg.supabaseAnonKey&&!cfg.supabaseAnonKey.includes('YOUR_SUPABASE');
  const emit=(label,state='')=>{if(callback)callback({label,state,onlineMembers})};
  const localKey='superlist-v1';
  function status(){return client?'Supabase conectado — entre para sincronizar':'Configure o Supabase para ativar a nuvem'}
  async function requireHousehold(){
    const {data:{user}}=await client.auth.getUser();if(!user)throw new Error('Faça login primeiro.');
    const {data:members,error}=await client.from('household_members').select('household_id').eq('user_id',user.id).limit(1);
    if(error)throw error;
    if(members&&members.length){householdId=members[0].household_id;return householdId}
    const {data:house,error:e1}=await client.from('households').insert({name:'Minha casa',owner_id:user.id}).select('id').single();if(e1)throw e1;
    const {error:e2}=await client.from('household_members').insert({household_id:house.id,user_id:user.id,role:'owner'});if(e2)throw e2;
    householdId=house.id;return householdId;
  }
  async function loadIntoApp(){
    if(!client)return;const {data:{session}}=await client.auth.getSession();if(!session){emit('Entre para sincronizar','');return}
    try{await requireHousehold();const {data,error}=await client.from('household_snapshots').select('data,updated_at').eq('household_id',householdId).maybeSingle();if(error)throw error;
      if(data&&data.data&&app&&app.setData){app.setData(data.data);emit('Sincronizado','online')}else{emit('Preparando sincronização','pending');await syncNow()}
      subscribe();emit('Sincronizado','online');
    }catch(e){emit('Erro na sincronização','pending');console.error(e)}
  }
  async function syncNow(data){
    if(!client||!householdId||syncing)return;const {data:{session}}=await client.auth.getSession();if(!session)return;
    syncing=true;emit('Sincronizando…','pending');
    try{const snapshot=data|| (app&&app.getData?app.getData():JSON.parse(localStorage.getItem(localKey)||'{}'));
      const {error}=await client.from('household_snapshots').upsert({household_id:householdId,data:snapshot,updated_at:new Date().toISOString()},{onConflict:'household_id'});if(error)throw error;
      if(channel)await channel.send({type:'broadcast',event:'snapshot',payload:{data:snapshot,updated_at:new Date().toISOString()}});
      emit(onlineMembers>1?`Compartilhado · ${onlineMembers} online`:'Sincronizado','online')
    }catch(e){emit('Offline — aguardando conexão','pending');console.warn(e)}finally{syncing=false}
  }
  function scheduleSync(data){if(!client||!householdId)return;emit('Alterações pendentes…','pending');clearTimeout(timer);timer=setTimeout(()=>syncNow(data),900)}
  async function subscribe(){if(!client||!householdId)return;if(channel)client.removeChannel(channel);
    const {data:{user:currentUser}}=await client.auth.getUser();
    channel=client.channel('household-'+householdId,{config:{presence:{key:currentUser?.id||('guest-'+Math.random().toString(36).slice(2))}}})
      .on('postgres_changes',{event:'*',schema:'public',table:'household_snapshots',filter:'household_id=eq.'+householdId},payload=>{if(syncing)return;let remote=payload.new&&payload.new.data;if(remote&&app&&app.setData){app.setData(remote);emit('Atualizado em tempo real','online')}})
      .on('broadcast',{event:'snapshot'},payload=>{if(syncing)return;let remote=payload.payload&&payload.payload.data;if(remote&&app&&app.setData){app.setData(remote);emit('Lista atualizada ao vivo','online')}})
      .on('presence',{event:'sync'},()=>{let state=channel.presenceState();onlineMembers=Object.keys(state).length;emit(onlineMembers>1?`Compartilhado · ${onlineMembers} online`:'Sincronizado · só você online','online')})
      .subscribe(async status=>{if(status==='SUBSCRIBED'){const {data:{user}}=await client.auth.getUser();await channel.track({user_id:user?.id||'member',online_at:new Date().toISOString()})}});
  }
  async function signIn(email,password){if(!client)throw new Error('Configure o Supabase primeiro.');let {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;await loadIntoApp()}
  async function signUp(email,password){if(!client)throw new Error('Configure o Supabase primeiro.');let {error}=await client.auth.signUp({email,password});if(error)throw error}
  async function signOut(){if(!client)return;await client.auth.signOut();householdId=null;if(channel)client.removeChannel(channel);emit('Somente neste dispositivo','')}
  async function getInviteCode(){if(!client||!householdId)throw new Error('Entre em um espaço primeiro.');let {data,error}=await client.from('households').select('invite_code').eq('id',householdId).single();if(error)throw error;return data.invite_code}
  async function join(code){if(!client)throw new Error('Configure o Supabase primeiro.');let {data,error}=await client.rpc('join_household',{invite_code_input:code});if(error)throw error;householdId=data;await loadIntoApp()}
  async function boot(appApi){
    app=appApi;
    if(!configured()){emit('Somente neste dispositivo','');return}
    if(!window.supabase||!window.supabase.createClient){emit('Biblioteca Supabase indisponível','pending');return}
    client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    const {data:{session}}=await client.auth.getSession();if(session)await loadIntoApp();else emit('Entre para sincronizar','');
    client.auth.onAuthStateChange((event,session)=>{if(session&&event!=='TOKEN_REFRESHED')setTimeout(loadIntoApp,0);else if(!session){householdId=null;emit('Entre para sincronizar','')}});
    window.addEventListener('online',()=>{if(app&&householdId)syncNow()});window.addEventListener('offline',()=>emit('Offline — dados salvos neste dispositivo','pending'));
  }
  window.SuperlistCloud={boot,status,signIn,signUp,signOut,join,getInviteCode,scheduleSync,onStatus(fn){callback=fn},loadIntoApp};
})();
