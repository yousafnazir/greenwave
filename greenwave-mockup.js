const GW_KITS = {
  house: [
    { id: "starter", name: "2 Room Starter Kit", filters: 4, rooms: "2 rooms · 300–500 sq ft", price: 160, sku: "2-room" },
    { id: "1br-house", name: "1 Bedroom House Kit", filters: 8, rooms: "4–5 rooms · 700–1,000 sq ft", price: 292, sku: "1br-house", popular: true },
    { id: "2br-house", name: "2 Bedroom House Kit", filters: 12, rooms: "5–7 rooms · 1,000–1,400 sq ft", price: 399, sku: "2br-house" },
    { id: "3br-house", name: "3 Bedroom House Kit", filters: 16, rooms: "6–8 rooms · 1,400–1,800 sq ft", price: 532, sku: "3br-house" },
    { id: "4br-house", name: "4 Bedroom House Kit", filters: 20, rooms: "7–10 rooms · 1,800–2,800 sq ft", price: 665, sku: "4br-house" },
    { id: "5br-house", name: "5 Bedroom House Kit", filters: 24, rooms: "8–12 rooms · 2,800+ sq ft", price: 798, sku: "5br-house" }
  ],
  apartment: [
    { id: "studio", name: "Studio Apartment Kit", filters: 4, rooms: "1–2 rooms · 300–500 sq ft", price: 160, sku: "studio" },
    { id: "1br-apt", name: "1 Bedroom Apartment Kit", filters: 7, rooms: "3–4 rooms · 500–800 sq ft", price: 255, sku: "1br-apt" },
    { id: "2br-apt", name: "2 Bedroom Apartment Kit", filters: 10, rooms: "4–6 rooms · 800–1,200 sq ft", price: 332, sku: "2br-apt" },
    { id: "3br-apt", name: "3 Bedroom Apartment Kit", filters: 12, rooms: "5–7 rooms · 1,200+ sq ft", price: 399, sku: "3br-apt" }
  ],
  office: [
    { id: "office", name: "Standard Office Kit", filters: 2, rooms: "100–150 sq ft", price: 80, sku: "office" },
    { id: "exec", name: "Executive Office Kit", filters: 3, rooms: "150–300 sq ft", price: 120, sku: "exec" }
  ],
  classroom: [
    { id: "class", name: "Classroom Kit", filters: 6, rooms: "750–900 sq ft", price: 219, sku: "class" }
  ]
};

function cartGet() {
  try { return JSON.parse(localStorage.getItem("gw-cart") || "[]"); } catch { return []; }
}
function cartSet(items) {
  localStorage.setItem("gw-cart", JSON.stringify(items));
  renderCart();
}
function money(n) { return "$" + n.toFixed(2).replace(/\.00$/, ""); }

function addToCart(item) {
  const cart = cartGet();
  const found = cart.find((x) => x.id === item.id && x.prong === item.prong);
  if (found) found.qty += item.qty || 1;
  else cart.push({ ...item, qty: item.qty || 1 });
  cartSet(cart);
  toast(item.name + " added");
  openCart();
}

function renderCart() {
  const cart = cartGet();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach((el) => { el.textContent = count; });
  const list = document.getElementById("cartItems");
  const sub = document.getElementById("cartSubtotal");
  if (!list) return;
  if (!cart.length) {
    list.innerHTML = "<p style='color:#5d6f66;padding:24px 0'>Your cart is empty. Choose a kit by home size so you don’t over- or under-buy.</p>";
    if (sub) sub.textContent = "$0";
    return;
  }
  list.innerHTML = cart.map((i, idx) => `
    <div class="cart-item">
      <div>
        <strong>${i.name}</strong>
        <div style="color:#5d6f66">${i.prong}-prong · Qty ${i.qty}</div>
      </div>
      <div>
        <div>${money(i.price * i.qty)}</div>
        <button type="button" data-remove="${idx}" style="border:0;background:none;color:#b42318;cursor:pointer;font-size:12px;font-weight:700">Remove</button>
      </div>
    </div>
  `).join("");
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (sub) sub.textContent = money(total);
  list.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = cartGet();
      next.splice(Number(btn.dataset.remove), 1);
      cartSet(next);
    });
  });
}

