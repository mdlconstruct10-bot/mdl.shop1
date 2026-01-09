document.addEventListener("DOMContentLoaded", () => {
    const cartItemsList = document.getElementById("cartItemsList");
    const cartGrandTotal = document.getElementById("cartGrandTotal");
    const subtotalVal = document.getElementById("subtotalVal");
    const shippingVal = document.getElementById("shippingVal");
    const cartCountTitle = document.getElementById("cartCountTitle");
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("shippingProgressInfo");

    const currentUser = localStorage.getItem("mdlUser") || "Anonim";
    const cartKey = currentUser !== "Anonim" ? `mdlCart_${currentUser}` : "mdlCart";
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    // 1. SYNC ABANDONED CART TO ADMIN
    function syncAbandonedCart() {
        if (cart.length === 0) return;

        let abandoned = JSON.parse(localStorage.getItem("mdlAbandonedCarts")) || [];
        // Filtram daca exista deja acest user
        abandoned = abandoned.filter(a => a.user !== currentUser);

        abandoned.push({
            user: currentUser,
            items: cart,
            date: new Date().toLocaleString(),
            total: cart.reduce((s, p) => s + (p.price * p.quantity), 0)
        });

        localStorage.setItem("mdlAbandonedCarts", JSON.stringify(abandoned.slice(-20))); // tinem ultimele 20
    }

    // 2. RENDER CART (PREMIUM CARDS)
    function renderCart() {
        cartItemsList.innerHTML = "";
        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = `
                <div style="text-align:center; padding:50px;">
                    <i class="fa-solid fa-cart-shopping" style="font-size:40px; color:#cbd5e1; margin-bottom:15px;"></i>
                    <p style="color:#64748b;">Coșul tău de cumpărături este gol.</p>
                </div>
            `;
            cartGrandTotal.innerText = "0";
            subtotalVal.innerText = "0";
            cartCountTitle.innerText = "0 produse";
            progressBar.style.width = "0%";
            progressText.innerText = "Adaugă produse pentru livrare gratuită!";
            return;
        }

        cart.forEach((product, index) => {
            const subtotal = product.price * product.quantity;
            total += subtotal;
            count += product.quantity;

            const card = document.createElement("div");
            card.className = "cart-item-card";
            card.innerHTML = `
                <div class="item-img-wrapper">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="item-details">
                    <span class="sku">${product.sku || 'SKU-000'}</span>
                    <h3>${product.name}</h3>
                    <a href="#" class="remove-item-link" onclick="removeItem(${index})">
                        <i class="fa-solid fa-trash-can"></i> Șterge
                    </a>
                </div>
                <div class="item-price-qty">
                    <div class="item-total-price">${subtotal} RON</div>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="updateQuantity(${index}, ${product.quantity - 1})">-</button>
                        <div class="qty-val">${product.quantity}</div>
                        <button class="qty-btn" onclick="updateQuantity(${index}, ${product.quantity + 1})">+</button>
                    </div>
                </div>
            `;
            cartItemsList.appendChild(card);
        });

        // Calculations
        const settings = JSON.parse(localStorage.getItem("mdlStoreSettings")) || { freeShippingThreshold: 300 };
        const freeShipThreshold = settings.freeShippingThreshold || 300;

        const shipping = total >= freeShipThreshold ? 0 : 19;
        subtotalVal.innerText = total;
        shippingVal.innerText = shipping === 0 ? "GRATUIT" : shipping + " RON";
        cartGrandTotal.innerText = total + (shipping === 0 ? 0 : shipping);
        cartCountTitle.innerText = `${count} ${count === 1 ? 'produs' : 'produse'}`;

        // Shipping Progress
        const percent = Math.min(100, (total / freeShipThreshold) * 100);
        progressBar.style.width = percent + "%";

        if (total >= freeShipThreshold) {
            progressText.innerHTML = `🌟 Bravo! Ai obținut <b style="color:#2ecc71">Livrare Gratuită</b>!`;
        } else {
            progressText.innerHTML = `Mai ai nevoie de <b>${freeShipThreshold - total} RON</b> pentru transport GRATUIT!`;
        }


        syncAbandonedCart();
    }

    window.updateQuantity = (index, newQty) => {
        if (newQty < 1) return removeItem(index);
        cart[index].quantity = newQty;
        localStorage.setItem(cartKey, JSON.stringify(cart));
        renderCart();
    };

    window.removeItem = (index) => {
        cart.splice(index, 1);
        localStorage.setItem(cartKey, JSON.stringify(cart));
        renderCart();
    };

    renderCart();
});
