document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  if (!form) return;

  const email = document.getElementById("email");

  const password = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");

   if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        const isHidden = password.type === "password";

        password.type = isHidden ? "text" : "password";

        togglePassword.textContent = isHidden ? "🙈" : "👁️";

    });
}

  const emailError = document.getElementById("emailError");

  const passwordError = document.getElementById("passwordError");

  form.addEventListener("submit", function (e) {
    let valid = true;

    // Reset

    email.classList.remove("is-valid", "is-invalid");
    password.classList.remove("is-valid", "is-invalid");

    emailError.textContent = "";
    passwordError.textContent = "";

    // Email

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.value.trim()) {
      valid = false;

      email.classList.add("is-invalid");

      emailError.textContent = "Email is required.";
    } else if (!emailRegex.test(email.value.trim())) {
      valid = false;

      email.classList.add("is-invalid");

      emailError.textContent = "Please enter a valid email address.";
    } else {
      email.classList.add("is-valid");
    }

    // Password

    if (!password.value.trim()) {
      valid = false;

      password.classList.add("is-invalid");

      passwordError.textContent = "Password is required.";
    } else {
      password.classList.add("is-valid");
    }

    const submitButton = form.querySelector('button[type="submit"]');

    if (!valid) {
      e.preventDefault();

      return;
    }
   



    submitButton.disabled = true;

    submitButton.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2"></span>
    Signing in...`;
  });
});
