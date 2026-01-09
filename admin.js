
// PAROLA DE ADMIN (Simulată)
const ADMIN_PASS = "admin123";

// 1. LOGIN LOGIC
function checkAdmin() {
    const pass = document.getElementById("adminPass").value;
    if (pass === ADMIN_PASS) {
        localStorage.setItem("mdlAdminLogged", "true");
        showDashboard();
    } else {
        document.getElementById("loginError").style.display = "block";
    }
}

function showDashboard() {
    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("mainDashboard").style.display = "flex";
    loadProducts();
    loadOrders();
    loadCategories();
    initDashboard();
}

// Auto-login check
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("mdlAdminLogged") === "true") {
        showDashboard();
    }
});

function logout() {
    localStorage.removeItem("mdlAdminLogged");
    location.reload();
}

// 2. TABS LOGIC
function switchTab(tabName) {
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".menu-item").forEach(m => m.classList.remove("active"));

    // Simplu mapping pentru active class pe meniu
    const menuItemIndex = {
        'dashboard': 0, 'products': 1, 'orders': 2, 'categories': 3, 'logistics': 4, 'marketing': 5, 'growth': 6, 'security': 7, 'settings': 8, 'reviews': 9
    }[tabName];


    // Attempt highlight
    const items = document.querySelectorAll(".sidebar .menu-item");
    if (items[menuItemIndex]) items[menuItemIndex].classList.add("active");

    // Show panel
    const panelId = tabName === 'dashboard' ? 'dashboardPanel' :
        tabName === 'products' ? 'productsPanel' :
            tabName === 'orders' ? 'ordersPanel' :
                tabName === 'categories' ? 'categoriesPanel' :
                    tabName === 'logistics' ? 'logisticsPanel' :
                        tabName === 'marketing' ? 'marketingPanel' :
                            tabName === 'growth' ? 'growthPanel' :
                                tabName === 'security' ? 'securityPanel' :
                                    tabName === 'settings' ? 'settingsPanel' :
                                        tabName === 'reviews' ? 'reviewsPanel' : 'dashboardPanel';


    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add("active");

    // Also re-init charts
    if (tabName === 'dashboard' || tabName === 'growth') {
        initDashboard();
        loadAbandonedCarts();
    }
    if (tabName === 'logistics') loadInventory();
    if (tabName === 'orders') loadOrders();
    if (tabName === 'reviews') loadReviews();
    if (tabName === 'settings') loadMaintenanceSettings();
}

function loadMaintenanceSettings() {
    const settings = JSON.parse(localStorage.getItem("mdlMaintenanceSettings")) || {
        enabled: true,
        message: "ATENȚIE: Acest site este unul de PROBĂ! Comenzile plasate nu sunt reale și nu vor fi procesate. Conținutul nu trebuie luat în calcul de ANAF sau ANPC."
    };

    const enabledCheckbox = document.getElementById("maintenanceEnabled");
    const messageTextarea = document.getElementById("maintenanceMessage");

    if (enabledCheckbox) enabledCheckbox.checked = settings.enabled;
    if (messageTextarea) messageTextarea.value = settings.message;
}

function saveMaintenanceSettings() {
    const enabled = document.getElementById("maintenanceEnabled").checked;
    const message = document.getElementById("maintenanceMessage").value;

    const settings = { enabled, message };
    localStorage.setItem("mdlMaintenanceSettings", JSON.stringify(settings));

    const status = document.getElementById("settingsStatus");
    if (status) {
        status.innerText = "Setările au fost salvate cu succes!";
        status.style.display = "block";
        status.style.color = "#22c55e";
        setTimeout(() => status.style.display = "none", 3000);
    }
    showToast("Setările de mentenanță au fost actualizate!", "success");
}




