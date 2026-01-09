function showToast(message, type = "success") {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.style.cssText = "position:fixed; top:20px; right:20px; z-index:9999;";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "fa-circle-check";
    if (type === "error") icon = "fa-circle-exclamation";
    if (type === "info") icon = "fa-circle-info";

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <div>${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "fadeOut 0.3s ease-in forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- MAINTENANCE MODE / WARNING OVERLAY ---
function initMaintenanceMode() {
    const settings = JSON.parse(localStorage.getItem("mdlMaintenanceSettings")) || {
        enabled: true,
        message: "ATENȚIE: Acest site este unul de PROBĂ! Comenzile plasate nu sunt reale și nu vor fi procesate. Conținutul nu trebuie luat în calcul de ANAF sau ANPC."
    };

    if (!settings.enabled) return;

    // Check if dismissed in this session
    if (sessionStorage.getItem("mdlWarningDismissed")) return;

    const overlay = document.createElement("div");
    overlay.className = "maintenance-overlay";
    overlay.id = "maintenanceOverlay";
    overlay.innerHTML = `
        <div class="maintenance-content">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <h2>AVERTISMENT IMPORTANTE</h2>
            <p>${settings.message}</p>
            <button onclick="dismissMaintenance()">AM ÎNȚELES ȘI ACCEPT</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

function dismissMaintenance() {
    const overlay = document.getElementById("maintenanceOverlay");
    if (overlay) {
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.remove();
            sessionStorage.setItem("mdlWarningDismissed", "true");
        }, 500);
    }
}

// Auto-init on script load
document.addEventListener("DOMContentLoaded", initMaintenanceMode);

