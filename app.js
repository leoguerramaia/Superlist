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

function loadDB() {
  try {
    let d = JSON.parse(localStorage.getItem(KEY));

    if(d) {
      d.categories ||= seedCategories;
      d.products ||= seedProducts;
      d.stores ||= [];
      d.lists ||= [];
      d.prices ||= [];
      d.purchases ||= [];

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
  $$('.page').forEach(p => p.classList.toggle('active',p.id==='page-'+name));
  $$('.nav-link').forEach(b => b.classList.toggle('active',b.dataset.page===name));
  $('#pageTitle').textContent = ({
    home:'Visão geral',
    lists:'Minhas listas',
    stores:'Supermercados',
    products:'Produtos e categorias',
    prices:'Histórico de preços',
    shopping:'Compras'
  })[name]||name;
  $('#sidebar').classList.remove('open');
  if(name!=='shopping') renderAll();
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
    ? ls.map(l=>`<article class="list-card" data-open-list="${l.id}">${listCardInner(l)}</article>`).join('')
    : '<div class="empty-state">Nenhuma lista encontrada. Clique em “Nova lista” para começar.</div>';
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
    .filter(p=>(store==='all'||p.storeId===store)&&p.productName.toLowerCase().includes(q))
    .sort((a,b)=>b.date.localeCompare(a.date));

  $('#priceSummary').innerHTML=
    `<div><small>Registros de preço</small><strong>${rows.length}</strong></div>
     <div><small>Supermercados</small><strong>${new Set(rows.map(r=>r.storeId)).size}</strong></div>
     <div><small>Produtos acompanhados</small><strong>${new Set(rows.map(r=>r.productId)).size}</strong></div>`;

  $('#priceRows').innerHTML=rows.length
    ? rows.map(p=>`<tr>
        <td><strong>${esc(p.productName)}</strong></td>
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
  if(!db.stores.length) {
    toast('Cadastre pelo menos um supermercado primeiro.');
    page('stores');
    return;
  }

  openModal('Criar nova lista',`<form id="modalForm">
    <div class="field">
      <label>Nome da lista</label>
      <input name="name" required placeholder="Ex.: Compra do mês">
    </div>
    <div class="form-grid">
      <div class="field">
        <label>Supermercado</label>
        <select name="storeId">${db.stores.map((s,i)=>`<option value="${s.id}" ${i===0?'selected':''}>${esc(s.name)}</option>`).join('')}</select>
      </div>
      <div class="field">
        <label>Data de criação</label>
        <input name="created" type="date" value="${today()}" required>
      </div>
    </div>
    <div class="field">
      <label>Importar itens por texto (opcional)</label>
      <textarea name="text" placeholder="Ex.:
2 arroz 5kg
1 kg de banana
Leite 3 unidades
Carne moída 1,5 kg"></textarea>
    </div>
    <p class="helper">Você também poderá adicionar produtos individualmente depois. Itens não reconhecidos serão incluídos em “Outros”.</p>
    <div class="form-actions">
      <button type="button" class="btn secondary" data-cancel>Cancelar</button>
      <button class="btn primary">Criar lista</button>
    </div>
  </form>`,'NOVA LISTA');

  $('#modalForm').addEventListener('submit',e=>{
    e.preventDefault();
    let d=formData();
    let storeId=d.storeId;
    let items=parseImported(d.text||'');

    items.forEach(i=>{
      let h=latestPrice(i.productId,storeId);
      if(h)i.estimate=h.price;
    });

    let l={
      id:uid(),
      name:d.name,
      storeId,
      created:d.created,
      done:false,
      items
    };

    db.lists.push(l);
    save();
    closeModal();
    openList(l.id);
    toast('Lista criada com sucesso!');
  });
}

function parseImported(text) {
  return text.split(/\n|,/).map(line=>line.trim()).filter(Boolean).map(line=>{
    let qty=1,unit=null,name=line;
    let m=line.match(/^(\d+(?:[,.]\d+)?)\s*(kg|quilo[s]?|g|gramas?|l|litros?|ml|un(?:idade[s]?)?|x)?\s+(?:de\s+)?(.+)$/i);

    if(m) {
      qty=Number(m[1].replace(',','.'));
      let u=(m[2]||'').toLowerCase();
      name=m[3].trim();

      if(/kg|quilo/.test(u))unit='kg';
      else if(u==='g'||u.startsWith('gram'))unit='g';
      else if(u==='l'||u.startsWith('litro'))unit='l';
      else if(u==='ml')unit='ml';
      else if(u.startsWith('un')||u==='x')unit='un';
    }

    let norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    let found=db.products.find(p=>norm(name).includes(norm(p.name))||norm(p.name).includes(norm(name)));
    if (!found) {
  found = {
    id: uid(),
    name: name,
    category: 'Outros',
    unit: unit || 'un',
    ...packageInfo(name, unit || 'un'),
    barcode: '',
    photo: '',
    photoPath: '',
    active: true
  };

  db.products.push(found);
}

    return {
      id:uid(),
      productId:found?.id||null,
      name:found?.name||name,
      category:found?.category||'Outros',
      unit:unit||found?.unit||'un',
      qty,
      price:0,
      checked:false
    };
  });
}

function addStoreModal() {
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
        <input id="productPhotoFile" type="file"
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

      d.name = d.name.trim();
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
        name: d.name,
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

item.name = d.name.trim();
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
      name: item.name.trim(),
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

  item.productId = product.id;
  item.name = product.name;
  item.category = product.category;
  item.unit = product.unit;

  return product;
}



function addProductToCurrentList(product, qty = 1) {
  if (!currentList || !product) return;

  const already = currentList.items.find(
    i => i.productId === product.id
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
          Number($('#addProductQty').value) || 1
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
              category: 'Outros',
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
            Number($('#addProductQty').value) || 1
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

          controls = await reader.decodeFromConstraints(
            {
              audio: false,
              video: { facingMode: { ideal: 'environment' } }
            },
            video,
            (result) => {
              if (!result) return;

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
        Number($('#addProductQty').value) || 1
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
              <strong>${esc(i.name)}</strong>
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

  updateSummary();
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

    script.src='https://unpkg.com/@zxing/browser@latest';
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

      controls=await reader.decodeFromConstraints(
        {
          audio:false,
          video:{
            facingMode:{ideal:'environment'}
          }
        },
        video,
        (result,error)=>{
          if(stopped||!result)return;

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
            category:'Outros',
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

// Conta e sincronização.
function accountModal() {
  let cloud=window.SuperlistCloud;

  if(!cloud) {
    toast('Supabase não configurado ou não carregado.');
    return;
  }

  let status=cloud.status();

  openModal(
    'Conta e sincronização',
    `<div class="invite-box">
      ${esc(status)}<br>
      Entre ou crie uma conta para sincronizar suas listas entre dispositivos e compartilhar o espaço da família.
    </div>
    <form id="authForm">
      <div class="field">
        <label>E-mail</label>
        <input name="email" type="email" required placeholder="voce@email.com">
      </div>
      <div class="field">
        <label>Senha</label>
        <input name="password" type="password" required minlength="6" placeholder="Mínimo de 6 caracteres">
      </div>
      <div class="form-actions">
        <button type="button" class="btn secondary" id="signOutBtn">Sair</button>
        <button type="button" class="btn secondary" id="signUpBtn">Criar conta</button>
        <button type="submit" class="btn primary">Entrar</button>
      </div>
    </form>
    <div class="field" style="margin-top:15px">
      <label>Código de convite da família</label>
      <input id="joinCode" placeholder="Código recebido de quem criou o espaço">
    </div>
    <button type="button" class="btn secondary" id="joinHousehold">
      Entrar em um espaço compartilhado
    </button>
    <div class="invite-box">
      <strong>Convide sua família</strong>
      <div id="inviteCodeDisplay">Código disponível após entrar.</div>
      <button type="button" class="text-button" id="showInviteCode">
        Mostrar meu código de convite
      </button>
    </div>
    <p class="auth-note">
      Para ativar a nuvem, configure a URL e a chave pública do seu projeto Supabase no arquivo cloud.js e execute o script SQL fornecido no pacote.
    </p>`,
    'MINHA CONTA'
  );

  const authForm=$('#authForm');

  authForm.addEventListener('submit',async e=>{
    e.preventDefault();

    if(!authForm.reportValidity())return;

    const d=formData(authForm);

    try {
      await cloud.signIn(d.email,d.password);
      closeModal();
      toast('Login realizado!');

    } catch(err) {
      console.error('Erro no login:',err);
      toast(err.message||'Não foi possível entrar.');
    }
  });

  $('#signUpBtn').addEventListener('click',async()=>{
    if(!authForm.reportValidity())return;

    const d=formData(authForm);

    try {
      await cloud.signUp(d.email,d.password);
      toast('Conta criada! Verifique seu e-mail se a confirmação estiver ativada.');

    } catch(err) {
      console.error('Erro no cadastro:',err);
      toast(err.message||'Não foi possível criar a conta.');
    }
  });

  $('#signOutBtn').addEventListener('click',async()=>{
    try {
      await cloud.signOut();
      closeModal();
      toast('Sessão encerrada.');

    } catch(err) {
      console.error(err);
      toast(err.message||'Erro ao sair.');
    }
  });

  $('#joinHousehold').addEventListener('click',async()=>{
    try {
      const code=$('#joinCode').value.trim();

      if(!code) {
        toast('Informe o código de convite.');
        return;
      }

      await cloud.join(code);
      closeModal();
      await cloud.loadIntoApp();
      toast('Você entrou no espaço compartilhado!');

    } catch(err) {
      console.error(err);
      toast(err.message||'Erro ao entrar no espaço.');
    }
  });

  $('#showInviteCode').addEventListener('click',async()=>{
    try {
      let code=await cloud.getInviteCode();

      $('#inviteCodeDisplay').innerHTML=
        `<div class="invite-code">${esc(code)}</div>
         <small>Compartilhe este código somente com pessoas de confiança.</small>`;

    } catch(err) {
      console.error(err);
      toast(err.message||'Erro ao obter convite.');
    }
  });
}

function init() {
  $('#todayLabel').textContent=new Date().toLocaleDateString(
    'pt-BR',
    {weekday:'short',day:'2-digit',month:'short'}
  );

  renderAll();

  document.addEventListener('click',e=>{
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
    let scan=e.target.closest('[data-scan]');

    if(scan) {
      scanBarcode(scan.dataset.scan);
      return;
    }
  });
$('#shoppingSearch').addEventListener('input', renderShopping);
  $('#closeModal').onclick=closeModal;

  $('#modalBackdrop').addEventListener('click',e=>{
    if(e.target.id==='modalBackdrop') {
      closeModal();
    }
  });

  $('#mobileMenu').onclick=()=>{
    $('#sidebar').classList.toggle('open');
  };

  $('#accountBtn').onclick=accountModal;

  $('#listSearch').addEventListener('input',renderLists);
  $('#listFilter').addEventListener('change',renderLists);

  $('#productSearch').addEventListener('input',renderProducts);
  $('#categoryFilter').addEventListener('change',renderProducts);

  $('#priceStoreFilter').addEventListener('change',renderPrices);
  $('#priceSearch').addEventListener('input',renderPrices);

  $('#exportPrices').onclick=exportCSV;

  $('#backToLists').onclick=()=>page('lists');
  $('#finishList').onclick=finishList;
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

    if(accountButton&&s.userEmail) {
      accountButton.textContent=s.userEmail;
      accountButton.title='Conta conectada: '+s.userEmail;

    } else if(accountButton&&s.userEmail===null) {
      accountButton.textContent='Conta';
      accountButton.title='Entrar ou criar conta';
    }
  });

  window.SuperlistCloud.boot({
    getData:()=>db,
    setData:d=>{
      db=d;
      localStorage.setItem(KEY,JSON.stringify(db));
      renderAll();
    },
    key:KEY
  });
}
