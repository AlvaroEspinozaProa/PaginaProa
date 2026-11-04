// ====================================================
// UTILIDADES COMPARTIDAS - ESCUELA PROA
// ====================================================

/**
 * Escapa caracteres especiales de HTML para prevenir inyecciones XSS.
 * @param {string|number} str
 * @returns {string}
 */
export function escaparHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Sanitiza y valida una URL para su uso seguro en atributos src y href.
 * Bloquea esquemas peligrosos como javascript:, data: (no-imagen), vbscript:, etc.
 * @param {string} url
 * @param {string} [fallback=""]
 * @returns {string}
 */
export function sanitizarUrl(url, fallback = "") {
    if (!url) return fallback;
    const limpia = String(url).trim();
    // Permitir solo http, https, rutas relativas seguras o data:image
    if (/^(https?:\/\/|\/|\.\/|data:image\/)/i.test(limpia)) {
        return escaparHTML(limpia);
    }
    return fallback;
}

/**
 * Sanitiza valores para atributos HTML (data-*, id, title, alt).
 * @param {string|number} val
 * @returns {string}
 */
export function sanitizarAtributo(val) {
    return escaparHTML(val);
}

/**
 * Muestra una notificación moderna tipo Toast flotante en pantalla.
 * @param {string} mensaje
 * @param {'exito'|'error'|'advertencia'|'info'} [tipo='info']
 * @param {number} [duracion=3500]
 */
export function mostrarToast(mensaje, tipo = "info", duracion = 3500) {
    if (typeof document === "undefined") return;

    let contenedor = document.getElementById("proa-toast-container");
    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "proa-toast-container";
        contenedor.className = "proa-toast-container";
        contenedor.setAttribute("aria-live", "polite");
        document.body.appendChild(contenedor);
    }

    const iconoClase = {
        exito: "fa-solid fa-circle-check",
        error: "fa-solid fa-circle-exclamation",
        advertencia: "fa-solid fa-triangle-exclamation",
        info: "fa-solid fa-circle-info"
    }[tipo] || "fa-solid fa-circle-info";

    const toast = document.createElement("div");
    toast.className = `proa-toast proa-toast-${tipo}`;
    toast.innerHTML = `
        <i class="${iconoClase}"></i>
        <span>${escaparHTML(mensaje)}</span>
    `;

    contenedor.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("is-visible");
    });

    setTimeout(() => {
        toast.classList.remove("is-visible");
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duracion);
}

if (typeof window !== "undefined") {
    window.mostrarToast = mostrarToast;
}

