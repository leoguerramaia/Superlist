const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const KEY = 'superlist-v1';

const seedCategories = [
  'Hortifruti', 'Açougue e aves', 'Mercearia', 'Laticínios e frios',
  'Padaria', 'Bebidas', 'Limpeza', 'Higiene pessoal', 'Congelados',
  'Pet shop', 'Outros'
];

const seedProducts = [
  ['Banana','Hortifruti','kg'], ['Maçã','Hortifruti','kg'], ['Laranja','Hortifruti','kg'],
  ['Tomate','Hortifruti','kg'], ['Batata','Hortifruti','kg'], ['Cebola','Hortifruti','kg'],
  ['Alho','Hortifruti','kg'], ['Cenoura','Hortifruti','kg'], ['Alface','Hortifruti','un'],
  ['Cheiro-verde','Hortifruti','un'], ['Limão','Hortifruti','kg'], ['Mamão','Hortifruti','kg'],
  ['Peito de frango','Açougue e aves','kg'], ['Coxa e sobrecoxa','Açougue e aves','kg'],
  ['Carne moída','Açougue e aves','kg'], ['Patinho','Açougue e aves','kg'],
  ['Alcatra','Açougue e aves','kg'], ['Costela bovina','Açougue e aves','kg'],
  ['Linguiça','Açougue e aves','kg'], ['Peixe','Açougue e aves','kg'],
  ['Arroz 5 kg','Mercearia','un'], ['Feijão 1 kg','Mercearia','un'],
  ['Açúcar 1 kg','Mercearia','un'], ['Café 500 g','Mercearia','un'],
  ['Óleo de soja 900 ml','Mercearia','un'], ['Macarrão 500 g','Mercearia','un'],
  ['Farinha de trigo 1 kg','Mercearia','un'], ['Sal 1 kg','Mercearia','un'],
  ['Molho de tomate','Mercearia','un'], ['Milho em conserva','Mercearia','un'],
  ['Biscoito','Mercearia','un'], ['Aveia','Mercearia','un'],
  ['Leite integral 1 L','Laticínios e frios','un'], ['Queijo muçarela','Laticínios e frios','kg'],
  ['Presunto','Laticínios e frios','kg'], ['Manteiga 200 g','Laticínios e frios','un'],
  ['Requeijão','Laticínios e frios','un'], ['Iogurte','Laticínios e frios','un'],
  ['Ovos (dúzia)','Laticínios e frios','un'], ['Pão francês','Padaria','kg'],
  ['Pão de forma','Padaria','un'], ['Bolo','Padaria','un'], ['Água mineral 1,5 L','Bebidas','un'],
  ['Suco','Bebidas','un'], ['Refrigerante 2 L','Bebidas','un'], ['Cerveja','Bebidas','un'],
  ['Detergente','Limpeza','un'], ['Água sanitária','Limpeza','un'],
  ['Desinfetante','Limpeza','un'], ['Sabão em pó','Limpeza','un'], ['Amaciante','Limpeza','un'],
  ['Esponja','Limpeza','un'], ['Papel toalha','Limpeza','un'], ['Saco de lixo','Limpeza','un'],
  ['Papel higiênico','Higiene pessoal','un'], ['Creme dental','Higiene pessoal','un'],
  ['Sabonete','Higiene pessoal','un'], ['Shampoo','Higiene pessoal','un'],
  ['Condicionador','Higiene pessoal','un'], ['Desodorante','Higiene pessoal','un'],
  ['Pizza congelada','Congelados','un'], ['Batata congelada','Congelados','un'],
  ['Sorvete','Congelados','un'], ['Ração para cachorro','Pet shop','kg'],
  ['Areia para gatos','Pet shop','kg']
].map((p,i) => {
  let pack = packageInfo(p[0],p[2]);
  return {
    id:'p'+(i+1),name:p[0],category:p[1],unit:p[2],
    netAmount:pack.amount,netUnit:pack.unit,
    barcode:'',photo:'',active:true
  };
});


// Catálogo inicial ampliado de produtos comuns de supermercado.
// Mantido localmente para inclusão manual mesmo sem consulta externa.
const extraSeedProducts = [
  ['Abacaxi','Hortifruti','un'],['Abacate','Hortifruti','kg'],['Acerola','Hortifruti','kg'],['Uva','Hortifruti','kg'],['Melancia','Hortifruti','kg'],['Melão','Hortifruti','kg'],['Manga','Hortifruti','kg'],['Pera','Hortifruti','kg'],['Morango','Hortifruti','bandeja'],['Pepino','Hortifruti','kg'],['Pimentão','Hortifruti','kg'],['Beterraba','Hortifruti','kg'],['Abobrinha','Hortifruti','kg'],['Chuchu','Hortifruti','kg'],['Brócolis','Hortifruti','un'],['Couve','Hortifruti','un'],['Repolho','Hortifruti','un'],['Mandioca','Hortifruti','kg'],
  ['Carne bovina','Açougue e aves','kg'],['Coxão mole','Açougue e aves','kg'],['Coxão duro','Açougue e aves','kg'],['Músculo bovino','Açougue e aves','kg'],['Fígado bovino','Açougue e aves','kg'],['Bisteca suína','Açougue e aves','kg'],['Pernil suíno','Açougue e aves','kg'],['Bacon','Açougue e aves','kg'],['Salsicha','Açougue e aves','kg'],['Peito de peru','Açougue e aves','kg'],['Filé de peixe','Açougue e aves','kg'],['Camarão','Açougue e aves','kg'],['Ovos de codorna','Açougue e aves','un'],
  ['Feijão preto','Mercearia','un'],['Feijão fradinho','Mercearia','un'],['Lentilha','Mercearia','un'],['Grão-de-bico','Mercearia','un'],['Fubá','Mercearia','un'],['Farinha de mandioca','Mercearia','un'],['Farinha de milho','Mercearia','un'],['Tapioca','Mercearia','un'],['Flocão de milho','Mercearia','un'],['Amido de milho','Mercearia','un'],['Fermento em pó','Mercearia','un'],['Fermento biológico','Mercearia','un'],['Vinagre','Mercearia','un'],['Azeite de oliva','Mercearia','un'],['Maionese','Mercearia','un'],['Ketchup','Mercearia','un'],['Mostarda','Mercearia','un'],['Ervilha em conserva','Mercearia','un'],['Atum em lata','Mercearia','un'],['Sardinha em lata','Mercearia','un'],['Leite de coco','Mercearia','un'],['Creme de leite','Mercearia','un'],['Leite condensado','Mercearia','un'],['Gelatina','Mercearia','un'],['Pipoca','Mercearia','un'],['Chocolate em pó','Mercearia','un'],['Achocolatado','Mercearia','un'],['Goiabada','Mercearia','un'],['Mel','Mercearia','un'],['Castanha de caju','Mercearia','un'],
  ['Leite desnatado','Laticínios e frios','un'],['Leite sem lactose','Laticínios e frios','un'],['Leite em pó','Laticínios e frios','un'],['Queijo coalho','Laticínios e frios','kg'],['Queijo parmesão','Laticínios e frios','kg'],['Queijo prato','Laticínios e frios','kg'],['Cream cheese','Laticínios e frios','un'],['Margarina','Laticínios e frios','un'],[' iogurte natural','Laticínios e frios','un'],['Bebida láctea','Laticínios e frios','un'],
  ['Pão de queijo','Padaria','un'],['Torrada','Padaria','un'],['Bisnaguinha','Padaria','un'],['Croissant','Padaria','un'],['Biscoito de polvilho','Padaria','un'],
  ['Água mineral 500 ml','Bebidas','un'],['Água com gás','Bebidas','un'],['Água de coco','Bebidas','un'],['Chá pronto','Bebidas','un'],['Energético','Bebidas','un'],['Achocolatado pronto','Bebidas','un'],
  ['Limpador multiuso','Limpeza','un'],['Sabão em barra','Limpeza','un'],['Desengordurante','Limpeza','un'],['Limpa-vidros','Limpeza','un'],['Álcool 70%','Limpeza','un'],['Lustra-móveis','Limpeza','un'],['Pano de chão','Limpeza','un'],['Pano de prato','Limpeza','un'],['Luvas de limpeza','Limpeza','un'],
  ['Fio dental','Higiene pessoal','un'],['Enxaguante bucal','Higiene pessoal','un'],['Escova de dentes','Higiene pessoal','un'],['Absorvente','Higiene pessoal','un'],['Hastes flexíveis','Higiene pessoal','un'],['Algodão','Higiene pessoal','un'],['Papel facial','Higiene pessoal','un'],['Protetor solar','Higiene pessoal','un'],['Aparelho de barbear','Higiene pessoal','un'],['Fralda descartável','Higiene pessoal','un'],
  ['Lasanha congelada','Congelados','un'],['Hambúrguer congelado','Congelados','un'],['Nuggets','Congelados','un'],['Polpa de fruta','Congelados','un'],['Legumes congelados','Congelados','un'],['Pão de alho','Congelados','un'],
  ['Ração para gato','Pet shop','kg'],['Petisco para cachorro','Pet shop','un'],['Petisco para gato','Pet shop','un'],['Shampoo para pets','Pet shop','un']
].map((p,i)=>{const pack=packageInfo(p[0],p[2]);return {id:'seed-extra-'+(i+1),name:formatDisplayName(p[0]),category:p[1],unit:['kg','l','g','ml'].includes(p[2])?p[2]:'un',netAmount:pack.amount,netUnit:pack.unit,barcode:'',photo:'',active:true};});
seedProducts.push(...extraSeedProducts);

function inferProductCategory(product={}) {
  const text=[product.categories,product.categories_tags,product.product_name,product.product_name_pt].flat().join(' ').toLocaleLowerCase('pt-BR');
  const rules=[
    ['Hortifruti',/fruit|vegetable|fruta|verdura|legume|hortifruti/],
    ['Açougue e aves',/meat|poultry|beef|pork|fish|seafood|carne|frango|peixe/],
    ['Laticínios e frios',/dairy|milk|cheese|yogurt|latic.nio|leite|queijo/],
    ['Padaria',/bakery|bread|biscuit|p.o|padaria/],
    ['Bebidas',/beverage|drink|water|juice|soda|bebida/],
    ['Limpeza',/cleaning|detergent|laundry|limpeza/],
    ['Higiene pessoal',/personal care|toothpaste|shampoo|hygiene|higiene/],
    ['Congelados',/frozen|congelad/],
    ['Pet shop',/pet food|petfood|dog food|cat food|pet shop/],
    ['Mercearia',/grocery|pasta|rice|cereal|sauce|snack|mercearia/]
  ];
  return rules.find(([,regex])=>regex.test(text))?.[0] || 'Outros';
}

function packageInfo(name,unit) {
  let m = name.match(/(\d+(?:[,.]\d+)?)\s*(kg|g|l|ml)\b/i);
  if(m) {
    let n = Number(m[1].replace(',','.'));
    let u = m[2].toLowerCase();
    if(u==='g') return {amount:n/1000,unit:'kg'};
    if(u==='ml') return {amount:n/1000,unit:'l'};
    return {amount:n,unit:u};
  }
  return {amount:1,unit:unit==='un'?'un':unit};
}

let db = loadDB();
let currentList = null;
let activeCategory = 'all';


// Padroniza nomes de produtos e marcas em formato Título, mantendo conectores em minúsculas.
function formatDisplayName(value) {
  const minorWords = new Set(['a','as','o','os','de','da','do','das','dos','e','em','no','na','nos','nas','ao','aos','à','às','pelo','pela','pelos','pelas','por','para','com','sem','sob','sobre','entre']);
  const capitalize = (part, isFirst) => {
    if (!part) return part;
    const lower = part.toLocaleLowerCase('pt-BR');
    if (!isFirst && minorWords.has(lower)) return lower;
    return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
  };
  return String(value || '').trim().replace(/\s+/g, ' ').split(' ').map((word, index) =>
    word.split('-').map((part, subIndex) => capitalize(part, index === 0 && subIndex === 0)).join('-')
  ).join(' ');
}

function normalizeProductNames(data) {
  if (!data || typeof data !== 'object') return data;
  data.products ||= [];
  data.lists ||= [];
  data.prices ||= [];
  data.products.forEach(product => { product.name = formatDisplayName(product.name); });
  data.lists.forEach(list => (list.items || []).forEach(item => { item.name = formatDisplayName(item.name); }));
  data.prices.forEach(price => { price.productName = formatDisplayName(price.productName); });
  return data;
}

function loadDB() {
  try {
    let d = JSON.parse(localStorage.getItem(KEY));

    if(d) {
      d.categories ||= seedCategories;
      d.products ||= [];
      // Inclui novos itens do catálogo inicial em contas já existentes, sem duplicar IDs ou nomes.
      const existingSeedIds = new Set(d.products.map(p=>p.id));
      const existingNames = new Set(d.products.map(p=>String(p.name||'').toLocaleLowerCase('pt-BR')));
      seedProducts.forEach(p=>{
        if(!existingSeedIds.has(p.id) && !existingNames.has(p.name.toLocaleLowerCase('pt-BR'))) {
          d.products.push({...p});
          existingSeedIds.add(p.id);
          existingNames.add(p.name.toLocaleLowerCase('pt-BR'));
        }
      });
      d.stores ||= [];
      d.lists ||= [];
      d.prices ||= [];
      d.purchases ||= [];
      // Padroniza produtos antigos e suas referências sem alterar IDs ou relacionamentos.
      normalizeProductNames(d);
      d.lists.forEach(list => (list.items || []).forEach(item => { item.brand = formatDisplayName(item.brand); }));
      d.prices.forEach(price => { price.brand = formatDisplayName(price.brand); });
      // Persiste no navegador a atualização do catálogo inicial para que fique disponível nas próximas sessões.
      localStorage.setItem(KEY,JSON.stringify(d));
      return d;
    }
  } catch(e) {
    console.warn('Erro ao carregar dados locais:', e);
  }

  return {
    categories: seedCategories,
    products: seedProducts,
    stores: [],
    lists: [],
    prices: [],
    purchases: []
  };
}

function save() {
  localStorage.setItem(KEY,JSON.stringify(db));
  renderAll();
  if(window.SuperlistCloud) window.SuperlistCloud.scheduleSync(db);
}

