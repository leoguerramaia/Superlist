(() => {
  const items = [
    { name: "Arroz 5 kg", detail: "1 pacote", price: 28.90, checked: false },
    { name: "Leite integral", detail: "1 litro", price: 5.49, checked: false },
    { name: "Café 500 g", detail: "1 pacote", price: 18.90, checked: false },
    { name: "Banana", detail: "1 kg", price: 7.80, checked: false },
    { name: "Detergente", detail: "1 unidade", price: 2.49, checked: false }
  ];
  const extraProducts = [
    { name: "Pão de forma", detail: "1 pacote", price: 8.90 },
    { name: "Ovos, 12 unidades", detail: "1 bandeja", price: 11.50 },
    { name: "Maçã", detail: "1 kg", price: 9.20 }
  ];
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const list = document.getElementById("demoItems");
  const itemCount = document.getElementById("demoItemCount");
  const checkedCount = document.getElementById("demoCheckedCount");
  const estimate = document.getElementById("demoEstimate");
  const checkedTotal = document.getElementById("demoCheckedTotal");
  const checkedLabel = document.getElementById("demoCheckedLabel");

  function addRow(item, index) {
    const label = document.createElement("label");
    label.className = "demo-item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.checked;
    checkbox.dataset.index = String(index);
    checkbox.setAttribute("aria-label", "Marcar " + item.name + " como comprado");
    const name = document.createElement("span");
    name.className = "demo-item-name";
    const strong = document.createElement("strong");
    strong.textContent = item.name;
    const detail = document.createElement("small");
    detail.textContent = item.detail;
    name.append(strong, detail);
    const price = document.createElement("span");
    price.className = "demo-item-price";
    price.textContent = currency.format(item.price);
    label.append(checkbox, name, price);
    list.append(label);
  }

  function updateSummary() {
    const selected = items.filter(item => item.checked);
    const allTotal = items.reduce((sum, item) => sum + item.price, 0);
    const selectedTotal = selected.reduce((sum, item) => sum + item.price, 0);
    itemCount.textContent = String(items.length);
    checkedCount.textContent = String(selected.length);
    estimate.textContent = currency.format(allTotal);
    checkedTotal.textContent = currency.format(selectedTotal);
    checkedLabel.textContent = selected.length + " de " + items.length + " itens";
  }

  items.forEach(addRow);
  updateSummary();

  list.addEventListener("change", event => {
    const checkbox = event.target.closest('input[type="checkbox"]');
    if (!checkbox) return;
    const item = items[Number(checkbox.dataset.index)];
    if (!item) return;
    item.checked = checkbox.checked;
    updateSummary();
  });

  document.getElementById("demoAddForm").addEventListener("submit", event => {
    event.preventDefault();
    const selector = document.getElementById("demoProduct");
    const product = extraProducts[Number(selector.value)];
    if (!product) return;
    const item = { ...product, checked: false };
    items.push(item);
    addRow(item, items.length - 1);
    updateSummary();
    selector.value = "";
  });

  const dialog = document.getElementById("accountDialog");
  const dialogMessage = document.getElementById("dialogMessage");
  document.querySelectorAll("[data-requires-account]").forEach(button => {
    button.addEventListener("click", () => {
      const feature = button.dataset.requiresAccount;
      dialogMessage.textContent = feature === "family"
        ? "Compartilhar listas com a família exige uma conta gratuita. Cadastre-se para convidar os membros da sua casa e continuar organizando em conjunto."
        : "Salvar e sincronizar listas exige uma conta gratuita. Cadastre-se para voltar a esta lista depois e acessá-la em outros dispositivos.";
      dialog.showModal();
    });
  });
})();