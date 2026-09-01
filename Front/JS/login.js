import { iniciarSesion, recuperarContraseña } from "./auth.js";

console.log("Módulo de inicio de sesión inicializado.");

function obtenerDestinoRedireccionSegura() {
    const referrer = document.referrer;
    if (referrer && referrer.includes(window.location.origin)) {
        try {
            const urlObj = new URL(referrer);
            const path = urlObj.pathname.toLowerCase();
            // Evitamos redireccionar en bucle a login, sesion o registro
            if (!path.endsWith("sesion.html") && !path.endsWith("login.html") && !path.endsWith("registro.html")) {
                return referrer;
            }
        } catch (e) {
            console.warn("Error al analizar referrer:", e);
        }
    }
    return "tablon.html"; // Plan B predeterminado
}

async function ejecutarLogin(e) {
    if (e) e.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const mensaje = document.getElementById("mensaje");

    if (!emailInput || !passwordInput || !mensaje) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    mensaje.textContent = "";
    mensaje.className = "mensaje-estado";

    if (!email || !password) {
        mensaje.style.color = "#dc2626";
        mensaje.textContent = "Por favor, completa todos los campos.";
        return;
    }

    mensaje.style.color = "#0077cc";
    mensaje.textContent = "Iniciando sesión...";

    const { error } = await iniciarSesion(email, password);

    if (error) {
        mensaje.style.color = "#dc2626";
        mensaje.textContent = error.message || "Error al iniciar sesión. Revisa tus credenciales.";
        return;
    }

    mensaje.style.color = "#16a34a";
    mensaje.textContent = "¡Inicio de sesión exitoso! Redirigiendo...";

    setTimeout(() => {
        const destino = obtenerDestinoRedireccionSegura();
        window.location.href = destino;
    }, 600);
}

async function solicitarRecuperacionPassword(e) {
    if (e) e.preventDefault();

    const emailInput = document.getElementById("email");
    const mensaje = document.getElementById("mensaje");

    const email = emailInput ? emailInput.value.trim() : "";

    if (!email) {
        if (mensaje) {
            mensaje.style.color = "#dc2626";
            mensaje.textContent = "Ingresa tu correo en el campo de Email para recuperar la contraseña.";
        } else {
            alert("Ingresa tu correo en el campo de Email para recuperar la contraseña.");
        }
        return;
    }

    if (mensaje) {
        mensaje.style.color = "#0077cc";
        mensaje.textContent = "Enviando enlace de recuperación...";
    }

    const { error } = await recuperarContraseña(email);

    if (error) {
        if (mensaje) {
            mensaje.style.color = "#dc2626";
            mensaje.textContent = error.message || "Error al solicitar la recuperación.";
        }
    } else {
        if (mensaje) {
            mensaje.style.color = "#16a34a";
            mensaje.textContent = "¡Enlace enviado! Revisa la bandeja de entrada de tu correo.";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const btnLogin = document.getElementById("btnLogin");
    const formLogin = document.getElementById("formLogin");
    const btnForgot = document.getElementById("btnForgot");

    if (btnLogin) {
        btnLogin.addEventListener("click", ejecutarLogin);
    }
    if (formLogin) {
        formLogin.addEventListener("submit", ejecutarLogin);
    }
    if (btnForgot) {
        btnForgot.addEventListener("click", solicitarRecuperacionPassword);
    }
});