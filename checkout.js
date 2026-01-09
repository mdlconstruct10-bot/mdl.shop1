// PJ/PF Toggle
window.toggleClientType = (type) => {
    const pjFields = document.getElementById("pjFields");
    const tabs = document.querySelectorAll(".radio-tab");

    if (type === 'pj') {
        pjFields.style.display = "block";
        tabs[1].classList.add("active");
        tabs[0].classList.remove("active");
        // Make fields required if PJ
        document.getElementById("compName").required = true;
        document.getElementById("compCUI").required = true;
        document.getElementById("compReg").required = true;
    } else {
        pjFields.style.display = "none";
        tabs[0].classList.add("active");
        tabs[1].classList.remove("active");
        // Remove requirement
        document.getElementById("compName").required = false;
        document.getElementById("compCUI").required = false;
        document.getElementById("compReg").required = false;
    }
};

window.updatePaymentUI = () => {
    const radios = document.querySelectorAll('input[name="payment"]');
    const cardSection = document.getElementById("cardDetailsSection");
    const rambursSection = document.getElementById("rambursInfo");
    const summaryTotal = document.getElementById("summaryTotal");

    radios.forEach(r => {
        const card = r.closest('.payment-card');
        if (r.checked) {
            card.classList.add('active');

            // Toggle sections based on selection
            if (r.value === 'card') {
                cardSection.style.display = "block";
                rambursSection.style.display = "none";
            } else if (r.value === 'ramburs') {
                cardSection.style.display = "none";
                rambursSection.style.display = "block";
                if (summaryTotal) document.getElementById("rambursTotalDisplay").innerText = summaryTotal.innerText;
            } else if (r.value === 'apple') {
                cardSection.style.display = "none";
                rambursSection.style.display = "none";
                openApplePay();
            } else {
                cardSection.style.display = "none";
                rambursSection.style.display = "none";
            }
        } else {
            card.classList.remove('active');
        }
    });
};

window.openApplePay = () => {
    const modal = document.getElementById("applePayModal");
    const total = document.getElementById("summaryTotal").innerText;
    document.getElementById("applePayTotal").innerText = total + " RON";
    modal.style.display = "flex";
};

window.closeApplePay = () => {
    document.getElementById("applePayModal").style.display = "none";
    // Check back to Card if cancelled
    document.querySelector('input[name="payment"][value="card"]').checked = true;
    updatePaymentUI();
};

window.confirmApplePay = () => {
    const btn = event.currentTarget;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Se confirmă...';
    setTimeout(() => {
        showToast("Plată Apple Pay confirmată cu succes!", "success");

        document.getElementById("applePayModal").style.display = "none";
        // Finalize order automatically
        document.getElementById("checkoutForm").dispatchEvent(new Event('submit'));
    }, 1500);
};


document.addEventListener("DOMContentLoaded", () => {
    const currentUser = localStorage.getItem("mdlUser");
    const cartKey = currentUser ? `mdlCart_${currentUser}` : "mdlCart";
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const summaryContainer = document.getElementById("summaryItems");
    const summaryTotal = document.getElementById("summaryTotal");

    const settings = JSON.parse(localStorage.getItem("mdlStoreSettings")) || { freeShippingThreshold: 300 };
    const freeShippingThreshold = settings.freeShippingThreshold || 300;


    // 1. Redirecționare dacă coșul e gol
    if (cart.length === 0) {
        showToast("Coșul tău este gol!", "error");

        window.location.href = "hom.html";
        return;
    }

    let discount = 0;

    function renderSummary() {
        summaryContainer.innerHTML = "";
        let total = 0;
        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            summaryContainer.innerHTML += `
                <div class="summary-item">
                    <span>${item.name} x${item.quantity}</span>
                    <span>${subtotal} RON</span>
                </div>
            `;
        });

        const finalTotal = Math.max(0, total - discount);
        if (discount > 0) {
            summaryContainer.innerHTML += `
                <div class="summary-item" style="color:red; font-weight:bold;">
                    <span>Reducere Cupon</span>
                    <span>-${discount} RON</span>
                </div>
            `;
        }

        summaryTotal.innerText = finalTotal;
    }

    renderSummary();

    // 2.5 Coupon Logic
    window.applyCoupon = () => {
        const code = document.getElementById("couponCode").value.trim();
        const coupons = JSON.parse(localStorage.getItem("mdlCoupons")) || [];
        const coupon = coupons.find(c => c.code === code && c.active);

        if (coupon) {
            discount = coupon.val;
            showToast(`Cupon aplicat! Ai primit o reducere de ${discount} RON.`, "success");

            renderSummary();
        } else {
            showToast("Cupon invalid sau expirat!", "error");

        }
    };

    // 3. Estimare Livrare
    const estimateElem = document.getElementById("deliveryEstimate");
    if (estimateElem) {
        const date = new Date();
        date.setDate(date.getDate() + 2); // 2 zile livrare
        estimateElem.innerText = date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' });
    }

    // 4. Abandoned Cart Recovery (Simulat)
    // Dacă utilizatorul stă mai mult de 30 secunde fără să trimită, logăm "Coș abandonat"
    setTimeout(() => {
        if (localStorage.getItem(cartKey)) {
            const logs = JSON.parse(localStorage.getItem("mdlAdminLogs")) || [];
            logs.push(`[AI] Coș abandonat detectat pentru ${currentUser || 'Anonim'}. Email trimis automat.`);
            localStorage.setItem("mdlAdminLogs", JSON.stringify(logs));
        }
    }, 30000);

    // 5. Procesare Comandă
    const checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("Submitting order...");

            const paymentSelected = document.querySelector('input[name="payment"]:checked');
            const clientTypeSelected = document.querySelector('input[name="clientType"]:checked');

            if (!paymentSelected || !clientTypeSelected) {
                showToast("Te rugăm să selectezi metoda de plată și tipul de client.", "error");

                return;
            }

            const paymentMethod = paymentSelected.value;
            const clientType = clientTypeSelected.value;
            const isPJ = clientType === 'pj';

            let billingData = null;
            if (isPJ) {
                billingData = {
                    companyName: document.getElementById("compName").value,
                    cui: document.getElementById("compCUI").value,
                    regCom: document.getElementById("compReg").value,
                    isVatPayer: document.getElementById("isVatPayerPJ").checked
                };
            }
            const orderData = {
                orderId: "ORD-" + Math.floor(Math.random() * 1000000),
                user: currentUser || "Guest",
                items: cart,
                total: Number(summaryTotal.innerText),
                payment: paymentMethod,
                clientType: clientType,
                shippingInfo: {
                    fullName: document.getElementById("fullName").value,
                    phone: document.getElementById("phone").value,
                    email: document.getElementById("email").value,
                    county: document.getElementById("county").value,
                    city: document.getElementById("city").value,
                    address: document.getElementById("address").value,
                    notes: document.getElementById("notes") ? document.getElementById("notes").value : ""
                },
                billingInfo: billingData,
                status: "Nou",
                date: new Date().toLocaleString()
            };



            // Salvare în "Back-end" (mdlOrders)
            // Salvare în "Back-end" (mdlOrders)
            let orders = JSON.parse(localStorage.getItem("mdlOrders")) || [];
            orders.push(orderData);
            localStorage.setItem("mdlOrders", JSON.stringify(orders));

            // Golire coș
            localStorage.removeItem(cartKey);

            showToast("Comanda a fost trimisă cu succes!", "success");

            window.location.href = `thanks.html?orderId=${orderData.orderId.replace('ORD-', '')}`;
        });
    }

    // Initial UI Setup
    updatePaymentUI();
});

