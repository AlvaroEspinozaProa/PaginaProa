document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("global-header");
    if (!header) return;

    // Obtener el nombre del archivo actual del URL
    let currentPage = window.location.pathname.split("/").pop();
    if (!currentPage || currentPage === "") {
        currentPage = "index.html";
    }

    // Definición de los elementos del menú de navegación
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
    navItems.forEach(item => {
        const link = document.createElement("a");
        link.href = item.href;
        
        // Agregar clase activa si corresponde a la página actual
        if (currentPage.toLowerCase() === item.href.toLowerCase()) {
            link.className = "active";
        }
        
        link.innerHTML = `<i class="${item.icon}"></i> ${item.text}`;
        navElement.appendChild(link);
    });

    // Limpiar contenido previo e inyectar cabecera unificada
    header.innerHTML = "";
    header.appendChild(logoDiv);
    header.appendChild(navElement);
});
