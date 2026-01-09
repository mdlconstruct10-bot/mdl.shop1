// arată formularul de register
function showRegister() {
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("registerBox").classList.remove("hidden");
}

// arată formularul de login
function showLogin() {
  document.getElementById("registerBox").classList.add("hidden");
  document.getElementById("loginBox").classList.remove("hidden");
}

// LOGIN (doar demo)
document.querySelector("#loginBox form").addEventListener("submit", function (e) {
  e.preventDefault();

  const inputs = this.querySelectorAll("input");
  const user = inputs[0].value;
  const pass = inputs[1].value;

  if (user === "" || pass === "") {
    showToast("Completează toate câmpurile!", "error");

    return;
  }

  // SIMULARE LOGIN REUȘIT
  // Salvăm utilizatorul în browser (localStorage)
  localStorage.setItem("mdlUser", user);

  showToast("Autentificare reușită, " + user + "!", "success");


  // Redirecționare către pagina principală
  // Redirecționare către pagina principală sau reîncărcare pt dashboard
  // window.location.href = "index.html"; 
  location.reload();
});

// REGISTER (doar demo)
document.querySelector("#registerBox form").addEventListener("submit", function (e) {
  e.preventDefault();

  const inputs = this.querySelectorAll("input");
  const email = inputs[0].value;
  const user = inputs[1].value;
  const pass = inputs[2].value;

  if (email === "" || user === "" || pass === "") {
    showToast("Completează toate câmpurile!", "error");

    return;
  }

  showToast("Cont creat cu succes (demo)", "success");

  showLogin();
});

// SOCIAL LOGIN MOCK
function loginWithGoogle() {
  showToast("Te conectezi cu Google...", "info");

  localStorage.setItem("mdlUser", "Google User");
  setTimeout(() => {
    // window.location.href = "hom.html";
    location.reload();
  }, 1000);
}

function loginWithFacebook() {
  showToast("Te conectezi cu Facebook...", "info");

  localStorage.setItem("mdlUser", "Facebook User");
  setTimeout(() => {
    // window.location.href = "hom.html";
    location.reload();
  }, 1000);
}

// NAV FAVORITES UPDATE
// NAV FAVORITES & DASHBOARD LOGIC
document.addEventListener("DOMContentLoaded", () => {
  // 1. Favorites
  const user = localStorage.getItem("mdlUser");
  const favKey = user ? `mdlFavorites_${user}` : "mdlFavorites";
  const favs = JSON.parse(localStorage.getItem(favKey)) || [];
  const navHeart = document.querySelector(".navbar a .fa-heart");
  const favCount = document.getElementById("favCount");

  if (navHeart) navHeart.style.color = favs.length > 0 ? "red" : "";
  if (favCount) {
    favCount.innerText = favs.length;
    favCount.style.display = favs.length > 0 ? "inline-block" : "none";
  }

  // 2. DASHBOARD CHECK
  const currentUser = localStorage.getItem("mdlUser");
  const loginBox = document.getElementById("loginBox");
  const dashboardBox = document.getElementById("dashboardBox");

  // Generare Client ID (mock simplu based pe nume)
  const getClientId = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return "CL-" + Math.abs(hash).toString().substring(0, 6);
  };

  if (currentUser) {
    // User logged in -> Show Dashboard
    if (loginBox) loginBox.classList.add("hidden");
    if (dashboardBox) {
      dashboardBox.classList.remove("hidden");

      // Set User Info
      document.getElementById("dashUsername").innerText = "Salut, " + currentUser + "!";
      document.getElementById("dashClientId").innerText = getClientId(currentUser);

      // Real Orders Logic
      const allOrders = JSON.parse(localStorage.getItem("mdlOrders")) || [];
      const userOrders = allOrders.filter(o => o.user === currentUser);

      let activeHtml = "";
      let pastHtml = "";

      if (userOrders.length === 0) {
        activeHtml = "<p style='color:#777'>Nu ai comenzi active.</p>";
        pastHtml = "<p style='color:#777'>Nu ai comenzi anterioare.</p>";
      } else {
        userOrders.forEach(order => {
          const isCompleted = order.status === "Livrat" || order.status === "Retur";
          const statusColor = order.status === "Nou" ? "orange" :
            order.status === "Procesare" ? "blue" :
              order.status === "Livrat" ? "green" : "red";

          const awbHtml = order.awb ? `<br><small>AWB: <b>${order.awb}</b></small>` : "";

          const html = `
            <div style="border:1px solid #eee; padding:10px; border-radius:8px; margin-bottom:10px; background:#fafafa;">
                <strong>Comanda #${order.orderId || order.id}</strong> - 
                <span style="color:${statusColor}; font-weight:bold;">${order.status}</span><br>
                <small>Total: ${order.total} RON | Data: ${order.date || 'N/A'}</small>
                ${awbHtml}
            </div>
          `;

          if (isCompleted) {
            pastHtml += html;
          } else {
            activeHtml += html;
          }
        });

        if (activeHtml === "") activeHtml = "<p style='color:#777'>Nu ai comenzi active.</p>";
        if (pastHtml === "") pastHtml = "<p style='color:#777'>Nu ai comenzi anterioare.</p>";
      }

      document.getElementById("activeOrders").innerHTML = activeHtml;
      document.getElementById("pastOrders").innerHTML = pastHtml;
    }
  }
});

function logout() {
  localStorage.removeItem("mdlUser");
  // Poate vrem sa pastram cosul/favoritele? De obicei da.
  location.reload();
}
