import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...cors, 'Content-Type': 'application/json' },
});
const PRINCIPAL_EMAIL = 'leoguerramaia@gmail.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ ok: false, error: 'Método não permitido.' }, 405);

  try {
    const url = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !anonKey || !serviceKey) throw new Error('Configuração administrativa incompleta no servidor.');

    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) return json({ ok: false, error: 'Sessão não informada.' }, 401);

    const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || claimsData?.claims?.aal !== 'aal2') return json({ ok: false, error: 'Confirme o código de dois fatores antes de usar a Administração.' }, 403);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData.user) return json({ ok: false, error: 'Sessão inválida ou expirada.' }, 401);
    const caller = authData.user;
    const callerEmail = (caller.email || '').toLowerCase();
    const isAdmin = caller.app_metadata?.is_admin === true || callerEmail === PRINCIPAL_EMAIL;
    if (!isAdmin) return json({ ok: false, error: 'Acesso restrito à administração.' }, 403);
    const callerRole = caller.app_metadata?.admin_role || (callerEmail === PRINCIPAL_EMAIL ? 'super_admin' : 'admin');

    const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');

    const audit = async (event: string, target: string | null = null, details: string | null = null) => {
      const { error } = await db.from('admin_audit_logs').insert({
        admin_user_id: caller.id, admin_email: caller.email, action: event,
        target, details,
      });
      if (error) console.error('Não foi possível gravar auditoria:', error.message);
    };

    if (action === 'dashboard') {
      const [{ data: households, error: hErr }, { data: members, error: mErr }, { data: snapshots, error: sErr }] = await Promise.all([
        db.from('households').select('id,name,owner_id,invite_code,created_at').order('created_at', { ascending: false }).limit(1000),
        db.from('household_members').select('household_id,user_id,role').limit(5000),
        db.from('household_snapshots').select('household_id,data').limit(1000),
      ]);
      if (hErr) throw hErr; if (mErr) throw mErr; if (sErr) throw sErr;

      const users: any[] = [];
      for (let page = 1; page <= 10; page++) {
        const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw error;
        users.push(...data.users);
        if (data.users.length < 1000) break;
      }
      const userMap = new Map(users.map((u: any) => [u.id, u]));
      const userRows = users.map((u: any) => ({
        id: u.id, email: u.email || '', fullName: u.user_metadata?.full_name || '',
        createdAt: u.created_at, banned: !!u.banned_until && new Date(u.banned_until).getTime() > Date.now(),
        isAdmin: u.app_metadata?.is_admin === true || (u.email || '').toLowerCase() === PRINCIPAL_EMAIL,
        adminRole: u.app_metadata?.admin_role || ((u.email || '').toLowerCase() === PRINCIPAL_EMAIL ? 'super_admin' : ''),
        isPrincipal: (u.email || '').toLowerCase() === PRINCIPAL_EMAIL,
      }));
      const memberRows = members || [];
      const snapshotMap = new Map((snapshots || []).map((s: any) => [s.household_id, s.data || {}]));
      const familyRows = (households || []).map((h: any) => {
        const owner: any = userMap.get(h.owner_id);
        const familyMembers = memberRows.filter((m: any) => m.household_id === h.id);
        const snap: any = snapshotMap.get(h.id) || {};
        const lists = Array.isArray(snap.lists) ? snap.lists : [];
        const products = Array.isArray(snap.products) ? snap.products : [];
        return {
          id: h.id, name: h.name, inviteCode: h.invite_code, createdAt: h.created_at,
          ownerEmail: owner?.email || '', ownerName: owner?.user_metadata?.full_name || '',
          memberCount: familyMembers.length, listCount: lists.length, productCount: products.length,
        };
      });
      await audit('dashboard_view', null, 'Consulta de indicadores, usuários e famílias.');
      const { data: logs, error: logError } = await db.from('admin_audit_logs').select('created_at,admin_email,action,target,details').order('created_at', { ascending: false }).limit(100);
      if (logError) throw logError;
      return json({ ok: true, callerRole, users: userRows, families: familyRows, audit: (logs || []).map((a: any) => ({ createdAt: a.created_at, adminEmail: a.admin_email, action: a.action, target: a.target, details: a.details })) });
    }

    if (action === 'set_user_ban') {
      const userId = String(body.userId || '');
      const banned = body.banned === true;
      if (!userId || userId === caller.id) return json({ ok: false, error: 'Não é permitido bloquear a própria conta.' }, 400);
      const { data: targetData, error: targetError } = await db.auth.admin.getUserById(userId);
      if (targetError || !targetData.user) return json({ ok: false, error: 'Usuário não encontrado.' }, 404);
      if ((targetData.user.email || '').toLowerCase() === PRINCIPAL_EMAIL) return json({ ok: false, error: 'A conta do administrador principal não pode ser bloqueada.' }, 403);
      if (targetData.user.app_metadata?.is_admin === true && callerRole !== 'super_admin') return json({ ok: false, error: 'Somente o administrador principal pode alterar outra conta administrativa.' }, 403);
      const { error } = await db.auth.admin.updateUserById(userId, { ban_duration: banned ? '876000h' : 'none' });
      if (error) throw error;
      await audit(banned ? 'user_blocked' : 'user_reactivated', targetData.user.email || userId, banned ? 'Conta bloqueada pelo painel.' : 'Conta reativada pelo painel.');
      return json({ ok: true });
    }

    if (action === 'set_admin') {
      if (callerRole !== 'super_admin') return json({ ok: false, error: 'Somente o administrador principal pode gerenciar administradores.' }, 403);
      const userId = String(body.userId || '');
      const makeAdmin = body.isAdmin === true;
      if (!userId) return json({ ok: false, error: 'Usuário não informado.' }, 400);
      const { data: targetData, error: targetError } = await db.auth.admin.getUserById(userId);
      if (targetError || !targetData.user) return json({ ok: false, error: 'Usuário não encontrado.' }, 404);
      if ((targetData.user.email || '').toLowerCase() === PRINCIPAL_EMAIL) return json({ ok: false, error: 'A função do administrador principal é permanente.' }, 403);
      const currentMeta = targetData.user.app_metadata || {};
      const nextMeta = { ...currentMeta, is_admin: makeAdmin, admin_role: makeAdmin ? 'admin' : null };
      const { error } = await db.auth.admin.updateUserById(userId, { app_metadata: nextMeta });
      if (error) throw error;
      await audit(makeAdmin ? 'admin_granted' : 'admin_revoked', targetData.user.email || userId, makeAdmin ? 'Privilégio administrativo concedido.' : 'Privilégio administrativo removido.');
      return json({ ok: true });
    }

    return json({ ok: false, error: 'Ação administrativa desconhecida.' }, 400);
  } catch (error) {
    console.error('admin-panel:', error);
    return json({ ok: false, error: error instanceof Error ? error.message : 'Erro interno no painel administrativo.' }, 500);
  }
});
