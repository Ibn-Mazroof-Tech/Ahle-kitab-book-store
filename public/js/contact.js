window.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const fd = new FormData(form);

    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const message = String(fd.get("message") || "").trim();

    if (!name || !phone || !message) {
      toast("Please complete all fields.", true);
      return;
    }

    const payload = encodeURIComponent(`Assalamu alaikum, I am ${name} (${phone}). ${message}`);
    window.open(`https://wa.me/919999999999?text=${payload}`, "_blank", "noopener");
    toast("WhatsApp opened successfully.");
    form.reset();
  });
});