function loadAbandonedCarts() {
    const tbody = document.getElementById("abandonedCartsTable");
    if (!tbody) return;

    const abandoned = JSON.parse(localStorage.getItem("mdlAbandonedCarts")) || [];
    tbody.innerHTML = "";

    abandoned.forEach(a => {
        const prodCount = a.items.reduce((s, i) => s + i.quantity, 0);
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><b>${a.user}</b></td>
            <td>${prodCount} produse</td>
            <td>${a.total} RON</td>
            <td>${a.date}</td>
            <td><button class="action-btn" onclick="showToast('Email trimis catre ${a.user}!', 'success')">Trimite Reminder</button></td>

        `;
        tbody.appendChild(tr);
    });
}


// 3. PRODUCTS LOGIC & DRAG DROP
const defaultProducts = [
    { name: "Cameră Wireless", price: 199, category: "telefon", image: "/imagine 14.jpg", badge: "NOU", description: "Cameră HD...", sku: "MDL-1001", stock: 15, colors: "Alb,Negru" },
    { name: "Cameră Exterior", price: 249, category: "telefon", image: "/imagine 14.jpg", badge: "-50%", description: "Rezistentă la apă...", sku: "MDL-1002", stock: 3, colors: "Alb" }
];

function getProducts() {
    const stored = localStorage.getItem("mdlProducts");
    return stored ? JSON.parse(stored) : defaultProducts;
}

function saveProducts(products) {
    localStorage.setItem("mdlProducts", JSON.stringify(products));
    loadProducts();
}

function generateSKU() {
    return 'MDL-' + Math.floor(1000 + Math.random() * 9000);
}

function loadProducts() {
    const products = getProducts();
    const tbody = document.getElementById("productsTable");
    tbody.innerHTML = "";

    products.forEach((p, index) => {
        const badge = p.badge ? `<span style="background:red; color:white; padding:2px 5px; border-radius:3px; font-size:10px;">${p.badge}</span>` : "";
        const lowStock = (p.stock && p.stock < 5) ? '<span style="color:red; font-weight:bold; font-size:12px; display:block;">(Stoc Critic!)</span>' : '';
        const variants = p.colors ? `<br><small>Var: ${p.colors}</small>` : '';

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img src="${p.image}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;"></td>
            <td>
                <b>${p.name}</b> <br> 
                <small style="color:#666;">SKU: ${p.sku || 'N/A'}</small>
                ${badge}
            </td>
            <td>${p.price} RON ${variants}</td>
            <td>${p.stock || 0} buc ${lowStock}</td>
            <td><button class="action-btn" onclick="deleteProduct(${index})">Șterge</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// ==== DRAG & DROP LOGIC ====
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const pImgInput = document.getElementById("pImg");
const previewImg = document.getElementById("previewImg");

if (dropZone) {
    dropZone.addEventListener("click", () => fileInput.click());

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.style.background = "#e9e9e9";
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.style.background = "#fafafa";
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.style.background = "#fafafa";
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length) handleFile(fileInput.files[0]);
    });
}

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result;
        previewImg.src = base64;
        previewImg.style.display = "block";
        pImgInput.value = base64; // Salvăm Base64 direct în input
    };
    reader.readAsDataURL(file);
}

function addProduct() {
    const name = document.getElementById("pName").value;
    const price = document.getElementById("pPrice").value;
    const stock = document.getElementById("pStock").value;
    const cat = document.getElementById("pCat").value;
    const img = document.getElementById("pImg").value;
    const badge = document.getElementById("pBadge").value;
    const desc = document.getElementById("pDesc").value;

    // VARIANT FIELDS
    const colors = document.getElementById("pColors") ? document.getElementById("pColors").value : "";
    const sizes = document.getElementById("pSizes") ? document.getElementById("pSizes").value : "";

    if (!name || !price) {
        showToast("Introdu numele și prețul!", "error");

        return;
    }

    const products = getProducts();
    products.push({
        name: name,
        price: Number(price),
        stock: Number(stock) || 0,
        sku: generateSKU(),
        category: cat,
        image: img || "/imagine 14.jpg",
        badge: badge,
        description: desc,
        colors: colors,
        sizes: sizes
    });

    saveProducts(products);
    showToast("Produs adăugat cu variante și SKU!", "success");

    clearForm();
}

function clearForm() {
    document.getElementById("pName").value = "";
    document.getElementById("pPrice").value = "";
    document.getElementById("pStock").value = "";
    document.getElementById("pBadge").value = "";
    document.getElementById("pDesc").value = "";
    document.getElementById("pImg").value = "";
    document.getElementById("previewImg").style.display = "none";
    if (document.getElementById("pColors")) document.getElementById("pColors").value = "";
    if (document.getElementById("pSizes")) document.getElementById("pSizes").value = "";
}

window.deleteProduct = (index) => {
    if (confirm("Sigur ștergi acest produs?")) {
        const products = getProducts();
        products.splice(index, 1);
        saveProducts(products);
    }
};

// ================= CATEGORIES LOGIC =================
const defaultCategories = ["telefon", "electrocasnice"];

function getCategories() {
    const stored = localStorage.getItem("mdlCategories");
    return stored ? JSON.parse(stored) : defaultCategories;
}

function loadCategories() {
    const categories = getCategories();

    // 1. Update Table in Categories Panel
    const tbody = document.getElementById("categoriesTable");
    if (tbody) {
        tbody.innerHTML = "";
        categories.forEach((cat, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><b>${cat}</b></td>
                <td><span style="color:green">Activ</span></td>
                <td><button class="action-btn" onclick="deleteCategory(${index})">Șterge</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 2. Update Dropdown in Product Panel
    const pCatSelect = document.getElementById("pCat");
    if (pCatSelect) {
        pCatSelect.innerHTML = "";
        categories.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat;
            opt.innerText = cat.charAt(0).toUpperCase() + cat.slice(1);
            pCatSelect.appendChild(opt);
        });
    }
}

window.addCategory = () => {
    const input = document.getElementById("newCatName");
    const name = input.value.trim().toLowerCase();

    if (!name) return showToast("Introdu un nume!", "error");


    let categories = getCategories();
    if (categories.includes(name)) return showToast("Categoria există deja!", "error");


    categories.push(name);
    localStorage.setItem("mdlCategories", JSON.stringify(categories));
    input.value = "";
    loadCategories();
    showToast("Categorie adăugată!", "success");

};

window.deleteCategory = (index) => {
    if (confirm("Sigur ștergi categoria? Produsele din această categorie vor rămâne, dar filtrarea va fi afectată.")) {
        let categories = getCategories();
        categories.splice(index, 1);
        localStorage.setItem("mdlCategories", JSON.stringify(categories));
        loadCategories();
    }
};

// ================= LOGISTICS & INVENTORY LOGIC =================
function loadInventory() {
    const products = getProducts();
    const tbody = document.getElementById("inventoryTable");
    let lowStockCount = 0;

    tbody.innerHTML = "";
    products.forEach(p => {
        // Simulăm stoc pe depozite (Central: 70%, Vest: 20%, Retur: 10%)
        const central = Math.floor(p.stock * 0.7);
        const vest = Math.floor(p.stock * 0.2);
        const incubator = p.stock - central - vest;

        if (p.stock < 5) lowStockCount++;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><b>${p.name}</b><br><small>SKU: ${p.sku}</small></td>
            <td>${central} buc</td>
            <td>${vest} buc</td>
            <td>${incubator} buc</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("lowStockCount").innerText = lowStockCount;
}

// 4. ORDERS & AWB LOGIC
function loadOrders() {
    const tbody = document.getElementById("ordersTable");

    // Încărcare ordine reale din stocare
    const storedOrders = JSON.parse(localStorage.getItem("mdlOrders")) || [];

    // Mock orders extended (dacă nu există comenzi reale, arătăm test)
    const mockOrders = [
        { id: "1001", client: "Popescu Ion", date: "09-01-2026", items: [{ name: "Cameră Wireless", qty: 1, price: 199 }], total: 199, status: "Livrat", awb: "AWB123456" },
        { id: "1002", client: "Maria Ionescu", date: "08-01-2026", items: [{ name: "Ceas Smart", qty: 2, price: 399 }], total: 798, status: "Nou", awb: "" }
    ];

    // Combinăm pentru demo sau folosim doar cele reale
    const orders = storedOrders.length > 0 ? storedOrders : mockOrders;

    // Mapare format pentru compatibilitate dacă e cazul
    const displayOrders = orders.map(o => ({
        id: o.orderId || o.id,
        client: o.shippingInfo ? o.shippingInfo.fullName : o.client,
        items: o.items,
        total: o.total,
        status: o.status,
        payment: o.payment || "N/A",
        clientType: o.clientType || "pf",
        billing: o.billingInfo || null,
        shipping: o.shippingInfo || null,
        awb: o.awb || ""
    }));


    // Save to window for invoice generation
    window.ordersDb = displayOrders;

    tbody.innerHTML = "";
    displayOrders.forEach(order => {
        const tr = document.createElement("tr");
        const itemsStr = order.items && Array.isArray(order.items)
            ? order.items.map(i => `${i.qty || i.quantity || 0} x ${i.name || 'Produs'}`).join(", ")
            : "Fără produse";


        // Status Colors
        let statusColor = order.status === 'Nou' ? 'orange' : order.status === 'Livrat' ? 'green' : 'blue';

        // AWB Button or Code
        const awbDisplay = order.awb
            ? `<span style="font-family:monospace; background:#eee; padding:2px;">${order.awb}</span>`
            : `<button class="action-btn" style="background:#3498db;" onclick="generateAWB('${order.id}')">Generare AWB</button>`;

        tr.innerHTML = `
            <td>#${order.id}</td>
            <td>
                <b>${order.client}</b> 
                ${order.clientType === 'pj' ? '<span style="background:rgba(58,123,213,0.1); color:#3a7bd5; padding:2px 6px; border-radius:10px; font-size:10px; font-weight:bold;">PJ</span>' : ''}
                <br><small style="color:#64748b;">${itemsStr}</small>
            </td>
            <td>
                <select onchange="updateOrderStatus('${order.id}', this.value)" style="border:1px solid ${statusColor}; color:${statusColor}; font-weight:bold; border-radius:5px; padding:2px;">
                    <option ${order.status === 'Nou' ? 'selected' : ''}>Nou</option>
                    <option ${order.status === 'Procesare' ? 'selected' : ''}>Procesare</option>
                    <option ${order.status === 'Livrat' ? 'selected' : ''}>Livrat</option>
                    <option ${order.status === 'Retur' ? 'selected' : ''}>Retur</option>
                </select>
            </td>
            <td>
                <b>${order.total} RON</b>
                <br><small style="color:#94a3b8; text-transform:capitalize;">${order.payment}</small>
            </td>

            <td style="display:flex; gap:5px;">
                <button class="action-btn" style="background:green;" onclick="generateInvoice('${order.id}')"><i class="fa-solid fa-file"></i></button>
                ${awbDisplay}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.generateInvoice = (orderId) => {
    const order = window.ordersDb.find(o => o.id === orderId);
    if (!order) return;

    const win = window.open("", "Factura", "width=800,height=600");
    const today = new Date().toLocaleDateString();

    // Load company details from settings
    const settings = JSON.parse(localStorage.getItem("mdlStoreSettings")) || {
        storeName: "MDL SHOP",
        company: { name: "MDL SHOP SRL", address: "Str. Exemplului Nr. 1, București", cui: "RO12345678", reg: "J40/000/2023", county: "București", iban: "-", bank: "-" }
    };
    const c = settings.company;

    win.document.write(`
        <html>
        <head>
            <title>Factura #${order.id}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; color: #334155; }
                .header { display: flex; justify-content: space-between; margin-bottom: 50px; border-bottom: 2px solid #3a7bd5; padding-bottom: 20px;}
                .company h1 { margin: 0; color: #3a7bd5; }
                .company p { margin: 2px 0; font-size: 13px; }
                table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
                th { background: #f8fafc; font-weight: bold; }
                .total { text-align: right; margin-top: 30px; font-size: 22px; font-weight: 800; color: #1e293b; }
                .footer-legal { margin-top: 50px; font-size: 11px; color: #94a3b8; border-top: 1px solid #eee; padding-top: 20px; }
                .print-btn { background: #3a7bd5; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-top: 30px;}
                @media print { .print-btn { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company">
                    <h1>${settings.storeName}</h1>
                    <p><b>${c.name}</b></p>
                    <p>CUI: ${c.cui}</p>
                    <p>Reg. Com: ${c.reg}</p>
                    <p>Sediu: ${c.address}, ${c.county}</p>
                    <p>IBAN: ${c.iban}</p>
                    <p>Bancă: ${c.bank}</p>
                </div>
                <div class="client">
                    <h3 style="margin-top:0;">FACTURĂ FISCALĂ</h3>
                    <p><b>Nr:</b> MDL-${order.id}</p>
                    <p><b>Data:</b> ${today}</p>
                    <div style="margin-top:10px; border: 1px solid #eee; padding: 10px; border-radius: 8px;">
                        <p style="margin:0; font-weight:bold; color:#64748b; font-size:11px; text-transform:uppercase;">Cumpărător:</p>
                        ${order.clientType === 'pj' ? `
                            <p style="margin:5px 0 2px; font-weight:bold;">${order.billing.companyName}</p>
                            <p style="margin:0; font-size:12px;">CUI: ${order.billing.isVatPayer ? (order.billing.cui.toUpperCase().startsWith('RO') ? order.billing.cui.toUpperCase() : 'RO' + order.billing.cui) : order.billing.cui}</p>
                            <p style="margin:0; font-size:12px;">Reg. Com: ${order.billing.regCom}</p>
                        ` : `
                            <p style="margin:5px 0 2px; font-weight:bold;">${order.client}</p>
                        `}

                        <p style="margin:5px 0 0; font-size:12px;">${order.shipping ? order.shipping.address : ''}</p>
                        <p style="margin:0; font-size:12px;">${order.shipping ? order.shipping.city : ''}, ${order.shipping ? order.shipping.county : ''}</p>
                        <p style="margin:0; font-size:12px;">Tel: ${order.shipping ? order.shipping.phone : ''}</p>
                        <p style="margin:0; font-size:12px;">Email: ${order.shipping ? order.shipping.email : ''}</p>
                    </div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Produs</th>
                        <th>Cantitate</th>
                        <th>Preț Unitar</th>
                        <th>Valoare</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(i => {
        const q = i.qty || i.quantity || 0;
        return `
                        <tr>
                            <td>${i.name}</td>
                            <td>${q}</td>
                            <td>${i.price} RON</td>
                            <td>${i.price * q} RON</td>
                        </tr>
                        `;
    }).join('')}
                </tbody>
            </table>

            <div class="total">
                Total de plată: ${order.total} RON
            </div>

            <button class="print-btn" onclick="window.print()">Printează Factura</button>
        </body>
        </html>
    `);
};

window.generateAWB = (id) => {
    const awb = "SMART-AWB-" + Math.floor(Math.random() * 1000000);
    showToast(`AWB Generat cu succes pentru comanda #${id}!\nCod: ${awb}\nS-a trimis SMS automat clientului.`, "success");


    // Save AWB to order
    const orders = JSON.parse(localStorage.getItem("mdlOrders")) || [];
    const order = orders.find(o => (o.orderId || o.id) === id);
    if (order) {
        order.awb = awb;
        localStorage.setItem("mdlOrders", JSON.stringify(orders));
        loadOrders(); // Refresh table
    }
};

window.updateOrderStatus = (id, newStatus) => {
    let orders = JSON.parse(localStorage.getItem("mdlOrders")) || [];
    // Găsim comanda fie după orderId (din checkout) fie id (mock)
    const order = orders.find(o => (o.orderId || o.id) === id);

    if (order) {
        order.status = newStatus;
        localStorage.setItem("mdlOrders", JSON.stringify(orders));
        showToast(`Statusul comenzii #${id} a fost actualizat la "${newStatus}"!`, "success");

        // Log activitate
        const log = document.getElementById("activityLog");
        if (log) log.innerHTML += `<p>> [UPDATE] Comanda #${id} mutată în "${newStatus}"</p>`;
        loadOrders();
    } else {
        showToast(`Statusul comenzii de test #${id} s-a schimbat la "${newStatus}" (nu se salvează în DB mock).`, "info");

    }
};

// ================= GROWTH & ANALYTICS LOGIC =================
function loadTopClients() {
    const tbody = document.getElementById("topClientsTable");
    if (!tbody) return;

    const orders = JSON.parse(localStorage.getItem("mdlOrders")) || [];
    const clientMap = {};

    orders.forEach(o => {
        if (!clientMap[o.user]) {
            clientMap[o.user] = { name: o.user, orders: 0, spent: 0 };
        }
        clientMap[o.user].orders++;
        clientMap[o.user].spent += o.total;
    });

    const clients = Object.values(clientMap)
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 5);

    tbody.innerHTML = "";
    clients.forEach(c => {
        const score = Math.min(100, (c.spent / 5000) * 100); // 100% la 5000 RON
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><b>${c.name}</b></td>
            <td>${c.orders}</td>
            <td>${c.spent} RON</td>
            <td>
                <div style="width:100px; height:8px; background:#eee; border-radius:4px;">
                    <div style="width:${score}%; height:100%; background:#2ecc71; border-radius:4px;"></div>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 5. CHART JS
let salesChart = null;
let categoryChart = null;

function initDashboard() {
    const cvs1 = document.getElementById('salesChart');
    const cvs2 = document.getElementById('categoryChart');
    if (!cvs1 || !cvs2) return;

    const ctx1 = cvs1.getContext('2d');
    const ctx2 = cvs2.getContext('2d');

    if (salesChart) salesChart.destroy();
    if (categoryChart) categoryChart.destroy();

    const orders = JSON.parse(localStorage.getItem("mdlOrders")) || [];
    const products = getProducts();

    // 1. KPI Calculation
    const today = new Date().toLocaleDateString('ro-RO');
    const todayOrders = orders.filter(o => o.date && o.date.includes(today));

    const salesToday = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const newOrdersCount = todayOrders.length;
    const conversion = orders.length > 0 ? ((orders.length / 500) * 100).toFixed(1) : 0;

    if (document.getElementById("kpiSalesToday")) document.getElementById("kpiSalesToday").innerText = salesToday + " RON";
    if (document.getElementById("kpiNewOrders")) document.getElementById("kpiNewOrders").innerText = newOrdersCount;
    if (document.getElementById("trendOrders")) document.getElementById("trendOrders").innerText = `▲ ${newOrdersCount}`;
    if (document.getElementById("kpiConversion")) document.getElementById("kpiConversion").innerText = conversion + "%";



    // 2. Sales Chart - Aggregate by last 7 days
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString();
    }).reverse();

    const salesData = last7Days.map(day => {
        return orders
            .filter(o => new Date(o.date).toLocaleDateString() === day)
            .reduce((sum, o) => sum + o.total, 0);
    });

    salesChart = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: last7Days.map(d => d.split('.')[0] + '/' + d.split('.')[1]), // Format scurt DD/MM

            datasets: [{
                label: 'Vânzări (RON)',
                data: salesData,
                borderColor: '#00d2ff',
                backgroundColor: 'rgba(0, 210, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 3. Category Distribution
    const catCounts = {};
    products.forEach(p => {
        catCounts[p.category] = (catCounts[p.category] || 0) + 1;
    });

    const catLabels = Object.keys(catCounts);
    const catValues = Object.values(catCounts);

    categoryChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: catLabels.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
            datasets: [{
                data: catValues,
                backgroundColor: ['#3498db', '#9b59b6', '#2ecc71', '#f1c40f', '#e67e22', '#e74c3c']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });


    // RFM & Prediction Charts
    const cvs3 = document.getElementById('rfmChart');
    const cvs4 = document.getElementById('predictionChart');
    if (cvs3 && cvs4) {
        new Chart(cvs3.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['Recency', 'Frequency', 'Monetary'],
                datasets: [{
                    label: 'Segment VIP',
                    data: [90, 80, 95],
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: '#3498db'
                }, {
                    label: 'Segment Nou',
                    data: [100, 20, 30],
                    backgroundColor: 'rgba(46, 204, 113, 0.2)',
                    borderColor: '#2ecc71'
                }]
            }
        });

        new Chart(cvs4.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Feb', 'Mar', 'Apr', 'Mai'],
                datasets: [{
                    label: 'Predicție Vânzări AI (RON)',
                    data: [65000, 72000, 81000, 95000],
                    backgroundColor: '#00d2ff'
                }]
            }
        });
    }

    loadTopClients();
}

// ================= SMART PRICING & MARKETING =================
function applySmartPricing() {
    let products = getProducts();
    const aiToggle = document.querySelector('.ai-status input');
    if (!aiToggle || !aiToggle.checked) return;

    products.forEach(p => {
        // Simple logic: If stock < 10, price +5%. If stock > 30, price -10%.
        if (p.stock < 10 && !p.badge) {
            p.price = Math.round(p.price * 1.05);
            p.badge = "HOT";
        } else if (p.stock > 30) {
            p.price = Math.round(p.price * 0.9);
            p.badge = "AUTO-SALE";
        }
    });

    saveProducts(products);
    const log = document.getElementById("activityLog");
    if (log) log.innerHTML += `<p>> [AI] Smart Pricing a adaptat prețurile conform cererii.</p>`;
}

window.createCoupon = () => {
    const code = "DISCOUNT-" + Math.floor(1000 + Math.random() * 9000);
    const val = prompt("Valoare reducere (RON):", "50");
    if (!val) return;

    let coupons = JSON.parse(localStorage.getItem("mdlCoupons")) || [];
    coupons.push({ code, val: Number(val), active: true });
    localStorage.setItem("mdlCoupons", JSON.stringify(coupons));

    showToast(`Cupon creat: ${code} (-${val} RON)`, "success");

};

// ================= LOGISTICS & INVENTORY LOGIC =================
function loadInventory() {
    const products = getProducts();
    const tbody = document.getElementById("inventoryTable");
    if (!tbody) return;
    let lowStockCount = 0;

    tbody.innerHTML = "";
    products.forEach(p => {
        const central = Math.floor(p.stock * 0.7);
        const vest = Math.floor(p.stock * 0.2);
        const incubator = p.stock - central - vest;

        if (p.stock < 5) lowStockCount++;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><b>${p.name}</b><br><small>SKU: ${p.sku || 'N/A'}</small></td>
            <td>${central} buc</td>
            <td>${vest} buc</td>
            <td>${incubator} buc</td>
        `;
        tbody.appendChild(tr);
    });

    const lowStockElem = document.getElementById("lowStockCount");
    if (lowStockElem) lowStockElem.innerText = lowStockCount;
}

// GROWTH & ANALYTICS HELPER
function loadTopClients() {
    const tbody = document.getElementById("topClientsTable");
    if (!tbody) return;

    const clients = [
        { name: "Andrei Popa", orders: 12, spent: 4500, score: 98 },
        { name: "Elena Ionescu", orders: 8, spent: 3200, score: 92 },
        { name: "Mihai Georgescu", orders: 5, spent: 1500, score: 85 }
    ];

    tbody.innerHTML = "";
    clients.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><b>${c.name}</b></td>
            <td>${c.orders}</td>
            <td>${c.spent} RON</td>
            <td>
                <div style="width:100px; height:8px; background:#eee; border-radius:4px;">
                    <div style="width:${c.score}%; height:100%; background:#2ecc71; border-radius:4px;"></div>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Auto-login check on page load
document.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = localStorage.getItem("mdlLoggedInUser");
    if (loggedInUser) {
        document.body.classList.add("logged-in");
        document.getElementById("usernameDisplay").innerText = loggedInUser;
        loadOrders();
        loadProducts();
        loadTopClients();
        initDashboard(); // Initialize charts if already logged in
        loadInventory(); // Load inventory if already logged in
    }
});

// ================= DATA PORTABILITY (CSV EXPORT) =================
window.exportProductsToCSV = () => {
    const products = getProducts();
    let csv = "Nume,Pret,Categorie,SKU,Stoc\n";

    products.forEach(p => {
        csv += `"${p.name}",${p.price},"${p.category}","${p.sku}",${p.stock}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produse_mdl_shop_${new Date().toLocaleDateString()}.csv`;
    a.click();

    const log = document.getElementById("activityLog");
    if (log) log.innerHTML += `<p>> [EXPORT] Baza de date produse exportată în format CSV.</p>`;
};

// ================= SEO & META TAGS =================
function updateMetaTags(title, desc) {
    document.title = title + " | MDL Smart Shop";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);
}

// Check for SEO triggers
if (window.location.pathname.includes("admin.html")) {
    updateMetaTags("Admin Dashboard", "Gestiune enterprise pentru MDL Shop");
}


// ================= SETTINGS & ANAF LOGIC =================
function saveAdminSettings() {
    const settings = {
        storeName: document.getElementById("settingStoreName").value,
        currency: document.getElementById("settingCurrency").value,
        freeShippingThreshold: document.getElementById("settingFreeShipping") ? Number(document.getElementById("settingFreeShipping").value) : 300,
        company: {

            name: document.getElementById("companyName").value,
            cui: document.getElementById("companyCUI").value,
            reg: document.getElementById("companyReg").value,
            county: document.getElementById("companyCounty").value,
            address: document.getElementById("companyAddress").value,
            iban: document.getElementById("companyIBAN").value,
            bank: document.getElementById("companyBank").value
        }
    };
    localStorage.setItem("mdlStoreSettings", JSON.stringify(settings));

    // UI Feedback
    const status = document.getElementById("saveStatus");
    status.style.display = "inline";
    setTimeout(() => { status.style.display = "none"; }, 3000);

    const log = document.getElementById("activityLog");
    if (log) log.innerHTML += `<p>> [CONFIG] Setările magazinului și datele ANAF au fost actualizate.</p>`;
}

function loadAdminSettings() {
    const data = JSON.parse(localStorage.getItem("mdlStoreSettings"));
    if (!data) return;

    if (document.getElementById("settingStoreName")) document.getElementById("settingStoreName").value = data.storeName;
    if (document.getElementById("settingCurrency")) document.getElementById("settingCurrency").value = data.currency;
    if (document.getElementById("settingFreeShipping")) document.getElementById("settingFreeShipping").value = data.freeShippingThreshold || 300;


    if (data.company) {
        if (document.getElementById("companyName")) document.getElementById("companyName").value = data.company.name;
        if (document.getElementById("companyCUI")) document.getElementById("companyCUI").value = data.company.cui;
        if (document.getElementById("companyReg")) document.getElementById("companyReg").value = data.company.reg;
        if (document.getElementById("companyCounty")) document.getElementById("companyCounty").value = data.company.county;
        if (document.getElementById("companyAddress")) document.getElementById("companyAddress").value = data.company.address;
        if (document.getElementById("companyIBAN")) document.getElementById("companyIBAN").value = data.company.iban;
        if (document.getElementById("companyBank")) document.getElementById("companyBank").value = data.company.bank;
    }
}

// Call on startup
document.addEventListener("DOMContentLoaded", () => {
    loadAdminSettings();
    initDashboard(); // Load real data on landing
});

// 11. REVIEWS MODERATION
function loadReviews() {
    const tbody = document.getElementById("reviewsTableBody");
    if (!tbody) return;

    const reviews = JSON.parse(localStorage.getItem("mdlReviews")) || [];
    tbody.innerHTML = "";

    reviews.forEach((r, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><b>${r.sku}</b></td>
            <td>${r.user} ${r.verified ? '<i class="fa-solid fa-circle-check" style="color:#22c55e;"></i>' : ''}</td>
            <td style="color:#f59e0b;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</td>
            <td><small>${r.text}</small></td>
            <td>
                <button class="action-btn" style="background:#ef4444;" onclick="deleteReview(${index})">Șterge</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.deleteReview = (index) => {
    if (!confirm("Ești sigur că vrei să ștergi această recenzie?")) return;
    let reviews = JSON.parse(localStorage.getItem("mdlReviews")) || [];
    reviews.splice(index, 1);
    localStorage.setItem("mdlReviews", JSON.stringify(reviews));
    loadReviews();
};
