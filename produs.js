// Funcție schimbare imagine la click pe thumbnail
function changeImage(thumb) {
    const mainImg = document.getElementById("mainImage");
    mainImg.src = thumb.src;
    document.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
    thumb.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
    // === DETERMINARE CHEI PT USER ===
    const currentUser = localStorage.getItem("mdlUser");
    const cartKey = currentUser ? `mdlCart_${currentUser}` : "mdlCart";
    const favKey = currentUser ? `mdlFavorites_${currentUser}` : "mdlFavorites";

    // === 1. CART COUNT & NAV FAVORITES ===
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    let favs = JSON.parse(localStorage.getItem(favKey)) || [];

    function updateFavCountUI(f) {
        const currentUser = localStorage.getItem("mdlUser");
        const favKey = currentUser ? `mdlFavorites_${currentUser}` : "mdlFavorites";
        const navHeart = document.querySelector(".navbar a .fa-heart");
        const favCount = document.getElementById("favCount");
        if (navHeart) navHeart.style.color = f.length > 0 ? "red" : "";
        if (favCount) {
            favCount.innerText = f.length;
            favCount.style.display = f.length > 0 ? "inline-block" : "none";
        }
    }

    // --- NEW LOGIC FOR PRODUCT PAGE RENDERING ---
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const products = JSON.parse(localStorage.getItem("mdlProducts")) || [];
    const product = products.find(p => p.sku === productId || p.name === productId);

    const nameElem = document.getElementById("productName");
    const priceElem = document.getElementById("productPrice");
    const skuElem = document.getElementById("productSku");
    const descElem = document.querySelector(".description p");
    const imgElem = document.getElementById("mainImage");
    const variantElem = document.getElementById("variantSelectors");
    const deliveryElem = document.getElementById("deliveryDate");

    const productSkuGlobal = product ? (product.sku || product.name) : "";



    if (product) {
        if (nameElem) nameElem.innerText = product.name;
        if (priceElem) priceElem.innerText = product.price + " RON";
        if (skuElem) skuElem.innerText = "SKU: " + (product.sku || "N/A");
        if (descElem) descElem.innerText = product.description;
        if (imgElem) imgElem.src = product.image;

        // 1. Render Variants
        if (product.colors || product.sizes) {
            variantElem.innerHTML = "";
            if (product.colors) {
                const colors = product.colors.split(",");
                let html = "<label>Culoare:</label><div style='display:flex; gap:10px; margin-top:5px;'>";
                colors.forEach(c => {
                    html += `<span class='v-opt' onclick='selectOpt(this)' style='padding:5px 15px; border:1px solid #ddd; border-radius:5px; cursor:pointer;'>${c.trim()}</span>`;
                });
                variantElem.innerHTML += html + "</div>";
            }
            if (product.sizes) {
                const sizes = product.sizes.split(",");
                let html = "<label style='margin-top:10px; display:block;'>Mărime:</label><div style='display:flex; gap:10px; margin-top:5px;'>";
                sizes.forEach(s => {
                    html += `<span class='v-opt' onclick='selectOpt(this)' style='padding:5px 15px; border:1px solid #ddd; border-radius:5px; cursor:pointer;'>${s.trim()}</span>`;
                });
                variantElem.innerHTML += html + "</div>";
            }
        }

        if (deliveryElem) {
            const d1 = new Date();
            const d2 = new Date();
            d1.setDate(d1.getDate() + 1);
            d2.setDate(d2.getDate() + 3);
            const options = { day: 'numeric', month: 'short' };
            deliveryElem.innerText = `${d1.toLocaleDateString('ro-RO', options)} - ${d2.toLocaleDateString('ro-RO', options)}`;
        }

        // 3. Render Reviews
        renderReviews(productSkuGlobal);


    } else {
        if (nameElem) nameElem.innerText = "Produsul nu a fost găsit!";
    }

    // star rating input logic
    const stars = document.querySelectorAll('#starInput i');
    let selectedRating = 0;
    stars.forEach(s => {
        s.addEventListener('click', function () {
            selectedRating = parseInt(this.dataset.value);
            stars.forEach((star, index) => {
                if (index < selectedRating) {
                    star.classList.replace('fa-regular', 'fa-solid');
                    star.classList.add('active');
                } else {
                    star.classList.replace('fa-solid', 'fa-regular');
                    star.classList.remove('active');
                }
            });
        });
    });

    window.submitReview = () => {
        const name = document.getElementById("reviewName").value;
        const text = document.getElementById("reviewText").value;
        if (!selectedRating || !name || !text) {
            showToast("Te rugăm să completezi toate câmpurile și să alegi o notă!", "error");

            return;
        }

        const reviews = JSON.parse(localStorage.getItem("mdlReviews")) || [];
        reviews.push({
            sku: productSkuGlobal,
            user: name,
            rating: selectedRating,
            text: text,
            date: new Date().toLocaleDateString('ro-RO'),
            verified: currentUser ? true : false
        });

        localStorage.setItem("mdlReviews", JSON.stringify(reviews));
        showToast("Recenzia a fost trimisă cu succes!", "success");

        document.getElementById("reviewName").value = "";
        document.getElementById("reviewText").value = "";
        renderReviews(productSkuGlobal);
    };

    function renderReviews(sku) {
        const allReviews = JSON.parse(localStorage.getItem("mdlReviews")) || [];
        const reviews = allReviews.filter(r => r.sku === sku);
        const listContainer = document.getElementById("reviewList");
        const avgText = document.getElementById("avgRatingText");
        const avgStarsCont = document.getElementById("avgStars");

        if (reviews.length === 0) {
            listContainer.innerHTML = `<p style="color:#64748b; font-size:14px; text-align:center; padding:20px;">Fii primul care lasă o recenzie!</p>`;
            avgText.innerText = `0.0 (0 recenzii)`;
            return;
        }

        const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
        avgText.innerText = `${avg} (${reviews.length} recenzii)`;

        // stars summary
        avgStarsCont.innerHTML = "";
        for (let i = 1; i <= 5; i++) {
            const iconClass = i <= Math.round(avg) ? 'fa-solid fa-star' : 'fa-regular fa-star';
            avgStarsCont.innerHTML += `<i class="${iconClass}"></i>`;
        }

        listContainer.innerHTML = "";
        reviews.forEach(r => {
            const starsHtml = Array(5).fill(0).map((_, i) =>
                `<i class="${i < r.rating ? 'fa-solid fa-star' : 'fa-regular fa-star'}"></i>`
            ).join('');

            const reviewHtml = `
                <div class="review-item">
                    <div class="review-user-info">
                        <div>
                            <span class="user-name">${r.user}</span>
                            ${r.verified ? '<span class="verified-badge"><i class="fa-solid fa-circle-check"></i> Cumpărător Verificat</span>' : ''}
                        </div>
                        <span style="font-size:12px; color:#94a3b8;">${r.date}</span>
                    </div>
                    <div class="review-stars" style="margin-bottom:8px;">${starsHtml}</div>
                    <p class="review-text">${r.text}</p>
                </div>
            `;
            listContainer.innerHTML += reviewHtml;
        });
    }

    // --- END NEW LOGIC ---

    const countSpan = document.getElementById("cartCount");
    if (cart.length > 0) {
        const count = cart.reduce((acc, item) => acc + item.quantity, 0);
        countSpan.innerText = count;
        countSpan.style.display = "inline-block";
    }
    // Update nav heart if any favs exist
    updateFavCountUI(favs);

    // === 2. ADD TO CART LOGIC ===
    const addCartBtn = document.getElementById("addToCartBtn");
    if (addCartBtn && product) {
        addCartBtn.addEventListener("click", function () {
            const cartItem = {
                name: product.name,
                price: product.price,
                image: product.image,
                sku: productSkuGlobal,
                quantity: 1
            };

            let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
            const existing = cart.find(p => p.sku === productSkuGlobal);
            if (existing) {
                existing.quantity++;
            } else {
                cart.push(cartItem);
            }

            localStorage.setItem(cartKey, JSON.stringify(cart));
            showToast(`Produsul <b>${product.name}</b> a fost adăugat în coș!`, "success");

            // Render count without reload
            const updatedCount = cart.reduce((acc, item) => acc + item.quantity, 0);
            const countSpan = document.getElementById("cartCount");
            if (countSpan) {
                countSpan.innerText = updatedCount;
                countSpan.style.display = "inline-block";
            }
        });
    }



    // === 3. FAVORITES LOGIC ===
    const favBtn = document.querySelector(".fav-btn-prod");
    if (favBtn && product) {
        // Check if already is favorite
        const isFav = favs.find(f => (f.sku && f.sku === productSkuGlobal) || f.name === product.name);

        if (isFav) {
            favBtn.querySelector("i").className = "fa-solid fa-heart";
            favBtn.style.color = "red";
            favBtn.style.borderColor = "red";
        }

        favBtn.addEventListener("click", () => {
            let currentFavs = JSON.parse(localStorage.getItem(favKey)) || [];
            const icon = favBtn.querySelector("i");
            const isFav = currentFavs.find(f => (f.sku && f.sku === productSkuGlobal) || f.name === product.name);

            if (!isFav) {
                // Add to favorites
                const pData = {
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    sku: productSkuGlobal
                };
                currentFavs.push(pData);
                icon.className = "fa-solid fa-heart";
                favBtn.style.color = "red";
                favBtn.style.borderColor = "red";
                showToast("Adăugat la favorite! ❤️", "error");
            } else {
                // Remove from favorites
                currentFavs = currentFavs.filter(f => (f.sku && f.sku !== productSkuGlobal) && f.name !== product.name);
                icon.className = "fa-regular fa-heart";
                favBtn.style.color = "#475569";
                favBtn.style.borderColor = "#ddd";
                showToast("Sters de la favorite", "info");
            }

            localStorage.setItem(favKey, JSON.stringify(currentFavs));
            updateFavCountUI(currentFavs);
        });


    }
});


window.selectOpt = function (elem) {
    const parent = elem.parentElement;
    parent.querySelectorAll(".v-opt").forEach(opt => {
        opt.style.borderColor = "#ddd";
        opt.style.background = "transparent";
    });
    elem.style.borderColor = "#000";
    elem.style.background = "#f0f0f0";
};
