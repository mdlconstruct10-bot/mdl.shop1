document.addEventListener("DOMContentLoaded", () => {
    // === KEYS LOGIC ===
    const currentUser = localStorage.getItem("mdlUser");
    const cartKey = currentUser ? `mdlCart_${currentUser}` : "mdlCart";
    const favKey = currentUser ? `mdlFavorites_${currentUser}` : "mdlFavorites";

    // === CART COUNTER LOGIC (COPIED FOR VISIBILITY) ===
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const countSpan = document.getElementById("cartCount");
    if (cart.length > 0) {
        const count = cart.reduce((acc, item) => acc + item.quantity, 0);
        countSpan.innerText = count;
        countSpan.style.display = "inline-block";
    }

    // === RENDER FAVORITES ===
    const favList = document.getElementById("favList");
    let favs = JSON.parse(localStorage.getItem(favKey)) || [];

    function render() {
        favList.innerHTML = "";

        // Update navbar count
        const cnt = document.getElementById("favCount");
        if (cnt) {
            cnt.innerText = favs.length;
            cnt.style.display = favs.length > 0 ? "inline-block" : "none";
        }

        if (favs.length === 0) {
            favList.innerHTML = "<p class='empty-msg'>Nu ai produse favorite încă.</p>";
            return;
        }

        favs.forEach((p, index) => {
            // Creăm cardul fix ca în index.html
            const div = document.createElement("div");
            div.className = "product-card"; // Clasa din CSS-ul principal
            div.style.position = "relative";

            div.innerHTML = `
                <!-- Badge doar dacă avea -->
                ${p.badge ? `<div class="badge">${p.badge}</div>` : ""}
                
                <!-- Butonul de heart este acum de ștergere -->
                <button class="fav-btn active" onclick="removeFav(${index})" style="color:red">
                    <i class="fa-solid fa-trash"></i>
                </button>
                
                <img src="${p.image}">
                <h2>${p.name}</h2>
                <p class="price">${p.price} RON</p>
                <button class="add-cart" onclick="addToCart('${p.name}', ${p.price}, '${p.image}')">Adaugă în coș</button>
            `;
            favList.appendChild(div);
        });
    }

    window.removeFav = (index) => {
        if (confirm("Elimini de la favorite?")) {
            favs.splice(index, 1);
            localStorage.setItem(favKey, JSON.stringify(favs));
            render();

            // Update nav heart color if empty
            if (favs.length === 0) {
                document.querySelector(".navbar a .fa-heart").style.color = "";
            }
        }
    };

    window.addToCart = (name, price, image) => {
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const existing = cart.find(p => p.name === name);

        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ name, price, image, quantity: 1 });
        }

        localStorage.setItem(cartKey, JSON.stringify(cart));
        showToast("Produsul a fost adăugat în coș!", "success");

        // Update nav count manually
        const countSpan = document.getElementById("cartCount");
        const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
        if (countSpan) {
            countSpan.innerText = totalQty;
            countSpan.style.display = "inline-block";
        }
    };


    render();
});