function toast(msg) {
  let el = document.getElementById("gwToast");
  if (!el) {
    el = document.createElement("div");
    el.id = "gwToast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("is-on");
  setTimeout(() => el.classList.remove("is-on"), 1800);
}

function openCart() {
  document.getElementById("overlay")?.classList.add("is-on");
  document.getElementById("drawer")?.classList.add("is-on");
}
function closeCart() {
  document.getElementById("overlay")?.classList.remove("is-on");
  document.getElementById("drawer")?.classList.remove("is-on");
}

function fillSizes() {
  const space = document.getElementById("spaceType");
  const size = document.getElementById("spaceSize");
  if (!space || !size) return;
  const kits = GW_KITS[space.value] || [];
  size.innerHTML = kits.map((k) => `<option value="${k.id}">${k.name} — ${k.filters} filters</option>`).join("");
}

function recommend() {
  const space = document.getElementById("spaceType")?.value;
  const id = document.getElementById("spaceSize")?.value;
  const prong = document.getElementById("prongType")?.value || "3";
  const kit = (GW_KITS[space] || []).find((k) => k.id === id);
  const box = document.getElementById("finderResult");
  if (!kit || !box) return;
  box.classList.add("is-on");
  box.innerHTML = `
    <div>
      <b>${kit.name}</b>
      <div><span>${kit.filters} filters · ${kit.rooms} · ${prong}-prong · ${money(kit.price)}</span></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <a class="btn btn-primary" href="greenwave-product-mockup.html?kit=${kit.id}&prong=${prong}">View kit</a>
      <button class="btn btn-line" type="button" data-add='${JSON.stringify({ id: kit.id, name: kit.name, price: kit.price, prong, qty: 1 }).replace(/'/g, "&#39;")}'>Add to cart</button>
    </div>
  `;
  box.querySelector("[data-add]")?.addEventListener("click", (e) => {
    addToCart(JSON.parse(e.currentTarget.getAttribute("data-add").replace(/&#39;/g, "'")));
  });
}

const GW_EXTRAS = [
  { id: "test", name: "Dirty Electricity Test Kit", filters: 2, rooms: "Meter + 2 filters + outlet tester", price: 200, sku: "test" },
  { id: "filter", name: "Greenwave Filter", filters: 1, rooms: "Single filter · volume pricing at checkout", price: 40, sku: "filter" },
  { id: "meter", name: "Broadband EMI Meter", filters: 0, rooms: "Measure dirty electricity on wiring", price: 186, sku: "meter" }
];

function pdpInit() {
  const params = new URLSearchParams(location.search);
  const kitId = params.get("kit") || "1br-house";
  const prongStart = params.get("prong") || "3";
  const all = Object.values(GW_KITS).flat().concat(GW_EXTRAS);
  const kit = all.find((k) => k.id === kitId) || all.find((k) => k.id === "1br-house");
  const nameEl = document.getElementById("pdpName");
  const crumbEl = document.getElementById("pdpCrumb");
  const priceEl = document.getElementById("pdpPrice");
  const metaEl = document.getElementById("pdpMeta");
  if (nameEl) nameEl.textContent = kit.name;
  if (crumbEl) crumbEl.textContent = kit.name;
  if (priceEl) {
    const extra = kit.filters ? kit.filters + " filters" : "sold separately";
    priceEl.innerHTML = money(kit.price) + " <small>" + extra + "</small>";
  }
  if (metaEl) metaEl.textContent = kit.rooms + " · UL certified · plug-through outlet";
  document.querySelectorAll("[data-prong]").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.prong === prongStart);
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-prong]").forEach((b) => b.classList.remove("is-on"));
      btn.classList.add("is-on");
    });
  });
  document.getElementById("addKit")?.addEventListener("click", () => {
    const prong = document.querySelector("[data-prong].is-on")?.dataset.prong || "3";
    const qty = Number(document.getElementById("qty")?.value || 1);
    addToCart({ id: kit.id, name: kit.name, price: kit.price, prong, qty });
  });
}

function checkoutInit() {
  const cart = cartGet();
  const box = document.getElementById("chkItems");
  const totalEl = document.getElementById("chkTotal");
  if (!box) return;
  if (!cart.length) {
    box.innerHTML = "<p>Your cart is empty. <a href='greenwave-homepage-mockup.html#shop' style='color:#1b8a54;font-weight:700'>Choose a kit</a></p>";
    return;
  }
  box.innerHTML = cart.map((i) => `<div class="summary-row"><span>${i.name} × ${i.qty}<br><small>${i.prong}-prong</small></span><span>${money(i.price * i.qty)}</span></div>`).join("");
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (totalEl) totalEl.textContent = money(total);
  document.getElementById("placeOrder")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("gw-cart");
    renderCart();
    toast("Order placed — mock only");
    setTimeout(() => { location.href = "greenwave-homepage-mockup.html"; }, 900);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("menuToggle")?.addEventListener("click", () => {
    document.getElementById("nav")?.classList.toggle("is-open");
  });
  document.getElementById("cartBtn")?.addEventListener("click", openCart);
  document.getElementById("overlay")?.addEventListener("click", closeCart);
  document.getElementById("closeCart")?.addEventListener("click", closeCart);
  document.getElementById("spaceType")?.addEventListener("change", () => { fillSizes(); recommend(); });
  document.getElementById("spaceSize")?.addEventListener("change", recommend);
  document.getElementById("prongType")?.addEventListener("change", recommend);
  document.getElementById("findBtn")?.addEventListener("click", recommend);
  fillSizes();
  if (document.getElementById("finderResult")) recommend();
  pdpInit();
  checkoutInit();
  renderCart();

  const header = document.querySelector(".header");
  const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 16);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  document.querySelectorAll("[data-quick-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(JSON.parse(btn.getAttribute("data-quick-add")));
    });
  });
});
