window.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector("[data-shop-grid]");
  if (!grid) return;

  const searchInput = document.querySelector("[data-search]");
  const categoryInput = document.querySelector("[data-category]");
  const sortInput = document.querySelector("[data-sort]");

  let books = [];

  function render(list) {
    if (!list.length) {
      grid.innerHTML = `<p class="muted">No books found for this filter.</p>`;
      return;
    }

    grid.innerHTML = list
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

    grid.querySelectorAll("[data-add]").forEach((button) => {
      button.addEventListener("click", () => {
        const book = books.find((item) => item.id === button.dataset.add);
        if (!book) return;
        addToCart(book);
        toast("Added to cart");
      });
    });
  }

  function runFilters() {
    const q = (searchInput.value || "").trim().toLowerCase();
    const category = categoryInput.value;
    const sort = sortInput.value;

    let filtered = books.filter((book) => {
      const matchText = !q || `${book.title} ${book.author}`.toLowerCase().includes(q);
      const matchCategory = category === "all" || book.category === category;
      return matchText && matchCategory;
    });

    if (sort === "price_asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
    if (sort === "rating_desc") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

    render(filtered);
  }

  try {
    books = await fetchBooks();
    const categories = [...new Set(books.map((book) => book.category))];

    categoryInput.innerHTML = [
      `<option value="all">All categories</option>`,
      ...categories.map((cat) => `<option value="${cat}">${cat}</option>`)
    ].join("");

    [searchInput, categoryInput, sortInput].forEach((input) => {
      input.addEventListener("input", runFilters);
      input.addEventListener("change", runFilters);
    });

    runFilters();
  } catch (_err) {
    grid.innerHTML = `<p class="muted">Unable to load books right now.</p>`;
  }
});
