document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validación simple
    if (email && password) {
      // Guardamos el "usuario" en localStorage
      localStorage.setItem("usuario", email);

      // Redirigimos al inicio
      window.location.href = "index.html";
    } else {
      alert("Por favor completa todos los campos.");
    }
  });

  // Mostrar / ocultar contraseña
  const toggleBtn = document.querySelector(".toggle-password");
  const passwordField = document.getElementById("password");

  toggleBtn.addEventListener("click", () => {
    const type =
      passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", type);
  });
});
