import { iniciarSesion, recuperarContraseña, actualizarContraseña, obtenerPerfil, esAdmin } from "./auth.js";
import supabase from "./supabase.js";

console.log("Módulo de autenticación y acceso inicializado.");

function obtenerDestinoRedireccionSegura() {
    const referrer = document.referrer;
    if (referrer) {
        try {
            const urlObj = new URL(referrer, window.location.origin);
            if (urlObj.origin === window.location.origin) {
                const path = urlObj.pathname.toLowerCase();
                if (!path.endsWith("sesion.html") && !path.endsWith("login.html") && !path.endsWith("registro.html")) {
                    return urlObj.pathname + urlObj.search + urlObj.hash;
                }
            }
        } catch (e) {
            console.warn("Error al analizar referrer:", e);
        }
    }
    return "tablon.html";
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

    try {
        const perfil = await obtenerPerfil();
        const esAdminUser = await esAdmin();
        if (perfil) {
            sessionStorage.setItem("proa_session_cache", JSON.stringify({
                perfil,
                esAdmin: esAdminUser || perfil.rol === 'admin'
            }));
        }
    } catch (_) {}

    setTimeout(() => {
        const destino = obtenerDestinoRedireccionSegura();
        window.location.href = destino;
    }, 400);
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

// ====================================================
// GESTIÓN DE RESTABLECIMIENTO DE CONTRASEÑA (REL-03)
// ====================================================
function activarModoRestablecerContraseña() {
    const card = document.querySelector(".uiverse-card");
    if (!card) return;

    const heading = card.querySelector(".uiverse-heading");
    const subheading = card.querySelector(".uiverse-subheading");
    const formLogin = document.getElementById("formLogin");
    const registerFooter = card.querySelector(".register-footer");

    if (heading) heading.textContent = "Nueva Contraseña";
    if (subheading) subheading.textContent = "Ingresa tu nueva contraseña para acceder a la plataforma.";
    if (registerFooter) registerFooter.style.display = "none";

    if (formLogin) {
        formLogin.innerHTML = `
            <div class="input-group">
                <i class="fa-solid fa-lock"></i>
                <input required class="uiverse-input" type="password" id="nuevaPassword" placeholder="Nueva contraseña (mínimo 6 caracteres)">
            </div>

            <div class="input-group">
                <i class="fa-solid fa-lock"></i>
                <input required class="uiverse-input" type="password" id="confirmarPassword" placeholder="Repite tu nueva contraseña">
            </div>

            <button class="uiverse-btn" type="submit" id="btnGuardarPassword">
                <i class="fa-solid fa-floppy-disk"></i> Guardar Nueva Contraseña
            </button>
        `;

        formLogin.onsubmit = async (e) => {
            e.preventDefault();
            const pass1 = document.getElementById("nuevaPassword")?.value || "";
            const pass2 = document.getElementById("confirmarPassword")?.value || "";
            const mensaje = document.getElementById("mensaje");

            if (!pass1 || pass1.length < 6) {
                if (mensaje) {
                    mensaje.style.color = "#dc2626";
                    mensaje.textContent = "La contraseña debe tener al menos 6 caracteres.";
                }
                return;
            }

            if (pass1 !== pass2) {
                if (mensaje) {
                    mensaje.style.color = "#dc2626";
                    mensaje.textContent = "Las contraseñas no coinciden.";
                }
                return;
            }

            if (mensaje) {
                mensaje.style.color = "#0077cc";
                mensaje.textContent = "Guardando nueva contraseña...";
            }

            const { error } = await actualizarContraseña(pass1);

            if (error) {
                if (mensaje) {
                    mensaje.style.color = "#dc2626";
                    mensaje.textContent = error.message || "Error al actualizar la contraseña.";
                }
            } else {
                if (mensaje) {
                    mensaje.style.color = "#16a34a";
                    mensaje.textContent = "¡Contraseña actualizada con éxito! Redirigiendo a tu perfil...";
                }
                setTimeout(() => {
                    window.location.href = "perfil.html";
                }, 1200);
            }
        };
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

    // Detectar si el usuario llega con token de recuperación de contraseña (hash de URL)
    if (window.location.hash && (window.location.hash.includes("type=recovery") || window.location.hash.includes("access_token="))) {
        activarModoRestablecerContraseña();
    }

    // Escuchar el evento PASSWORD_RECOVERY emitido por Supabase Auth
    supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
            activarModoRestablecerContraseña();
        }
    });
});