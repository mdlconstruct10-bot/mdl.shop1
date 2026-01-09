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
    alert("Completează toate câmpurile!");
    return;
  }

  alert("Autentificare reușită (demo)");
  // aici vei lega backend / PHP / API mai târziu
});

// REGISTER (doar demo)
document.querySelector("#registerBox form").addEventListener("submit", function (e) {
  e.preventDefault();

  const inputs = this.querySelectorAll("input");
  const email = inputs[0].value;
  const user = inputs[1].value;
  const pass = inputs[2].value;

  if (email === "" || user === "" || pass === "") {
    alert("Completează toate câmpurile!");
    return;
  }

  alert("Cont creat cu succes (demo)");
  showLogin();
});
