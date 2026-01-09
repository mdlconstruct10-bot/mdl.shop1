document.addEventListener("DOMContentLoaded", () => {
    const proposalForm = document.getElementById("proposalForm");
    if (proposalForm) {
        proposalForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const data = {
                name: document.getElementById("senderName").value,
                email: document.getElementById("senderEmail").value,
                subject: document.getElementById("subject").value,
                message: document.getElementById("message").value,
                date: new Date().toLocaleString()
            };

            // Simulăm salvarea propunerii în localStorage (pentru admin)
            let proposals = JSON.parse(localStorage.getItem("mdlProposals")) || [];
            proposals.push(data);
            localStorage.setItem("mdlProposals", JSON.stringify(proposals));

            showToast("Mesajul tău a fost trimis cu succes către directorul MDL SHOP! Vei primi un răspuns în curând.", "success");

            this.reset();
        });
    }
});
