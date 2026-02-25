window.addEventListener("DOMContentLoaded", async () => {
  const root = document.querySelector("[data-product]");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    root.innerHTML = `<p class="muted">Book ID missing.</p>`;
    return;
  }

  try {
    const res = await fetch(`/api/books/${id}`);
    if (!res.ok) throw new Error("Missing");
    const data = await res.json();
    const book = data.book;

    root.innerHTML = `
      <div class="product-layout">
        <div>
          <img class="product-image" src="${book.image}" alt="${book.title}" />
        </div>
        <div class="card">
          <p class="muted">${book.category} | ${book.language}</p>
          <h2>${book.title}</h2>
          <p class="book-author">by ${book.author}</p>
          <p>${book.description}</p>
          <p><strong>Reader rating:</strong> ${book.rating} / 5</p>
          <p class="price">${currency(book.price)}</p>
          <div class="row">
            <button class="btn btn-primary" data-add-book>Add To Cart</button>
            <a href="/pages/checkout.html" class="btn btn-secondary">Buy Now</a>
          </div>
        </div>
      </div>
    `;

    root.querySelector("[data-add-book]").addEventListener("click", () => {
      addToCart(book);
      toast("Added to cart");
    });
  } catch (_err) {
    root.innerHTML = `<p class="muted">Book not found.</p>`;
  }
});
