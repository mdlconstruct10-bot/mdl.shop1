// ❤️ INIMĂ LOGIC MOVED TO DOMContentLoaded AND DELEGATED

// 🔍 SEARCH PRODUSE
const searchInput = document.getElementById("searchInput");

if (searchInput) {
  searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();
    const products = document.querySelectorAll(".product-card");

    products.forEach(product => {
      const name = product.dataset.name.toLowerCase();
      product.style.display = name.includes(value) ? "" : "none";
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {

  // ================= DYNAMIC PRODUCTS RENDER =================
  const productsContainer = document.querySelector(".products");

  function updateFavCountUI() {
    const currentUser = localStorage.getItem("mdlUser");
    const favKey = currentUser ? `mdlFavorites_${currentUser}` : "mdlFavorites";
    const currentFavs = JSON.parse(localStorage.getItem(favKey)) || [];
    const navHeart = document.querySelector(".navbar a .fa-heart");
    const favCount = document.getElementById("favCount");

    if (navHeart) {
      navHeart.style.color = currentFavs.length > 0 ? "red" : "";
    }
    if (favCount) {
      favCount.innerText = currentFavs.length;
      favCount.style.display = currentFavs.length > 0 ? "inline-block" : "none";
    }
  }

  // 1. Get products from "Backend" (LocalStorage)
  const storedProducts = localStorage.getItem("mdlProducts");

  // DETERMINE KEYS BASED ON USER
  const currentUser = localStorage.getItem("mdlUser");
  const cartKey = currentUser ? `mdlCart_${currentUser}` : "mdlCart";
  const favKey = currentUser ? `mdlFavorites_${currentUser}` : "mdlFavorites";

  let favs = JSON.parse(localStorage.getItem(favKey)) || [];
  let productsData = [];

  if (storedProducts) {
    productsData = JSON.parse(storedProducts);
    // Migration: ensure every product has a SKU
    let changed = false;
    productsData.forEach((p, idx) => {
      if (!p.sku) {
        p.sku = "MDL-GEN-" + idx;
        changed = true;
      }
      // Migration: strip leading slash from images for GitHub Pages
      if (p.image && p.image.startsWith("/")) {
        p.image = p.image.substring(1);
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem("mdlProducts", JSON.stringify(productsData));
    }
  } else {

    productsData = [
      { sku: "MDL-CAM-01", name: "Cameră Wireless", price: 199, category: "telefon", image: "imagine 14.jpg", badge: "SUPER PRET" },
      { sku: "MDL-CAM-02", name: "Cameră Exterior", price: 249, category: "telefon", image: "imagine 14.jpg", badge: "REDUCERE 50%" },
      { sku: "MDL-SMT-01", name: "Ceas Smart", price: 399, category: "telefon", image: "imagine 14.jpg", badge: "OFERTA ZILEI" },
      { sku: "MDL-DRY-01", name: "Uscător Rufe", price: 899, category: "electrocasnice", image: "imagine 14.jpg", badge: "NOU" },
      { sku: "MDL-WSH-01", name: "Mașină de spălat", price: 1599, category: "electrocasnice", image: "imagine 14.jpg", badge: "SUPER PRET" }
    ];
    localStorage.setItem("mdlProducts", JSON.stringify(productsData));

  }

  // 2. Render HTML
  if (productsContainer) {
    productsContainer.innerHTML = "";

    // Fetch all reviews for rating calculation
    const allReviews = JSON.parse(localStorage.getItem("mdlReviews")) || [];

    productsData.forEach(p => {
      const pId = p.sku || p.name;
      const card = document.createElement("a");
      card.href = `produs.html?id=${encodeURIComponent(pId)}`;
      card.className = "product-card";
      card.dataset.name = p.name;
      card.dataset.price = p.price;
      card.dataset.category = p.category;

      // Calculate Average Rating
      const pReviews = allReviews.filter(r => r.sku === pId || r.sku === p.sku || r.sku === p.name);
      const avg = pReviews.length > 0
        ? (pReviews.reduce((sum, r) => sum + r.rating, 0) / pReviews.length).toFixed(1)
        : 0;

      let starsHtml = "";
      if (avg > 0) {
        starsHtml = `<div class="card-stars">`;
        for (let i = 1; i <= 5; i++) {
          starsHtml += `<i class="${i <= Math.round(avg) ? 'fa-solid' : 'fa-regular'} fa-star"></i>`;
        }
        starsHtml += ` <span>(${pReviews.length})</span></div>`;
      } else {
        starsHtml = `<div class="card-stars no-reviews">Fără recenzii</div>`;
      }

      const isFav = favs.find(f => f.name === p.name || f.sku === pId);
      const heartClass = isFav ? "fa-solid fa-heart" : "fa-regular fa-heart";
      const btnStyle = isFav ? "color: red;" : "";
      const badgeHtml = p.badge ? `<div class="badge">${p.badge}</div>` : `<div class="badge">MDL</div>`;

      card.innerHTML = `
          ${badgeHtml}
          <button class="fav-btn" style="${btnStyle}"><i class="${heartClass}"></i></button>
          <img src="${p.image}">
          <h2>${p.name}</h2>
          ${starsHtml}
          <p class="price">${p.price} RON</p>
          <button class="add-cart">Adaugă în coș</button>
        `;
      productsContainer.appendChild(card);
    });
  }

  // COMPACT FILTERS LOGIC
  const categoryFilter = document.getElementById("categoryFilter");
  const sortOrder = document.getElementById("sortOrder");

  function loadFilterCategories() {
    const defaultCats = ["telefon", "electrocasnice"];
    const stored = localStorage.getItem("mdlCategories");
    const categories = stored ? JSON.parse(stored) : defaultCats;

    if (categoryFilter) {
      categoryFilter.innerHTML = '<option value="all">Toate Produsele</option>';
      categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.innerText = cat.charAt(0).toUpperCase() + cat.slice(1);
        categoryFilter.appendChild(opt);
      });
    }
  }
  loadFilterCategories();

  const productsNodes = Array.from(document.querySelectorAll(".product-card"));

  if (currentUser) {
    const userIcon = document.querySelector(".fa-user");
    if (userIcon) {
      userIcon.parentElement.title = "Salut, " + currentUser;
      userIcon.classList.replace("fa-user", "fa-user-check");
    }
  }

  updateFavCountUI();

  function filterAndSortProducts() {
    const selectedCategory = categoryFilter.value;
    const sortValue = sortOrder.value;

    let visibleProducts = productsNodes.filter(product => {
      const category = product.dataset.category || "all";
      const show = (selectedCategory === "all" || category === selectedCategory);
      product.style.display = show ? "block" : "none";
      return show;
    });

    if (sortValue !== "default") {
      visibleProducts.sort((a, b) => {
        const priceA = Number(a.dataset.price);
        const priceB = Number(b.dataset.price);
        return sortValue === "price-asc" ? priceA - priceB : priceB - priceA;
      });
    }

    visibleProducts.forEach(prod => {
      productsContainer.appendChild(prod);
    });
  }

  if (categoryFilter) categoryFilter.addEventListener("change", filterAndSortProducts);
  if (sortOrder) sortOrder.addEventListener("change", filterAndSortProducts);

  function renderRecommendations() {
    const container = document.getElementById("recommendationsContainer");
    if (!container) return;

    const allReviews = JSON.parse(localStorage.getItem("mdlReviews")) || [];
    const shuffled = [...productsData].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);

    container.className = "compact-recs-wrapper";
    container.innerHTML = `
      <h3>🚀 Smart Picks</h3>
      <div class="compact-recs-grid" id="recsGrid"></div>
    `;

    const grid = document.getElementById("recsGrid");
    selected.forEach(p => {
      const pId = p.sku || p.name;
      const pReviews = allReviews.filter(r => r.sku === pId || r.sku === p.sku || r.sku === p.name);
      const avg = pReviews.length > 0
        ? (pReviews.reduce((sum, r) => sum + r.rating, 0) / pReviews.length).toFixed(1)
        : 0;

      let starsHtml = "";
      if (avg > 0) {
        starsHtml = `<div class="rec-stars" style="font-size:10px; color:#f59e0b; margin-top:2px;">`;
        for (let i = 1; i <= 5; i++) {
          starsHtml += `<i class="${i <= Math.round(avg) ? 'fa-solid' : 'fa-regular'} fa-star"></i>`;
        }
        starsHtml += `</div>`;
      }

      grid.innerHTML += `
            <a href="produs.html?id=${encodeURIComponent(pId)}" class="compact-recs-card">
                <img src="${p.image}" alt="${p.name}">
                <h4>${p.name}</h4>
                ${starsHtml}
                <p class="price">${p.price} RON</p>
            </a>
        `;
    });
  }



  function updateLoyaltyPoints() {
    if (!currentUser) return;
    const orders = JSON.parse(localStorage.getItem("mdlOrders")) || [];
    const userOrders = orders.filter(o => o.user === currentUser);
    const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
    const points = Math.floor(totalSpent / 10);

    const pointsDiv = document.createElement("div");
    pointsDiv.style.background = "#fff";
    pointsDiv.style.padding = "10px";
    pointsDiv.style.borderRadius = "10px";
    pointsDiv.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
    pointsDiv.style.position = "fixed";
    pointsDiv.style.bottom = "20px";
    pointsDiv.style.left = "20px";
    pointsDiv.style.zIndex = "1000";
    pointsDiv.innerHTML = `<i class="fa-solid fa-star" style="color:gold;"></i> Puncte Loialitate: <b>${points}</b>`;
    document.body.appendChild(pointsDiv);
  }

  function syncFooterLegal() {
    const rawSettings = localStorage.getItem("mdlStoreSettings");
    if (!rawSettings) return;
    const settings = JSON.parse(rawSettings);
    if (!settings || !settings.company) return;

    const c = settings.company;
    const storeNameElem = document.getElementById("footerStoreName");
    const compNameElem = document.getElementById("footerCompanyName");
    const cuiElem = document.getElementById("footerCUI");
    const regElem = document.getElementById("footerReg");
    const addrElem = document.getElementById("footerAddress");

    if (storeNameElem) storeNameElem.innerText = settings.storeName;
    if (compNameElem) compNameElem.innerText = c.name;
    if (cuiElem) cuiElem.innerText = c.cui;
    if (regElem) regElem.innerText = c.reg;
    if (addrElem) addrElem.innerText = `${c.address}, ${c.county}`;
  }

  renderRecommendations();

  updateLoyaltyPoints();
  syncFooterLegal();

  if (productsContainer) {
    productsContainer.addEventListener("click", function (e) {
      if (e.target.classList.contains("add-cart")) {
        e.preventDefault();
        e.stopPropagation();
        const card = e.target.closest(".product-card");
        const name = card.dataset.name;
        const price = Number(card.dataset.price);
        const image = card.querySelector("img").getAttribute("src");

        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const existingProduct = cart.find(p => p.name === name);
        if (existingProduct) {
          existingProduct.quantity++;
        } else {
          cart.push({ name, price, image, quantity: 1 });
        }
        localStorage.setItem(cartKey, JSON.stringify(cart));
        showToast("Produsul " + name + " a fost adăugat în coș!", "success");

      } else if (e.target.closest(".fav-btn")) {
        e.preventDefault();
        e.stopPropagation();
        const btn = e.target.closest(".fav-btn");
        const card = btn.closest(".product-card");
        const icon = btn.querySelector("i");
        const name = card.dataset.name;
        const price = Number(card.dataset.price);
        const image = card.querySelector("img").getAttribute("src");

        let currentFavs = JSON.parse(localStorage.getItem(favKey)) || [];
        const existingIndex = currentFavs.findIndex(f => f.name === name);

        if (existingIndex > -1) {
          currentFavs.splice(existingIndex, 1);
          icon.className = "fa-regular fa-heart";
          btn.style.color = "";
        } else {
          const badgeEl = card.querySelector(".badge");
          const badge = badgeEl ? badgeEl.innerText : "";
          currentFavs.push({ name, price, image, badge });
          icon.className = "fa-solid fa-heart";
          btn.style.color = "red";
        }
        localStorage.setItem(favKey, JSON.stringify(currentFavs));
        updateFavCountUI();
      }
    });
  }
});
