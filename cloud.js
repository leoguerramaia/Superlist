// Configure these values with your Supabase project (Project Settings > API).
// Never place the service_role key in browser code. Use only the anon/public key.
window.SUPERLIST_CONFIG = window.SUPERLIST_CONFIG || {
  supabaseUrl: "https://frhbocaxymxviltuvmox.supabase.co/",
  supabaseAnonKey: "sb_publishable_v0q_4StRh2H7b9M1pLVZ3w_4xUQKZUP",
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
  async function analyzeReceipt(file, products = []) {
    if (!client) throw new Error('Supabase não está configurado.');
    const { data: { session } } = await client.auth.getSession();
    if (!session?.access_token) throw new Error('Entre na sua conta antes de analisar a nota.');

    if (!file || !file.type || !file.type.startsWith('image/')) {
      throw new Error('Selecione uma imagem válida da nota.');
    }
    if (file.size > 12 * 1024 * 1024) {
      throw new Error('A imagem excede 12 MB. Reduza o tamanho e tente novamente.');
    }

    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const value = String(reader.result || '');
        const comma = value.indexOf(',');
        resolve(comma >= 0 ? value.slice(comma + 1) : value);
      };
      reader.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'));
      reader.readAsDataURL(file);
    });

    const { data, error } = await client.functions.invoke('analyze-receipt', {
      body: {
        image_base64: base64,
        mime_type: file.type,
        products: products.slice(0, 500)
      }
    });

    if (error) {
      let detail = error.message || 'Falha ao chamar a análise de nota.';
      try {
        const context = error.context;
        if (context && typeof context.json === 'function') {
          const body = await context.json();
          if (body?.error) detail = body.error;
        }
      } catch (_) {}
      throw new Error(detail);
    }
    if (!data || !Array.isArray(data.items)) {
      throw new Error('A IA retornou uma resposta inesperada.');
    }
    return data;
  }

  async function boot(appApi){
    app=appApi;
    if(!configured()){emit('Somente neste dispositivo','');return}
    if(!window.supabase||!window.supabase.createClient){emit('Biblioteca Supabase indisponível','pending');return}
    client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    const {data:{session}}=await client.auth.getSession();if(session)await loadIntoApp();else emit('Entre para sincronizar','');
    client.auth.onAuthStateChange((event,session)=>{if(session&&event!=='TOKEN_REFRESHED')setTimeout(loadIntoApp,0);else if(!session){householdId=null;emit('Entre para sincronizar','')}});
    window.addEventListener('online',()=>{if(app&&householdId)syncNow()});window.addEventListener('offline',()=>emit('Offline — dados salvos neste dispositivo','pending'));
  }
  window.SuperlistCloud={boot,status,signIn,signUp,signOut,join,getInviteCode,scheduleSync,analyzeReceipt,onStatus(fn){callback=fn},loadIntoApp};
})();