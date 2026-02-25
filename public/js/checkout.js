window.addEventListener("DOMContentLoaded", () => {
  const summaryEl = document.querySelector("[data-checkout-summary]");
  const form = document.querySelector("[data-checkout-form]");
  const payButton = document.querySelector("[data-pay-now]");

  if (!summaryEl || !form || !payButton) return;

  function renderSummary() {
    const cart = loadCart();
    const totals = getCartTotals();

    if (!cart.length) {
      summaryEl.innerHTML = `
        <p class="muted">Your cart is empty.</p>
        <a class="btn btn-secondary" href="/pages/shop.html">Browse Books</a>
      `;
      payButton.disabled = true;
      return;
    }

    summaryEl.innerHTML = `
      ${cart
        .map(
          (item) => `
        <div class="row" style="justify-content: space-between;">
          <span>${item.title} x ${item.quantity}</span>
          <span>${currency(item.price * item.quantity)}</span>
        </div>
      `
        )
        .join("")}
      <hr />
      <div class="row" style="justify-content: space-between;"><span>Subtotal</span><strong>${currency(totals.subtotal)}</strong></div>
      <div class="row" style="justify-content: space-between;"><span>Shipping</span><strong>${totals.shipping ? currency(totals.shipping) : "Free"}</strong></div>
      <div class="row" style="justify-content: space-between;"><span>Total</span><strong>${currency(totals.total)}</strong></div>
    `;

    payButton.disabled = false;
  }

  function validateForm() {
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const address = String(fd.get("address") || "").trim();

    if (!name || !phone || !address) {
      toast("Name, phone, and address are required.", true);
      return null;
    }

    return { name, phone, email, address };
  }

  payButton.addEventListener("click", async () => {
    const customer = validateForm();
    if (!customer) return;

    const items = loadCart().map((item) => ({ id: item.id, quantity: item.quantity }));
    if (!items.length) {
      toast("Your cart is empty.", true);
      return;
    }

    try {
      payButton.disabled = true;
      payButton.textContent = "Preparing payment...";

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customer })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Order creation failed.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Ahle Kitab",
        description: "Islamic Books Purchase",
        order_id: orderData.id,
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone
        },
        theme: {
          color: "#0c3b2e"
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response)
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            clearCart();
            toast("Payment successful. Order confirmed.");
            setTimeout(() => {
              window.location.href = "/pages/thanks.html?paymentId=" + encodeURIComponent(verifyData.paymentId);
            }, 1200);
          } catch (error) {
            toast(error.message || "Verification failed.", true);
          }
        },
        modal: {
          ondismiss: () => {
            toast("Payment popup closed.", true);
            payButton.disabled = false;
            payButton.textContent = "Pay with Razorpay";
          }
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      toast(error.message || "Unable to proceed.", true);
      payButton.disabled = false;
      payButton.textContent = "Pay with Razorpay";
    }
  });

  renderSummary();
});
