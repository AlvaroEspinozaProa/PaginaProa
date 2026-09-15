document.addEventListener("DOMContentLoaded", async () => {
    const header = document.getElementById("global-header");
    if (!header) return;

    // Obtener el nombre del archivo actual del URL
    let currentPage = window.location.pathname.split("/").pop();
    if (!currentPage || currentPage === "") {
        currentPage = "index.html";
    }

    // Definición de los elementos base del menú de navegación global
    const navItems = [
        { href: "index.html", icon: "fa-solid fa-house", text: "Inicio" },
        { href: "tablon.html", icon: "fa-solid fa-bullhorn", text: "Novedades" },
        { href: "proyectos.html", icon: "fa-solid fa-code-branch", text: "Proyectos" },
        { href: "pasantias.html", icon: "fa-solid fa-briefcase", text: "Pasantías" },
        { href: "cde.html", icon: "fa-solid fa-users-rectangle", text: "CDE" },
        { href: "deporte.html", icon: "fa-solid fa-trophy", text: "Deportes" },
        { href: "horarios.html", icon: "fa-solid fa-calendar-days", text: "Horarios" }
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

    // Función auxiliar para renderizar los links del menú de forma consistente
    function construirLinksMenu(esAdminUser = false, perfilData = null) {
        navElement.innerHTML = "";

        let itemsCompletos = [...navItems];

        // Si es admin, insertamos el Panel Admin antes de Mi Perfil o al final
        if (esAdminUser) {
            itemsCompletos.push({ href: "admin.html", icon: "fa-solid fa-user-shield", text: "Panel Admin", id: "nav-link-admin" });
        }

        // Agregamos Mi Perfil al final
        const avatarSeed = perfilData?.email || 'user';
        const defaultAvatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(avatarSeed)}`;
        const fotoUrl = perfilData?.avatar_url && perfilData.avatar_url.trim() !== "" ? perfilData.avatar_url : defaultAvatar;

        itemsCompletos.push({ 
            href: "perfil.html", 
            icon: `<img src="${fotoUrl}" alt="Perfil" class="nav-avatar" onerror="this.src='${defaultAvatar}'">`, 
            text: `Mi Perfil <span class="sesion-dot" title="Sesión activa"></span>`, 
            id: "nav-link-perfil",
            esHtmlIcon: true
        });

        itemsCompletos.forEach(item => {
            const link = document.createElement("a");
            link.href = item.href;
            if (item.id) link.id = item.id;
            
            if (currentPage.toLowerCase() === item.href.toLowerCase()) {
                link.className = "active";
            }

            if (item.esHtmlIcon) {
                link.innerHTML = `${item.icon} ${item.text}`;
            } else {
                link.innerHTML = `<i class="${item.icon}"></i> ${item.text}`;
            }

            navElement.appendChild(link);
        });
    }

    // Renderizado inicial estándar (por si demora la sesión)
    construirLinksMenu(false, null);

    // Construcción del botón hamburguesa (solo mobile)
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "nav-toggle";
    toggleBtn.setAttribute("aria-label", "Abrir menú");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.innerHTML = `<i class="fa-solid fa-bars"></i>`;

    toggleBtn.addEventListener("click", () => {
        const isOpen = navElement.classList.toggle("nav-open");
        toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        toggleBtn.innerHTML = isOpen
            ? `<i class="fa-solid fa-xmark"></i>`
            : `<i class="fa-solid fa-bars"></i>`;
    });

    navElement.addEventListener("click", (e) => {
        if (e.target.closest("a")) {
            navElement.classList.remove("nav-open");
            toggleBtn.setAttribute("aria-expanded", "false");
            toggleBtn.innerHTML = `<i class="fa-solid fa-bars"></i>`;
        }
    });

    // Inyectar cabecera base de inmediato
    header.innerHTML = "";
    header.appendChild(logoDiv);
    header.appendChild(toggleBtn);
    header.appendChild(navElement);

    // Verificación dinámica de sesión y roles de manera segura
    try {
        const { obtenerPerfil, esAdmin } = await import("./auth.js");
        const perfil = await obtenerPerfil();
        const esAdministrador = await esAdmin();

        if (perfil) {
            const esAdminUser = esAdministrador || (perfil.rol && perfil.rol.toLowerCase() === 'admin');
            // Re-renderizamos el menú completo con los permisos y el avatar del usuario ya validados
            construirLinksMenu(esAdminUser, perfil);
        }
    } catch (e) {
        console.warn("No se pudo verificar la sesión en el header:", e);
    }
});