function money(n) {
  return (Number(n)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}

function dateBR(d) {
  return new Date(d+'T12:00:00').toLocaleDateString('pt-BR');
}

function today() {
  return new Date().toISOString().slice(0,10);
}

function uid() {
  return Math.random().toString(36).slice(2,10);
}

function toast(t) {
  let e = $('#toast');
  if(!e) return;
  e.textContent = t;
  e.classList.add('show');
  setTimeout(() => e.classList.remove('show'),2400);
}

function page(name) {
  if(name==='admin' && !window.__superlistIsAdmin){toast('Acesso restrito à administração.');return;}
  $$('.page').forEach(p => p.classList.toggle('active',p.id==='page-'+name));
  $$('.nav-link').forEach(b => b.classList.toggle('active',b.dataset.page===name));
  $('#pageTitle').textContent = ({
    home:'Visão geral',
    lists:'Minhas listas',
    stores:'Supermercados',
    products:'Produtos e categorias',
    prices:'Histórico de preços',
    shopping:'Compras',
    admin:'Painel administrativo'
  })[name]||name;
  $('#sidebar').classList.remove('open');
  if(name!=='shopping') renderAll();
  if(name==='admin') loadAdminDashboard();
}

function openModal(title,body,eyebrow='SUPERLIST') {
  $('#modalTitle').textContent = title;
  $('#modalEyebrow').textContent = eyebrow;
  $('#modalBody').innerHTML = body;
  $('#modalBackdrop').classList.add('open');
}

function closeModal() {
  $('#modalBackdrop').classList.remove('open');
}

function field(label,name,placeholder='',type='text',value='') {
  return `<div class="field"><label>${label}</label><input name="${name}" type="${type}" placeholder="${placeholder}" value="${String(value).replaceAll('"','&quot;')}"></div>`;
}

function selectField(label,name,options,value='') {
  return `<div class="field"><label>${label}</label><select name="${name}">${options.map(o=>`<option value="${o}" ${o===value?'selected':''}>${o}</option>`).join('')}</select></div>`;
}

function formData(form=null) {
  const target = form || $('#modalForm') || $('#authForm');
  if(!target) throw new Error('Formulário não encontrado.');
  return Object.fromEntries(new FormData(target).entries());
}

function renderAll() {
  renderHome();
  renderLists();
  renderStores();
  renderProducts();
  renderPrices();
}

function renderHome() {
  $('#statLists').textContent = db.lists.length;
  $('#statDone').textContent = db.lists.filter(l=>l.done).length;
  $('#statProducts').textContent = db.products.length;
  $('#statSpent').textContent = money(db.lists.filter(l=>l.done).reduce((a,l)=>a+listTotal(l),0));
  let recent = [...db.lists].sort((a,b)=>b.created.localeCompare(a.created)).slice(0,3);
  $('#recentLists').innerHTML = recent.length
    ? recent.map(listCard).join('')
    : '<div class="empty-state">Você ainda não criou listas. Comece sua primeira compra!</div>';
}

function listTotal(l) {
  return (l.items||[]).reduce((s,i)=>s+(Number(i.qty)||0)*(Number(i.price)||0),0);
}

function listCard(l) {
  let done=(l.items||[]).filter(i=>i.checked).length;
  let total=(l.items||[]).length;
  let pct=total?done/total*100:0;
  return `<article class="recent-card" data-open-list="${l.id}">
    <div class="card-top">
      <span class="card-symbol">☷</span>
      <span class="status ${l.done?'done':''}">${l.done?'Concluída':'Em andamento'}</span>
    </div>
    <h3>${esc(l.name)}</h3>
    <div class="card-meta">${dateBR(l.created)} · ${esc(storeName(l.storeId))}</div>
    <div class="card-progress"><span style="width:${pct}%"></span></div>
    <div class="card-foot"><span>${done}/${total} itens</span><strong>${money(listTotal(l))}</strong></div>
  </article>`;
}

function renderLists() {
  let q=($('#listSearch')?.value||'').toLowerCase();
  let f=$('#listFilter')?.value||'all';
  let ls=[...db.lists]
    .filter(l=>l.name.toLowerCase().includes(q)&&(f==='all'||(f==='done'?l.done:!l.done)))
    .sort((a,b)=>b.created.localeCompare(a.created));

  $('#allLists').innerHTML=ls.length
    ? ls.map(l=>`<article class="list-card" data-open-list="${l.id}">${listCardInner(l).replace('<h3>', '<div class="list-card-title-row"><h3>').replace('</h3>', '</h3><div class="list-card-actions"><button type="button" class="list-card-action" data-rename-list="${l.id}" aria-label="Renomear lista" title="Renomear lista"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg></button><button type="button" class="list-card-action danger" data-delete-list="${l.id}" aria-label="Excluir lista" title="Excluir lista"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/></svg></button></div></div>')}</article>`).join('')
    : '<div class="empty-state">Nenhuma lista encontrada. Clique em “Nova lista” para começar.</div>';
}

function renameListById(id) {
  const list=db.lists.find(item=>item.id===id);
  if(!list)return;
  openModal('Renomear lista', `<form id="renameListCardForm"><div class="field"><label>Nome da lista</label><input name="name" maxlength="80" required value="${esc(list.name)}"></div><div class="form-actions"><button type="button" class="btn secondary" data-cancel>Cancelar</button><button class="btn primary">Salvar nome</button></div></form>`);
  $('#renameListCardForm').addEventListener('submit',e=>{
    e.preventDefault();
    const name=formData(e.currentTarget).name.trim();
    if(!name)return toast('Informe o nome da lista.');
    list.name=name;save();closeModal();toast('Lista renomeada.');
  });
}

function deleteListById(id) {
  const list=db.lists.find(item=>item.id===id);
  if(!list)return;
  if(!confirm(`Excluir a lista "${list.name}"? Esta ação não pode ser desfeita.`))return;
  db.lists=db.lists.filter(item=>item.id!==id);
  db.prices=db.prices.filter(item=>item.listId!==id);
  db.purchases=db.purchases.filter(item=>item.listId!==id);
  if(currentList?.id===id)currentList=null;
  save();
  if(!currentList && $('#page-shopping')?.classList.contains('active'))page('lists');
  toast('Lista excluída.');
}

function listCardInner(l) {
  let done=l.items.filter(i=>i.checked).length;
  let pct=l.items.length?done/l.items.length*100:0;
  return `<div class="card-top">
    <span class="card-symbol">☷</span>
    <span class="status ${l.done?'done':''}">${l.done?'Concluída':'Em andamento'}</span>
  </div>
  <h3>${esc(l.name)}</h3>
  <div class="list-info">
    <div>▦ ${l.items.length} produtos</div>
    <div>⌖ ${esc(storeName(l.storeId))}</div>
    <div>◷ ${dateBR(l.created)}</div>
  </div>
  <div class="card-progress"><span style="width:${pct}%"></span></div>
  <div class="card-foot"><span>${done} de ${l.items.length} comprados</span><strong>${money(listTotal(l))}</strong></div>`;
}

function latestPrice(productId,storeId) {
  if(!productId) return null;
  return [...db.prices]
    .filter(p=>p.productId===productId&&p.storeId===storeId)
    .sort((a,b)=>b.date.localeCompare(a.date))[0]||null;
}

function storeName(id) {
  return db.stores.find(s=>s.id===id)?.name||'Sem supermercado';
}

function renderStores() {
  $('#storeGrid').innerHTML=db.stores.length
    ? db.stores.map(s=>`<article class="store-card">
        <div class="store-icon">⌖</div>
        <div>
          <h3>${esc(s.name)}</h3>
          <p>${esc(s.address||'Endereço não informado')}<br>${db.prices.filter(p=>p.storeId===s.id).length} registros de preço</p>
        </div>
        <button data-delete-store="${s.id}" title="Excluir">•••</button>
      </article>`).join('')
    : '<div class="empty-state">Cadastre os supermercados onde você costuma comprar.</div>';
}

function renderProducts() {
  let q=($('#productSearch')?.value||'').toLowerCase();
  let cat=$('#categoryFilter')?.value||'all';
  let cats=['all',...db.categories];

  $('#categoryFilter').innerHTML=cats.map(c=>`<option value="${esc(c)}" ${c===cat?'selected':''}>${c==='all'?'Todas as categorias':esc(c)}</option>`).join('');

  let counts=db.categories.map(c=>[c,db.products.filter(p=>p.category===c).length]);

  $('#categoryList').innerHTML=
    `<button class="category-item ${activeCategory==='all'?'active':''}" data-cat="all">Todas <small>${db.products.length}</small></button>`+
    counts.map(([c,n])=>`<button class="category-item ${activeCategory===c?'active':''}" data-cat="${esc(c)}">${esc(c)} <small>${n}</small></button>`).join('');

  let products=db.products.filter(p=>
    (activeCategory==='all'||p.category===activeCategory)&&
    (cat==='all'||p.category===cat)&&
    p.name.toLowerCase().includes(q)
  );

  $('#productCount').textContent=`${products.length} produtos`;

  $('#productTable').innerHTML=products.length
    ? products.map(p=>`<div class="product-row">
        <div class="product-thumb">${p.photo?'▧':'◈'}</div>
        <div><strong>${esc(p.name)}</strong><small>${esc(p.category)} ${p.barcode?'· '+esc(p.barcode):''}</small></div>
        <span class="unit-tag">${unitLabel(p.unit)}</span>
        <span class="product-price muted">${p.barcode?'EAN cadastrado':'Sem código'}</span>
        <button data-edit-product="${p.id}" title="Editar">✎</button>
      </div>`).join('')
    : '<div class="empty-state">Nenhum produto nesta seleção.</div>';
}

function renderPrices() {
  let store=$('#priceStoreFilter')?.value||'all';
  let q=($('#priceSearch')?.value||'').toLowerCase();

  $('#priceStoreFilter').innerHTML=
    '<option value="all">Todos os supermercados</option>'+
    db.stores.map(s=>`<option value="${s.id}" ${store===s.id?'selected':''}>${esc(s.name)}</option>`).join('');

  let rows=db.prices
    .filter(p=>(store==='all'||p.storeId===store)&&(p.productName+' '+(p.brand||'')).toLowerCase().includes(q))
    .sort((a,b)=>b.date.localeCompare(a.date));

  $('#priceSummary').innerHTML=
    `<div><small>Registros de preço</small><strong>${rows.length}</strong></div>
     <div><small>Supermercados</small><strong>${new Set(rows.map(r=>r.storeId)).size}</strong></div>
     <div><small>Produtos acompanhados</small><strong>${new Set(rows.map(r=>r.productId)).size}</strong></div>`;

  $('#priceRows').innerHTML=rows.length
    ? rows.map(p=>`<tr>
        <td><strong>${esc(p.productName)}</strong>${p.brand?`<small> · ${esc(p.brand)}</small>`:''}</td>
        <td>${esc(storeName(p.storeId))}</td>
        <td>${dateBR(p.date)}</td>
        <td><strong>${money(p.price)}</strong></td>
        <td>${unitLabel(p.unit)}</td>
      </tr>`).join('')
    : '<tr><td colspan="5" class="muted">Ainda não há preços registrados. Eles serão salvos ao informar preços durante as compras.</td></tr>';

  renderPriceAnalytics(rows);
}

let priceChartInstance=null;

function renderPriceAnalytics(rows) {
  const canvas=$('#priceChart');

  if(canvas&&window.Chart) {
    if(priceChartInstance) priceChartInstance.destroy();

    let grouped={};
    [...rows].sort((a,b)=>a.date.localeCompare(b.date)).slice(-30).forEach(p=>{
      let key=p.date;
      grouped[key]=grouped[key]||[];
      grouped[key].push(Number(p.price)||0);
    });

    let labels=Object.keys(grouped);
    let vals=labels.map(k=>grouped[k].reduce((a,b)=>a+b,0)/grouped[k].length);

    priceChartInstance=new Chart(canvas,{
      type:'line',
      data:{
        labels,
        datasets:[{
          label:'Preço médio registrado',
          data:vals,
          borderColor:'#23835d',
          backgroundColor:'rgba(35,131,93,.10)',
          fill:true,
          tension:.35,
          pointRadius:3
        }]
      },
      options:{
        responsive:true,
        plugins:{legend:{display:false}},
        scales:{y:{ticks:{callback:v=>'R$ '+v.toFixed(2)}}}
      }
    });
  }

  let byProduct={};

  rows.forEach(p=>{
    let k=p.productId||p.productName;
    let old=byProduct[k]||{name:p.productName,unit:p.unit,stores:{}};

    if(!old.stores[p.storeId]||p.date>old.stores[p.storeId].date) {
      old.stores[p.storeId]=p;
    }

    byProduct[k]=old;
  });

  let comparisons=Object.values(byProduct)
    .filter(x=>Object.keys(x.stores).length>1)
    .slice(0,8);

  $('#comparisonTable').innerHTML=comparisons.length
    ? `<table class="comparison-table">
        <thead><tr><th>Produto</th><th>Supermercado</th><th>Preço pago</th><th>Equivalente</th></tr></thead>
        <tbody>${comparisons.flatMap(p=>{
          let vals=Object.entries(p.stores).map(([sid,r])=>{
            let amount=Number(r.netAmount)||1;
            let unit=r.netUnit||r.unit;
            return {
              name:p.name,
              store:storeName(sid),
              price:Number(r.price),
              normalized:Number(r.price)/amount,
              unit
            };
          });

          let low=Math.min(...vals.map(v=>v.normalized));
          return vals.map(r=>({...r,lowest:r.normalized===low}));
        }).map(r=>`<tr>
          <td>${esc(r.name)}</td>
          <td>${esc(r.store)}</td>
          <td>${money(r.price)}</td>
          <td class="${r.lowest?'comparison-best':''}">${money(r.normalized)}/${esc(r.unit)} ${r.lowest?'★':''}</td>
        </tr>`).join('')}</tbody>
      </table>`
    : '<div class="empty-state">Registre o mesmo produto em mais de uma loja para visualizar a comparação por kg, litro ou unidade de conteúdo.</div>';
}

function unitLabel(u) {
  return u==='kg'?'Por kg':
    u==='g'?'Por grama':
    u==='l'?'Por litro':
    u==='ml'?'Por ml':'Por unidade';
}

function esc(s='') {
  return String(s).replace(/[&<>"']/g,c=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[c]));
}

function createListModal() {
  const storeOptions = () => db.stores.map(s => '<option value="' + esc(s.id) + '">' + esc(s.name) + '</option>').join('');
  if (!db.stores.length) {
    openModal('Cadastrar supermercado', '<p class="muted">Antes de criar sua lista, cadastre o supermercado onde pretende fazer as compras.</p><div class="form-actions"><button type="button" class="btn secondary" data-cancel>Voltar</button><button type="button" class="btn primary" id="firstListStore">Cadastrar supermercado</button></div>', 'NOVA LISTA');
    $('#firstListStore').addEventListener('click', () => { closeModal(); addStoreModal(createListModal); });
    return;
  }

  openModal('Criar nova lista',
    '<form id="modalForm">' +
      '<div class="field"><label>Nome da lista</label><input name="name" required maxlength="80" placeholder="Ex.: Compra do mês"></div>' +
      '<div class="field"><label>Supermercado</label><div class="form-grid"><select name="storeId" required><option value="">Selecione um supermercado</option>' + storeOptions() + '</select><button type="button" class="btn secondary" id="newListAddStore">＋ Cadastrar supermercado</button></div></div>' +
      '<div class="field"><label>Adicionar produtos à lista</label><div class="form-grid"><button type="button" class="btn secondary" id="openTextImport">Importar Lista de Texto</button><button type="button" class="btn secondary" id="openPhotoImport">Fotografar Lista</button></div><button type="button" class="btn secondary full" id="manualListItems" style="margin-top:10px">＋ Adicionar Itens Manualmente</button></div>' +
      '<section id="textImportPanel" class="invite-box" style="display:none"><div class="field"><label for="newListText">Cole ou digite os produtos, um por linha</label><textarea id="newListText" rows="6" placeholder="2 arroz 5kg&#10;1 kg de banana&#10;3 unidades de leite"></textarea></div><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><button type="button" class="btn primary" id="validateTextList">Validar produtos</button><span id="validateTextWarning" role="alert" style="display:none;color:#c62828;font-size:12px;font-weight:600"><span aria-hidden="true">*</span> Valide os produtos antes de Criar a Lista</span></div></section>' +
      '<section id="photoImportPanel" class="invite-box" style="display:none"><p class="muted">Escolha uma foto da galeria ou tire uma foto da lista escrita à mão. A IA vai transcrever os produtos para você revisar.</p><div class="form-grid"><button type="button" class="btn secondary" id="chooseListGallery">Escolher da galeria</button><button type="button" class="btn secondary" id="takeListPhoto">Usar câmera</button></div><input id="listGalleryInput" type="file" accept="image/*" style="display:none"><input id="listCameraInput" type="file" accept="image/*" capture="environment" style="display:none"><div id="listPhotoName" class="helper"></div><div id="listPhotoPreview" style="display:none;margin:10px 0"><img id="listPhotoPreviewImage" alt="Prévia da lista fotografada" style="display:block;width:100%;max-height:260px;object-fit:contain;border-radius:10px;border:1px solid var(--line);background:#fff"></div><button type="button" class="btn primary" id="readListPhoto" disabled>✨ Transcrever com IA</button></section>' +
      '<div id="listImportProgress" class="receipt-progress" style="display:none" aria-live="polite"><div class="receipt-progress-top"><span class="receipt-spinner"></span><strong id="listImportProgressText">Organizando seus produtos...</strong></div><div class="receipt-progress-track"><span></span></div></div>' +
      '<section id="listValidationPanel" style="display:none;margin-top:14px"><h3>Revise os produtos</h3><p class="helper">Confirme o nome, a quantidade e a associação ao catálogo. Nenhum produto será incluído antes de você confirmar.</p><div id="listValidationRows" class="receipt-table-wrap"></div><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:12px"><button type="button" class="btn primary" id="confirmValidatedItems">Confirmar produtos</button><span id="confirmProductsWarning" role="alert" style="display:none;color:#c62828;font-size:12px;font-weight:600"><span aria-hidden="true">*</span> Confirme os produtos antes de Criar a Lista</span></div></section>' +
      '<div class="form-actions"><button type="button" class="btn secondary" data-cancel>Cancelar</button><button type="submit" class="btn primary" id="createNewListButton">Criar lista</button></div>' +
    '</form>', 'NOVA LISTA');

  let reviewRows = [];
  let confirmedItems = [];
  let selectedPhoto = null;
  let importNeedsConfirmation = false;
  let textNeedsValidation = false;
  let previewUrl = null;
  const form = $('#modalForm');
  const createButton = $('#createNewListButton');
  const confirmWarning = $('#confirmProductsWarning');
  const validateTextWarning = $('#validateTextWarning');
  const textInput = $('#newListText');
  const setCreateEnabled = enabled => { createButton.disabled = false; createButton.title = ''; if (enabled) confirmWarning.style.display = 'none'; };
  const textPanel = $('#textImportPanel'), photoPanel = $('#photoImportPanel');
  const validation = $('#listValidationPanel'), validationRows = $('#listValidationRows');
  const progress = $('#listImportProgress'), progressText = $('#listImportProgressText');
  const showProgress = message => { progressText.textContent = message; progress.style.display = 'block'; };
  const hideProgress = () => { progress.style.display = 'none'; };
  const norm = value => String(value || '').toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

  $('#newListAddStore').addEventListener('click', () => { closeModal(); addStoreModal(createListModal); });
  $('#openTextImport').addEventListener('click', () => { photoPanel.style.display = 'none'; textPanel.style.display = textPanel.style.display === 'none' ? 'block' : 'none'; validateTextWarning.style.display = 'none'; });
  $('#openPhotoImport').addEventListener('click', () => { textPanel.style.display = 'none'; photoPanel.style.display = photoPanel.style.display === 'none' ? 'block' : 'none'; validateTextWarning.style.display = 'none'; });
  textInput.addEventListener('input', () => { textNeedsValidation = !!textInput.value.trim(); confirmedItems = []; if (textNeedsValidation) importNeedsConfirmation = true; validateTextWarning.style.display = 'none'; });
  $('#chooseListGallery').addEventListener('click', () => $('#listGalleryInput').click());
  $('#takeListPhoto').addEventListener('click', () => $('#listCameraInput').click());
  ['listGalleryInput','listCameraInput'].forEach(id => $('#'+id).addEventListener('change', e => {
    selectedPhoto = e.target.files && e.target.files[0] || null;
    $('#listPhotoName').textContent = selectedPhoto ? selectedPhoto.name : '';
    $('#readListPhoto').disabled = !selectedPhoto;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = selectedPhoto ? URL.createObjectURL(selectedPhoto) : null;
    $('#listPhotoPreview').style.display = previewUrl ? 'block' : 'none';
    if (previewUrl) $('#listPhotoPreviewImage').src = previewUrl;
    importNeedsConfirmation = !!selectedPhoto;
    confirmedItems = [];
    setCreateEnabled(!importNeedsConfirmation);
    confirmWarning.style.display = 'none';
    validation.style.display = 'none';
  }));

  function prepareRows(rows) {
    importNeedsConfirmation = true;
    confirmedItems = [];
    setCreateEnabled(false);
    confirmWarning.style.display = 'none';
    reviewRows = rows.map(row => {
      const name = String(row.name || '').trim();
      const key = norm(name);
      const match = db.products.find(p => norm(p.name) === key) ||
        db.products.find(p => norm(p.name).includes(key) || key.includes(norm(p.name)));
      return { name, suggestedName: row.suggested_name || '', correctionReason: row.reason || '', hasCorrection: !!row.has_correction, needsReview: !!row.needs_review, quantity: Number(row.quantity) > 0 ? Number(row.quantity) : 1, unit: row.unit || match?.unit || 'un', brand: row.brand || '', productId: match?.id || '' };
    }).filter(row => row.name);
    renderValidation();
  }

  function brandsForProduct(productId) {
    const values = new Set();
    const product = db.products.find(p => p.id === productId);
    (product?.brands || []).forEach(b => { if (b) values.add(formatDisplayName(b)); });
    (db.prices || []).filter(p => p.productId === productId).forEach(p => { if (p.brand) values.add(formatDisplayName(p.brand)); });
    (db.lists || []).forEach(list => (list.items || []).filter(item => item.productId === productId && item.brand).forEach(item => values.add(formatDisplayName(item.brand))));
    return [...values].sort((a,b) => a.localeCompare(b,'pt-BR'));
  }

  function renderValidation() {
    validationRows.innerHTML = '<table class="receipt-items-table"><thead><tr><th>Produto</th><th>Quantidade</th><th>Unidade</th><th>Associar ao catálogo</th><th>Marca (opcional)</th><th></th></tr></thead><tbody>' +
      reviewRows.map((row,i) => {
        const brands = brandsForProduct(row.productId);
        const selectedBrand = row.brand || '';
        const hasNew = selectedBrand && !brands.some(b => norm(b) === norm(selectedBrand));
        return '<tr data-review-row="' + i + '"><td><input data-review="name" value="' + esc(row.name) + '">' + (row.hasCorrection ? '<div style="font-size:11px;color:#a15c00;margin-top:5px">Sugestão da IA: <button type="button" data-accept-suggestion="' + i + '" style="color:#176b52;text-decoration:underline;background:none;border:0;padding:0;font-weight:700">' + esc(row.suggestedName) + '</button></div>' : row.needsReview ? '<small style="display:block;color:#a15c00;margin-top:5px">Confira a grafia deste produto.</small>' : '') + '</td><td><input data-review="quantity" type="number" min="0.01" step="0.01" value="' + row.quantity + '"></td><td><select data-review="unit">' + ['un','kg','g','l','ml','cx','pct'].map(u => '<option value="' + u + '"' + (row.unit === u ? ' selected' : '') + '>' + u + '</option>').join('') + '</select></td><td><select data-review="product"><option value="">Criar novo produto</option>' + db.products.map(p => '<option value="' + esc(p.id) + '"' + (row.productId === p.id ? ' selected' : '') + '>' + esc(p.name) + '</option>').join('') + '</select></td><td><select data-review="brand"><option value="">Sem marca</option>' + brands.map(b => '<option value="' + esc(b) + '"' + (norm(b) === norm(selectedBrand) ? ' selected' : '') + '>' + esc(b) + '</option>').join('') + '<option value="__new__"' + (hasNew ? ' selected' : '') + '>＋ Nova marca</option></select><input data-review="newBrand" value="' + (hasNew ? esc(selectedBrand) : '') + '" placeholder="Digite a nova marca" style="display:' + (hasNew ? 'block' : 'none') + ';margin-top:6px;max-width:150px"></td><td><button type="button" data-remove-review="' + i + '">×</button></td></tr>';
      }).join('') +
      '</tbody></table>';
    validation.style.display = 'block';
  }

  $('#validateTextList').addEventListener('click', async () => {
    const raw = textInput.value.trim();
    if (!raw) return toast('Cole ou digite os produtos primeiro.');
    importNeedsConfirmation = true;
    confirmedItems = [];
    setCreateEnabled(false);
    const button = $('#validateTextList'); button.disabled = true;
    showProgress('A IA está conferindo a grafia dos produtos...');
    try {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const rows = raw.split(/\n|,/).map(line => line.trim()).filter(Boolean).map(line => {
        let quantity = 1, unit = 'un', name = line;
        const match = line.match(/^(\d+(?:[,.]\d+)?)\s*(kg|quilo[s]?|g|gramas?|l|litros?|ml|un(?:idades?)?|x)?\s+(?:de\s+)?(.+)$/i);
        if (match) {
          quantity = Number(match[1].replace(',', '.'));
          const u = (match[2] || '').toLowerCase();
          name = match[3].trim();
          if (/kg|quilo/.test(u)) unit = 'kg'; else if (u === 'g' || u.startsWith('gram')) unit = 'g';
          else if (u === 'l' || u.startsWith('litro')) unit = 'l'; else if (u === 'ml') unit = 'ml';
          else if (u.startsWith('un') || u === 'x') unit = 'un';
        }
        return { name, quantity, unit };
      });
      if (!window.SuperlistCloud?.validateListItems) throw new Error('A validação por IA não está disponível. Atualize a Edge Function no Supabase.');
      const checked = await window.SuperlistCloud.validateListItems(rows);
      prepareRows(checked.items || rows);
      textNeedsValidation = false;
      validateTextWarning.style.display = 'none';
      toast(reviewRows.length + ' produto(s) revisados pela IA. Confira as sugestões.');
    } catch (error) {
      console.error(error);
      toast(error.message || 'Não foi possível validar a grafia com IA. Tente novamente.');
    } finally { hideProgress(); button.disabled = false; }
  });

  $('#readListPhoto').addEventListener('click', async () => {
    if (!selectedPhoto) return toast('Escolha ou fotografe sua lista primeiro.');
    if (!window.SuperlistCloud?.analyzeListPhoto) return toast('A leitura por IA não está disponível no momento.');
    const button = $('#readListPhoto'); button.disabled = true; showProgress('A IA está transcrevendo sua lista...');
    try {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const result = await window.SuperlistCloud.analyzeListPhoto(selectedPhoto);
      const transcribed = (result.items || []).map(x => ({ name:x.name, brand:x.brand, quantity:x.quantity, unit:String(x.unit || 'un').toLowerCase() }));
      showProgress('Transcrição concluída. A IA está revisando a grafia...');
      const checked = await window.SuperlistCloud.validateListItems(transcribed);
      prepareRows(checked.items || transcribed);
      toast(reviewRows.length + ' produto(s) identificados e revisados. Confira as sugestões.');
    } catch (error) {
      console.error(error); toast('Não foi possível ler a foto. Tente outra imagem ou use a importação por texto.');
    } finally { hideProgress(); button.disabled = false; }
  });

  validationRows.addEventListener('change', e => {
    const tr = e.target.closest('[data-review-row]'); if (!tr) return;
    const row = reviewRows[Number(tr.dataset.reviewRow)]; if (!row) return;
    const field = e.target.dataset.review;
    if (field === 'quantity') row.quantity = Number(e.target.value);
    else if (field === 'product') { row.productId = e.target.value; row.brand = ''; renderValidation(); }
    else if (field === 'brand') { row.brand = e.target.value === '__new__' ? '' : e.target.value; const input = tr.querySelector('[data-review="newBrand"]'); if (input) input.style.display = e.target.value === '__new__' ? 'block' : 'none'; }
    else if (field === 'newBrand') row.brand = e.target.value;
    else if (field) row[field] = e.target.value;
  });
  validationRows.addEventListener('click', e => {
    const accept = e.target.closest('[data-accept-suggestion]');
    if (accept) { const row = reviewRows[Number(accept.dataset.acceptSuggestion)]; if (row?.suggestedName) { row.name = row.suggestedName; row.hasCorrection = false; row.needsReview = false; renderValidation(); } return; }
    const button = e.target.closest('[data-remove-review]'); if (!button) return;
    reviewRows.splice(Number(button.dataset.removeReview), 1); renderValidation();
  });

  $('#confirmValidatedItems').addEventListener('click', () => {
    if (!reviewRows.length) return toast('Não há produtos para confirmar.');
    if (reviewRows.some(r => !r.name.trim() || !Number.isFinite(r.quantity) || r.quantity <= 0)) return toast('Revise os nomes e as quantidades.');
    confirmedItems = reviewRows.map(row => {
      let product = row.productId ? db.products.find(p => p.id === row.productId) : null;
      if (!product) product = findOrCreateProduct({ name: formatDisplayName(row.name), category:'Outros', unit:row.unit });
      const brand = formatDisplayName(row.brand || '');
      if (brand) {
        product.brands = Array.isArray(product.brands) ? product.brands : [];
        if (!product.brands.some(existing => norm(existing) === norm(brand))) product.brands.push(brand);
      }
      return { id:uid(), productId:product.id, name:product.name, category:product.category || 'Outros', unit:row.unit || product.unit || 'un', qty:row.quantity, brand, price:0, checked:false };
    });
    validation.style.display = 'none';
    importNeedsConfirmation = false;
    setCreateEnabled(true);
    confirmWarning.style.display = 'none';
    toast(confirmedItems.length + ' produto(s) confirmado(s).');
  });

  $('#manualListItems').addEventListener('click', () => { if (importNeedsConfirmation) return toast('Confirme ou descarte a importação antes de continuar.'); createListAndOpen([]); });
  function createListAndOpen(items) {
    const name = form.elements.name.value.trim(), storeId = form.elements.storeId.value;
    if (!name) { form.elements.name.focus(); return toast('Informe o nome da lista.'); }
    if (!storeId) return toast('Selecione um supermercado.');
    items.forEach(item => { const history = latestPrice(item.productId, storeId); if (history) item.estimate = history.price; });
    const list = { id:uid(), name, storeId, created:today(), done:false, items };
    db.lists.push(list); save(); closeModal(); openList(list.id);
    toast(items.length ? 'Lista criada com produtos!' : 'Lista criada. Adicione seus produtos!');
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    if (textPanel.style.display !== 'none' && textInput.value.trim() && textNeedsValidation) { validateTextWarning.style.display = 'inline'; validateTextWarning.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
    if (importNeedsConfirmation) { confirmWarning.style.display = 'inline'; confirmWarning.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
    createListAndOpen(confirmedItems);
  });
}


function parseImported(text) {
  return text.split(/\n|,/).map(line=>line.trim()).filter(Boolean).map(line=>{
    let qty=1,unit=null,name=line;
    let m=line.match(/^(\d+(?:[,.]\d+)?)\s*(kg|quilo[s]?|g|gramas?|l|litros?|ml|un(?:idade[s]?)?|x)?\s+(?:de\s+)?(.+)$/i);
    if(m){qty=Number(m[1].replace(',','.'));let u=(m[2]||'').toLowerCase();name=m[3].trim();if(/kg|quilo/.test(u))unit='kg';else if(u==='g'||u.startsWith('gram'))unit='g';else if(u==='l'||u.startsWith('litro'))unit='l';else if(u==='ml')unit='ml';else if(u.startsWith('un')||u==='x')unit='un'}
    const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    let found=db.products.find(p=>norm(name)===norm(p.name));
    if(!found){found={id:uid(),name,category:'Outros',unit:unit||'un',...packageInfo(name,unit||'un'),barcode:'',photo:'',photoPath:'',active:true};db.products.push(found)}
    return {id:uid(),productId:found.id,name:found.name,category:found.category||'Outros',unit:unit||found.unit||'un',qty,brand:'',price:0,checked:false};
  });
}

function addStoreModal(onSaved) {
  openModal('Adicionar supermercado',`<form id="modalForm">
    <div class="field">
      <label>Nome do supermercado</label>
      <input name="name" required placeholder="Ex.: Supermercado Central">
    </div>
    <div class="field">
      <label>Endereço ou unidade (opcional)</label>
      <input name="address" placeholder="Ex.: Aldeota — Fortaleza">
    </div>
    <div class="form-actions">
      <button type="button" class="btn secondary" data-cancel>Cancelar</button>
      <button class="btn primary">Salvar supermercado</button>
    </div>
  </form>`);

  $('#modalForm').addEventListener('submit',e=>{
    e.preventDefault();
    let d=formData();
    db.stores.push({id:uid(),...d});
    save();
    closeModal();
    toast('Supermercado cadastrado!');
    if (typeof onSaved === 'function') onSaved();
  });
}


function addProductModal(product = null) {
  const p = product || {};
  const photoPath = p.photoPath || '';
  const photoUrl = p.photo || '';

  openModal(product ? 'Editar produto' : 'Novo produto', `
    <form id="modalForm">
      <div class="field">
        <label>Nome do produto</label>
        <input name="name" required
          placeholder="Ex.: Arroz tipo 1 — 5 kg"
          value="${esc(p.name || '')}">
      </div>

      <div class="form-grid">
        ${selectField('Categoria', 'category', db.categories,
          p.category || 'Mercearia')}
        ${selectField('Unidade de compra', 'unit',
          ['un','kg','g','l','ml'], p.unit || 'un')}
      </div>

      <div class="form-grid">
        ${field('Conteúdo da embalagem', 'netAmount',
          'Ex.: 5', 'number',
          p.netAmount ?? packageInfo(p.name || '', p.unit || 'un').amount)}
        ${selectField('Unidade do conteúdo', 'netUnit',
          ['un','kg','l'],
          p.netUnit || packageInfo(p.name || '', p.unit || 'un').unit)}
      </div>

      <div class="field">
        <label>Código de barras (EAN/GTIN)</label>
        <input name="barcode" placeholder="Digite o código"
          value="${esc(p.barcode || '')}">
      </div>

      <div class="field">
        <label>Foto por URL</label>
        <input name="photo" type="url"
          placeholder="https://..."
          value="${esc(photoUrl)}">
      </div>

      <div class="field">
        <label>Foto pela câmera ou galeria</label>
        <input id="productPhotoFile"
          accept="image/*">
        <small class="helper">
          No celular, você poderá escolher a câmera ou uma foto da galeria.
          Limite de 5 MB.
        </small>
      </div>

      <div id="productPhotoPreview" class="field">
        ${photoUrl
          ? `<img src="${esc(photoUrl)}" alt="Foto do produto"
              style="max-width:130px;max-height:130px;object-fit:contain">`
          : photoPath
            ? '<span class="helper">Foto armazenada no Supabase.</span>'
            : '<span class="helper">Nenhuma foto selecionada.</span>'}
      </div>

      <div class="form-actions">
        <button type="button" class="btn secondary" data-cancel>
          Cancelar
        </button>
        <button class="btn primary">Salvar produto</button>
      </div>
    </form>
  `);

  const form = $('#modalForm');
  const fileInput = $('#productPhotoFile');

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      fileInput.value = '';
      toast('A imagem deve ter no máximo 5 MB.');
      return;
    }

    const preview = $('#productPhotoPreview');
    const url = URL.createObjectURL(file);

    preview.innerHTML = `
      <img src="${url}" alt="Prévia da foto"
        style="max-width:130px;max-height:130px;object-fit:contain">
    `;
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const button = form.querySelector('button[type="submit"], button.primary');
    button.disabled = true;
    button.textContent = 'Salvando...';

    try {
      const d = formData(form);
      const file = fileInput.files[0];

      d.name = formatDisplayName(d.name);
      d.netAmount = Number(d.netAmount) || 1;

      const barcode = d.barcode.trim();

      const duplicate = db.products.find(x =>
        x.id !== p.id &&
        barcode &&
        x.barcode === barcode
      );

      if (duplicate) {
        throw new Error('Esse código de barras já está cadastrado em outro produto.');
      }

      let newPhotoPath = photoPath;
      let photo = d.photo.trim();

      if (file) {
        if (!window.SuperlistCloud?.uploadProductPhoto) {
          throw new Error('A integração de fotos não está disponível.');
        }

        newPhotoPath = await window.SuperlistCloud.uploadProductPhoto(file);
        photo = '';
      }

      const productData = {
        name: formatDisplayName(d.name),
        category: d.category,
        unit: d.unit,
        netAmount: d.netAmount,
        netUnit: d.netUnit,
        barcode,
        photo,
        photoPath: newPhotoPath,
        active: true
      };

      if (product) {
        Object.assign(product, productData);
      } else {
        db.products.push({
          id: uid(),
          ...productData
        });
      }

      save();
      closeModal();
      toast('Produto salvo com sucesso!');

    } catch (error) {
      console.error(error);
      toast(error.message || 'Não foi possível salvar o produto.');
      button.disabled = false;
      button.textContent = 'Salvar produto';
    }
  });
}


function addCategory() {
  openModal('Nova categoria',`<form id="modalForm">
    <div class="field">
      <label>Nome da categoria</label>
      <input name="name" required placeholder="Ex.: Bebê">
    </div>
    <div class="form-actions">
      <button type="button" class="btn secondary" data-cancel>Cancelar</button>
      <button class="btn primary">Criar categoria</button>
    </div>
  </form>`);

  $('#modalForm').addEventListener('submit',e=>{
    e.preventDefault();
    let n=formData().name.trim();

    if(db.categories.some(c=>c.toLowerCase()===n.toLowerCase())) {
      return toast('Essa categoria já existe.');
    }

    db.categories.push(n);
    save();
    closeModal();
    toast('Categoria criada!');
  });
}
function openList(id) {
  currentList=db.lists.find(l=>l.id===id);
  if(!currentList)return;
  page('shopping');
  renderShopping();
}

function editShoppingItem(itemId) {
  const item = currentList?.items.find(i => i.id === itemId);
  if (!item) return;

  const categories = [...new Set([
    ...db.categories,
    item.category || 'Outros'
  ])];

  openModal('Editar item da compra', `
    <form id="editShoppingItemForm">
      <div class="field">
        <label>Nome do produto</label>
        <input name="name" required value="${esc(item.name)}">
      </div>

      <div class="field">
        <label>Marca (opcional)</label>
        <input name="brand" placeholder="Ex.: Marca A" value="${esc(item.brand || '')}">
      </div>

      <div class="field">
        <label>Categoria</label>
        <select name="category">
          ${categories.map(c => `
            <option value="${esc(c)}"
              ${c === item.category ? 'selected' : ''}>
              ${esc(c)}
            </option>
          `).join('')}
        </select>
      </div>

      <div class="field">
        <label>Unidade</label>
        <select name="unit">
          ${['un','kg','g','l','ml'].map(u => `
            <option value="${u}"
              ${u === item.unit ? 'selected' : ''}>
              ${u}
            </option>
          `).join('')}
        </select>
      </div>

      <div class="field">
        <label>Preço (R$)</label>
        <input name="price" inputmode="decimal"
          value="${String(item.price || '').replace('.', ',')}">
      </div>

      <div class="form-actions">
        <button type="button" class="btn secondary"
          data-cancel>Cancelar</button>
        <button class="btn primary">Salvar alterações</button>
      </div>
    </form>
  `);

  $('#editShoppingItemForm').addEventListener('submit', e => {
    e.preventDefault();

    const d = formData(e.currentTarget);
    const price = Number(
      String(d.price).replace(',', '.')
    );

    if (!Number.isFinite(price) || price < 0) {
      toast('Informe um preço válido.');
      return;
    }

item.name = formatDisplayName(d.name);
item.brand = formatDisplayName(d.brand);
item.category = d.category;
item.unit = d.unit;

const product = findOrCreateProduct(item);
Object.assign(product, {
  name: item.name,
  category: item.category,
  unit: item.unit
});

item.price = price;
    item.estimate = price;

    savePrice(item);
    save();
    closeModal();
    renderShopping();
    toast('Item atualizado!');
  });
}


function findOrCreateProduct(item) {
  let product = item.productId
    ? db.products.find(p => p.id === item.productId)
    : null;

  if (!product) {
    const normalize = value => String(value || '')
      .trim()
      .toLocaleLowerCase('pt-BR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    product = db.products.find(p =>
      normalize(p.name) === normalize(item.name)
    );
  }

  if (!product) {
    product = {
      id: uid(),
      name: formatDisplayName(item.name),
      category: item.category || 'Outros',
      unit: item.unit || 'un',
      ...packageInfo(item.name, item.unit || 'un'),
      barcode: '',
      photo: '',
      photoPath: '',
      active: true
    };

    db.products.push(product);
  }

  product.name = formatDisplayName(product.name);
  item.productId = product.id;
  item.name = product.name;
  item.category = product.category;
  item.unit = product.unit;

  return product;
}



function addProductToCurrentList(product, qty = 1, brand = '') {
  if (!currentList || !product) return;

  const already = currentList.items.find(
    i => i.productId === product.id && String(i.brand || '').toLocaleLowerCase('pt-BR') === String(brand || '').trim().toLocaleLowerCase('pt-BR')
  );

  if (already) {
    already.qty = (Number(already.qty) || 0) + qty;
    toast('Quantidade atualizada na compra.');
  } else {
    const previous = latestPrice(product.id, currentList.storeId);

    currentList.items.push({
      id: uid(),
      productId: product.id,
      name: product.name,
      brand: formatDisplayName(brand),
      category: product.category || 'Outros',
      unit: product.unit || 'un',
      qty,
      price: 0,
      estimate: previous?.price || 0,
      checked: false
    });

    toast('Produto adicionado à compra!');
  }

  save();
  closeModal();
  renderShopping();
}

function addCatalogProductToList() {
  if (!currentList) return;

  openModal('Adicionar produto à compra', `
    <div class="field">
      <label>Como deseja localizar?</label>
      <select id="addProductMode">
        <option value="name">Buscar pelo nome</option>
        <option value="category">Buscar por categoria</option>
        <option value="barcode">Código de barras</option>
      </select>
    </div>

    <div id="addProductSearchArea"></div>

    <div class="field">
      <label>Quantidade</label>
      <input id="addProductQty" type="number"
        min="0.01" step="0.01" value="1">
    </div>

    <div class="field">
      <label>Marca (opcional)</label>
      <input id="addProductBrand" placeholder="Ex.: Marca A">
    </div>

    <div id="addProductResults"></div>

    <div class="form-actions">
      <button type="button" class="btn secondary" data-cancel>
        Fechar
      </button>
    </div>
  `);

  const mode = $('#addProductMode');
  const area = $('#addProductSearchArea');
  const results = $('#addProductResults');

  function availableProducts() {
    return db.products.filter(p => p.active !== false);
  }

  function showProducts(products) {
    results.innerHTML = products.length
      ? products.map(p => `
          <button type="button" class="product-row"
            data-add-catalog="${p.id}"
            style="width:100%;text-align:left">
            <div class="product-thumb">
              ${p.photo ? '▧' : '◈'}
            </div>
            <div>
              <strong>${esc(p.name)}</strong>
              <small>${esc(p.category || 'Outros')} · ${unitLabel(p.unit)}</small>
            </div>
            <span>＋</span>
          </button>
        `).join('')
      : '<div class="empty-state">Nenhum produto encontrado.</div>';
  }

  function renderMode() {
    results.innerHTML = '';

    if (mode.value === 'name') {
      area.innerHTML = `
        <div class="field">
          <label>Nome do produto</label>
          <input id="addProductNameSearch"
            placeholder="Digite o nome do produto">
        </div>
        <button type="button" class="btn secondary"
          id="createProductFromSearch">
          ＋ Cadastrar este produto
        </button>
      `;

      const input = $('#addProductNameSearch');

      function searchName() {
        const q = input.value.trim().toLocaleLowerCase('pt-BR');

        showProducts(q
          ? availableProducts().filter(p =>
              p.name.toLocaleLowerCase('pt-BR').includes(q)
            )
          : availableProducts()
        );
      }

      input.addEventListener('input', searchName);
      searchName();

      $('#createProductFromSearch').onclick = () => {
        const name = input.value.trim();

        if (!name) {
          toast('Digite o nome do produto.');
          return;
        }

        let product = db.products.find(p =>
          p.name.trim().toLocaleLowerCase('pt-BR') ===
          name.toLocaleLowerCase('pt-BR')
        );

        if (!product) {
          product = {
            id: uid(),
            name,
            category: 'Outros',
            unit: 'un',
            ...packageInfo(name, 'un'),
            barcode: '',
            photo: '',
            photoPath: '',
            active: true
          };

          db.products.push(product);
        }

        addProductToCurrentList(
          product,
          Number($('#addProductQty').value) || 1,
          $('#addProductBrand')?.value || ''
        );
      };

    } else if (mode.value === 'category') {
      area.innerHTML = `
        <div class="field">
          <label>Selecione a categoria</label>
          <select id="addProductCategory">
            <option value="">Todas as categorias</option>
            ${db.categories.map(c => `
              <option value="${esc(c)}">${esc(c)}</option>
            `).join('')}
          </select>
        </div>
      `;

      const select = $('#addProductCategory');

      function searchCategory() {
        showProducts(availableProducts().filter(p =>
          !select.value || p.category === select.value
        ));
      }

      select.addEventListener('change', searchCategory);
      searchCategory();

    } else {
      area.innerHTML = `
        <div class="field">
          <label>Código de barras (EAN/GTIN)</label>
          <input id="addProductBarcode"
            inputmode="numeric"
            placeholder="Digite ou escaneie o código">
        </div>
        <div class="form-actions">
          <button type="button" class="btn secondary"
            id="scanNewProductBarcode">
            ▣ Ler com a câmera
          </button>
          <button type="button" class="btn primary"
            id="lookupNewProductBarcode">
            Consultar código
          </button>
        </div>
        <div id="addBarcodeCamera" class="camera-box"
          style="display:none"></div>
      `;

      $('#lookupNewProductBarcode').onclick = async () => {
        const code = $('#addProductBarcode').value.trim();

        if (!code) {
          toast('Informe o código de barras.');
          return;
        }

        const button = $('#lookupNewProductBarcode');
        button.disabled = true;
        button.textContent = 'Consultando...';

        try {
          let product = db.products.find(p => p.barcode === code);

          if (!product) {
            const response = await fetch(
              `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`
            );

            if (!response.ok) throw new Error('Falha na consulta.');

            const data = await response.json();
            const prod = data.product;

            if (data.status !== 1 || !prod) {
              toast('Produto não encontrado. Cadastre pelo nome.');
              return;
            }

            product = {
              id: uid(),
              name: prod.product_name_pt || prod.product_name || `Produto ${code}`,
              category: inferProductCategory(prod),
              unit: 'un',
              ...packageInfo(prod.product_name || '', 'un'),
              barcode: code,
              photo: prod.image_url || '',
              photoPath: '',
              active: true
            };

            db.products.push(product);
          }

          addProductToCurrentList(
            product,
            Number($('#addProductQty').value) || 1,
            $('#addProductBrand')?.value || ''
          );

        } catch (error) {
          console.error(error);
          toast('Não foi possível consultar o código.');
        } finally {
          if ($('#lookupNewProductBarcode')) {
            $('#lookupNewProductBarcode').disabled = false;
            $('#lookupNewProductBarcode').textContent = 'Consultar código';
          }
        }
      };

      $('#scanNewProductBarcode').onclick = async () => {
        const cameraBox = $('#addBarcodeCamera');
        const button = $('#scanNewProductBarcode');

        let controls = null;

        try {
          if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error('A câmera exige acesso HTTPS pelo Safari.');
          }

          cameraBox.style.display = 'block';
          cameraBox.innerHTML = '<video autoplay muted playsinline style="width:100%"></video>';
          button.disabled = true;

          if (!window.ZXingBrowser) {
            let script = document.querySelector('script[data-superlist-zxing]');

            if (!script) {
              script = document.createElement('script');
              script.src = 'https://unpkg.com/@zxing/browser@latest';
              script.dataset.superlistZxing = 'true';
              document.head.appendChild(script);
            }

            await new Promise((resolve, reject) => {
              if (window.ZXingBrowser) return resolve();
              script.addEventListener('load', resolve, { once: true });
              script.addEventListener('error', reject, { once: true });
            });
          }

          const reader = new ZXingBrowser.BrowserMultiFormatReader();
          const video = cameraBox.querySelector('video');

          const devices = await ZXingBrowser.BrowserCodeReader.listVideoInputDevices();
          const backCamera = devices.find(device => /back|rear|environment|traseira/i.test(device.label));
          const selectedDeviceId = backCamera?.deviceId || devices[devices.length - 1]?.deviceId;
          controls = await reader.decodeFromVideoDevice(
            selectedDeviceId,
            video,
            (result, error) => {
              if (!result) {
                if (error && error.name !== 'NotFoundException') console.debug('Leitura em andamento:', error);
                return;
              }
              $('#addProductBarcode').value = result.getText();
              if (controls) controls.stop();
              cameraBox.style.display = 'none';
              button.disabled = false;
              toast('Código identificado. Toque em Consultar código.');
            }
          );

        } catch (error) {
          console.error(error);
          if (controls) controls.stop();
          cameraBox.style.display = 'none';
          button.disabled = false;
          toast('Não foi possível iniciar a câmera.');
        }
      };
    }
  }

  mode.addEventListener('change', renderMode);

  results.addEventListener('click', e => {
    const button = e.target.closest('[data-add-catalog]');
    if (!button) return;

    const product = db.products.find(p =>
      p.id === button.dataset.addCatalog
    );

    if (product) {
      addProductToCurrentList(
        product,
        Number($('#addProductQty').value) || 1,
        $('#addProductBrand')?.value || ''
      );
    }
  });

  renderMode();
}


