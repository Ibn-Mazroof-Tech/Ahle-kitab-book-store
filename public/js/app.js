const API_BASE = "";

async function fetchBooks() {
  const res = await fetch(`${API_BASE}/api/books`);
  if (!res.ok) throw new Error("Failed to load books");
  const data = await res.json();
  return data.books || [];
}

function currency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

function setActiveNav() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const target = link.getAttribute("href").split("/").pop();
    if (target === page) link.classList.add("active");
  });
}

function bindCartBadge() {
  const badge = document.querySelector("[data-cart-count]");
  if (!badge) return;

  const render = () => {
    badge.textContent = String(getCartCount());
  };

  render();
  document.addEventListener("cart:updated", render);
}

function toast(message, isError = false) {
  const root = document.querySelector("[data-alert-root]");
  if (!root) return;

  root.innerHTML = `<div class="alert ${isError ? "error" : "success"}">${message}</div>`;
  setTimeout(() => {
    root.innerHTML = "";
  }, 2500);
}

window.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  bindCartBadge();
});
