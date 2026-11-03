// Configure these values with your Supabase project (Project Settings > API).
// Never place the service_role key in browser code. Use only the anon/public key.
window.SUPERLIST_CONFIG = window.SUPERLIST_CONFIG || {
  supabaseUrl: "https://frhbocaxymxviltuvmox.supabase.co/",
  supabaseAnonKey: "sb_publishable_v0q_4StRh2H7b9M1pLVZ3w_4xUQKZUP",
};

(function(){
  const cfg=window.SUPERLIST_CONFIG;
  let client=null, householdId=null, timer=null, callback=null, app=null, channel=null, syncing=false, onlineMembers=0, currentUserEmail=null, currentUserId=null;
  const configured=()=>cfg.supabaseUrl&&!cfg.supabaseUrl.includes('YOUR_PROJECT')&&cfg.supabaseAnonKey&&!cfg.supabaseAnonKey.includes('YOUR_SUPABASE');
  const emit=(label,state='')=>{if(callback)callback({label,state,onlineMembers,userEmail:currentUserEmail,userId:currentUserId})};
  const localKey='superlist-v1';
  function status(){return client?'Supabase conectado — entre para sincronizar':'Configure o Supabase para ativar a nuvem'}
  async function requireHousehold(){
    const {data:{user}}=await client.auth.getUser();if(!user)throw new Error('Faça login primeiro.');currentUserId=user.id;
    const {data:members,error}=await client.from('household_members').select('household_id').eq('user_id',user.id).limit(1);
    if(error)throw error;
    if(members&&members.length){householdId=members[0].household_id;return householdId}
    const inviteCode=String(user.user_metadata?.household_invite_code||'').trim().toUpperCase();
    if(inviteCode){const {data,error:joinError}=await client.rpc('join_household',{invite_code_input:inviteCode});if(joinError)throw joinError;householdId=data;return householdId}
    const familyName=String(user.user_metadata?.family_name||'').trim();
    const {data:house,error:e1}=await client.from('households').insert({name:familyName||'Minha casa',owner_id:user.id}).select('id').single();if(e1)throw e1;
    const {error:e2}=await client.from('household_members').insert({household_id:house.id,user_id:user.id,role:'owner'});if(e2)throw e2;
    householdId=house.id;return householdId;
  }
  async function loadIntoApp(){
    if(!client)return false;const {data:{session}}=await client.auth.getSession();if(!session){currentUserId=null;emit('Entre para sincronizar','');return false}
    currentUserId=session.user?.id||null;
    try{await requireHousehold();const {data,error}=await client.from('household_snapshots').select('data,updated_at').eq('household_id',householdId).maybeSingle();if(error)throw error;
      if(data&&data.data&&app&&app.setData){app.setData(data.data);emit('Sincronizado','online')}else{
        // Never copy the previous browser user's localStorage into a new household.
        const clean=app&&app.emptyData?app.emptyData():{categories:[],products:[],stores:[],lists:[],prices:[],purchases:[]};
        if(app&&app.setData)app.setData(clean);
        emit('Preparando sincronização','pending');
        await syncNow(clean);
      }
      subscribe();emit('Sincronizado','online');return true;
    }catch(e){emit('Erro na sincronização','pending');console.error(e);return false}
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
    const {data:{user:currentUser}}=await client.auth.getUser();currentUserId=currentUser?.id||currentUserId;
    channel=client.channel('household-'+householdId,{config:{presence:{key:currentUser?.id||('guest-'+Math.random().toString(36).slice(2))}}})
      .on('postgres_changes',{event:'*',schema:'public',table:'household_snapshots',filter:'household_id=eq.'+householdId},payload=>{if(syncing)return;let remote=payload.new&&payload.new.data;if(remote&&app&&app.setData){app.setData(remote);emit('Atualizado em tempo real','online')}})
      .on('broadcast',{event:'snapshot'},payload=>{if(syncing)return;let remote=payload.payload&&payload.payload.data;if(remote&&app&&app.setData){app.setData(remote);emit('Lista atualizada ao vivo','online')}})
      .on('presence',{event:'sync'},()=>{let state=channel.presenceState();onlineMembers=Object.keys(state).length;emit(onlineMembers>1?`Compartilhado · ${onlineMembers} online`:'Sincronizado · só você online','online')})
      .subscribe(async status=>{if(status==='SUBSCRIBED'){const {data:{user}}=await client.auth.getUser();await channel.track({user_id:user?.id||'member',online_at:new Date().toISOString()})}});
  }
  async function signIn(email,password){if(!client)throw new Error('Configure o Supabase primeiro.');let {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;currentUserEmail=data?.user?.email||data?.session?.user?.email||email;currentUserId=data?.user?.id||data?.session?.user?.id||null;emit('Conta conectada','online');await loadIntoApp()}
  async function signUp(email,password){if(!client)throw new Error('Configure o Supabase primeiro.');let {error}=await client.auth.signUp({email,password});if(error)throw error}
  async function sendRecoveryCode(email){if(!client)throw new Error('Configure o Supabase primeiro.');const {error}=await client.auth.resetPasswordForEmail(email);if(error)throw error}
  async function verifyRecoveryCode(email,token,newPassword){if(!client)throw new Error('Configure o Supabase primeiro.');const {error:verifyError}=await client.auth.verifyOtp({email,token,type:'recovery'});if(verifyError)throw verifyError;const {error:updateError}=await client.auth.updateUser({password:newPassword});if(updateError)throw updateError}
  async function signOut(){if(!client)return;await client.auth.signOut();currentUserEmail=null;currentUserId=null;householdId=null;if(channel)client.removeChannel(channel);emit('Sessão encerrada','');window.location.replace('./index.html')}
  async function getInviteCode(){if(!client||!householdId)throw new Error('Entre em um espaço primeiro.');let {data,error}=await client.from('households').select('invite_code').eq('id',householdId).single();if(error)throw error;return data.invite_code}
  async function join(code){if(!client)throw new Error('Configure o Supabase primeiro.');let {data,error}=await client.rpc('join_household',{invite_code_input:code});if(error)throw error;householdId=data;await loadIntoApp()}

  async function getProfile(){
    if(!client) throw new Error('Supabase não está conectado.');
    const {data:{user},error:userError}=await client.auth.getUser();
    if(userError) throw userError;
    if(!user) throw new Error('Faça login novamente.');
    let family=null;
    if(householdId){
      const {data,error}=await client.from('households').select('id,name,invite_code').eq('id',householdId).maybeSingle();
      if(error) throw error;
      family=data;
    }
    return {id:user.id,email:user.email||'',fullName:user.user_metadata?.full_name||'',phone:user.user_metadata?.phone||'',avatarUrl:user.user_metadata?.avatar_url||'',familyName:family?.name||'',familyCode:family?.invite_code||'',isAdmin:user.app_metadata?.is_admin===true,adminRole:user.app_metadata?.admin_role||''};
  }
  async function updatePhone(phoneDigits){
    if(!client) throw new Error('Supabase não está conectado.');
    if(!/^\d{10,11}$/.test(phoneDigits)) throw new Error('Informe um telefone válido com DDD.');
    const {data,error}=await client.auth.updateUser({data:{phone:phoneDigits}});
    if(error) throw error;
    return data.user;
  }
  async function uploadAvatar(file){
    if(!client) throw new Error('Supabase não está conectado.');
    if(!file||!file.type?.startsWith('image/')) throw new Error('Selecione uma imagem válida.');
    if(file.size>5*1024*1024) throw new Error('A foto deve ter no máximo 5 MB.');
    const {data:{user},error:userError}=await client.auth.getUser();
    if(userError) throw userError;
    if(!user) throw new Error('Faça login novamente.');
    const ext=(file.type.split('/')[1]||'jpg').replace('jpeg','jpg').replace(/[^a-z0-9]/gi,'')||'jpg';
    const path=`${user.id}/avatar.${ext}`;
    const {error:uploadError}=await client.storage.from('profile-photos').upload(path,file,{upsert:true,contentType:file.type,cacheControl:'3600'});
    if(uploadError) throw uploadError;
    const {data}=client.storage.from('profile-photos').getPublicUrl(path);
    const avatarUrl=data.publicUrl+`?v=${Date.now()}`;
    const {error:updateError}=await client.auth.updateUser({data:{avatar_url:avatarUrl}});
    if(updateError) throw updateError;
    return avatarUrl;
  }

  async function uploadStorePhoto(file, storeId){
    if(!client) throw new Error('Supabase não está conectado.');
    if(!file||!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) throw new Error('Selecione uma foto JPG, PNG, WebP ou GIF.');
    if(file.size>5*1024*1024) throw new Error('A foto deve ter no máximo 5 MB.');
    const {data:{user},error:userError}=await client.auth.getUser();
    if(userError) throw userError;
    if(!user) throw new Error('Faça login novamente.');
    const ext=({ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif' })[file.type];
    const path=`${user.id}/stores/${storeId}-${Date.now()}.${ext}`;
    const {error}=await client.storage.from('profile-photos').upload(path,file,{upsert:false,contentType:file.type,cacheControl:'3600'});
    if(error) throw error;
    const {data}=client.storage.from('profile-photos').getPublicUrl(path);
    return {path,url:data.publicUrl+`?v=${Date.now()}`};
  }

  async function uploadProductPhoto(file, productId, brandId){
    if(!client||!householdId) throw new Error('Entre em uma família para enviar a foto da marca.');
    if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Selecione uma foto JPG, PNG ou WebP.');
    if(file.size>5*1024*1024) throw new Error('A foto deve ter no máximo 5 MB.');
    const {data:{user},error:userError}=await client.auth.getUser();
    if(userError) throw userError;
    if(!user) throw new Error('Faça login novamente.');
    const ext=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp'})[file.type];
    const safePart=value=>String(value||'item').replace(/[^a-z0-9_-]/gi,'_').slice(0,80);
    const path=`${householdId}/${safePart(productId)}/${safePart(brandId)}-${Date.now()}.${ext}`;
    const {error}=await client.storage.from('produtos').upload(path,file,{upsert:false,contentType:file.type,cacheControl:'3600'});
    if(error) throw error;
    return {path};
  }
  async function getProductPhotoUrl(path){
    if(!client||!householdId) throw new Error('Entre em uma família para ver as fotos.');
    const safePath=String(path||'');
    if(!safePath.startsWith(`${householdId}/`)) throw new Error('A foto não pertence à família atual.');
    const {data,error}=await client.storage.from('produtos').createSignedUrl(safePath,3600);
    if(error) throw error;
    return data?.signedUrl||'';
  }
  async function adminRequest(action, payload={}){
    if(!client)throw new Error('Supabase não está conectado.');
    const {data,error}=await client.functions.invoke('admin-panel',{body:{action,...payload}});
    if(error){let message=error.message||'Falha na operação administrativa.';try{const body=await error.context?.json?.();if(body?.error)message=body.error;}catch(_){}throw new Error(message);}
    if(!data?.ok)throw new Error(data?.error||'A operação administrativa não foi concluída.');
    return data;
  }

  async function providerSettings(action, order){
    if(!client)throw new Error('Supabase não está conectado.');
    const {data,error}=await client.functions.invoke('manage-provider-settings',{body:{action,...(order?{order}:{})}});
    if(error){let message=error.message||'Falha ao salvar a prioridade das APIs.';try{const body=await error.context?.json?.();if(body?.error)message=body.error;}catch(_){}throw new Error(message);}
    if(!data?.ok)throw new Error(data?.error||'Não foi possível atualizar a prioridade das APIs.');
    return data;
  }

  async function analyzeImage(file, mode='receipt', products=[]) {
    if (!client) throw new Error('Supabase não está configurado.');
    const { data: { session } } = await client.auth.getSession();
    if (!session?.access_token) throw new Error('Entre na sua conta antes de analisar a imagem.');
    if (!file || !file.type || !file.type.startsWith('image/')) throw new Error('Selecione uma imagem válida.');
    if (file.size > 12 * 1024 * 1024) throw new Error('A imagem excede 12 MB. Reduza o tamanho e tente novamente.');
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => { const value = String(reader.result || ''); const comma = value.indexOf(','); resolve(comma >= 0 ? value.slice(comma + 1) : value); };
      reader.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'));
      reader.readAsDataURL(file);
    });
    const { data, error } = await client.functions.invoke('analyze-receipt', {
      body: { mode, image_base64: base64, mime_type: file.type, products: products.slice(0, 500) }
    });
    if (error) {
      let detail = error.message || 'Falha ao chamar a análise de imagem.';
      try { const context = error.context; if (context && typeof context.json === 'function') { const body = await context.json(); if (body?.error) detail = body.error; } } catch (_) {}
      throw new Error(detail);
    }
    if (!data || typeof data !== 'object') throw new Error('A IA retornou uma resposta inesperada.');
    if (mode === 'barcode') {
      if (typeof data.ean !== 'string') throw new Error('A IA não retornou um EAN.');
      return data;
    }
    if (!Array.isArray(data.items)) throw new Error('A IA retornou uma resposta inesperada.');
    return data;
  }
  async function analyzeBarcode({ image = null, code = '' } = {}) {
    const digits = String(code || '').replace(/\D/g, '');
    if (!image) return { ean: digits, confidence: 'high' };
    const result = await analyzeImage(image, 'barcode');
    return {
      ean: String(result?.ean || '').replace(/\D/g, ''),
      confidence: String(result?.confidence || 'low')
    };
  }

  async function analyzeListPhoto(file) { return analyzeImage(file, 'list'); }
  async function validateListItems(items = []) {
    if (!client) throw new Error('Supabase não está configurado.');
    const { data: { session } } = await client.auth.getSession();
    if (!session?.access_token) throw new Error('Entre na sua conta antes de validar os produtos.');
    const { data, error } = await client.functions.invoke('analyze-receipt', {
      body: { mode: 'validate-list', items: items.slice(0, 200) }
    });
    if (error) {
      let detail = error.message || 'Falha ao revisar a grafia dos produtos.';
      try { const context = error.context; if (context && typeof context.json === 'function') { const body = await context.json(); if (body?.error) detail = body.error; } } catch (_) {}
      throw new Error(detail);
    }
    if (!data || !Array.isArray(data.items)) throw new Error('A IA retornou uma resposta inesperada.');
    return data;
  }

  async function analyzeListAudio(file) {
    if (!client) throw new Error('Supabase não está configurado.');
    const { data: { session } } = await client.auth.getSession();
    if (!session?.access_token) throw new Error('Entre na sua conta antes de importar um áudio.');
    if (!file || !file.type?.startsWith('audio/')) throw new Error('Selecione um arquivo de áudio válido.');
    if (file.size > 12 * 1024 * 1024) throw new Error('O áudio excede 12 MB. Escolha um arquivo menor.');
    const audio_base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => { const value = String(reader.result || ''); const comma = value.indexOf(','); resolve(comma >= 0 ? value.slice(comma + 1) : value); };
      reader.onerror = () => reject(new Error('Não foi possível ler o áudio selecionado.'));
      reader.readAsDataURL(file);
    });
    const { data, error } = await client.functions.invoke('analyze-receipt', {
      body: { mode: 'audio-list', audio_base64, mime_type: file.type }
    });
    if (error) {
      let detail = error.message || 'Falha ao transcrever o áudio.';
      try { const context = error.context; if (context && typeof context.json === 'function') { const body = await context.json(); if (body?.error) detail = body.error; } } catch (_) {}
      throw new Error(detail);
    }
    if (!data || !Array.isArray(data.items)) throw new Error('A IA retornou uma resposta inesperada.');
    return data;
  }
  async function boot(appApi){
    app=appApi;
    if(!configured()){emit('Supabase não configurado','pending');return false}
    if(!window.supabase||!window.supabase.createClient){emit('Biblioteca Supabase indisponível','pending');return false}
    client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    const {data:{session}}=await client.auth.getSession();currentUserEmail=session?.user?.email||null;currentUserId=session?.user?.id||null;if(session){const loaded=await loadIntoApp();if(!loaded)return false}else{emit('Entre para sincronizar','');return false}
    client.auth.onAuthStateChange((event,session)=>{currentUserEmail=session?.user?.email||null;if(session){emit('Conta conectada','online');if(event!=='TOKEN_REFRESHED')setTimeout(loadIntoApp,0)}else{householdId=null;currentUserId=null;emit('Entre para sincronizar','')}});
    window.addEventListener('online',()=>{if(app&&householdId)syncNow()});window.addEventListener('offline',()=>emit('Offline — dados salvos neste dispositivo','pending'));
    return true;
  }
  async function analyzeReceipt(file, products=[]) { return analyzeImage(file, 'receipt', products); }
  async function lookupProductByBarcode(gtin) {
    if (!client) throw new Error('Supabase não está configurado.');
    const { data: { session } } = await client.auth.getSession();
    if (!session?.access_token) throw new Error('Entre na sua conta antes de consultar o código de barras.');
    const { data, error } = await client.functions.invoke('lookup-product', { body: { gtin: String(gtin || '') } });
    if (error) {
      let detail = error.message || 'Falha ao consultar o produto.';
      try { const body = await error.context?.json?.(); if (body?.error) detail = body.error; } catch (_) {}
      throw new Error(detail);
    }
    return data;
  }

  window.SuperlistCloud={boot,status,currentUserId:()=>currentUserId,signIn,signUp,sendRecoveryCode,verifyRecoveryCode,signOut,join,getInviteCode,getProfile,updatePhone,uploadAvatar,uploadStorePhoto,uploadProductPhoto,getProductPhotoUrl,scheduleSync,analyzeReceipt,analyzeListPhoto,validateListItems,analyzeListAudio,analyzeBarcode,lookupProductByBarcode,adminRequest,providerSettings,onStatus(fn){callback=fn},loadIntoApp};
})();