function removeShoppingItem(itemId) {
  if (!currentList) return;

  const item = currentList.items.find(i => i.id === itemId);
  if (!item) return;

  if (!confirm(`Retirar "${item.name}" desta compra? O produto continuará no catálogo.`)) {
    return;
  }

  currentList.items = currentList.items.filter(i => i.id !== itemId);

  save();
  renderShopping();
  toast('Item retirado da compra.');
}

function renderShopping() {
  let l=currentList;

  $('#shoppingTitle').textContent=l.name;
  $('#shoppingMeta').textContent=`Criada em ${dateBR(l.created)} · ${l.items.length} produtos`;
  $('#shoppingStore').textContent=storeName(l.storeId);

  const search = ($('#shoppingSearch')?.value || '')
  .trim()
  .toLocaleLowerCase('pt-BR');

const visibleItems = l.items.filter(i =>
  i.name.toLocaleLowerCase('pt-BR').includes(search)
);

let cats=[...new Set(visibleItems.map(i=>i.category||'Outros'))];

  $('#shoppingItems').innerHTML=cats.length
    ? cats.map(cat=>{
        let its=visibleItems.filter(i=>(i.category||'Outros')===cat);
        let subtotal=its.reduce((s,i)=>s+(Number(i.qty)||0)*(Number(i.price)||0),0);

        return `<section class="shopping-category">
          <h3>${esc(cat)} <small>${money(subtotal)}</small></h3>
          ${its.map(i=>`<div class="shop-item">
            <input type="checkbox" data-check="${i.id}" ${i.checked?'checked':''}>
            <div class="shop-name ${i.checked?'checked':''}">
              <strong>${esc(i.name)}${i.brand ? ` · ${esc(i.brand)}` : ''}</strong>
              <small>
                ${unitLabel(i.unit)}
                ${i.productId?'· cadastrado':'· revisar produto'}
                ${i.estimate?' · previsão '+money(i.estimate):''}
                ${(()=>{
                  let p=db.products.find(p=>p.id===i.productId);
                  return p&&p.netAmount>1?' · embalagem '+p.netAmount+' '+p.netUnit:'';
                })()}
              </small>
            </div>
            <input type="number" min="0" step="${i.unit==='kg'||i.unit==='l'?'.01':'1'}" data-qty="${i.id}" value="${i.qty}" aria-label="Quantidade">
            <input type="number" min="0" step=".01" data-price="${i.id}" value="${i.price||''}" placeholder="Preço (R$)" aria-label="Preço">
            <span class="shop-total">${money((Number(i.qty)||0)*(Number(i.price)||0))}</span>
            <button class="scan-btn" data-scan="${i.id}"
  title="Associar código de barras">▥</button>

<button class="scan-btn" data-edit-shopping-item="${i.id}"
  title="Editar item">✎</button>

<button class="scan-btn" data-remove-shopping-item="${i.id}"
  title="Retirar da compra">×</button>
          </div>`).join('')}
        </section>`;
      }).join('')
    : '<div class="empty-state">Sua lista está vazia. Adicione produtos para começar.</div>';

  const actionBar = document.createElement('div');
  actionBar.className = 'shopping-list-actions';
  actionBar.innerHTML = '<button type="button" class="btn primary" id="addShoppingProduct"><svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/><rect x="3" y="3" width="18" height="18" rx="4"/></svg> Novo Produto</button><button type="button" class="btn secondary" id="addShoppingBarcode"><svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5v14M6 5v14M9 5v14M13 5v14M16 5v14M19 5v14M22 5v14"/></svg> Ler Código de Barras</button>';
  $('#shoppingItems').prepend(actionBar);
  updateSummary();
}

