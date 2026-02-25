const CART_KEY = "ahle_kitab_cart_v1";

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  document.dispatchEvent(new CustomEvent("cart:updated", { detail: items }));
}

function getCartCount() {
  return loadCart().reduce((sum, item) => sum + item.quantity, 0);
}

function addToCart(book) {
  const cart = loadCart();
  const existing = cart.find((item) => item.id === book.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: book.id,
      title: book.title,
      price: book.price,
      image: book.image,
      quantity: 1
    });
  }

  saveCart(cart);
}

function updateCartQuantity(id, quantity) {
  const cart = loadCart();
  const target = cart.find((item) => item.id === id);
  if (!target) return;

  target.quantity = Math.max(1, Math.min(10, quantity));
  saveCart(cart);
}

function removeFromCart(id) {
  const cart = loadCart().filter((item) => item.id !== id);
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function getCartTotals() {
  const cart = loadCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 80;
  const total = subtotal + shipping;

  return { subtotal, shipping, total };
}
