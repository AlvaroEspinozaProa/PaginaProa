// ====================================================
// NAVEGACIÓN GLOBAL Y HEADER - ESCUELA PROA
// ====================================================

document.addEventListener("DOMContentLoaded", async () => {
    const header = document.getElementById("global-header");
    if (!header) return;

    // Detectar página actual para marcar link activo
    let currentPage = window.location.pathname.split("/").pop();
    if (!currentPage || currentPage === "") {
        currentPage = "index.html";
    }

    // 1. Asignar sección al body para tematización dinámica (Punto 5)
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

    // 2. Enlace del Logo institucional (Punto 3 y UX-04)
    const logoLink = document.createElement("a");
    logoLink.href = "index.html";
    logoLink.className = "logo";
    logoLink.setAttribute("aria-label", "Página principal Escuela PRoA");
    logoLink.innerHTML = `
        <img src="logo.png" alt="Logo Escuela PRoA">
        <div class="logo-texto">
            <h2>Escuela PRoA</h2>
            <span>Innovación en Educación</span>
        </div>
    `;

    // 3. Botón Hamburguesa accesible para vista móvil
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "nav-toggle";
    toggleBtn.setAttribute("aria-label", "Abrir menú de navegación");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-controls", "nav-menu-principal");
    toggleBtn.innerHTML = `<i class="fa-solid fa-bars"></i>`;

    // 4. Menú de navegación
    const navElement = document.createElement("nav");
    navElement.id = "nav-menu-principal";
    navElement.setAttribute("aria-label", "Navegación principal");

    // Indicador deslizante dinámico con técnica FLIP (Punto 4)
    const indicator = document.createElement("span");
    indicator.className = "nav-indicator";
    indicator.setAttribute("aria-hidden", "true");
    navElement.appendChild(indicator);

    // Los 7 ítems de secciones fijas
    const navItems = [
        { href: "index.html", icon: "fa-solid fa-house", text: "Inicio" },
        { href: "tablon.html", icon: "fa-solid fa-bullhorn", text: "Novedades" },
        { href: "proyectos.html", icon: "fa-solid fa-code-branch", text: "Proyectos" },
        { href: "pasantias.html", icon: "fa-solid fa-briefcase", text: "Pasantías" },
        { href: "cde.html", icon: "fa-solid fa-users-rectangle", text: "CDE" },
        { href: "deporte.html", icon: "fa-solid fa-trophy", text: "Deportes" },
        { href: "horarios.html", icon: "fa-solid fa-calendar-days", text: "Horarios" }
    ];

    navItems.forEach(item => {
        const link = document.createElement("a");
        link.href = item.href;
        link.className = "nav-link-item";
        if (currentPage.toLowerCase() === item.href.toLowerCase()) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
        link.innerHTML = `<i class="${item.icon}"></i> <span>${item.text}</span>`;
        navElement.appendChild(link);
    });

    // Separador visual
    const divider = document.createElement("div");
    divider.className = "nav-divider";
    navElement.appendChild(divider);

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

    // Lógica del indicador deslizante (Punto 4 y FLUID-01)
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

    // Técnica FLIP: Recuperar la última posición del indicador antes de navegar
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

    // Función auxiliar para escapar texto en el header
    function escaparTexto(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Renderizar estado de usuario en el slot
    function renderizarSlotUsuario(perfil, esAdminUser, onLogout) {
        userSlot.innerHTML = "";

        if (perfil) {
            const nombreMostrar = perfil.nombre || (perfil.email ? perfil.email.split("@")[0] : "Usuario");
            const emailMostrar = perfil.email || "";
            const initial = (nombreMostrar && nombreMostrar.trim() ? nombreMostrar.trim()[0] : (emailMostrar ? emailMostrar[0] : "P")).toUpperCase();
            const localSvgAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%230057B8"/><text x="50" y="63" font-size="44" font-family="Poppins,sans-serif" font-weight="700" fill="white" text-anchor="middle">${encodeURIComponent(initial)}</text></svg>`;
            const fotoUrl = (perfil.avatar_url && perfil.avatar_url.trim() !== "") ? perfil.avatar_url : localSvgAvatar;
            const rolActual = (perfil.rol || (esAdminUser ? "admin" : "estudiante")).toLowerCase();

            let roleBadgeClass = "role-badge-comun";
            let roleLabel = "Externo";
            if (rolActual === "admin") {
                roleBadgeClass = "role-badge-admin";
                roleLabel = "Administrador";
            } else if (rolActual === "estudiante") {
                roleBadgeClass = "role-badge-estudiante";
                roleLabel = "Estudiante";
            }

            const dropdownWrapper = document.createElement("div");
            dropdownWrapper.className = "nav-user-dropdown";
            dropdownWrapper.innerHTML = `
                <button type="button" class="nav-avatar-btn" id="nav-avatar-btn" aria-haspopup="true" aria-expanded="false" aria-label="Menú de usuario">
                    <img src="${fotoUrl}" alt="${escaparTexto(nombreMostrar)}" class="nav-avatar" onerror="this.onerror=null; this.src='${localSvgAvatar}';">
                    <span class="sesion-dot" title="Sesión activa"></span>
                </button>
                <div class="nav-dropdown-menu" id="nav-user-dropdown-menu" role="menu">
                    <div class="nav-dropdown-header">
                        <strong class="nav-user-name">${escaparTexto(nombreMostrar)}</strong>
                        <span class="nav-user-email">${escaparTexto(emailMostrar)}</span>
                        <span class="nav-user-role-badge ${roleBadgeClass}">${roleLabel}</span>
                    </div>
                    <div class="nav-dropdown-divider"></div>
                    <a href="perfil.html" class="nav-dropdown-item" role="menuitem">
                        <i class="fa-solid fa-user"></i> Mi Perfil
                    </a>
                    ${esAdminUser ? `
                    <a href="admin.html" class="nav-dropdown-item nav-dropdown-item-admin" role="menuitem">
                        <i class="fa-solid fa-shield-halved"></i> Panel Admin
                    </a>
                    ` : ""}
                    <div class="nav-dropdown-divider"></div>
                    <button type="button" class="nav-dropdown-item nav-dropdown-item-logout" id="nav-logout-btn" role="menuitem">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar Sesión
                    </button>
                </div>
            `;

            userSlot.appendChild(dropdownWrapper);

            const avatarBtn = dropdownWrapper.querySelector("#nav-avatar-btn");
            const dropdownMenu = dropdownWrapper.querySelector("#nav-user-dropdown-menu");
            const logoutBtn = dropdownWrapper.querySelector("#nav-logout-btn");

            avatarBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const isOpen = dropdownMenu.classList.toggle("is-open");
                avatarBtn.classList.toggle("is-active", isOpen);
                avatarBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
            });

            if (logoutBtn && onLogout) {
                logoutBtn.addEventListener("click", async () => {
                    await onLogout();
                });
            }
        } else {
            userSlot.innerHTML = `
                <a href="sesion.html" class="nav-btn-login">
                    <i class="fa-solid fa-arrow-right-to-bracket"></i> Iniciar Sesión
                </a>
            `;
        }
    }

    // Cache en sessionStorage para eliminar Layout Shift (CLS)
    let cachedSession = null;
    try {
        const rawCache = sessionStorage.getItem("proa_session_cache");
        if (rawCache) {
            cachedSession = JSON.parse(rawCache);
            renderizarSlotUsuario(cachedSession.perfil, cachedSession.esAdmin, null);
        } else {
            userSlot.innerHTML = `<div class="nav-avatar-skeleton" title="Verificando sesión..."></div>`;
        }
    } catch (_) {
        userSlot.innerHTML = `<div class="nav-avatar-skeleton" title="Verificando sesión..."></div>`;
    }

    // Manejo del menú responsive hamburguesa
    toggleBtn.addEventListener("click", () => {
        const isOpen = navElement.classList.toggle("nav-open");
        toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
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
});