function renameCurrentList() {
  if (!currentList) return;
  openModal('Renomear lista', `<form id="renameListForm"><div class="field"><label>Nome da lista</label><input name="name" maxlength="80" required value="${esc(currentList.name)}"></div><div class="form-actions"><button type="button" class="btn secondary" data-cancel>Cancelar</button><button class="btn primary">Salvar nome</button></div></form>`);
  $('#renameListForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = formData(e.currentTarget).name.trim();
    if (!name) return toast('Informe o nome da lista.');
    currentList.name = name; save(); closeModal(); renderShopping(); toast('Lista renomeada.');
  });
}

function deleteCurrentList() {
  if (!currentList) return;
  if (!confirm('Excluir esta lista permanentemente? Esta ação não pode ser desfeita.')) return;
  const id = currentList.id;
  db.lists = db.lists.filter(list => list.id !== id);
  db.prices = db.prices.filter(price => price.listId !== id);
  db.purchases = db.purchases.filter(purchase => purchase.listId !== id);
  currentList = null; save(); page('lists'); toast('Lista excluída.');
}

function exportCurrentList() {
  if (!currentList) return;
  openModal('Exportar lista', '<p class="muted">Escolha como deseja compartilhar ou guardar sua lista.</p><div class="form-actions" style="flex-wrap:wrap"><button type="button" class="btn secondary" id="exportListExcel">Excel (CSV)</button><button type="button" class="btn secondary" id="exportListPDF">PDF</button><button type="button" class="btn primary" id="exportListWhatsApp">WhatsApp</button></div>');
  $('#exportListExcel').onclick = () => {
    const rows = [['Produto','Marca','Quantidade','Unidade','Preço unitário','Total','Comprado'], ...currentList.items.map(item => [item.name,item.brand||'',item.qty,item.unit,item.price||0,(Number(item.qty)||0)*(Number(item.price)||0),item.checked?'Sim':'Não'])];
    const csv = '\uFEFF' + rows.map(row => row.map(value => '"' + String(value ?? '').replace(/"/g,'""') + '"').join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
    const a=document.createElement('a');a.href=url;a.download=(currentList.name||'lista').replace(/[^\w-]+/g,'_')+'.csv';a.click();URL.revokeObjectURL(url);
  };
  $('#exportListPDF').onclick = () => {
    const rows=currentList.items.map(item=>'<tr><td>'+esc(item.name)+'</td><td>'+esc(item.brand||'')+'</td><td>'+item.qty+' '+esc(item.unit)+'</td><td>'+money(item.price||0)+'</td><td>'+money((Number(item.qty)||0)*(Number(item.price)||0))+'</td><td>'+(item.checked?'Sim':'Não')+'</td></tr>').join('');
    const w=window.open('','_blank');
    if(!w)return toast('Permita pop-ups para gerar o PDF.');
    w.document.write('<html><head><title>'+esc(currentList.name)+'</title><style>body{font:14px Arial;padding:28px;color:#18352d}h1{font-size:22px}table{width:100%;border-collapse:collapse}th,td{padding:9px;border-bottom:1px solid #ddd;text-align:left}button{padding:10px;margin-bottom:18px}@media print{button{display:none}}</style></head><body><button onclick="window.print()">Salvar como PDF / Imprimir</button><h1>'+esc(currentList.name)+'</h1><p>'+esc(storeName(currentList.storeId))+' · '+dateBR(currentList.created)+'</p><table><thead><tr><th>Produto</th><th>Marca</th><th>Quantidade</th><th>Preço</th><th>Total</th><th>Comprado</th></tr></thead><tbody>'+rows+'</tbody></table><h2>Total: '+money(listTotal(currentList))+'</h2></body></html>');
    w.document.close();
  };
  $('#exportListWhatsApp').onclick = () => {
    const text=['*'+currentList.name+'*','Supermercado: '+storeName(currentList.storeId), ...currentList.items.map(item=>'• '+item.name+(item.brand?' ('+item.brand+')':'')+' — '+item.qty+' '+item.unit),'Total estimado: '+money(listTotal(currentList))].join('\n');
    window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank');
  };
}

function updateSummary() {
  let l=currentList;
  if(!l)return;

  let total=listTotal(l);
  let estimate=l.items.reduce((s,i)=>s+(Number(i.qty)||0)*(Number(i.estimate)||Number(i.price)||0),0);

  $('#summaryItems').textContent=l.items.length;
  $('#summaryChecked').textContent=l.items.filter(i=>i.checked).length;
  $('#summaryEstimate').textContent=money(estimate);
  $('#summaryTotal').textContent=money(total);

  $('#shoppingItems').querySelectorAll('.shopping-category').forEach(section=>{
    let cat=section.querySelector('h3').childNodes[0].textContent.trim();
    let sum=l.items
      .filter(i=>i.category===cat)
      .reduce((s,i)=>s+(Number(i.qty)||0)*(Number(i.price)||0),0);

    section.querySelector('h3 small').textContent=money(sum);
  });
}

function savePrice(item) {
  if(!item.price||!item.productId)return;

  let existing=db.prices.find(p=>p.listId===currentList.id&&p.productId===item.productId);
  let product=db.products.find(p=>p.id===item.productId)||{};

  let row={
    id:existing?.id||uid(),
    listId:currentList.id,
    productId:item.productId,
    productName:item.name,
    brand:formatDisplayName(item.brand),
    storeId:currentList.storeId,
    date:today(),
    price:Number(item.price),
    unit:item.unit,
    netAmount:product.netAmount||1,
    netUnit:product.netUnit||item.unit
  };

  if(existing)Object.assign(existing,row);
  else db.prices.push(row);
}


// Melhoria leve da imagem usando apenas recursos nativos do navegador.
// Não depende de OpenCV, evitando carregamento pesado e travamentos.
async function enhanceReceiptImage(file, status) {
  status.textContent = 'Preparando e melhorando a imagem...';

  if (!file || !file.type || !file.type.startsWith('image/')) {
    throw new Error('Selecione uma imagem válida da nota.');
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Não foi possível abrir a foto da nota.'));
      img.src = imageUrl;
    });

    // Limita a resolução para reduzir o uso de memória e processamento.
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d', { willReadFrequently: false });
    if (!context) throw new Error('Não foi possível preparar a imagem neste navegador.');

    // Grayscale + contraste moderado: melhora a leitura sem operações pesadas.
    context.filter = 'grayscale(1) contrast(1.35) brightness(1.08)';
    context.drawImage(image, 0, 0, width, height);
    context.filter = 'none';

    status.textContent = 'Localizando QR Code para evitar que ele atrapalhe o OCR...';
    const qrMasked = await maskQrCodeForOcr(canvas);
    status.textContent = qrMasked
      ? 'QR Code isolado. Iniciando leitura dos textos da nota...'
      : 'Imagem preparada. Iniciando reconhecimento dos textos...';
    return canvas;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

// Tenta localizar o QR Code na imagem e cobrir somente essa região antes do OCR.
async function maskQrCodeForOcr(canvas) {
  if (!('BarcodeDetector' in window)) return false;

  try {
    const detector = new BarcodeDetector({ formats: ['qr_code'] });
    const found = await detector.detect(canvas);
    if (!found.length) return false;

    const ctx = canvas.getContext('2d');
    found.forEach(code => {
      const box = code.boundingBox;
      if (!box) return;
      const margin = Math.max(8, Math.round(Math.max(box.width, box.height) * 0.08));
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(
        Math.max(0, box.x - margin),
        Math.max(0, box.y - margin),
        Math.min(canvas.width - box.x + margin, box.width + margin * 2),
        Math.min(canvas.height - box.y + margin, box.height + margin * 2)
      );
    });
    return true;
  } catch (error) {
    console.warn('Não foi possível localizar o QR Code para excluí-lo do OCR:', error);
    return false;
  }
}

// Extrai sugestões conservadoras de linhas de itens de NFC-e.
// Os valores continuam editáveis e precisam ser conferidos pelo usuário.
function normalizeReceiptText(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9., ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function receiptNumber(value) {
  if (value == null) return NaN;
  return Number(String(value).replace(/\./g, '').replace(',', '.'));
}

// Interpreta o padrão comum de NFC-e: uma linha com código/descrição,
// seguida por outra com quantidade, unidade, preço unitário e total.
// Descontos "Desconto no item N" são aplicados ao item anterior.
function suggestReceiptItems(ocrText) {
  const lines = String(ocrText || '')
    .split(/\r?\n/)
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const result = [];
  let pending = null;

  const itemStart = /^(?:0*\d{1,3})\s+(.+)$/;
  const detail = /^(\d{1,4}[,.]\d{1,3})\s*(UN|UND|KG|G|L|LT|ML|CX|PC|PCT)?\s*(?:X|×)?\s*(\d{1,5}[,.]\d{2})\s+(\d{1,5}[,.]\d{2})$/i;
  const discount = /desconto\s+no\s+item\s+\d+\s*[-:]?\s*(\d{1,5}[,.]\d{2})/i;

  for (const line of lines) {
    const discountMatch = line.match(discount);
    if (discountMatch && result.length) {
      const amount = receiptNumber(discountMatch[1]);
      if (Number.isFinite(amount) && amount > 0) {
        result[result.length - 1].total = Math.max(0, result[result.length - 1].total - amount);
        result[result.length - 1].discount = amount;
      }
      continue;
    }

    // Ignora cabeçalho, rodapé e linhas de pagamento.
    if (/CNPJ|CPF|CHAVE|CONSULTA|PROTOCOLO|TOTAL DE ITENS|VALOR TOTAL|VALOR A PAGAR|FORMA DE PAGAMENTO|CARTAO|CONSUMIDOR|DOCUMENTO AUXILIAR|NOTA FISCAL/i.test(line)) {
      continue;
    }

    const detailMatch = line.match(detail);
    if (detailMatch && pending) {
      const qty = receiptNumber(detailMatch[1]);
      const unit = (detailMatch[2] || 'UN').toUpperCase();
      const unitPrice = receiptNumber(detailMatch[3]);
      const total = receiptNumber(detailMatch[4]);

      if (Number.isFinite(qty) && qty > 0 && Number.isFinite(total) && total >= 0) {
        result.push({
          name: pending.name,
          code: pending.code,
          qty,
          unit,
          unitPrice,
          total,
          discount: 0
        });
      }
      pending = null;
      continue;
    }

    const startMatch = line.match(itemStart);
    if (startMatch) {
      const raw = startMatch[1].trim();
      // Código EAN/código interno costuma vir antes da descrição.
      const codeMatch = raw.match(/^(\d{6,14})\s+(.+)$/);
      const name = (codeMatch ? codeMatch[2] : raw)
        .replace(/\b(?:UN|UND|KG|G|ML|LT|L)\s*$/i, '')
        .trim();

      if (name.length >= 3 && /[A-Za-zÀ-ÿ]/.test(name)) {
        pending = { code: codeMatch ? codeMatch[1] : '', name };
      }
    }
  }

  return result.map(item => {
    const paidTotal = Math.max(0, item.total);
    return {
      ...item,
      paidTotal,
      line: `${item.name}; ${String(item.qty).replace('.', ',')}; ${paidTotal.toFixed(2).replace('.', ',')}`
    };
  });
}

// Correspondência conservadora entre a descrição da nota e o catálogo.
// Só substitui pelo nome cadastrado quando a similaridade é alta.
function findReceiptCatalogMatch(receiptName) {
  const target = normalizeReceiptText(receiptName);
  if (!target) return null;

  let best = null;
  let bestScore = 0;

  for (const product of (db.products || [])) {
    const candidate = normalizeReceiptText(product.name);
    if (!candidate) continue;

    if (candidate === target) return { product, score: 1 };

    const a = new Set(target.split(' ').filter(token => token.length > 2));
    const b = new Set(candidate.split(' ').filter(token => token.length > 2));
    if (!a.size || !b.size) continue;

    const intersection = [...a].filter(token => b.has(token)).length;
    const score = intersection / Math.max(a.size, b.size);

    if (score > bestScore) {
      bestScore = score;
      best = product;
    }
  }

  return best && bestScore >= 0.72 ? { product: best, score: bestScore } : null;
}

async function loadTesseract() {
  if (window.Tesseract) return window.Tesseract;
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Não foi possível carregar o leitor OCR.'));
    document.head.appendChild(script);
  });
  return window.Tesseract;
}

async function loadZXingLibrary() {
  if (window.ZXingBrowser?.BrowserMultiFormatReader) return window.ZXingBrowser;

  if (window.__superlistZXingPromise) return window.__superlistZXingPromise;

  window.__superlistZXingPromise = new Promise((resolve, reject) => {
    let script = document.querySelector('script[data-superlist-zxing]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://unpkg.com/@zxing/browser@latest';
      script.async = true;
      script.dataset.superlistZxing = 'true';
      document.head.appendChild(script);
    }

    const timer = setTimeout(() => reject(new Error('O leitor de QR Code demorou para carregar.')), 20000);

    const check = () => {
      if (window.ZXingBrowser?.BrowserMultiFormatReader) {
        clearTimeout(timer);
        resolve(window.ZXingBrowser);
      }
    };

    script.addEventListener('load', check, { once: true });
    script.addEventListener('error', () => {
      clearTimeout(timer);
      reject(new Error('Não foi possível carregar o leitor de QR Code.'));
    }, { once: true });

    check();
  });

  return window.__superlistZXingPromise;
}

// Leitura de QR em uma imagem já existente: tenta BarcodeDetector e depois ZXing,
// com ampliações para ajudar quando o QR está pequeno na foto.
async function readReceiptQr(file, status) {
  if (!file) return '';

  const imageUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Não foi possível abrir a imagem do QR Code.'));
      image.src = imageUrl;
    });

    if ('BarcodeDetector' in window) {
      try {
        const detector = new BarcodeDetector({ formats: ['qr_code'] });
        for (const factor of [1, 1.5, 2]) {
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(2400, Math.round(img.naturalWidth * factor));
          canvas.height = Math.min(2400, Math.round(img.naturalHeight * factor));
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const results = await detector.detect(canvas);
          const value = results.find(x => x.rawValue)?.rawValue;
          if (value) return value;
        }
      } catch (err) {
        console.warn('BarcodeDetector não conseguiu ler a imagem; tentando ZXing.', err);
      }
    }

    const ZXing = await loadZXingLibrary();
    const reader = new ZXing.BrowserMultiFormatReader();
    const result = await reader.decodeFromImageElement(img);
    return result?.getText?.() || '';
  } catch (error) {
    console.warn('Falha na leitura do QR Code da imagem:', error);
    return '';
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

// Leitura ao vivo pela câmera, sem exigir foto da nota.
async function startReceiptQrCamera(video, status, onFound) {
  const ZXing = await loadZXingLibrary();
  const reader = new ZXing.BrowserMultiFormatReader();

  const controls = await reader.decodeFromVideoDevice(
    undefined,
    video,
    (result, error) => {
      if (result) {
        const value = result.getText();
        if (value) onFound(value);
      }
    }
  );

  status.textContent = 'Aponte a câmera para o QR Code da nota fiscal.';
  return controls;
}

function openPurchaseModal() {
  const storeOptions = db.stores.map(s =>
    `<option value="${esc(s.id)}">${esc(s.name)}</option>`
  ).join('');

  openModal('Registrar compra realizada', `
    <form id="purchaseForm">
      <div class="field">
        <label>Foto da nota fiscal</label>
        <input type="file" id="receiptPhoto" name="receiptPhoto" accept="image/*">
        <small class="muted">Tire uma foto ou escolha uma imagem da galeria. A imagem será ajustada antes da leitura.</small>
        <div id="receiptPreview" style="margin-top:10px"></div>
        <div class="form-actions">
          <button type="button" class="btn primary" id="readReceiptBtn">✨ Analisar nota com IA</button>
        </div>
        <div id="receiptProgress" class="receipt-progress" style="display:none" aria-live="polite">
          <div class="receipt-progress-top"><span class="receipt-spinner"></span><strong id="receiptProgressMessage">Preparando a análise...</strong></div>
          <div class="receipt-progress-track"><span></span></div>
          <small class="muted">Isso pode levar alguns instantes. Não feche esta janela.</small>
        </div>
        <p id="receiptOcrStatus" class="muted" aria-live="polite"></p>
        <div id="receiptAiReview" class="invite-box" style="display:none"></div>
        <div class="field">
          <label>Texto reconhecido na nota</label>
          <textarea id="receiptOcrText" rows="5" placeholder="O texto identificado aparecerá aqui..."></textarea>
        </div>
      </div>

      <div class="form-grid">
        <div class="field">
          <label>Supermercado</label>
          <select name="storeId" required>
            <option value="">Selecione</option>${storeOptions}
          </select>
        </div>
        <div class="field">
          <label>Data da compra</label>
          <input type="date" name="date" value="${today()}" required>
        </div>
      </div>

      <div class="field">
        <div class="receipt-items-heading">
          <div><label>Itens da nota fiscal</label><small class="muted">Edite os dados e aprove individualmente cada produto.</small></div>
          <button type="button" class="btn secondary" id="addReceiptItemBtn">＋ Adicionar item</button>
        </div>
        <div id="receiptItemsEmpty" class="empty-state">Envie uma foto para a IA identificar os produtos ou adicione um item manualmente.</div>
        <div id="receiptItemsTableWrap" class="receipt-table-wrap" style="display:none">
          <table class="receipt-items-table">
            <thead><tr><th>Produto</th><th>Marca</th><th>Preço total (R$)</th><th>Unidade</th><th>Ação</th></tr></thead>
            <tbody id="receiptItemsBody"></tbody>
          </table>
        </div>
        <div id="receiptApprovedSummary" class="receipt-approved-summary" aria-live="polite"></div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn secondary" data-cancel>Cancelar</button>
        <button type="submit" class="btn primary">Registrar produtos aprovados</button>
      </div>
    </form>
  `, 'COMPRA AVULSA');

  // Estilos locais: a melhoria fica restrita ao modal de registro de compra.
  if (!document.getElementById('receiptReviewStyles')) {
    const style = document.createElement('style');
    style.id = 'receiptReviewStyles';
    style.textContent = `
      .receipt-progress{margin:14px 0;padding:13px;border:1px solid #dce8e2;border-radius:12px;background:#f7fbf8}
      .receipt-progress-top{display:flex;align-items:center;gap:9px;margin-bottom:11px;color:#245b43;font-size:13px}
      .receipt-spinner{width:17px;height:17px;border:2px solid #c9ddd1;border-top-color:#23835d;border-radius:50%;animation:receiptSpin .8s linear infinite;flex:none}
      .receipt-progress-track{height:7px;overflow:hidden;border-radius:99px;background:#e1ebe5;margin-bottom:8px}
      .receipt-progress-track span{display:block;width:38%;height:100%;border-radius:99px;background:#23835d;animation:receiptSlide 1.35s ease-in-out infinite}
      @keyframes receiptSpin{to{transform:rotate(360deg)}}
      @keyframes receiptSlide{0%{transform:translateX(-110%)}100%{transform:translateX(280%)}}
      .receipt-items-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
      .receipt-items-heading label{display:block;margin-bottom:3px}
      .receipt-table-wrap{width:100%;overflow-x:auto;border:1px solid #e3e9e5;border-radius:10px}
      .receipt-items-table{width:100%;min-width:650px;border-collapse:collapse;font-size:13px}
      .receipt-items-table th{padding:10px 8px;text-align:left;background:#f5f8f6;color:#53645a;font-weight:600;white-space:nowrap}
      .receipt-items-table td{padding:8px;border-top:1px solid #edf0ee;vertical-align:middle}
      .receipt-items-table input,.receipt-items-table select{width:100%;min-width:90px;box-sizing:border-box;padding:9px 8px;border:1px solid #dce3df;border-radius:7px;background:#fff;color:#24342b;font:inherit}
      .receipt-items-table .receipt-product-input{min-width:190px}
      .receipt-unit-cell{display:flex;gap:6px;min-width:145px}
      .receipt-unit-cell input{width:72px;min-width:65px}
      .receipt-unit-cell select{min-width:65px}
      .receipt-row-actions{display:flex;gap:5px;white-space:nowrap}
      .receipt-row-actions button{padding:7px 9px;border:1px solid #dce3df;border-radius:7px;background:#fff;cursor:pointer;font:inherit}
      .receipt-row-actions .is-approved{background:#e8f5ed;border-color:#9bc9aa;color:#17663b}
      .receipt-row-actions .receipt-delete{color:#a52c2c}
      .receipt-row-approved{background:#fbfefc}
      .receipt-approved-summary{font-size:12px;color:#64736a;margin-top:8px}
      @media(max-width:600px){.receipt-items-heading{align-items:flex-start}.receipt-items-heading .btn{width:100%}}
    `;
    document.head.appendChild(style);
  }

  const receiptInput = $('#receiptPhoto');
  const preview = $('#receiptPreview');
  const status = $('#receiptOcrStatus');
  const progress = $('#receiptProgress');
  const progressMessage = $('#receiptProgressMessage');
  const review = $('#receiptAiReview');
  const itemsBody = $('#receiptItemsBody');
  const itemsWrap = $('#receiptItemsTableWrap');
  const itemsEmpty = $('#receiptItemsEmpty');
  const approvedSummary = $('#receiptApprovedSummary');
  let aiReceiptAnalysis = null;
  let receiptRows = [];
  let progressTimer = null;

  const parseReceiptDecimal = value => {
    const raw = String(value ?? '').trim().replace(/\s/g, '');
    if (!raw) return NaN;
    return raw.includes(',') ? Number(raw.replace(/\./g, '').replace(',', '.')) : Number(raw);
  };

  function renderReceiptRows() {
    itemsWrap.style.display = receiptRows.length ? 'block' : 'none';
    itemsEmpty.style.display = receiptRows.length ? 'none' : 'block';
    itemsBody.innerHTML = receiptRows.map(row => `
      <tr data-receipt-row="${esc(row.id)}" class="${row.approved ? 'receipt-row-approved' : ''}">
        <td><input class="receipt-product-input" data-receipt-field="name" value="${esc(row.name)}" aria-label="Produto"></td>
        <td><input data-receipt-field="brand" value="${esc(row.brand || '')}" placeholder="Marca" aria-label="Marca"></td>
        <td><input data-receipt-field="total" inputmode="decimal" value="${esc(String(row.total).replace('.', ','))}" aria-label="Preço total"></td>
        <td><div class="receipt-unit-cell"><input data-receipt-field="quantity" type="number" min="0.001" step="0.001" value="${esc(String(row.quantity).replace('.', ','))}" aria-label="Quantidade"><select data-receipt-field="unit" aria-label="Unidade">${['un','kg','g','l','ml','cx','pct'].map(u => `<option value="${u}" ${row.unit === u ? 'selected' : ''}>${u}</option>`).join('')}</select></div></td>
        <td><div class="receipt-row-actions"><button type="button" data-receipt-approve="${esc(row.id)}" class="${row.approved ? 'is-approved' : ''}">${row.approved ? '✓ Aprovado' : 'Aprovar'}</button><button type="button" class="receipt-delete" data-receipt-delete="${esc(row.id)}" aria-label="Excluir produto">Excluir</button></div></td>
      </tr>
    `).join('');
    const approved = receiptRows.filter(r => r.approved).length;
    approvedSummary.textContent = `${approved} de ${receiptRows.length} produto(s) aprovado(s) para registro.`;
  }

  receiptInput.addEventListener('change', () => {
    const file = receiptInput.files[0];
    aiReceiptAnalysis = null;
    receiptRows = [];
    renderReceiptRows();
    if (!file) { preview.innerHTML = ''; return; }
    if (!file.type.startsWith('image/')) {
      toast('Selecione uma imagem válida.');
      receiptInput.value = '';
      preview.innerHTML = '';
      return;
    }
    const url = URL.createObjectURL(file);
    preview.innerHTML = `<img src="${url}" alt="Foto original da nota" style="width:100%;max-height:260px;object-fit:contain;border-radius:10px;border:1px solid #ddd">`;
    status.textContent = 'Foto carregada. Clique em “Analisar nota com IA”.';
  });

  $('#addReceiptItemBtn').addEventListener('click', () => {
    receiptRows.push({ id: uid(), name: '', brand: '', total: '', quantity: 1, unit: 'un', approved: false, catalogMatchId: null });
    renderReceiptRows();
    itemsBody.querySelector('tr:last-child input')?.focus();
  });

  itemsBody.addEventListener('input', e => {
    const field = e.target.dataset.receiptField;
    if (!field) return;
    const tr = e.target.closest('[data-receipt-row]');
    const row = receiptRows.find(r => r.id === tr?.dataset.receiptRow);
    if (row) row[field] = e.target.value;
  });

  itemsBody.addEventListener('change', e => {
    const field = e.target.dataset.receiptField;
    if (!field) return;
    const tr = e.target.closest('[data-receipt-row]');
    const row = receiptRows.find(r => r.id === tr?.dataset.receiptRow);
    if (row) row[field] = e.target.value;
  });

  itemsBody.addEventListener('click', e => {
    const approveButton = e.target.closest('[data-receipt-approve]');
    const deleteButton = e.target.closest('[data-receipt-delete]');
    if (approveButton) {
      const row = receiptRows.find(r => r.id === approveButton.dataset.receiptApprove);
      if (!row) return;
      const price = parseReceiptDecimal(row.total);
      const qty = parseReceiptDecimal(row.quantity);
      if (!row.name.trim() || !Number.isFinite(price) || price < 0 || !Number.isFinite(qty) || qty <= 0) {
        return toast('Preencha produto, preço e quantidade/unidade corretamente antes de aprovar.');
      }
      row.approved = !row.approved;
      renderReceiptRows();
    }
    if (deleteButton) {
      receiptRows = receiptRows.filter(r => r.id !== deleteButton.dataset.receiptDelete);
      renderReceiptRows();
    }
  });

  $('#readReceiptBtn').addEventListener('click', async () => {
    const file = receiptInput.files[0];
    if (!file) return toast('Selecione ou fotografe a nota fiscal.');
    if (!window.SuperlistCloud?.analyzeReceipt) {
      return toast('Integração de IA não disponível. Verifique a configuração do Supabase.');
    }

    const button = $('#readReceiptBtn');
    const output = $('#receiptOcrText');
    button.disabled = true;
    button.textContent = 'Analisando...';
    progress.style.display = 'block';
    progressMessage.textContent = 'Enviando a imagem com segurança...';
    status.textContent = 'A IA está processando a nota fiscal.';
    review.style.display = 'none';
    review.innerHTML = '';

    const progressMessages = [
      'Enviando a imagem com segurança...',
      'A IA está identificando os produtos e quantidades...',
      'Conferindo preços, descontos e totais...',
      'Organizando os produtos para sua revisão...'
    ];
    let progressIndex = 0;
    progressTimer = setInterval(() => {
      progressIndex = (progressIndex + 1) % progressMessages.length;
      progressMessage.textContent = progressMessages[progressIndex];
    }, 4500);

    try {
      const analysis = await window.SuperlistCloud.analyzeReceipt(file, (db.products || []).map(p => ({
        id: p.id, name: p.name, category: p.category || 'Outros', unit: p.unit || 'un',
        netAmount: p.netAmount || 1, netUnit: p.netUnit || p.unit || 'un', barcode: p.barcode || ''
      })));

      aiReceiptAnalysis = analysis;
      output.value = analysis.raw_text || '';
      const items = Array.isArray(analysis.items) ? analysis.items : [];

      const storeSelect = $('#purchaseForm [name="storeId"]');
      if (analysis.store_name && storeSelect) {
        const storeMatch = (db.stores || []).find(s => normalizeReceiptText(s.name) === normalizeReceiptText(analysis.store_name));
        if (storeMatch) storeSelect.value = storeMatch.id;
      }
      const dateInput = $('#purchaseForm [name="date"]');
      if (analysis.invoice_date && /^\d{4}-\d{2}-\d{2}$/.test(analysis.invoice_date) && dateInput) dateInput.value = analysis.invoice_date;

      receiptRows = items.map(item => {
        const matched = item.catalog_match_id ? db.products.find(p => String(p.id) === String(item.catalog_match_id)) : null;
        return {
          id: uid(), name: matched?.name || item.name || 'Produto não identificado', brand: formatDisplayName(item.brand),
          total: Number(item.paid_total ?? item.line_total) || 0,
          quantity: Number(item.quantity) || 1,
          unit: (() => { const raw = String(item.unit || matched?.unit || 'un').toLowerCase(); return ({und:'un',unid:'un',unidade:'un',lt:'l',litro:'l',litros:'l',grama:'g',gramas:'g',quilo:'kg',quilos:'kg',pacote:'pct',caixa:'cx'}[raw] || (['un','kg','g','l','ml','cx','pct'].includes(raw) ? raw : 'un')); })(),
          approved: false,
          catalogMatchId: matched?.id || item.catalog_match_id || null
        };
      });
      renderReceiptRows();

      const matchedCount = receiptRows.filter(r => r.catalogMatchId).length;
      const unmatchedCount = receiptRows.length - matchedCount;
      review.innerHTML = `<strong>Análise da IA concluída — confira cada linha</strong><p class="muted">${items.length} item(ns) identificado(s) · ${matchedCount} associado(s) ao catálogo · ${unmatchedCount} para revisar/cadastrar.</p><p class="muted">A IA pode cometer erros. Edite os campos e aprove somente os produtos conferidos.</p>`;
      review.style.display = 'block';

      if (analysis.invoice_total != null) {
        status.textContent = `Leitura concluída. Total informado na nota: ${money(analysis.invoice_total)}. Confira os itens antes de registrar.`;
      } else {
        status.textContent = `Leitura concluída: ${items.length} item(ns) extraído(s). Confira os dados antes de registrar.`;
      }
      progressMessage.textContent = 'Análise concluída!';
      toast(`${items.length} item(ns) analisado(s) pela IA.`);
    } catch (error) {
      console.error('Erro na análise IA da nota:', error);
      status.textContent = 'Não conseguimos ler a nota neste momento. Tente novamente em alguns instantes ou confira os produtos manualmente.';
      toast('Não foi possível concluir a leitura agora. Você pode conferir os produtos manualmente.');
    } finally {
      if (progressTimer) clearInterval(progressTimer);
      progressTimer = null;
      progress.style.display = 'none';
      button.disabled = false;
      button.textContent = '✨ Analisar nota com IA';
    }
  });

  $('#purchaseForm').addEventListener('submit', e => {
    e.preventDefault();
    const data = formData(e.target);
    const store = db.stores.find(s => s.id === data.storeId);
    if (!store) return toast('Selecione um supermercado cadastrado.');

    const approvedRows = receiptRows.filter(row => row.approved);
    if (!approvedRows.length) return toast('Aprove pelo menos um produto para registrar a compra.');

    const parsed = approvedRows.map(row => ({
      name: formatDisplayName(row.name), brand: formatDisplayName(row.brand),
      qty: parseReceiptDecimal(row.quantity),
      total: parseReceiptDecimal(row.total),
      unit: String(row.unit || 'un').toLowerCase(),
      catalogMatchId: row.catalogMatchId
    }));
    if (parsed.some(item => !item.name || !Number.isFinite(item.qty) || item.qty <= 0 || !Number.isFinite(item.total) || item.total < 0)) {
      return toast('Revise os produtos aprovados: nome, preço e quantidade precisam ser válidos.');
    }

    const purchaseId = uid();
    db.purchases ||= [];
    db.purchases.push({
      id: purchaseId, storeId: store.id, date: data.date,
      total: parsed.reduce((sum, item) => sum + item.total, 0),
      itemCount: parsed.length, createdAt: new Date().toISOString(), receiptQr: ''
    });

    parsed.forEach(item => {
      const exactMatch = item.catalogMatchId
        ? db.products.find(p => String(p.id) === String(item.catalogMatchId))
        : null;
      const catalogMatch = exactMatch ? { product: exactMatch, score: 1 } : findReceiptCatalogMatch(item.name);
      let product = catalogMatch?.product || null;

      if (!product) {
        product = {
          id: uid(), name: item.name, category: 'Outros', unit: item.unit,
          netAmount: 1, netUnit: ['kg','g','l','ml'].includes(item.unit) ? item.unit : 'un',
          barcode: '', photo: '', active: true
        };
        db.products.push(product);
      }

      // Mantém a unidade identificada/editada na linha da nota para o histórico.
      db.prices.push({
        id: uid(), purchaseId, listId: null,
        productId: product.id, productName: product.name, brand: item.brand,
        storeId: store.id, date: data.date,
        price: item.total / item.qty, totalPaid: item.total,
        quantity: item.qty, unit: item.unit,
        netAmount: product.netAmount || 1,
        netUnit: product.netUnit || item.unit
      });
    });

    save();
    closeModal();
    toast('Compra registrada com os produtos aprovados!');
  });
}

// Leitor de código de barras compatível com Safari e outros navegadores.
async function scanBarcode(itemId) {
  let item=currentList?.items.find(i=>i.id===itemId);

  if(!item) {
    toast('Item não encontrado.');
    return;
  }

  openModal(
    'Ler código de barras',
    `<div class="field">
      <label>Código de barras</label>
      <input id="barcodeInput" placeholder="Digite ou cole o código EAN">
    </div>
    <div class="camera-box" id="cameraBox">
      Aponte a câmera para o código de barras
    </div>
    <div class="camera-controls">
      <button type="button" class="btn secondary" id="startCamera">▣ Abrir câmera</button>
      <button type="button" class="btn secondary" id="stopCamera">Parar câmera</button>
      <button type="button" class="btn primary" id="lookupBarcode">Consultar código</button>
    </div>
    <p class="helper">
      A leitura utiliza a câmera traseira. Permita o acesso quando o Safari solicitar.
      Se não funcionar, digite o código manualmente.
    </p>`,
    'SUPERLIST'
  );

  let controls=null;
  let reader=null;
  let stopped=false;
  let lookupStarted=false;

  const stop=()=>{
    stopped=true;

    if(controls) {
      try {
        controls.stop();
      } catch(e) {
        console.warn('Erro ao parar leitor:',e);
      }
      controls=null;
    }

    const video=$('#cameraBox')?.querySelector('video');

    if(video?.srcObject) {
      video.srcObject.getTracks().forEach(track=>track.stop());
      video.srcObject=null;
    }

    reader=null;
  };

  const loadZXing=()=>new Promise((resolve,reject)=>{
    if(window.ZXingBrowser) {
      resolve(window.ZXingBrowser);
      return;
    }

    const existing=document.querySelector('script[data-superlist-zxing]');

    if(existing) {
      if(existing.dataset.loaded==='true'&&window.ZXingBrowser) {
        resolve(window.ZXingBrowser);
        return;
      }

      existing.addEventListener('load',()=>{
        window.ZXingBrowser
          ? resolve(window.ZXingBrowser)
          : reject(new Error('Não foi possível carregar o leitor.'));
      },{once:true});

      existing.addEventListener('error',()=>{
        reject(new Error('Falha ao carregar a biblioteca de leitura.'));
      },{once:true});

      return;
    }

    const script=document.createElement('script');

    script.src='https://unpkg.com/@zxing/browser@0.2.1/umd/index.min.js';
    script.async=true;
    script.dataset.superlistZxing='true';

    script.onload=()=>{
      script.dataset.loaded='true';

      if(window.ZXingBrowser) {
        resolve(window.ZXingBrowser);
      } else {
        reject(new Error('Biblioteca de leitura indisponível.'));
      }
    };

    script.onerror=()=>{
      reject(new Error('Não foi possível baixar o leitor. Verifique sua conexão.'));
    };

    document.head.appendChild(script);
  });

  $('#stopCamera').onclick=()=>{
    stop();
    const button=$('#startCamera');
    if(button)button.textContent='Abrir câmera novamente';

    const box=$('#cameraBox');
    if(box)box.textContent='Câmera desligada.';
  };

  $('#startCamera').onclick=async()=>{
    const button=$('#startCamera');
    const box=$('#cameraBox');

    try {
      stop();
      stopped=false;

      if(!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          'A câmera não está disponível. Acesse o Superlist pelo endereço HTTPS no Safari.'
        );
      }

      button.disabled=true;
      button.textContent='Carregando leitor...';

      const ZXing=await loadZXing();

      if(stopped||!$('#cameraBox'))return;

      if(!ZXing.BrowserMultiFormatReader) {
        throw new Error('O leitor de códigos não foi carregado corretamente.');
      }

      reader=new ZXing.BrowserMultiFormatReader();

      const video=document.createElement('video');

      video.setAttribute('autoplay','');
      video.setAttribute('muted','');
      video.setAttribute('playsinline','');
      video.playsInline=true;
      video.muted=true;
      video.style.width='100%';
      video.style.height='100%';
      video.style.objectFit='contain';

      box.innerHTML='';
      box.appendChild(video);

      button.textContent='Câmera aberta';

      // Seleciona preferencialmente a câmera traseira e usa o leitor contínuo da ZXing.
      const devices=await ZXing.BrowserCodeReader.listVideoInputDevices();
      const backCamera=devices.find(device=>/back|rear|environment|traseira|environment/i.test(device.label));
      const selectedDeviceId=backCamera?.deviceId || devices[devices.length-1]?.deviceId;
      controls=await reader.decodeFromVideoDevice(
        selectedDeviceId,
        video,
        (result,error)=>{
          if(stopped)return;
          if(!result) {
            if(error && error.name!=='NotFoundException') console.debug('Leitura em andamento:',error);
            return;
          }
          const code=result.getText();
          if(code) {
            $('#barcodeInput').value=code;
            box.textContent='Código lido: '+code;
            stop();
            button.textContent='Abrir câmera novamente';
            button.disabled=false;
            toast('Código de barras identificado!');
          }
        }
      );

      if(stopped&&controls) {
        controls.stop();
        controls=null;
      }

    } catch(e) {
      console.error('Erro na câmera:',e);

      stop();

      if(box)box.textContent='Não foi possível iniciar a câmera.';

      button.disabled=false;
      button.textContent='Abrir câmera';

      let message=e.message||'Não foi possível abrir a câmera.';

      if(e.name==='NotAllowedError') {
        message='Acesso à câmera negado. Verifique as permissões do Safari.';
      } else if(e.name==='NotFoundError') {
        message='Nenhuma câmera foi encontrada neste dispositivo.';
      } else if(e.name==='NotReadableError') {
        message='A câmera está sendo utilizada por outro aplicativo.';
      }

      toast(message);

    } finally {
      button.disabled=false;

      if(button.textContent==='Carregando leitor...') {
        button.textContent='Abrir câmera';
      }
    }
  };

  $('#lookupBarcode').onclick=async()=>{
    if(lookupStarted)return;

    const code=$('#barcodeInput').value.trim();

    if(!code) {
      toast('Informe o código de barras.');
      return;
    }

    lookupStarted=true;

    const lookupButton=$('#lookupBarcode');
    lookupButton.disabled=true;
    lookupButton.textContent='Consultando...';

    try {
      const response=await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`
      );

      if(!response.ok) {
        throw new Error('Falha na consulta.');
      }

      const data=await response.json();
      const prod=data.product;

      if(data.status===1&&prod) {
        let match=
          db.products.find(p=>p.barcode===code)||
          db.products.find(p=>p.name.toLowerCase()===item.name.toLowerCase());

        if(match) {
          item.productId=match.id;
          item.name=match.name;
          item.category=match.category;
          item.unit=match.unit;
          match.barcode=code;
        } else {
          let p={
            id:uid(),
            name:prod.product_name_pt||prod.product_name||item.name,
            category:inferProductCategory(prod),
            unit:item.unit,
            barcode:code,
            photo:prod.image_url||'',
            active:true
          };

          db.products.push(p);

          item.productId=p.id;
          item.name=p.name;
          item.category=p.category;
        }

        stop();
        save();
        closeModal();
        renderShopping();
        toast('Código associado com sucesso!');

      } else {
        toast('Produto não encontrado no catálogo. Você pode cadastrá-lo manualmente.');
      }

    } catch(e) {
      console.error('Erro na consulta:',e);
      toast('Não foi possível consultar. Verifique sua conexão.');

    } finally {
      lookupStarted=false;

      if($('#lookupBarcode')) {
        $('#lookupBarcode').disabled=false;
        $('#lookupBarcode').textContent='Consultar código';
      }
    }
  };

  // Desliga a câmera ao fechar o modal.
  $('#closeModal').addEventListener('click',stop);

  $('#modalBackdrop').addEventListener('click',e=>{
    if(e.target.id==='modalBackdrop')stop();
  });
}
function finishList() {
  if(!currentList)return;

  let l=currentList;
  l.done=true;
  l.items.forEach(savePrice);

  save();
  page('lists');
  toast('Compra finalizada e preços registrados!');
}

function exportCSV() {
  let rows=[
    ['Produto','Supermercado','Data','Preço da embalagem','Unidade de compra','Conteúdo da embalagem','Unidade equivalente','Preço equivalente'],
    ...db.prices.map(p=>{
      let amount=Number(p.netAmount)||1;
      let normalized=Number(p.price)/amount;

      return [
        p.productName,
        storeName(p.storeId),
        dateBR(p.date),
        p.price,
        p.unit,
        amount,
        p.netUnit||p.unit,
        normalized
      ];
    })
  ];

  let csv=rows.map(r=>r.map(x=>'"'+String(x).replaceAll('"','""')+'"').join(';')).join('\n');
  let blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  let a=document.createElement('a');

  a.href=URL.createObjectURL(blob);
  a.download='superlist-historico-precos.csv';
  a.click();

  URL.revokeObjectURL(a.href);
  toast('Arquivo de preços exportado!');
}

// Perfil pessoal: nome/e-mail e família somente leitura; telefone e foto editáveis.
function formatProfilePhone(value='') {
  const d=String(value).replace(/\D/g,'').slice(0,11);
  if(d.length<=2)return d?`(${d}`:'';
  if(d.length<=6)return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if(d.length<=10)return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}
async function profileModal() {
  const cloud=window.SuperlistCloud;
  if(!cloud){toast('Não foi possível conectar ao perfil.');return;}
  openModal('Meu perfil','<p class="muted">Carregando seus dados...</p>','MINHA CONTA');
  try {
    const profile=await cloud.getProfile();
    const avatar=profile.avatarUrl?`<img src="${esc(profile.avatarUrl)}" alt="Foto do perfil" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`:`<span style="font-size:25px;font-weight:700;color:#176b52">${esc(getNameInitials(profile.fullName))}</span>`;
    $('#modalBody').innerHTML=`
      <style>.profile-edit-grid{display:grid;gap:12px}.profile-photo-row{display:flex;align-items:center;gap:16px;margin-bottom:16px}.profile-photo{width:88px;height:88px;border-radius:50%;overflow:hidden;background:#e8f2ed;display:grid;place-items:center;border:3px solid #d8e9df;flex:none}.profile-readonly{background:#f4f6f5!important;color:#52615b!important}.profile-code{display:flex;gap:8px}.profile-code input{font-family:monospace;font-weight:700;letter-spacing:1px}.profile-actions{display:flex;gap:8px;flex-wrap:wrap}</style>
      <div class="profile-photo-row"><div class="profile-photo" id="profilePhotoPreview">${avatar}</div><div><strong>Foto do perfil</strong><p class="muted" style="margin:4px 0 10px">A foto aparecerá ao lado do seu usuário.</p><div class="profile-actions"><button type="button" class="btn secondary" id="chooseProfilePhoto">Enviar foto</button><button type="button" class="btn secondary" id="takeProfilePhoto">Usar câmera</button></div><input id="profilePhotoFile" type="file" accept="image/*" hidden><input id="profileCameraFile" type="file" accept="image/*" capture="user" hidden></div></div>
      <div class="profile-edit-grid">
        <div class="field"><label>Nome completo</label><input class="profile-readonly" value="${esc(profile.fullName)}" readonly aria-readonly="true"></div>
        <div class="field"><label>E-mail</label><input class="profile-readonly" type="email" value="${esc(profile.email)}" readonly aria-readonly="true"></div>
        <div class="field"><label>Telefone com DDD</label><input id="profilePhone" type="tel" inputmode="numeric" maxlength="15" value="${esc(formatProfilePhone(profile.phone))}" placeholder="(00) 00000-0000"></div>
        <div class="field"><label>Nome da Família</label><input class="profile-readonly" value="${esc(profile.familyName?`Família ${profile.familyName}`:'Não identificado')}" readonly aria-readonly="true"></div>
        <div class="field"><label>Código de vinculação da família</label><div class="profile-code"><input id="profileFamilyCode" class="profile-readonly" value="${esc(profile.familyCode||'Indisponível')}" readonly aria-readonly="true"><button type="button" class="btn secondary" id="copyFamilyCode">Copiar</button></div><small class="muted">Compartilhe esse código somente com pessoas que deseja adicionar à família.</small></div>
      </div>
      <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><button type="button" class="btn primary" id="saveProfilePhone">Salvar telefone</button><button type="button" class="btn secondary" id="closeProfile">Fechar</button><button type="button" class="btn secondary" id="profileSignOut" style="margin-left:auto;color:#b42318;border-color:#f0c7c4">Sair da conta</button></div><p id="profileFeedback" class="auth-note" aria-live="polite"></p>`;
    const phone=$('#profilePhone');phone.addEventListener('input',()=>phone.value=formatProfilePhone(phone.value));
    $('#saveProfilePhone').addEventListener('click',async()=>{const digits=phone.value.replace(/\D/g,'');if(digits.length!==10&&digits.length!==11){toast('Informe um telefone válido com DDD.');return;}const btn=$('#saveProfilePhone');btn.disabled=true;try{await cloud.updatePhone(digits);toast('Telefone atualizado com sucesso!');}catch(e){toast(e.message||'Não foi possível atualizar o telefone.');}finally{btn.disabled=false;}});
    $('#chooseProfilePhoto').onclick=()=>$('#profilePhotoFile').click();$('#takeProfilePhoto').onclick=()=>$('#profileCameraFile').click();
    async function handlePhoto(input){const file=input.files?.[0];if(!file)return;try{const url=await cloud.uploadAvatar(file);$('#profilePhotoPreview').innerHTML=`<img src="${esc(url)}" alt="Foto do perfil" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;applyProfileAvatar(url);toast('Foto de perfil atualizada!');}catch(e){toast(e.message||'Não foi possível enviar a foto.');}finally{input.value='';}}
    $('#profilePhotoFile').addEventListener('change',e=>handlePhoto(e.target));$('#profileCameraFile').addEventListener('change',e=>handlePhoto(e.target));
    $('#copyFamilyCode').onclick=()=>{const code=profile.familyCode;if(!code){toast('Código de vinculação indisponível.');return;}if(navigator.clipboard?.writeText)navigator.clipboard.writeText(code).then(()=>toast('Código copiado!')).catch(()=>toast('Não foi possível copiar o código.'));else{const input=$('#profileFamilyCode');input.select();document.execCommand('copy');toast('Código copiado!');}};
    $('#closeProfile').onclick=closeModal;
    $('#profileSignOut').addEventListener('click',async()=>{const btn=$('#profileSignOut');btn.disabled=true;btn.textContent='Saindo...';try{await cloud.signOut();}catch(err){btn.disabled=false;btn.textContent='Sair da conta';toast(err.message||'Não foi possível sair da conta.');}});
  } catch(e) { $('#modalBody').innerHTML=`<p>Não foi possível carregar seu perfil: ${esc(e.message||'Tente novamente.')}</p><button type="button" class="btn secondary" id="closeProfile">Fechar</button>`;$('#closeProfile').onclick=closeModal; }
}
function getNameInitials(name='') {
  const parts=String(name).trim().split(/\s+/).filter(Boolean);
  if(!parts.length)return 'U';
  return (parts.length===1?parts[0].slice(0,2):parts[0][0]+parts[parts.length-1][0]).toLocaleUpperCase('pt-BR');
}
function applyProfileAvatar(url,fullName='') {
  const button=$('#profileAvatarButton');if(!button)return;
  button.innerHTML=url?`<img src="${esc(url)}" alt="Foto do perfil" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`:`<span style="font-weight:700;color:#176b52">${esc(getNameInitials(fullName))}</span>`;
}

// Conta, login, cadastro e recuperação de senha.
function accountModal() {
  const cloud=window.SuperlistCloud;
  if(!cloud){toast('Não foi possível conectar à conta agora.');return;}
  openModal('Acessar o SuperList', '<div id="authScreen"></div>', 'MINHA CONTA');
  const screen=$('#authScreen');

  const eyeField=(name,label,placeholder='')=>`<div class="field"><label>${label}</label><div style="display:flex;gap:8px;align-items:center"><input style="flex:1" id="${name}" name="${name}" type="password" autocomplete="${name==='password'?'current-password':'new-password'}" placeholder="${placeholder}" required><button type="button" class="btn secondary" data-toggle-password="${name}" aria-label="Mostrar senha" title="Mostrar senha">◉</button></div></div>`;
  function wireEyes(){screen.querySelectorAll('[data-toggle-password]').forEach(btn=>btn.addEventListener('click',()=>{const input=$('#'+btn.dataset.togglePassword);if(!input)return;const show=input.type==='password';input.type=show?'text':'password';btn.textContent=show?'◎':'◉';btn.title=show?'Ocultar senha':'Mostrar senha';btn.setAttribute('aria-label',btn.title);}));}
  function familyArea(){return `<div class="invite-box" style="margin-top:18px"><strong>Compartilhar com a família</strong><p>Já tem um código de convite? Informe abaixo para entrar no espaço compartilhado.</p><div class="field"><label>Código de convite</label><input id="joinCode" placeholder="Código recebido de quem criou o espaço"></div><button type="button" class="btn secondary" id="joinHousehold">Entrar em um espaço compartilhado</button><hr style="margin:14px 0;border:0;border-top:1px solid var(--border,#ddd)"><strong>Convide sua família</strong><div id="inviteCodeDisplay">Código disponível após entrar.</div><button type="button" class="text-button" id="showInviteCode">Mostrar meu código de convite</button></div><button type="button" class="btn secondary" id="signOutBtn" style="margin-top:12px;width:100%">Sair da conta</button>`;}
  function wireFamily(){
    const join=$('#joinHousehold'); if(join)join.addEventListener('click',async()=>{try{const code=$('#joinCode').value.trim();if(!code){toast('Informe o código de convite.');return;}await cloud.join(code);closeModal();await cloud.loadIntoApp();toast('Você entrou no espaço compartilhado!');}catch(err){toast(err.message||'Não foi possível entrar no espaço.');}});
    const invite=$('#showInviteCode');if(invite)invite.addEventListener('click',async()=>{try{const code=await cloud.getInviteCode();$('#inviteCodeDisplay').innerHTML=`<div class="invite-code">${esc(code)}</div><small>Compartilhe este código somente com pessoas de confiança.</small>`;}catch(err){toast(err.message||'Entre na sua conta para obter o convite.');}});
    const out=$('#signOutBtn');if(out)out.addEventListener('click',async()=>{try{await cloud.signOut();closeModal();toast('Você saiu da sua conta.');}catch(err){toast(err.message||'Não foi possível sair.');}});
  }
  function showLogin(){
    screen.innerHTML=`<div class="invite-box">Entre para sincronizar suas listas e compartilhar suas compras com a família.</div><form id="loginForm"><div class="field"><label>E-mail</label><input id="loginEmail" name="email" type="email" autocomplete="email" required placeholder="voce@email.com"></div>${eyeField('loginPassword','Senha','Digite sua senha')}<div style="text-align:right;margin:-4px 0 14px"><button type="button" class="text-button" id="forgotPassword">Esqueci minha senha</button></div><button class="btn primary full" type="submit">Entrar</button></form><p style="text-align:center;margin:18px 0 8px">Ainda não tem uma conta?</p><button type="button" class="btn secondary full" id="goSignup">Criar minha conta</button>${familyArea()}`;
    wireEyes();wireFamily();
    $('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const email=$('#loginEmail').value.trim(),password=$('#loginPassword').value;try{await cloud.signIn(email,password);closeModal();toast('Login realizado com sucesso!');}catch(err){toast(err.message||'Confira seu e-mail e sua senha e tente novamente.');}});
    $('#goSignup').addEventListener('click',showSignup);$('#forgotPassword').addEventListener('click',showRecoveryEmail);
  }
  function showSignup(){
    screen.innerHTML=`<p class="muted">Crie sua conta para manter suas listas protegidas e sincronizadas.</p><form id="signupForm"><div class="field"><label>E-mail</label><input id="signupEmail" type="email" autocomplete="email" required placeholder="voce@email.com"></div>${eyeField('signupPassword','Senha','Crie uma senha segura')}${eyeField('signupConfirm','Confirme sua senha','Digite a senha novamente')}<div class="invite-box" style="font-size:13px;margin:8px 0"><strong>Sua senha precisa ter:</strong><ul style="margin:8px 0 0 18px"><li>Ao menos 8 caracteres</li><li>Uma letra maiúscula e uma minúscula</li><li>Um caractere especial (ex.: ! @ # $ %)</li></ul></div><p id="signupFeedback" class="auth-note" aria-live="polite"></p><button class="btn primary full" type="submit">Criar conta</button></form><p style="text-align:center;margin-top:16px">Já tem uma conta? <button type="button" class="text-button" id="backLogin">Voltar ao login</button></p>`;
    wireEyes();
    const pass=$('#signupPassword'),confirm=$('#signupConfirm'),feedback=$('#signupFeedback');
    const validate=()=>{const v=pass.value, c=confirm.value;const checks=[v.length>=8,/[A-ZÀ-Þ]/.test(v),/[a-zà-ÿ]/.test(v),/[^A-Za-zÀ-ÿ0-9\s]/.test(v)];let msg=checks.every(Boolean)?'Senha atende aos requisitos.':'A senha ainda não atende a todos os requisitos.';if(c&&v!==c)msg='As senhas estão diferentes.';else if(c&&v===c&&checks.every(Boolean))msg='As senhas conferem.';feedback.textContent=msg;feedback.style.color=(checks.every(Boolean)&&(!c||v===c))?'#16834a':'#b45309';return checks.every(Boolean)&&v===c&&c.length>0;};
    pass.addEventListener('input',validate);confirm.addEventListener('input',validate);
    $('#signupForm').addEventListener('submit',async e=>{e.preventDefault();const email=$('#signupEmail').value.trim();if(!validate()){toast('Confira os requisitos e a confirmação da senha.');return;}try{await cloud.signUp(email,pass.value);toast('Cadastro iniciado! Confira seu e-mail para confirmar a conta.');showLogin();}catch(err){toast(err.message||'Não foi possível criar sua conta.');}});
    $('#backLogin').addEventListener('click',showLogin);
  }
  function showRecoveryEmail(){
    screen.innerHTML=`<p>Informe o e-mail cadastrado. Enviaremos um código para confirmar que a conta é sua.</p><form id="recoveryEmailForm"><div class="field"><label>E-mail cadastrado</label><input id="recoveryEmail" type="email" autocomplete="email" required placeholder="voce@email.com"></div><button class="btn primary full" type="submit">Enviar código</button></form><p style="text-align:center;margin-top:16px"><button type="button" class="text-button" id="backLogin">Voltar ao login</button></p>`;
    $('#backLogin').addEventListener('click',showLogin);
    $('#recoveryEmailForm').addEventListener('submit',async e=>{e.preventDefault();const email=$('#recoveryEmail').value.trim();try{await cloud.sendRecoveryCode(email);showRecoveryCode(email);toast('Se o e-mail estiver cadastrado, você receberá um código de confirmação.');}catch(err){toast(err.message||'Não foi possível enviar o código. Tente novamente.');}});
  }
  function showRecoveryCode(email){
    screen.innerHTML=`<p>Digite o código enviado para <strong>${esc(email)}</strong> e escolha uma nova senha.</p><form id="recoveryForm"><div class="field"><label>Código de confirmação</label><input id="recoveryToken" inputmode="numeric" autocomplete="one-time-code" required maxlength="12" placeholder="Código recebido por e-mail"></div>${eyeField('newPassword','Nova senha','Mínimo de 8 caracteres')}${eyeField('newPasswordConfirm','Confirme a nova senha','Digite novamente')}<div class="invite-box" style="font-size:13px">Use pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um caractere especial.</div><p id="recoveryFeedback" class="auth-note" aria-live="polite"></p><button class="btn primary full" type="submit">Confirmar e alterar senha</button></form><p style="text-align:center;margin-top:16px"><button type="button" class="text-button" id="resendCode">Enviar outro código</button> · <button type="button" class="text-button" id="backLogin">Voltar ao login</button></p>`;
    wireEyes();const pass=$('#newPassword'),confirm=$('#newPasswordConfirm'),feedback=$('#recoveryFeedback');
    const validate=()=>{const v=pass.value,c=confirm.value;const ok=v.length>=8&&/[A-ZÀ-Þ]/.test(v)&&/[a-zà-ÿ]/.test(v)&&/[^A-Za-zÀ-ÿ0-9\s]/.test(v);feedback.textContent=c&&v!==c?'As senhas estão diferentes.':ok?'Senha válida.':'A senha precisa atender aos requisitos informados.';return ok&&c.length>0&&v===c;};pass.addEventListener('input',validate);confirm.addEventListener('input',validate);
    $('#recoveryForm').addEventListener('submit',async e=>{e.preventDefault();if(!validate()){toast('Confira os requisitos e a confirmação da senha.');return;}try{await cloud.verifyRecoveryCode(email,$('#recoveryToken').value.trim(),pass.value);toast('Senha alterada! Agora você já pode entrar.');showLogin();}catch(err){toast(err.message||'Código inválido ou expirado. Solicite outro código.');}});
    $('#resendCode').addEventListener('click',async()=>{try{await cloud.sendRecoveryCode(email);toast('Se o e-mail estiver cadastrado, enviaremos outro código.');}catch(err){toast(err.message||'Não foi possível reenviar o código.');}});$('#backLogin').addEventListener('click',showLogin);
  }
  showLogin();
}

let adminCache={users:[],families:[],audit:[]};
function adminEscape(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function adminDate(v){return v?new Date(v).toLocaleString('pt-BR'):'—';}
function adminNotice(message,error=false){const el=$('#adminNotice');if(el){el.textContent=message;el.classList.toggle('error',!!error);}}
async function adminRequest(action,extra={}){if(!window.SuperlistCloud?.adminRequest)throw new Error('Atualize os arquivos do SuperList para habilitar o painel administrativo.');return window.SuperlistCloud.adminRequest(action,extra);}
async function loadAdminDashboard(){
 if(!window.__superlistIsAdmin){adminNotice('Acesso não autorizado.',true);return;}
 adminNotice('Consultando dados administrativos…');
 try{
  const data=await adminRequest('dashboard');adminCache={users:data.users||[],families:data.families||[],audit:data.audit||[]};
  const stats=[['Usuários',adminCache.users.length],['Famílias',adminCache.families.length],['Usuários bloqueados',adminCache.users.filter(u=>u.banned).length],['Administradores',adminCache.users.filter(u=>u.isAdmin).length]];
  $('#adminStats').innerHTML=stats.map(([label,value])=>`<article class="stat-card"><span>${label}</span><strong>${value}</strong></article>`).join('');
  renderAdminUsers();renderAdminFamilies();renderAdminAudit();adminNotice('Dados atualizados. A consulta e as ações administrativas são registradas para auditoria.');
 }catch(e){console.error(e);adminNotice(e.message||'Não foi possível carregar o painel administrativo.',true);}
}
function renderAdminUsers(){const q=($('#adminUserSearch')?.value||'').toLowerCase();const rows=adminCache.users.filter(u=>`${u.email} ${u.fullName}`.toLowerCase().includes(q));$('#adminUsersRows').innerHTML=rows.length?rows.map(u=>`<tr><td><strong>${adminEscape(u.fullName||'Sem nome')}</strong><small class="admin-sub">${adminEscape(u.email)}</small></td><td>${adminDate(u.createdAt)}</td><td><span class="admin-pill ${u.banned?'blocked':'active'}">${u.banned?'Bloqueado':'Ativo'}</span></td><td>${u.isAdmin?(u.adminRole==='super_admin'?'Administrador principal':'Administrador'):'Usuário'}</td><td class="admin-actions">${u.isPrincipal?'<span class="muted">Conta principal</span>':`<button class="text-button" data-admin-action="ban" data-user-id="${u.id}" data-banned="${u.banned}">${u.banned?'Reativar':'Bloquear'}</button>${window.__superlistAdminRole==='super_admin'?`<button class="text-button" data-admin-action="role" data-user-id="${u.id}" data-admin="${u.isAdmin}">${u.isAdmin?'Remover admin':'Tornar admin'}</button>`:''}`}</td></tr>`).join(''):'<tr><td colspan="5">Nenhum usuário encontrado.</td></tr>';}
function renderAdminFamilies(){const q=($('#adminFamilySearch')?.value||'').toLowerCase();const rows=adminCache.families.filter(f=>`${f.name} ${f.ownerEmail}`.toLowerCase().includes(q));$('#adminFamiliesRows').innerHTML=rows.length?rows.map(f=>`<tr><td><strong>Família ${adminEscape(f.name)}</strong><small class="admin-sub">Código: ${adminEscape(f.inviteCode)}</small></td><td>${adminEscape(f.ownerName||f.ownerEmail||'—')}<small class="admin-sub">${adminEscape(f.ownerEmail||'')}</small></td><td>${f.memberCount}</td><td>${f.listCount}</td><td>${f.productCount}</td><td>${adminDate(f.createdAt)}</td></tr>`).join(''):'<tr><td colspan="6">Nenhuma família encontrada.</td></tr>';}
function renderAdminAudit(){const rows=adminCache.audit;$('#adminAuditRows').innerHTML=rows.length?rows.map(a=>`<tr><td>${adminDate(a.createdAt)}</td><td>${adminEscape(a.adminEmail)}</td><td>${adminEscape(a.action)}</td><td>${adminEscape(a.target||'—')}</td><td>${adminEscape(a.details||'—')}</td></tr>`).join(''):'<tr><td colspan="5">Nenhum registro de auditoria.</td></tr>';}
async function adminUserAction(button){const id=button.dataset.userId;const action=button.dataset.adminAction;try{button.disabled=true;if(action==='ban'){const banned=button.dataset.banned!=='true';if(!confirm(banned?'Confirma bloquear este usuário? Ele não poderá entrar enquanto estiver bloqueado.':'Confirma reativar este usuário?'))return;await adminRequest('set_user_ban',{userId:id,banned});}else{const isAdmin=button.dataset.admin==='true';if(!confirm(isAdmin?'Remover privilégios administrativos deste usuário?':'Conceder privilégios de administrador a este usuário?'))return;await adminRequest('set_admin',{userId:id,isAdmin});}toast('Ação administrativa concluída.');await loadAdminDashboard();}catch(e){toast(e.message||'Não foi possível executar a ação.');}finally{button.disabled=false;}}

function init() {
  $('#todayLabel').textContent=new Date().toLocaleDateString(
    'pt-BR',
    {weekday:'short',day:'2-digit',month:'short'}
  );

  renderAll();
  $('#adminRefresh')?.addEventListener('click',loadAdminDashboard);
  $('#adminUserSearch')?.addEventListener('input',renderAdminUsers);
  $('#adminFamilySearch')?.addEventListener('input',renderAdminFamilies);

  document.addEventListener('click',e=>{
    const adminTab=e.target.closest('[data-admin-tab]');if(adminTab){const tab=adminTab.dataset.adminTab;$$('.admin-tab').forEach(b=>b.classList.toggle('active',b===adminTab));$('#adminUsersPanel').hidden=tab!=='users';$('#adminFamiliesPanel').hidden=tab!=='families';$('#adminAuditPanel').hidden=tab!=='audit';return;}
    const adminAction=e.target.closest('[data-admin-action]');if(adminAction){adminUserAction(adminAction);return;}
    let nav=e.target.closest('[data-page]');

    if(nav) {
      e.preventDefault();
      page(nav.dataset.page);
      return;
    }

    let go=e.target.closest('[data-goto]');

    if(go) {
      page(go.dataset.goto);
      return;
    }

    if(
      e.target.closest('[data-action="new-list"]')||
      e.target.id==='homeNewList'||
      e.target.id==='newListBtn'
    ) {
      createListModal();
      return;
    }

    const renameListButton=e.target.closest('[data-rename-list]');
    if(renameListButton){e.stopPropagation();renameListById(renameListButton.dataset.renameList);return;}
    const deleteListButton=e.target.closest('[data-delete-list]');
    if(deleteListButton){e.stopPropagation();deleteListById(deleteListButton.dataset.deleteList);return;}

    let open=e.target.closest('[data-open-list]');

    if(open) {
      openList(open.dataset.openList);
      return;
    }

    if(e.target.closest('[data-cancel]')) {
      closeModal();
      return;
    }

    if(e.target.id==='addStoreBtn') {
      addStoreModal();
      return;
    }

    if(e.target.id==='addProductBtn') {
      addProductModal();
      return;
    }

    if(e.target.id==='addCategoryBtn') {
      addCategory();
      return;
    }

    let edit=e.target.closest('[data-edit-product]');

    if(edit) {
      addProductModal(
        db.products.find(p=>p.id===edit.dataset.editProduct)
      );
      return;
    }

    let del=e.target.closest('[data-delete-store]');

    if(del) {
      if(confirm('Excluir este supermercado? Os registros de preço existentes serão mantidos.')) {
        db.stores=db.stores.filter(s=>s.id!==del.dataset.deleteStore);
        save();
      }
      return;
    }

    let cat=e.target.closest('[data-cat]');

    if(cat) {
      activeCategory=cat.dataset.cat;
      renderProducts();
      return;
    }
const editShopping = e.target.closest('[data-edit-shopping-item]');
if (editShopping) {
  editShoppingItem(editShopping.dataset.editShoppingItem);
  return;
}

const removeShopping = e.target.closest('[data-remove-shopping-item]');
if (removeShopping) {
  removeShoppingItem(removeShopping.dataset.removeShoppingItem);
  return;
}

if (e.target.closest('#addShoppingProduct')) {
  addCatalogProductToList();
  return;
}
if (e.target.closest('#addShoppingBarcode')) {
  addCatalogProductToList();
  const mode = $('#addProductMode');
  if (mode) { mode.value = 'barcode'; mode.dispatchEvent(new Event('change')); }
  return;
}
if (e.target.closest('#renameCurrentList')) { renameCurrentList(); return; }
if (e.target.closest('#deleteCurrentList')) { deleteCurrentList(); return; }
if (e.target.closest('#exportCurrentList')) { exportCurrentList(); return; }
    let scan=e.target.closest('[data-scan]');

    if(scan) {
      scanBarcode(scan.dataset.scan);
      return;
    }
  });
  $('#shoppingSearch')?.addEventListener('input', renderShopping);
  $('#closeModal').onclick=closeModal;

  $('#modalBackdrop').addEventListener('click',e=>{
    if(e.target.id==='modalBackdrop') {
      closeModal();
    }
  });

  $('#mobileMenu').onclick=()=>{
    $('#sidebar').classList.toggle('open');
  };

  $('#profileAvatarButton').onclick=()=>window.__superlistSignedIn?profileModal():accountModal();
  $('#accountBtn').onclick=()=>window.__superlistSignedIn?profileModal():accountModal();

  $('#listSearch').addEventListener('input',renderLists);
  $('#listFilter').addEventListener('change',renderLists);

  $('#productSearch').addEventListener('input',renderProducts);
  $('#categoryFilter').addEventListener('change',renderProducts);

  $('#priceStoreFilter').addEventListener('change',renderPrices);
  $('#priceSearch').addEventListener('input',renderPrices);

  $('#exportPrices').onclick=exportCSV;
  if ($('#registerPurchaseBtn')) $('#registerPurchaseBtn').onclick = openPurchaseModal;

  $('#backToLists').onclick=()=>page('lists');
  if ($('#finishList')) $('#finishList').onclick=finishList;
  $('#finishListBottom').onclick=finishList;

  $('#shoppingItems').addEventListener('change',e=>{
    let l=currentList;
    if(!l)return;

    let id=e.target.dataset.check||e.target.dataset.qty||e.target.dataset.price;
    if(!id)return;

    let item=l.items.find(i=>i.id===id);
    if(!item)return;

    if(e.target.dataset.check) {
      item.checked=e.target.checked;
    }

    if(e.target.dataset.qty) {
      item.qty=Number(e.target.value)||0;
    }

    if(e.target.dataset.price) {
      item.price=Number(e.target.value)||0;
      item.estimate=item.price;
      savePrice(item);
    }

    renderShopping();
    save();
  });
}

init();

if(window.SuperlistCloud) {
  window.SuperlistCloud.onStatus(s=>{
    let el=$('#syncStatus');

    if(el) {
      el.textContent=s.label;
      el.className='sync-status '+(s.state||'');
    }

    const accountButton=$('#accountBtn');
    const identity=$('#userIdentity');
    if(s.userEmail) {
      window.__superlistSignedIn=true;
      if(identity)identity.style.display='flex';
      if(!window.__superlistProfileLoaded){window.__superlistProfileLoaded=true;window.SuperlistCloud.getProfile().then(p=>{
        applyProfileAvatar(p.avatarUrl,p.fullName);
        const name=$('#identityName'),family=$('#identityFamily'),email=$('#identityEmail');
        if(name)name.textContent=p.fullName||'Usuário';
        if(family)family.textContent=p.familyName?`Família ${p.familyName}`:'Família não identificada';
        if(email)email.textContent=p.email||s.userEmail;
        window.__superlistIsAdmin=!!p.isAdmin;window.__superlistAdminRole=p.adminRole||'';
        document.documentElement.dataset.admin=window.__superlistIsAdmin?'true':'false';
        const adminLink=$('.admin-only');if(adminLink)adminLink.style.display=window.__superlistIsAdmin?'flex':'none';
      }).catch(()=>{window.__superlistProfileLoaded=false;});}
    } else if(s.userEmail===null) {
      window.__superlistSignedIn=false;window.__superlistProfileLoaded=false;window.__superlistIsAdmin=false;
      if(identity)identity.style.display='none';
      applyProfileAvatar('', '');
    }
  });

  window.SuperlistCloud.boot({
    getData:()=>db,
    emptyData:()=>({categories:[...seedCategories],products:JSON.parse(JSON.stringify(seedProducts)),stores:[],lists:[],prices:[],purchases:[]}),
    setData:d=>{
      const original = JSON.stringify(d || {});
      db=normalizeProductNames(d || {});
      db.lists.forEach(list => (list.items || []).forEach(item => { item.brand = formatDisplayName(item.brand); }));
      db.prices.forEach(price => { price.brand = formatDisplayName(price.brand); });
      const normalized = JSON.stringify(db);
      localStorage.setItem(KEY,normalized);
      renderAll();
      // Se dados antigos vierem da nuvem, grava a versão padronizada no snapshot compartilhado.
      if (original !== normalized && window.SuperlistCloud?.scheduleSync) window.SuperlistCloud.scheduleSync(db);
    },
    key:KEY
  }).then(ready=>{
    if(ready){
      document.documentElement.classList.remove('auth-check');
    }else if(document.documentElement.classList.contains('auth-check')){
      document.body.innerHTML='<main style="max-width:560px;margin:12vh auto;padding:24px;font:16px system-ui;color:#18352d"><h1>Não foi possível carregar seus dados</h1><p>Por segurança, a área de listas continua bloqueada. Verifique sua conexão e tente novamente.</p><a href="./index.html">Voltar à página inicial</a></main>';
      document.documentElement.classList.remove('auth-check');
    }
  }).catch(error=>{
    console.error('Falha ao inicializar a área privada:',error);
    if(document.documentElement.classList.contains('auth-check')){
      document.body.innerHTML='<main style="max-width:560px;margin:12vh auto;padding:24px;font:16px system-ui;color:#18352d"><h1>Não foi possível validar sua conta</h1><p>Por segurança, a área privada permanece bloqueada.</p><a href="./index.html">Voltar à página inicial</a></main>';
      document.documentElement.classList.remove('auth-check');
    }
  });
}
