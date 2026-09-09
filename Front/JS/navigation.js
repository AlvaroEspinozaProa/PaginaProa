document.addEventListener("DOMContentLoaded", async () => {
    const header = document.getElementById("global-header");
    if (!header) return;

    // Obtener el nombre del archivo actual del URL
    let currentPage = window.location.pathname.split("/").pop();
    if (!currentPage || currentPage === "") {
        currentPage = "index.html";
    }

    // Definición de los elementos del menú de navegación global
    const navItems = [
        { href: "index.html", icon: "fa-solid fa-house", text: "Inicio" },
        { href: "tablon.html", icon: "fa-solid fa-bullhorn", text: "Novedades" },
        { href: "proyectos.html", icon: "fa-solid fa-code-branch", text: "Proyectos" },
        { href: "pasantias.html", icon: "fa-solid fa-briefcase", text: "Pasantías" },
        { href: "cde.html", icon: "fa-solid fa-users-rectangle", text: "CDE" },
        { href: "deporte.html", icon: "fa-solid fa-trophy", text: "Deportes" },
        { href: "horarios.html", icon: "fa-solid fa-calendar-days", text: "Horarios" },
        { href: "perfil.html", icon: "fa-solid fa-user-gear", text: "Mi Perfil", id: "nav-link-perfil" }
    ];

    // Construcción del logo
    const logoDiv = document.createElement("div");
    logoDiv.className = "logo";
    logoDiv.innerHTML = `
        <img src="logo.png" alt="Logo PRoA">
        <div>
            <h2>Escuela PRoA</h2>
            <span>Innovación en Educación</span>
        </div>
    `;

    // Construcción del menú de navegación
    const navElement = document.createElement("nav");
    navItems.forEach(item => {
        const link = document.createElement("a");
        link.href = item.href;
        if (item.id) link.id = item.id;
        
        // Agregar clase activa si corresponde a la página actual
        if (currentPage.toLowerCase() === item.href.toLowerCase()) {
            link.className = "active";
        }
        
        link.innerHTML = `<i class="${item.icon}"></i> ${item.text}`;
        navElement.appendChild(link);
    });

    // Construcción del botón hamburguesa (solo se muestra en mobile via CSS)
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "nav-toggle";
    toggleBtn.setAttribute("aria-label", "Abrir menú");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.innerHTML = `<i class="fa-solid fa-bars"></i>`;

    // Abrir/cerrar el menú al tocar el botón
    toggleBtn.addEventListener("click", () => {
        const isOpen = navElement.classList.toggle("nav-open");
        toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        toggleBtn.innerHTML = isOpen
            ? `<i class="fa-solid fa-xmark"></i>`
            : `<i class="fa-solid fa-bars"></i>`;
    });

    // Cerrar el menú automáticamente al elegir una opción (mobile)
    navElement.addEventListener("click", (e) => {
        if (e.target.closest("a")) {
            navElement.classList.remove("nav-open");
            toggleBtn.setAttribute("aria-expanded", "false");
            toggleBtn.innerHTML = `<i class="fa-solid fa-bars"></i>`;
        }
    });

    // Limpiar contenido previo e inyectar cabecera unificada
    header.innerHTML = "";
    header.appendChild(logoDiv);
    header.appendChild(toggleBtn);
    header.appendChild(navElement);

    // Verificación dinámica de sesión activa (silenciosa)
    try {
        const { obtenerPerfil } = await import("./auth.js");
        const perfil = await obtenerPerfil();
        if (perfil) {
            const perfilLink = navElement.querySelector('#nav-link-perfil') || navElement.querySelector('a[href="perfil.html"]');
            if (perfilLink) {
                const defaultAvatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(perfil.email || 'user')}`;
                const fotoUrl = perfil.avatar_url && perfil.avatar_url.trim() !== "" ? perfil.avatar_url : defaultAvatar;

                perfilLink.innerHTML = `<img src="${fotoUrl}" alt="Foto de Perfil" class="nav-avatar" onerror="this.src='${defaultAvatar}'"> Mi Perfil <span class="sesion-dot" title="Sesión activa"></span>`;
            }
        }
    } catch (e) {
        // Silencioso si auth no está disponible en este contexto
    }
});