// Visao geral personalizada
(function(){
  const root=document.querySelector('#page-home');
  if(!root || typeof db==='undefined') return;
  const cash=n=>money(n);
  const lists=db.lists||[], done=lists.filter(x=>x.done), active=lists.filter(x=>!x.done);
  const today=new Date(), ym=today.toISOString().slice(0,7), yr=today.getFullYear().toString();
  const sumList=l=>(l.items||[]).reduce((s,i)=>s+(Number(i.qty)||0)*(Number(i.price)||0),0);
  const purchases=db.purchases||[];
  const sumPurchases=fn=>purchases.filter(p=>fn(String(p.date||''))).reduce((s,p)=>s+(Number(p.total)||0),0);
  const sumLists=fn=>done.filter(l=>fn(String(l.created||''))).reduce((s,l)=>s+sumList(l),0);
  const month=sumPurchases(d=>d.slice(0,7)===ym)+sumLists(d=>d.slice(0,7)===ym);
  const year=sumPurchases(d=>d.slice(0,4)===yr)+sumLists(d=>d.slice(0,4)===yr);
  const total=sumPurchases(()=>true)+sumLists(()=>true);
  const counts={};
  [...done.flatMap(l=>l.items||[]),...db.prices.filter(p=>p.purchaseId)].forEach(i=>{
    const name=i.name||i.productName||'';
    const key=name.toLocaleLowerCase('pt-BR');
    if(key){counts[key]=counts[key]||{name,qty:0};counts[key].qty+=Number(i.qty||i.quantity)||1;}
  });
  const top=Object.values(counts).sort((a,b)=>b.qty-a.qty)[0];
  const prices={};
  (db.prices||[]).forEach(p=>{const k=p.productId||p.productName;if(!k)return;(prices[k]||= []).push(p);});
  const deals=Object.values(prices).map(a=>{
    const sorted=[...a].sort((x,y)=>String(x.date||'').localeCompare(String(y.date||'')));
    const latest=sorted[sorted.length-1],best=[...sorted].sort((x,y)=>Number(x.price)-Number(y.price))[0];
    return {name:best.productName||latest.productName,store:storeName(best.storeId),price:Number(best.price),saving:Number(latest.price)-Number(best.price),n:a.length};
  }).filter(x=>x.n>1&&x.saving>0.009).sort((a,b)=>b.saving-a.saving).slice(0,5);
  const offerHtml=deals.length?deals.map(x=>'<article class="dash-card"><strong>'+esc(x.name)+'</strong><small>'+esc(x.store)+' · menor preço registrado</small><b>'+cash(x.price)+'</b><small class="dash-green">'+cash(x.saving)+' abaixo do último preço</small></article>').join(''):'<p class="dash-empty">Ainda não há histórico suficiente para apontar oportunidades. Registre preços em compras diferentes.</p>';
  const activeHtml=active.length?active.map(l=>{const n=(l.items||[]).length,c=(l.items||[]).filter(i=>i.checked).length,p=n?Math.round(c/n*100):0;return '<article class="dash-card dash-open" data-open-list="'+esc(l.id)+'"><strong>'+esc(l.name)+'</strong><small>'+esc(storeName(l.storeId))+' · '+dateBR(l.created)+'</small><div class="dash-bar"><i style="width:'+p+'%"></i></div><small>'+c+' de '+n+' produtos · '+p+'%</small><b>'+cash(sumList(l))+'</b></article>';}).join(''):'<p class="dash-empty">Nenhuma lista em andamento.</p>';
  const style=document.createElement('style');
  style.textContent='.dash-section{margin:26px 0}.dash-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.dash-card{background:#fff;border:1px solid var(--line);border-radius:13px;padding:16px;display:flex;flex-direction:column;gap:8px;min-width:0}.dash-card strong{font-size:13px}.dash-card b{font-size:20px;color:#176b52}.dash-card small{font-size:10px;color:#77857d}.dash-green{color:#21815d!important}.dash-empty{padding:18px;border:1px dashed #d5e1da;border-radius:12px;color:#718078;font-size:12px;background:#fff}.dash-bar{height:6px;background:#edf2ef;border-radius:10px;overflow:hidden}.dash-bar i{display:block;height:100%;background:#2b9b70}.dash-open{cursor:pointer}.dash-metric{background:#fff;border:1px solid var(--line);border-radius:13px;padding:17px;display:flex;flex-direction:column;gap:7px}.dash-metric span,.dash-metric small{font-size:11px;color:#718078}.dash-metric b{font-size:23px;color:#18352d;overflow-wrap:anywhere}.dash-metric.feature{background:#fbfefc;border-color:#b8dcca}.dash-activities{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.dash-activities .dash-card b{font-size:20px}.dash-activities .wide{grid-column:span 2}@media(max-width:760px){.dash-grid{grid-template-columns:1fr}.dash-activities{grid-template-columns:repeat(2,minmax(0,1fr))}.dash-activities .wide{grid-column:1/-1}}';
  document.head.appendChild(style);
  function renderDashboard(){ root.innerHTML='<div class="page-head"><div><div class="eyebrow">SEU CONTROLE DE COMPRAS</div><h1>Visão geral</h1><p class="muted">Acompanhe os gastos e planeje as próximas compras da família.</p></div><button class="btn primary" id="homeNewList">＋ Nova lista</button></div>'+
  '<section class="dash-section"><h2>Resumo financeiro</h2><div class="dash-grid"><article class="dash-metric feature"><span>Gasto neste mês</span><b>'+cash(month)+'</b><small>'+today.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})+'</small></article><article class="dash-metric"><span>Gasto neste ano</span><b>'+cash(year)+'</b><small>'+yr+'</small></article><article class="dash-metric"><span>Gasto total</span><b>'+cash(total)+'</b><small>Histórico registrado</small></article></div></section>'+
  '<section class="dash-section"><h2>Resumo das atividades</h2><div class="dash-grid dash-activities"><article class="dash-card"><b>'+done.length+'</b><small>Listas concluídas</small></article><article class="dash-card"><b>'+lists.length+'</b><small>Listas criadas</small></article><article class="dash-card"><b>'+active.length+'</b><small>Listas em andamento</small></article><article class="dash-card"><b>'+(db.products||[]).length+'</b><small>Produtos cadastrados</small></article><article class="dash-card wide"><b>'+(top?esc(top.name):'Ainda sem dados')+'</b><small>Produto mais comprado</small></article></div></section>'+
  '<section class="dash-section"><h2>Oportunidades para sua família</h2><p class="muted">Produtos com menor preço que o último valor registrado.</p><div class="dash-grid">'+offerHtml+'</div></section>'+
  '<section class="dash-section"><h2>Listas em andamento</h2><div class="dash-grid">'+activeHtml+'</div></section>';
  }
  renderDashboard();
  renderHome=renderDashboard;
})();