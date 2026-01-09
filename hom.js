// ❤️ INIMĂ
document.querySelectorAll(".fav-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault(); // NU deschide linkul
    e.stopPropagation();

    btn.classList.toggle("active");
    const icon = btn.querySelector("i");
    icon.classList.toggle("fa-regular");
    icon.classList.toggle("fa-solid");
  });
});

// 🔍 SEARCH PRODUSE
const searchInput = document.getElementById("searchInput");
const products = document.querySelectorAll(".product-card");

searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();

  products.forEach(product => {
    const name = product.dataset.name.toLowerCase();
    product.style.display = name.includes(value) ? "" : "none";
  });
});
document.addEventListener("DOMContentLoaded", function () {

  const priceRange = document.getElementById("priceRange");
  const priceValue = document.getElementById("priceValue");
  const categoryFilter = document.getElementById("categoryFilter");
  const applyBtn = document.getElementById("applyFilters");
  const products = document.querySelectorAll(".product-card");

  // afișare valoare slider
  priceValue.textContent = priceRange.value + " RON";

  priceRange.addEventListener("input", () => {
    priceValue.textContent = priceRange.value + " RON";
  });

  function filterProducts() {
    const maxPrice = Number(priceRange.value);
    const selectedCategory = categoryFilter.value;

    products.forEach(product => {

      // ia prețul din text (ex: "199 RON")
      const priceText = product.querySelector(".price")?.innerText || "0";
      const price = Number(priceText.replace(/\D/g, ""));

      // categoria (dacă nu există, o consideră "all")
      const category = product.dataset.category || "all";

      const show =
        price <= maxPrice &&
        (selectedCategory === "all" || category === selectedCategory);

      product.style.display = show ? "block" : "none";
    });
  }

  applyBtn.addEventListener("click", filterProducts);

});
