import { registrarUsuario } from "./auth.js";

console.log("Módulo de registro inicializado.");

async function ejecutarRegistro(e) {
    if (e) e.preventDefault();

    const nombreInput = document.getElementById("nombre");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const mensaje = document.getElementById("mensaje");

    if (!nombreInput || !emailInput || !passwordInput || !confirmPasswordInput || !mensaje) return;

    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    mensaje.textContent = "";

    if (!nombre || !email || !password || !confirmPassword) {
        mensaje.style.color = "#dc2626";
        mensaje.textContent = "Por favor, completa todos los campos del formulario.";
        return;
    }

    if (password !== confirmPassword) {
        mensaje.style.color = "#dc2626";
        mensaje.textContent = "Las contraseñas ingresadas no coinciden.";
        return;
    }

    if (password.length < 6) {
        mensaje.style.color = "#dc2626";
        mensaje.textContent = "La contraseña debe contener al menos 6 caracteres.";
        return;
    }

    mensaje.style.color = "#0077cc";
    mensaje.textContent = "Procesando registro...";

    const { data, error } = await registrarUsuario(email, password, nombre);

    if (error) {
        mensaje.style.color = "#dc2626";
        mensaje.textContent = error.message || "Error durante el registro. Inténtalo nuevamente.";
        return;
    }

    mensaje.style.color = "#16a34a";
    mensaje.textContent = "¡Registro exitoso! Redirigiendo a tu perfil...";

    setTimeout(() => {
        window.location.href = "perfil.html";
    }, 1200);
}

document.addEventListener("DOMContentLoaded", () => {
    const formRegistro = document.getElementById("formRegistro");
    const btnRegister = document.getElementById("btnRegister");

    if (formRegistro) {
        formRegistro.addEventListener("submit", ejecutarRegistro);
    }
    if (btnRegister) {
        btnRegister.addEventListener("click", ejecutarRegistro);
    }
});
