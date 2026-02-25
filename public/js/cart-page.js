window.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-cart-root]");
  if (!root) return;

  function render() {
    const cart = loadCart();
    const totals = getCartTotals();

    if (!cart.length) {
      root.innerHTML = `
        <div class="card">
          <h3>Your cart is empty</h3>
          <p class="muted">Browse books and add items to continue.</p>
          <a class="btn btn-primary" href="/pages/shop.html">Go to Shop</a>
        </div>
      `;
      return;
    }

    root.innerHTML = `
      <div class="card">
        <table class="cart-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${cart
              .map(
                (item) => `
              <tr>
                <td>${item.title}</td>
                <td>${currency(item.price)}</td>
                <td>
                  <div class="qty-control">
                    <button data-dec="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button data-inc="${item.id}">+</button>
                  </div>
                </td>
                <td>${currency(item.price * item.quantity)}</td>
                <td><button class="btn btn-secondary" data-remove="${item.id}">Remove</button></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div class="card" style="margin-top: 14px;">
        <p><strong>Subtotal:</strong> ${currency(totals.subtotal)}</p>
        <p><strong>Shipping:</strong> ${totals.shipping === 0 ? "Free" : currency(totals.shipping)}</p>
        <p class="price">Grand Total: ${currency(totals.total)}</p>
        <div class="row">
          <a class="btn btn-primary" href="/pages/checkout.html">Proceed to Checkout</a>
          <button class="btn btn-secondary" data-clear>Clear Cart</button>
        </div>
      </div>
    `;

    root.querySelectorAll("[data-inc]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = cart.find((entry) => entry.id === btn.dataset.inc);
        if (!item) return;
        updateCartQuantity(item.id, item.quantity + 1);
        render();
      });
    });

    root.querySelectorAll("[data-dec]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = cart.find((entry) => entry.id === btn.dataset.dec);
        if (!item) return;
        if (item.quantity === 1) return;
        updateCartQuantity(item.id, item.quantity - 1);
        render();
      });
    });

    root.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        removeFromCart(btn.dataset.remove);
        render();
      });
    });

    const clearButton = root.querySelector("[data-clear]");
    clearButton?.addEventListener("click", () => {
      clearCart();
      render();
    });
  }

  render();
});
