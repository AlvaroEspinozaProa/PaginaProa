// ====================================================
// NAVEGACIÓN GLOBAL Y HEADER - ESCUELA PROA
// ====================================================

import { obtenerIdioma, alternarIdioma, aplicarTraducciones, t } from "./i18n.js";

document.addEventListener("DOMContentLoaded", async () => {
    const header = document.getElementById("global-header");
    if (!header) return;

    // Detectar página actual para marcar link activo
    let currentPage = window.location.pathname.split("/").pop();
    if (!currentPage || currentPage === "") {
        currentPage = "index.html";
    }

    // Idioma activo inicial
    let idiomaActual = obtenerIdioma();

    // 1. Asignar sección al body para tematización dinámica
    const mapaSecciones = {
        "index.html": "inicio",
        "tablon.html": "novedades",
        "proyectos.html": "proyectos",
        "pasantias.html": "pasantias",
        "cde.html": "cde",
        "deporte.html": "deportes",
        "horarios.html": "horarios",
        "admin.html": "admin",
        "perfil.html": "perfil",
        "sesion.html": "auth",
        "registro.html": "auth"
    };
    const seccionDetectada = mapaSecciones[currentPage.toLowerCase()] || "inicio";
    document.body.dataset.seccion = seccionDetectada;

    // Meta theme-color dinámico para navegadores móviles
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
        metaThemeColor = document.createElement("meta");
        metaThemeColor.name = "theme-color";
        document.head.appendChild(metaThemeColor);
    }
    const coloresTheme = {
        inicio: "#0057B8",
        novedades: "#ea580c",
        proyectos: "#7c3aed",
        pasantias: "#0f766e",
        cde: "#be123c",
        deportes: "#15803d",
        horarios: "#4338ca",
        admin: "#1e293b",
        perfil: "#0077cc",
        auth: "#0077cc"
    };
    metaThemeColor.content = coloresTheme[seccionDetectada] || "#0057B8";

    // 2. Enlace del Logo institucional
    const logoLink = document.createElement("a");
    logoLink.href = "index.html";
    logoLink.className = "logo";
    logoLink.setAttribute("aria-label", t("nav.logo_aria", idiomaActual));
    logoLink.innerHTML = `
        <img src="logo.png" alt="Logo Escuela PRoA">
        <div class="logo-texto">
            <h2>Escuela PRoA</h2>
            <span data-i18n="nav.subtitle">${t("nav.subtitle", idiomaActual)}</span>
        </div>
    `;

    // 3. Botón Hamburguesa accesible para vista móvil
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "nav-toggle";
    toggleBtn.setAttribute("aria-label", t("nav.open_menu", idiomaActual));
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-controls", "nav-menu-principal");
    toggleBtn.innerHTML = `<i class="fa-solid fa-bars"></i>`;

    // 4. Menú de navegación
    const navElement = document.createElement("nav");
    navElement.id = "nav-menu-principal";
    navElement.setAttribute("aria-label", "Navegación principal");

    // Indicador deslizante dinámico con técnica FLIP
    const indicator = document.createElement("span");
    indicator.className = "nav-indicator";
    indicator.setAttribute("aria-hidden", "true");
    navElement.appendChild(indicator);

    // Ítems de secciones fijas
    const navItems = [
        { href: "index.html", icon: "fa-solid fa-house", text: "Inicio", key: "nav.inicio" },
        { href: "tablon.html", icon: "fa-solid fa-bullhorn", text: "Novedades", key: "nav.novedades" },
        { href: "proyectos.html", icon: "fa-solid fa-code-branch", text: "Proyectos", key: "nav.proyectos" },
        { href: "pasantias.html", icon: "fa-solid fa-briefcase", text: "Pasantías", key: "nav.pasantias" },
        { href: "cde.html", icon: "fa-solid fa-users-rectangle", text: "CDE", key: "nav.cde" },
        { href: "deporte.html", icon: "fa-solid fa-trophy", text: "Deportes", key: "nav.deportes" },
        { href: "horarios.html", icon: "fa-solid fa-calendar-days", text: "Horarios", key: "nav.horarios" }
    ];

    navItems.forEach(item => {
        const link = document.createElement("a");
        link.href = item.href;
        link.className = "nav-link-item";
        if (currentPage.toLowerCase() === item.href.toLowerCase()) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
        link.innerHTML = `<i class="${item.icon}"></i> <span data-i18n="${item.key}">${t(item.key, idiomaActual, item.text)}</span>`;
        navElement.appendChild(link);
    });

    // Separador visual
    const divider = document.createElement("div");
    divider.className = "nav-divider";
    navElement.appendChild(divider);

    // Botón de Traducción / Idioma (ES / EN)
    const langBtn = document.createElement("button");
    langBtn.type = "button";
    langBtn.className = "nav-lang-btn";
    langBtn.id = "nav-lang-btn";
    langBtn.setAttribute("aria-label", t("nav.lang_toggle_aria", idiomaActual));
    langBtn.setAttribute("title", t("nav.lang_toggle_title", idiomaActual));
    langBtn.innerHTML = `
        <i class="fa-solid fa-globe nav-lang-icon" aria-hidden="true"></i>
        <span class="nav-lang-pill">
            <span class="nav-lang-opt nav-lang-es ${idiomaActual === "es" ? "is-active" : ""}">ES</span>
            <span class="nav-lang-sep">/</span>
            <span class="nav-lang-opt nav-lang-en ${idiomaActual === "en" ? "is-active" : ""}">EN</span>
        </span>
    `;
    navElement.appendChild(langBtn);

    // Contenedor dinámico del usuario (Avatar + Dropdown o Botón Ingresar)
    const userSlot = document.createElement("div");
    userSlot.className = "nav-user-slot";
    userSlot.id = "nav-user-slot";
    navElement.appendChild(userSlot);

    // Inyectar en el header
    header.innerHTML = "";
    header.appendChild(logoLink);
    header.appendChild(toggleBtn);
    header.appendChild(navElement);

    // Elementos de enlace
    const linkItems = navElement.querySelectorAll("a.nav-link-item");

    // Lógica del indicador deslizante
    function moverIndicador(targetElement, inmediato = false) {
        if (!targetElement || window.innerWidth <= 1100) {
            indicator.style.opacity = "0";
            linkItems.forEach(l => l.classList.remove("indicator-on"));
            return;
        }

        const navRect = navElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const left = targetRect.left - navRect.left;
        const width = targetRect.width;

        // Mantener texto blanco estrictamente en el elemento bajo el indicador
        linkItems.forEach(l => l.classList.remove("indicator-on"));
        targetElement.classList.add("indicator-on");

        if (inmediato) {
            indicator.style.transition = "none";
            indicator.style.transform = `translate(${left}px, -50%)`;
            indicator.style.width = `${width}px`;
            indicator.style.opacity = "1";
            void indicator.offsetWidth; // Forzar reflow
            indicator.style.transition = "";
        } else {
            indicator.style.transform = `translate(${left}px, -50%)`;
            indicator.style.width = `${width}px`;
            indicator.style.opacity = "1";
        }
    }

    const activeLink = navElement.querySelector("a.nav-link-item.active");

    // Técnica FLIP: recuperar la última posición del indicador antes de navegar
    try {
        const storedPos = sessionStorage.getItem("proa_nav_indicator");
        if (storedPos && activeLink && window.innerWidth > 1100) {
            const { left, width } = JSON.parse(storedPos);
            indicator.style.transition = "none";
            indicator.style.transform = `translate(${left}px, -50%)`;
            indicator.style.width = `${width}px`;
            indicator.style.opacity = "1";
            linkItems.forEach(l => l.classList.remove("indicator-on"));
            activeLink.classList.add("indicator-on");
            void indicator.offsetWidth;
            indicator.style.transition = "";
            sessionStorage.removeItem("proa_nav_indicator");
            requestAnimationFrame(() => {
                moverIndicador(activeLink);
            });
        } else if (activeLink && window.innerWidth > 1100) {
            moverIndicador(activeLink, true);
        }
    } catch (_) {
        if (activeLink && window.innerWidth > 1100) moverIndicador(activeLink, true);
    }

    // Efectos hover y almacenamiento FLIP en clics
    linkItems.forEach(link => {
        link.addEventListener("mouseenter", () => {
            moverIndicador(link);
        });

        link.addEventListener("click", () => {
            if (window.innerWidth > 1100) {
                const navRect = navElement.getBoundingClientRect();
                const linkRect = link.getBoundingClientRect();
                sessionStorage.setItem("proa_nav_indicator", JSON.stringify({
                    left: linkRect.left - navRect.left,
                    width: linkRect.width
                }));
            }
        });
    });

    navElement.addEventListener("mouseleave", () => {
        if (activeLink && window.innerWidth > 1100) {
            moverIndicador(activeLink);
        } else {
            indicator.style.opacity = "0";
            linkItems.forEach(l => l.classList.remove("indicator-on"));
        }
    });

    window.addEventListener("resize", () => {
        if (activeLink && window.innerWidth > 1100) {
            moverIndicador(activeLink, true);
        } else {
            indicator.style.opacity = "0";
            linkItems.forEach(l => l.classList.remove("indicator-on"));
        }
    });

    // ====================================================
    // AVATAR Y MENÚ DE USUARIO (construidos 100% por DOM)
    // Nunca se concatena HTML con valores dinámicos: así es
    // imposible que comillas o símbolos rompan el atributo src
    // y se "derramen" como texto visible junto al avatar.
    // ====================================================

    // Crea un elemento con propiedades y atributos seguros
    function crearEl(tag, { clase, id, texto, attrs } = {}, hijos = []) {
        const el = document.createElement(tag);
        if (clase) el.className = clase;
        if (id) el.id = id;
        if (texto !== undefined && texto !== null) el.textContent = String(texto);
        if (attrs) {
            Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
        }
        hijos.forEach(h => { if (h) el.appendChild(h); });
        return el;
    }

    function crearIcono(clases) {
        const i = document.createElement("i");
        i.className = clases;
        i.setAttribute("aria-hidden", "true");
        return i;
    }

    // Valida que avatar_url sea una URL de imagen razonable (http/https o data:image)
    function esUrlAvatarSegura(url) {
        if (typeof url !== "string") return false;
        const limpia = url.trim();
        if (!limpia) return false;
        if (/[<>"'\s]/.test(limpia)) return false;
        return /^(https?:\/\/|data:image\/(png|jpe?g|webp|gif|svg\+xml)[;,])/i.test(limpia);
    }

    // Avatar por defecto: círculo azul con la inicial (SVG en data URI)
    function generarSvgAvatar(initial) {
        const char = (initial && initial.trim() ? initial.trim().charAt(0) : "P").toUpperCase();
        // Los colores van con # crudo; encodeURIComponent se encarga de escaparlos una sola vez
        const svg =
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
            `<circle cx="50" cy="50" r="50" fill="#0057B8"/>` +
            `<text x="50" y="64" font-size="44" font-family="Poppins, sans-serif" font-weight="700" fill="#ffffff" text-anchor="middle">${char.replace(/[<>&"']/g, "")}</text>` +
            `</svg>`;
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }

    // Cierre de sesión por defecto (cuando el header se pinta desde caché)
    async function cerrarSesionPorDefecto() {
        try {
            sessionStorage.removeItem("proa_session_cache");
            let mod = null;
            try { mod = await import("./auth.js"); } catch (_) { mod = await import("./JS/auth.js"); }
            await mod.cerrarSesion();
        } catch (e) {
            console.warn("No se pudo cerrar sesión desde el header:", e);
            window.location.href = "index.html";
        }
    }

    // Actualizar dinámicamente los textos de la ranura de usuario según el idioma
    function actualizarTextosSlotUsuario(lang) {
        const loginBtnSpan = userSlot.querySelector(".nav-btn-login span");
        if (loginBtnSpan) {
            loginBtnSpan.textContent = t("nav.login", lang);
        }
        const avatarBtn = userSlot.querySelector("#nav-avatar-btn");
        if (avatarBtn) {
            avatarBtn.setAttribute("aria-label", t("nav.user_menu", lang));
        }
        const dot = userSlot.querySelector(".sesion-dot");
        if (dot) {
            dot.setAttribute("title", t("nav.active_session", lang));
        }
        const roleBadge = userSlot.querySelector(".nav-user-role-badge");
        if (roleBadge && roleBadge.dataset.roleKey) {
            roleBadge.textContent = t(roleBadge.dataset.roleKey, lang);
        }
        const perfilItem = userSlot.querySelector("[data-i18n='nav.perfil']");
        if (perfilItem) perfilItem.textContent = t("nav.perfil", lang);
        const adminItem = userSlot.querySelector("[data-i18n='nav.admin']");
        if (adminItem) adminItem.textContent = t("nav.admin", lang);
        const logoutItem = userSlot.querySelector("[data-i18n='nav.logout']");
        if (logoutItem) logoutItem.textContent = t("nav.logout", lang);
    }

    // Renderizar estado de usuario en el slot
    function renderizarSlotUsuario(perfil, esAdminUser, onLogout) {
        userSlot.textContent = "";

        // ---------- Invitado: botón de iniciar sesión ----------
        if (!perfil) {
            const loginLink = crearEl("a", { clase: "nav-btn-login", attrs: { href: "sesion.html" } }, [
                crearIcono("fa-solid fa-arrow-right-to-bracket"),
                document.createTextNode(" "),
                crearEl("span", { texto: t("nav.login", idiomaActual), attrs: { "data-i18n": "nav.login" } })
            ]);
            userSlot.appendChild(loginLink);
            return;
        }

        // ---------- Usuario con sesión ----------
        const emailMostrar = typeof perfil.email === "string" ? perfil.email : "";
        const nombreMostrar = (typeof perfil.nombre === "string" && perfil.nombre.trim())
            ? perfil.nombre.trim()
            : (emailMostrar ? emailMostrar.split("@")[0] : "Usuario");
        const initial = (nombreMostrar.trim() ? nombreMostrar.trim()[0] : (emailMostrar ? emailMostrar[0] : "P")).toUpperCase();
        const svgAvatarLocal = generarSvgAvatar(initial);
        const fotoUrl = esUrlAvatarSegura(perfil.avatar_url) ? perfil.avatar_url.trim() : svgAvatarLocal;
        const rolActual = String(perfil.rol || (esAdminUser ? "admin" : "estudiante")).toLowerCase();

        let roleBadgeClass = "role-badge-comun";
        let roleKey = "nav.role_comun";
        if (rolActual === "admin") {
            roleBadgeClass = "role-badge-admin";
            roleKey = "nav.role_admin";
        } else if (rolActual === "estudiante") {
            roleBadgeClass = "role-badge-estudiante";
            roleKey = "nav.role_estudiante";
        }

        // Avatar: la URL se asigna por PROPIEDAD, nunca por string HTML
        const avatarImg = document.createElement("img");
        avatarImg.className = "nav-avatar";
        avatarImg.id = "nav-avatar-img";
        avatarImg.alt = nombreMostrar;
        avatarImg.addEventListener("error", () => {
            if (avatarImg.src !== svgAvatarLocal) avatarImg.src = svgAvatarLocal;
        }, { once: true });
        avatarImg.src = fotoUrl;

        const dot = crearEl("span", {
            clase: "sesion-dot",
            attrs: { title: t("nav.active_session", idiomaActual) }
        });

        const avatarBtn = crearEl("button", {
            clase: "nav-avatar-btn",
            id: "nav-avatar-btn",
            attrs: {
                type: "button",
                "aria-haspopup": "true",
                "aria-expanded": "false",
                "aria-label": t("nav.user_menu", idiomaActual)
            }
        }, [avatarImg, dot]);

        // Cabecera del dropdown
        const roleBadge = crearEl("span", {
            clase: `nav-user-role-badge ${roleBadgeClass}`,
            texto: t(roleKey, idiomaActual),
            attrs: { "data-role-key": roleKey }
        });

        const dropdownHeader = crearEl("div", { clase: "nav-dropdown-header" }, [
            crearEl("strong", { clase: "nav-user-name", texto: nombreMostrar }),
            crearEl("span", { clase: "nav-user-email", texto: emailMostrar }),
            roleBadge
        ]);

        // Ítems del dropdown
        const itemPerfil = crearEl("a", {
            clase: "nav-dropdown-item",
            attrs: { href: "perfil.html", role: "menuitem" }
        }, [
            crearIcono("fa-solid fa-user"),
            document.createTextNode(" "),
            crearEl("span", { texto: t("nav.perfil", idiomaActual), attrs: { "data-i18n": "nav.perfil" } })
        ]);

        let itemAdmin = null;
        if (esAdminUser) {
            itemAdmin = crearEl("a", {
                clase: "nav-dropdown-item nav-dropdown-item-admin",
                attrs: { href: "admin.html", role: "menuitem" }
            }, [
                crearIcono("fa-solid fa-shield-halved"),
                document.createTextNode(" "),
                crearEl("span", { texto: t("nav.admin", idiomaActual), attrs: { "data-i18n": "nav.admin" } })
            ]);
        }

        const logoutBtn = crearEl("button", {
            clase: "nav-dropdown-item nav-dropdown-item-logout",
            id: "nav-logout-btn",
            attrs: { type: "button", role: "menuitem" }
        }, [
            crearIcono("fa-solid fa-arrow-right-from-bracket"),
            document.createTextNode(" "),
            crearEl("span", { texto: t("nav.logout", idiomaActual), attrs: { "data-i18n": "nav.logout" } })
        ]);

        const dropdownMenu = crearEl("div", {
            clase: "nav-dropdown-menu",
            id: "nav-user-dropdown-menu",
            attrs: { role: "menu" }
        }, [
            dropdownHeader,
            crearEl("div", { clase: "nav-dropdown-divider" }),
            itemPerfil,
            itemAdmin,
            crearEl("div", { clase: "nav-dropdown-divider" }),
            logoutBtn
        ]);

        const dropdownWrapper = crearEl("div", { clase: "nav-user-dropdown" }, [avatarBtn, dropdownMenu]);
        userSlot.appendChild(dropdownWrapper);

        avatarBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = dropdownMenu.classList.toggle("is-open");
            avatarBtn.classList.toggle("is-active", isOpen);
            avatarBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });

        logoutBtn.addEventListener("click", async () => {
            if (onLogout) {
                await onLogout();
            } else {
                await cerrarSesionPorDefecto();
            }
        });
    }

    // Acción al hacer clic en el botón de alternancia de idioma
    langBtn.addEventListener("click", () => {
        idiomaActual = alternarIdioma();

        // Actualizar estados visuales del botón ES / EN
        const optEs = langBtn.querySelector(".nav-lang-es");
        const optEn = langBtn.querySelector(".nav-lang-en");
        if (optEs && optEn) {
            optEs.classList.toggle("is-active", idiomaActual === "es");
            optEn.classList.toggle("is-active", idiomaActual === "en");
        }
        langBtn.setAttribute("aria-label", t("nav.lang_toggle_aria", idiomaActual));
        langBtn.setAttribute("title", t("nav.lang_toggle_title", idiomaActual));

        // Actualizar textos dinámicos del header
        const subLogo = logoLink.querySelector("[data-i18n='nav.subtitle']");
        if (subLogo) subLogo.textContent = t("nav.subtitle", idiomaActual);
        logoLink.setAttribute("aria-label", t("nav.logo_aria", idiomaActual));

        navItems.forEach(item => {
            const span = navElement.querySelector(`[data-i18n="${item.key}"]`);
            if (span) span.textContent = t(item.key, idiomaActual, item.text);
        });

        const menuAbierto = navElement.classList.contains("nav-open");
        toggleBtn.setAttribute("aria-label", t(menuAbierto ? "nav.close_menu" : "nav.open_menu", idiomaActual));

        // Actualizar textos en la ranura de usuario
        actualizarTextosSlotUsuario(idiomaActual);

        // Reposicionar el indicador animado con las nuevas dimensiones de texto
        if (activeLink) {
            moverIndicador(activeLink);
        }
    });

    // Caché en sessionStorage para eliminar Layout Shift (CLS)
    let cachedSession = null;
    try {
        const rawCache = sessionStorage.getItem("proa_session_cache");
        if (rawCache) {
            cachedSession = JSON.parse(rawCache);
            if (cachedSession && cachedSession.perfil) {
                renderizarSlotUsuario(cachedSession.perfil, cachedSession.esAdmin, null);
            } else {
                cachedSession = null;
                sessionStorage.removeItem("proa_session_cache");
                userSlot.innerHTML = `<div class="nav-avatar-skeleton" title="Verificando sesión..."></div>`;
            }
        } else {
            userSlot.innerHTML = `<div class="nav-avatar-skeleton" title="Verificando sesión..."></div>`;
        }
    } catch (_) {
        cachedSession = null;
        try { sessionStorage.removeItem("proa_session_cache"); } catch (__) {}
        userSlot.innerHTML = `<div class="nav-avatar-skeleton" title="Verificando sesión..."></div>`;
    }

    // Manejo del menú responsive hamburguesa
    toggleBtn.addEventListener("click", () => {
        const isOpen = navElement.classList.toggle("nav-open");
        toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        toggleBtn.setAttribute("aria-label", t(isOpen ? "nav.close_menu" : "nav.open_menu", idiomaActual));
        toggleBtn.innerHTML = isOpen
            ? `<i class="fa-solid fa-xmark"></i>`
            : `<i class="fa-solid fa-bars"></i>`;
    });

    // Cerrar desplegables al hacer clic afuera
    document.addEventListener("click", (e) => {
        const openDropdown = document.querySelector(".nav-dropdown-menu.is-open");
        if (openDropdown && !openDropdown.contains(e.target)) {
            openDropdown.classList.remove("is-open");
            const avatarBtn = document.getElementById("nav-avatar-btn");
            if (avatarBtn) {
                avatarBtn.classList.remove("is-active");
                avatarBtn.setAttribute("aria-expanded", "false");
            }
        }
    });

    // Cerrar con tecla Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const openDropdown = document.querySelector(".nav-dropdown-menu.is-open");
            if (openDropdown) {
                openDropdown.classList.remove("is-open");
                const avatarBtn = document.getElementById("nav-avatar-btn");
                if (avatarBtn) {
                    avatarBtn.classList.remove("is-active");
                    avatarBtn.setAttribute("aria-expanded", "false");
                    avatarBtn.focus();
                }
            }
            if (navElement.classList.contains("nav-open")) {
                navElement.classList.remove("nav-open");
                toggleBtn.setAttribute("aria-expanded", "false");
                toggleBtn.setAttribute("aria-label", t("nav.open_menu", idiomaActual));
                toggleBtn.innerHTML = `<i class="fa-solid fa-bars"></i>`;
            }
        }
    });

    // Verificación asíncrona real de sesión con fallback seguro de ruta
    const authTimeout = setTimeout(() => {
        if (!userSlot.querySelector(".nav-avatar-btn") && !userSlot.querySelector(".nav-btn-login")) {
            console.warn("Tiempo de espera agotado al verificar sesión. Mostrando botón de acceso.");
            renderizarSlotUsuario(null, false, null);
        }
    }, 3500);

    try {
        let authMod = null;
        try {
            authMod = await import("./auth.js");
        } catch (_) {
            try {
                authMod = await import("./JS/auth.js");
            } catch (err) {
                console.error("Fallo al resolver auth.js:", err);
            }
        }

        if (authMod) {
            const { obtenerPerfil, esAdmin, cerrarSesion } = authMod;
            const perfil = await obtenerPerfil();
            const esAdministrador = await esAdmin();
            const esAdminUser = esAdministrador || (perfil?.rol && perfil.rol.toLowerCase() === "admin");

            clearTimeout(authTimeout);

            if (perfil) {
                sessionStorage.setItem("proa_session_cache", JSON.stringify({
                    perfil,
                    esAdmin: esAdminUser
                }));
                renderizarSlotUsuario(perfil, esAdminUser, async () => {
                    sessionStorage.removeItem("proa_session_cache");
                    await cerrarSesion();
                    window.location.href = "index.html";
                });
            } else {
                sessionStorage.removeItem("proa_session_cache");
                renderizarSlotUsuario(null, false, null);
            }
        } else {
            clearTimeout(authTimeout);
            if (!cachedSession) {
                renderizarSlotUsuario(null, false, null);
            }
        }
    } catch (e) {
        clearTimeout(authTimeout);
        console.warn("No se pudo verificar la sesión en el header:", e);
        if (!cachedSession) {
            renderizarSlotUsuario(null, false, null);
        }
    }

    // Aplicar traducción inicial de la página completa según idioma guardado
    aplicarTraducciones(idiomaActual);
});