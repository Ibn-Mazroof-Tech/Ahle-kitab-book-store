window.addEventListener("DOMContentLoaded", async () => {
  const featuredEl = document.querySelector("[data-featured]");
  if (!featuredEl) return;

  try {
    const books = await fetchBooks();
    const featured = books.slice(0, 4);

    featuredEl.innerHTML = featured
      .map(
        (book) => `
      <article class="book-card">
        <img class="book-image" src="${book.image}" alt="${book.title}" loading="lazy" />
        <div class="book-body">
          <p class="muted">${book.category}</p>
          <h4 class="book-title">${book.title}</h4>
          <p class="book-author">${book.author}</p>
          <div class="book-meta">
            <span class="price">${currency(book.price)}</span>
            <a href="/pages/book.html?id=${book.id}" class="btn btn-secondary">Details</a>
          </div>
          <button class="btn btn-primary" data-add="${book.id}">Add To Cart</button>
        </div>
      </article>
    `
      )
      .join("");

    featuredEl.querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const book = books.find((item) => item.id === btn.dataset.add);
        if (!book) return;
        addToCart(book);
        toast("Added to cart");
      });
    });
  } catch (_err) {
    featuredEl.innerHTML = `<p class="muted">Unable to load featured books right now.</p>`;
  }
});
