import { esAdmin, obtenerUsuarioActual, cerrarSesion } from "./auth.js";
import { obtenerPostulacionesEmpresas, actualizarEstadoPostulacion, eliminarPostulacionEmpresa } from "./pasantias_service.js"; 
import { obtenerNoticias, publicarNoticia, eliminarNoticia } from "./tablon.js"; 
import { mostrarToast } from "./utils.js";
import supabase from "./supabase.js";

// Constantes y estado global local del controlador
const SUPER_ADMIN_EMAIL = "despenaderos.ds@escuelasproa.edu.ar";
let usuarioActual = null;
let esSuperAdmin = false;
let postulacionesCache = [];
let usuariosCache = [];
let cambioRolPendiente = null;

document.addEventListener("DOMContentLoaded", async () => { 
    // 1. Protección estricta de seguridad
    try {
        usuarioActual = await obtenerUsuarioActual(); 
        const esAdministrador = await esAdmin(); 
        
        if (!usuarioActual || !esAdministrador) { 
            alert("Acceso restringido: Esta sección requiere rol de Administrador."); 
            window.location.href = "index.html"; 
            return; 
        } 
            
        esSuperAdmin = Boolean(
            usuarioActual &&
            usuarioActual.email &&
            usuarioActual.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase()
        );

        const txtEstado = document.getElementById("txt-usuario-estado");
        if (txtEstado) {
            if (esSuperAdmin) {
                txtEstado.innerHTML = `<i class="fa-solid fa-crown" style="color: #f59e0b; margin-right: 6px;"></i>Super Admin: <strong>${escaparHTML(usuarioActual.email)}</strong>`;
            } else {
                txtEstado.innerHTML = `<i class="fa-solid fa-user-shield" style="margin-right: 6px;"></i>Admin: <strong>${escaparHTML(usuarioActual.email)}</strong>`;
            }
        }
    } catch (err) {
        console.error("Error al verificar credenciales:", err);
        window.location.href = "index.html";
        return;
    }
    
    // 2. Control del menú de pestañas (defensivo)
    inicializarPestañas();

    // 3. Botón de cierre de sesión (defensivo)
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", async () => { 
            await cerrarSesion(); 
        });
    }

    // 4. Inicializar modal y eventos
    inicializarEventosModal();
    inicializarEventosModalRol();
    inicializarFiltrosPasantias();
    inicializarFiltrosUsuarios();
    inicializarFormularioNoticias();

    // 5. Carga inicial de datos
    cargarPasantiasAdmin(); 
    cargarNoticiasAdmin();
    cargarUsuariosAdmin();
    cargarHorariosAdmin();
}); 

// ======================================
// PESTAÑAS Y NAVEGACIÓN DENTRO DEL PANEL
// ======================================
function inicializarPestañas() {
    const botonesMenu = document.querySelectorAll(".admin-menu-btn"); 
    const pestañas = document.querySelectorAll(".tab-pane"); 
    
    botonesMenu.forEach(btn => { 
        btn.addEventListener("click", (e) => { 
            const targetId = e.currentTarget.getAttribute("data-tab"); 
            if (!targetId) return;

            botonesMenu.forEach(b => b.classList.remove("activo")); 
            pestañas.forEach(p => p.classList.add("hidden")); 
            
            e.currentTarget.classList.add("activo"); 
            const tabTarget = document.getElementById(targetId);
            if (tabTarget) {
                tabTarget.classList.remove("hidden"); 
            }
        }); 
    });
}

// ======================================
// 1. MÓDULO PASANTÍAS DE EMPRESAS
// ======================================
async function cargarPasantiasAdmin() { 
    const contenedor = document.getElementById("contenedor-pasantias-admin"); 
    if (!contenedor) return;

    contenedor.innerHTML = `<p><i class="fa-solid fa-spinner fa-spin"></i> Cargando postulaciones...</p>`;

    try {
        const postulaciones = await obtenerPostulacionesEmpresas(); 
        postulacionesCache = postulaciones || [];
        
        actualizarEstadisticasPasantias(postulacionesCache);
        aplicarFiltrosPasantias();
    } catch (err) {
        console.error("Error al cargar postulaciones:", err);
        contenedor.innerHTML = `<p style="color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Error al recuperar las postulaciones.</p>`;
    }
}

function actualizarEstadisticasPasantias(lista) {
    const elTotal = document.getElementById("stat-pasantias-total");
    const elPendientes = document.getElementById("stat-pasantias-pendientes");
    const elAprobadas = document.getElementById("stat-pasantias-aprobadas");
    const elRechazadas = document.getElementById("stat-pasantias-rechazadas");

    if (elTotal) elTotal.textContent = lista.length;
    if (elPendientes) elPendientes.textContent = lista.filter(p => (p.estado || "Pendiente") === "Pendiente").length;
    if (elAprobadas) elAprobadas.textContent = lista.filter(p => p.estado === "Aprobado").length;
    if (elRechazadas) elRechazadas.textContent = lista.filter(p => p.estado === "Rechazado").length;
}

function inicializarFiltrosPasantias() {
    const inputBuscar = document.getElementById("input-buscar-pasantias");
    const selectEstado = document.getElementById("select-filtro-estado");

    if (inputBuscar) {
        inputBuscar.addEventListener("input", aplicarFiltrosPasantias);
    }
    if (selectEstado) {
        selectEstado.addEventListener("change", aplicarFiltrosPasantias);
    }
}

function aplicarFiltrosPasantias() {
    const inputBuscar = document.getElementById("input-buscar-pasantias");
    const selectEstado = document.getElementById("select-filtro-estado");

    const texto = inputBuscar ? inputBuscar.value.toLowerCase().trim() : "";
    const estadoFiltro = selectEstado ? selectEstado.value : "todos";

    const filtradas = postulacionesCache.filter(p => {
        const coincideEstado = (estadoFiltro === "todos") || (p.estado || "Pendiente") === estadoFiltro;
        const coincideTexto = !texto || 
            (p.nombre_empresa && p.nombre_empresa.toLowerCase().includes(texto)) ||
            (p.contacto_nombre && p.contacto_nombre.toLowerCase().includes(texto)) ||
            (p.email && p.email.toLowerCase().includes(texto)) ||
            (p.rubro && p.rubro.toLowerCase().includes(texto));

        return coincideEstado && coincideTexto;
    });

    renderizarTablaPasantias(filtradas);
}

function renderizarTablaPasantias(postulaciones) {
    const contenedor = document.getElementById("contenedor-pasantias-admin");
    if (!contenedor) return;

    if (!postulaciones || postulaciones.length === 0) { 
        contenedor.innerHTML = `<div style="text-align: center; padding: 40px; color: #64748b;">
            <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
            No se encontraron postulaciones registradas que coincidan con los criterios.
        </div>`; 
        return; 
    } 

    let html = `<div class="admin-table-container">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Empresa / Rubro</th>
                    <th>Contacto</th>
                    <th>Correo / Teléfono</th>
                    <th>Vacantes</th>
                    <th>Estado</th>
                    <th style="text-align: center;">Acciones</th>
                </tr>
            </thead>
            <tbody>`;

    postulaciones.forEach(p => { 
        const estadoActual = p.estado || "Pendiente";
        let badgeClass = "badge-pendiente";
        if (estadoActual === "Aprobado" || estadoActual === "Aceptado") badgeClass = "badge-aprobado";
        else if (estadoActual === "Rechazado") badgeClass = "badge-rechazado";
        else if (estadoActual === "Contactado" || estadoActual === "En revisión") badgeClass = "badge-en-revision";

        html += `<tr> 
            <td>
                <strong>${escaparHTML(p.nombre_empresa || "Sin nombre")}</strong>
                <div style="font-size: 0.8rem; color: #64748b;">${escaparHTML(p.rubro || "General")}</div>
            </td> 
            <td>${escaparHTML(p.contacto_nombre || "No especificado")}</td> 
            <td>
                <div>${escaparHTML(p.email || "-")}</div>
                <div style="font-size: 0.8rem; color: #64748b;">${escaparHTML(p.telefono || "")}</div>
            </td> 
            <td><span class="badge-role">${p.vacantes || 1}</span></td> 
            <td>
                <select class="admin-select select-cambiar-estado" data-id="${p.id}" style="padding: 4px 8px; font-size: 0.8rem;">
                    <option value="Pendiente" ${estadoActual === "Pendiente" ? "selected" : ""}>Pendiente</option>
                    <option value="Contactado" ${(estadoActual === "Contactado" || estadoActual === "En revisión") ? "selected" : ""}>Contactado</option>
                    <option value="Aprobado" ${(estadoActual === "Aprobado" || estadoActual === "Aceptado") ? "selected" : ""}>Aprobado</option>
                    <option value="Rechazado" ${estadoActual === "Rechazado" ? "selected" : ""}>Rechazado</option>
                </select>
            </td> 
            <td style="text-align: center; white-space: nowrap;">
                <button class="btn-action-icon btn-action-primary btn-ver-detalle" data-id="${p.id}" title="Ver mensaje y detalles">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button class="btn-action-icon btn-action-danger btn-eliminar-pasantia" data-id="${p.id}" title="Eliminar postulación">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>`; 
    }); 

    html += `</tbody></table></div>`; 
    contenedor.innerHTML = html; 

    // Vincular eventos dinámicos a los elementos de la tabla
    vincularEventosTablaPasantias();
}

function vincularEventosTablaPasantias() {
    // Cambio rápido de estado
    document.querySelectorAll(".select-cambiar-estado").forEach(select => {
        select.addEventListener("change", async (e) => {
            const id = e.target.getAttribute("data-id");
            const nuevoEstado = e.target.value;
            if (!id) return;

            e.target.disabled = true;
            const exito = await actualizarEstadoPostulacion(id, nuevoEstado);
            e.target.disabled = false;

            if (exito) {
                const item = postulacionesCache.find(p => String(p.id) === String(id));
                if (item) item.estado = nuevoEstado;
                actualizarEstadisticasPasantias(postulacionesCache);
            } else {
                alert("Error al actualizar el estado en el servidor.");
            }
        });
    });

    // Ver detalle en modal
    document.querySelectorAll(".btn-ver-detalle").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.currentTarget.getAttribute("data-id");
            abrirModalDetallesPasantia(id);
        });
    });

    // Eliminar postulación
    document.querySelectorAll(".btn-eliminar-pasantia").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = e.currentTarget.getAttribute("data-id");
            if (!id) return;

            const item = postulacionesCache.find(p => String(p.id) === String(id));
            const nombreEmpresa = item ? item.nombre_empresa : "esta postulación";

            if (confirm(`¿Estás seguro de que deseas eliminar la postulación de "${nombreEmpresa}"?`)) {
                const exito = await eliminarPostulacionEmpresa(id);
                if (exito) {
                    postulacionesCache = postulacionesCache.filter(p => String(p.id) !== String(id));
                    actualizarEstadisticasPasantias(postulacionesCache);
                    aplicarFiltrosPasantias();
                } else {
                    alert("No se pudo eliminar la postulación.");
                }
            }
        });
    });
}

function abrirModalDetallesPasantia(id) {
    const item = postulacionesCache.find(p => String(p.id) === String(id));
    if (!item) return;

    const modal = document.getElementById("admin-modal-detalles");
    const titulo = document.getElementById("modal-detalles-titulo");
    const body = document.getElementById("modal-detalles-body");

    if (!modal || !body || !titulo) return;

    titulo.textContent = `Postulación: ${item.nombre_empresa || "Empresa"}`;

    body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
            <div>
                <strong><i class="fa-solid fa-briefcase"></i> Rubro:</strong>
                <span>${escaparHTML(item.rubro || "No especificado")}</span>
            </div>
            <div>
                <strong><i class="fa-solid fa-user"></i> Persona de Contacto:</strong>
                <span>${escaparHTML(item.contacto_nombre || "No especificado")}</span>
            </div>
            <div>
                <strong><i class="fa-solid fa-envelope"></i> Correo Electrónico:</strong>
                <a href="mailto:${escaparHTML(item.email)}">${escaparHTML(item.email || "-")}</a>
            </div>
            <div>
                <strong><i class="fa-solid fa-phone"></i> Teléfono:</strong>
                <span>${escaparHTML(item.telefono || "No registrado")}</span>
            </div>
            <div>
                <strong><i class="fa-solid fa-users"></i> Vacantes ofrecidas:</strong>
                <span>${item.vacantes || 1}</span>
            </div>
            <div>
                <strong><i class="fa-solid fa-clock"></i> Fecha de Registro:</strong>
                <span>${item.created_at ? new Date(item.created_at).toLocaleString("es-AR") : "Reciente"}</span>
            </div>
            <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 10px;">
                <strong style="display: block; margin-bottom: 6px; color: #475569;"><i class="fa-solid fa-comment-dots"></i> Mensaje de la Empresa:</strong>
                <p style="margin: 0; white-space: pre-wrap; font-size: 0.9rem; color: #1e293b;">${escaparHTML(item.mensaje || "Sin mensaje adicional.")}</p>
            </div>
        </div>
    `;

    modal.classList.remove("hidden");
}

// ======================================
// 2. MÓDULO NOTICIAS / COMUNICADOS
// ======================================
async function cargarNoticiasAdmin() {
    const contenedor = document.getElementById("contenedor-noticias-admin");
    if (!contenedor) return;

    contenedor.innerHTML = `<p><i class="fa-solid fa-spinner fa-spin"></i> Cargando comunicados...</p>`;

    try {
        const noticias = await obtenerNoticias();
        if (!noticias || noticias.length === 0) {
            contenedor.innerHTML = `<div style="text-align: center; padding: 40px; color: #64748b;">
                <i class="fa-solid fa-newspaper" style="font-size: 2.5rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                No hay comunicados o noticias publicadas en el tablón.
            </div>`;
            return;
        }

        let html = `<div class="admin-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Resumen</th>
                        <th>Adjunto</th>
                        <th>Fecha</th>
                        <th style="text-align: center;">Acción</th>
                    </tr>
                </thead>
                <tbody>`;

        noticias.forEach(n => {
            const fechaStr = n.created_at ? new Date(n.created_at).toLocaleDateString("es-AR") : "-";
            const tieneAdjunto = Boolean(n.archivo_url);

            html += `<tr>
                <td><strong>${escaparHTML(n.titulo || "Sin título")}</strong></td>
                <td><div style="max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escaparHTML(n.resumen || "-")}</div></td>
                <td>
                    ${tieneAdjunto 
                        ? `<a href="${n.archivo_url}" target="_blank" class="badge-role" style="color: #0057B8;"><i class="fa-solid fa-paperclip"></i> Ver adjunto</a>` 
                        : `<span style="color: #94a3b8; font-size: 0.8rem;">Ninguno</span>`}
                </td>
                <td>${fechaStr}</td>
                <td style="text-align: center;">
                    <button class="btn-action-icon btn-action-danger btn-eliminar-noticia" data-id="${n.id}" title="Eliminar noticia">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        });

        html += `</tbody></table></div>`;
        contenedor.innerHTML = html;

        // Listener de eliminación
        document.querySelectorAll(".btn-eliminar-noticia").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                if (!id) return;

                if (confirm("¿Deseas eliminar permanentemente este comunicado del tablón?")) {
                    const exito = await eliminarNoticia(id);
                    if (exito) {
                        cargarNoticiasAdmin();
                    } else {
                        alert("Error al eliminar la noticia.");
                    }
                }
            });
        });
    } catch (err) {
        console.error("Error al cargar noticias:", err);
        contenedor.innerHTML = `<p style="color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Error al recuperar los comunicados.</p>`;
    }
}

function inicializarFormularioNoticias() {
    const btnNuevaNoticia = document.getElementById("btn-nueva-noticia");
    const btnCancelar = document.getElementById("btn-cancelar-noticia");
    const cardForm = document.getElementById("card-formulario-noticia");
    const formNoticia = document.getElementById("form-noticia-admin");

    if (btnNuevaNoticia && cardForm) {
        btnNuevaNoticia.addEventListener("click", () => {
            cardForm.classList.toggle("hidden");
        });
    }

    if (btnCancelar && cardForm) {
        btnCancelar.addEventListener("click", () => {
            cardForm.classList.add("hidden");
        });
    }

    if (formNoticia) {
        formNoticia.addEventListener("submit", async (e) => {
            e.preventDefault();

            const titulo = document.getElementById("noticia-titulo")?.value.trim();
            const resumen = document.getElementById("noticia-resumen")?.value.trim();
            const contenido = document.getElementById("noticia-contenido")?.value.trim();
            const inputArchivo = document.getElementById("noticia-archivo");
            const btnSubmit = document.getElementById("btn-guardar-noticia");

            if (!titulo || !resumen || !contenido) {
                alert("Por favor completa los campos obligatorios del comunicado.");
                return;
            }

            const archivo = inputArchivo && inputArchivo.files.length > 0 ? inputArchivo.files[0] : null;

            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Publicando...`;
            }

            try {
                const exito = await publicarNoticia({ titulo, resumen, contenido, archivo });
                if (exito) {
                    formNoticia.reset();
                    if (cardForm) cardForm.classList.add("hidden");
                    cargarNoticiasAdmin();
                } else {
                    alert("No se pudo publicar la noticia. Revisa la consola para más detalles.");
                }
            } catch (err) {
                console.error("Error al publicar noticia:", err);
                alert("Ocurrió un error inesperado al publicar.");
            } finally {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Publicar`;
                }
            }
        });
    }
}

// ======================================
// 3. MÓDULO HORARIOS
// ======================================
async function cargarHorariosAdmin() {
    const contenedor = document.getElementById("contenedor-horarios-admin");
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <div style="background: #0057B8; color: #ffffff; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                    <i class="fa-solid fa-calendar-days"></i>
                </div>
                <div>
                    <h3 style="margin: 0; color: #0f172a;">Gestión del Asistente de Horarios Escolar</h3>
                    <p style="margin: 4px 0 0 0; color: #64748b; font-size: 0.9rem;">Consulta y edita los cronogramas por curso, materias y docentes.</p>
                </div>
            </div>
            <p style="color: #334155; font-size: 0.95rem; line-height: 1.5;">
                El módulo de horarios permite a estudiantes y docentes filtrar sus materias del día. Como administrador, puedes previsualizar y administrar las materias accediendo al asistente completo.
            </p>
            <div style="margin-top: 20px;">
                <a href="horarios.html" class="btn-admin-submit" style="text-decoration: none; display: inline-flex;">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir Asistente de Horarios
                </a>
            </div>
        </div>
    `;
}

// ======================================
// 4. MÓDULO USUARIOS Y ROLES (SUPABASE)
// ======================================
function obtenerClaseBadgeRol(rol) {
    const r = (rol || "comun").toLowerCase();
    if (r === "admin") return "badge-role-admin";
    if (r === "estudiante") return "badge-role-estudiante";
    return "badge-role-comun";
}

function formatearBadgeRol(rol) {
    const r = (rol || "comun").toLowerCase();
    if (r === "admin") {
        return `<i class="fa-solid fa-shield-halved"></i> admin`;
    } else if (r === "estudiante") {
        return `<i class="fa-solid fa-graduation-cap"></i> estudiante`;
    } else {
        return `<i class="fa-solid fa-user"></i> comun`;
    }
}

function actualizarEstadisticasUsuarios(lista) {
    const elTotal = document.getElementById("stat-usuarios-total");
    const elAdmin = document.getElementById("stat-usuarios-admin");
    const elEstudiante = document.getElementById("stat-usuarios-estudiante");
    const elComun = document.getElementById("stat-usuarios-comun");

    if (elTotal) elTotal.textContent = lista.length;
    if (elAdmin) elAdmin.textContent = lista.filter(u => (u.rol || "").toLowerCase() === "admin").length;
    if (elEstudiante) elEstudiante.textContent = lista.filter(u => (u.rol || "comun").toLowerCase() === "estudiante").length;
    if (elComun) elComun.textContent = lista.filter(u => (u.rol || "comun").toLowerCase() === "comun").length;
}

function actualizarBannerPermisosUsuarios() {
    const banner = document.getElementById("banner-permisos-usuarios");
    if (!banner) return;

    if (esSuperAdmin) {
        banner.className = "admin-banner-info admin-banner-superadmin";
        banner.innerHTML = `
            <i class="fa-solid fa-crown" style="font-size: 1.3rem; color: #d97706;"></i>
            <div>
                <strong>Modo Super Administrador Activo:</strong>
                <span style="display: block; margin-top: 3px; color: #1e3a8a;">
                    Tienes privilegios para reasignar roles (<code>admin</code>, <code>estudiante</code>, <code>comun</code>) de los usuarios registrados. Tu cuenta principal está protegida contra modificaciones accidentales.
                </span>
            </div>
        `;
    } else {
        banner.className = "admin-banner-info admin-banner-regular";
        banner.innerHTML = `
            <i class="fa-solid fa-shield-halved" style="font-size: 1.3rem; color: #64748b;"></i>
            <div>
                <strong>Modo Administrador (Vista de Solo Lectura):</strong>
                <span style="display: block; margin-top: 3px; color: #475569;">
                    Puedes consultar las cuentas y roles registrados en la plataforma. La asignación o modificación de roles está reservada exclusivamente para el Super Admin (<code>${SUPER_ADMIN_EMAIL}</code>).
                </span>
            </div>
        `;
    }
}

function inicializarFiltrosUsuarios() {
    const inputBuscar = document.getElementById("input-buscar-usuarios");
    const selectRol = document.getElementById("select-filtro-rol");

    if (inputBuscar) {
        inputBuscar.addEventListener("input", aplicarFiltrosUsuarios);
    }
    if (selectRol) {
        selectRol.addEventListener("change", aplicarFiltrosUsuarios);
    }
}

function aplicarFiltrosUsuarios() {
    const inputBuscar = document.getElementById("input-buscar-usuarios");
    const selectRol = document.getElementById("select-filtro-rol");

    const texto = inputBuscar ? inputBuscar.value.toLowerCase().trim() : "";
    const rolFiltro = selectRol ? selectRol.value.toLowerCase() : "todos";

    const filtrados = usuariosCache.filter(u => {
        const rolActual = (u.rol || "comun").toLowerCase();
        const coincideRol = (rolFiltro === "todos") || (rolActual === rolFiltro);

        const nombre = (u.nombre || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const coincideTexto = !texto || nombre.includes(texto) || email.includes(texto);

        return coincideRol && coincideTexto;
    });

    renderizarTablaUsuarios(filtrados);
}

function renderizarTablaUsuarios(perfiles) {
    const contenedor = document.getElementById("contenedor-usuarios-admin");
    if (!contenedor) return;

    if (!perfiles || perfiles.length === 0) {
        contenedor.innerHTML = `<div style="text-align: center; padding: 40px; color: #64748b;">
            <i class="fa-solid fa-users-slash" style="font-size: 2.5rem; margin-bottom: 12px; display: block; opacity: 0.5;"></i>
            No se encontraron cuentas o perfiles que coincidan con los criterios de búsqueda o el filtro seleccionado.
        </div>`;
        return;
    }

    let html = `<div class="admin-table-container">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Usuario / Nombre</th>
                    <th>Correo Electrónico</th>
                    <th>Rol Actual</th>
                    <th>Gestión de Rol</th>
                    <th>ID de Cuenta</th>
                </tr>
            </thead>
            <tbody>`;

    perfiles.forEach(usr => {
        const emailLower = (usr.email || "").toLowerCase().trim();
        const esFilaSuperAdmin = emailLower === SUPER_ADMIN_EMAIL.toLowerCase();
        const rolActual = (usr.rol || "comun").toLowerCase();
        const badgeClase = obtenerClaseBadgeRol(rolActual);

        let celdaRolActual = "";
        let celdaGestionRol = "";

        if (esFilaSuperAdmin) {
            celdaRolActual = `
                <span class="badge-role badge-role-superadmin">
                    <i class="fa-solid fa-crown"></i> Super Admin
                </span>
            `;
            celdaGestionRol = `
                <span class="badge-role" style="background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1;" title="La cuenta de Super Admin está protegida y no puede ser modificada.">
                    <i class="fa-solid fa-lock"></i> Protegido
                </span>
            `;
        } else {
            celdaRolActual = `
                <span class="badge-role ${badgeClase}">
                    ${formatearBadgeRol(rolActual)}
                </span>
            `;

            if (esSuperAdmin) {
                // El Super Admin puede cambiar el rol
                celdaGestionRol = `
                    <select class="admin-select select-cambiar-rol" 
                            data-id="${usr.id}" 
                            data-email="${escaparHTML(usr.email || '')}" 
                            data-nombre="${escaparHTML(usr.nombre || 'Usuario')}" 
                            data-rol-actual="${rolActual}"
                            aria-label="Cambiar rol de ${escaparHTML(usr.nombre || usr.email || 'usuario')}"
                            style="padding: 5px 10px; font-size: 0.85rem; font-weight: 500;">
                        <option value="admin" ${rolActual === "admin" ? "selected" : ""}>admin</option>
                        <option value="estudiante" ${rolActual === "estudiante" ? "selected" : ""}>estudiante</option>
                        <option value="comun" ${rolActual === "comun" ? "selected" : ""}>comun</option>
                    </select>
                `;
            } else {
                // Admin regular: control en modo de solo lectura
                celdaGestionRol = `
                    <span style="color: #94a3b8; font-size: 0.825rem;" title="Solo el Super Administrador (${SUPER_ADMIN_EMAIL}) puede reasignar roles.">
                        <i class="fa-solid fa-lock"></i> Solo lectura
                    </span>
                `;
            }
        }

        html += `<tr>
            <td>
                <strong>${escaparHTML(usr.nombre || "Usuario PRoA")}</strong>
                ${esFilaSuperAdmin ? `<span class="badge-role badge-role-superadmin" style="margin-left: 6px; font-size: 0.7rem;"><i class="fa-solid fa-crown"></i> Principal</span>` : ""}
            </td>
            <td>${escaparHTML(usr.email || "-")}</td>
            <td>${celdaRolActual}</td>
            <td>${celdaGestionRol}</td>
            <td style="font-family: monospace; font-size: 0.8rem; color: #64748b;" title="${usr.id || ''}">${usr.id || "-"}</td>
        </tr>`;
    });

    html += `</tbody></table></div>`;
    contenedor.innerHTML = html;

    vincularEventosTablaUsuarios();
}

function vincularEventosTablaUsuarios() {
    if (!esSuperAdmin) return;

    document.querySelectorAll(".select-cambiar-rol").forEach(select => {
        select.addEventListener("change", (e) => {
            const selectEl = e.target;
            const userId = selectEl.getAttribute("data-id");
            const userEmail = selectEl.getAttribute("data-email");
            const userName = selectEl.getAttribute("data-nombre");
            const rolAnterior = selectEl.getAttribute("data-rol-actual");
            const rolNuevo = selectEl.value;

            if (rolNuevo === rolAnterior) {
                return;
            }

            if (userEmail.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase()) {
                mostrarToast("La cuenta de Super Administrador está protegida contra modificaciones.", "advertencia");
                selectEl.value = rolAnterior;
                return;
            }

            abrirModalConfirmacionRol({
                userId,
                userEmail,
                userName,
                rolAnterior,
                rolNuevo,
                selectElement: selectEl
            });
        });
    });
}

function inicializarEventosModalRol() {
    const modal = document.getElementById("modal-confirmar-rol");
    const btnCerrar = document.getElementById("btn-cerrar-modal-rol");
    const btnCancelar = document.getElementById("btn-cancelar-cambio-rol");
    const btnConfirmar = document.getElementById("btn-confirmar-cambio-rol");

    if (btnCerrar) btnCerrar.addEventListener("click", cancelarCambioRol);
    if (btnCancelar) btnCancelar.addEventListener("click", cancelarCambioRol);
    if (btnConfirmar) btnConfirmar.addEventListener("click", confirmarCambioRol);

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                cancelarCambioRol();
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
            cancelarCambioRol();
        }
    });
}

function abrirModalConfirmacionRol(datos) {
    cambioRolPendiente = datos;

    const modal = document.getElementById("modal-confirmar-rol");
    const elNombre = document.getElementById("modal-rol-usuario-nombre");
    const elEmail = document.getElementById("modal-rol-usuario-email");
    const elRolAnterior = document.getElementById("modal-rol-anterior");
    const elRolNuevo = document.getElementById("modal-rol-nuevo");
    const elAlerta = document.getElementById("modal-rol-alerta");
    const elAlertaTexto = document.getElementById("modal-rol-alerta-texto");

    if (!modal) return;

    if (elNombre) elNombre.textContent = datos.userName || "Usuario";
    if (elEmail) elEmail.textContent = datos.userEmail || "-";

    if (elRolAnterior) {
        elRolAnterior.className = `badge-role ${obtenerClaseBadgeRol(datos.rolAnterior)}`;
        elRolAnterior.innerHTML = formatearBadgeRol(datos.rolAnterior);
    }

    if (elRolNuevo) {
        elRolNuevo.className = `badge-role ${obtenerClaseBadgeRol(datos.rolNuevo)}`;
        elRolNuevo.innerHTML = formatearBadgeRol(datos.rolNuevo);
    }

    if (elAlerta && elAlertaTexto) {
        if (datos.rolNuevo === "admin") {
            elAlertaTexto.textContent = "Al otorgar el rol de Administrador, el usuario tendrá acceso total a los módulos de Pasantías, Comunicados y Horarios.";
            elAlerta.style.display = "block";
        } else if (datos.rolAnterior === "admin") {
            elAlertaTexto.textContent = "Al quitar el rol de Administrador, el usuario perderá de forma inmediata el acceso a este panel de administración.";
            elAlerta.style.display = "block";
        } else {
            elAlerta.style.display = "none";
        }
    }

    modal.classList.remove("hidden");
}

function cancelarCambioRol() {
    if (cambioRolPendiente && cambioRolPendiente.selectElement) {
        // Revertir la selección visual en la tabla
        cambioRolPendiente.selectElement.value = cambioRolPendiente.rolAnterior;
    }
    cerrarModalConfirmacionRol();
}

function cerrarModalConfirmacionRol() {
    const modal = document.getElementById("modal-confirmar-rol");
    if (modal) modal.classList.add("hidden");
    cambioRolPendiente = null;
}

async function confirmarCambioRol() {
    if (!cambioRolPendiente) return;

    if (!esSuperAdmin) {
        mostrarToast("Solo el Super Administrador está facultado para modificar roles.", "error");
        cancelarCambioRol();
        return;
    }

    const { userId, userEmail, userName, rolAnterior, rolNuevo, selectElement } = cambioRolPendiente;

    if (userEmail.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase()) {
        mostrarToast("La cuenta de Super Administrador está protegida y no puede modificarse.", "advertencia");
        cancelarCambioRol();
        return;
    }

    const rolesValidos = ["admin", "estudiante", "comun"];
    if (!rolesValidos.includes(rolNuevo)) {
        mostrarToast("El rol seleccionado no es válido.", "error");
        cancelarCambioRol();
        return;
    }

    const btnConfirmar = document.getElementById("btn-confirmar-cambio-rol");
    const btnCancelar = document.getElementById("btn-cancelar-cambio-rol");

    if (btnConfirmar) {
        btnConfirmar.disabled = true;
        btnConfirmar.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;
    }
    if (btnCancelar) btnCancelar.disabled = true;

    try {
        const { error } = await supabase
            .from("perfiles")
            .update({ rol: rolNuevo })
            .eq("id", userId);

        if (error) throw error;

        // Notificación de éxito
        mostrarToast(`El rol de ${userName} (${userEmail}) se actualizó a "${rolNuevo}" con éxito.`, "exito");

        // Actualizar datos en memoria
        const usuarioEnCache = usuariosCache.find(u => String(u.id) === String(userId));
        if (usuarioEnCache) {
            usuarioEnCache.rol = rolNuevo;
        }

        actualizarEstadisticasUsuarios(usuariosCache);
        cerrarModalConfirmacionRol();
        aplicarFiltrosUsuarios();
    } catch (err) {
        console.error("Error al actualizar rol en Supabase:", err);
        mostrarToast(`Error al actualizar rol: ${err.message || "Error en el servidor"}`, "error");
        if (selectElement) {
            selectElement.value = rolAnterior;
        }
        cerrarModalConfirmacionRol();
    } finally {
        if (btnConfirmar) {
            btnConfirmar.disabled = false;
            btnConfirmar.innerHTML = `<i class="fa-solid fa-check"></i> Confirmar cambio`;
        }
        if (btnCancelar) btnCancelar.disabled = false;
    }
}

async function cargarUsuariosAdmin() {
    const contenedor = document.getElementById("contenedor-usuarios-admin");
    if (!contenedor) return;

    actualizarBannerPermisosUsuarios();

    contenedor.innerHTML = `<p><i class="fa-solid fa-spinner fa-spin"></i> Cargando perfiles de Supabase...</p>`;

    try {
        let { data: perfiles, error } = await supabase
            .from("perfiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.warn("Fallo al ordenar por created_at, reintentando consulta base:", error);
            const res = await supabase.from("perfiles").select("*");
            if (res.error) throw res.error;
            perfiles = res.data;
        }

        usuariosCache = perfiles || [];
        actualizarEstadisticasUsuarios(usuariosCache);
        aplicarFiltrosUsuarios();
    } catch (err) {
        console.error("Error al cargar usuarios de Supabase:", err);
        contenedor.innerHTML = `<p style="color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Error al recuperar perfiles de Supabase: ${escaparHTML(err.message || "")}</p>`;
    }
}

// ======================================
// UTILIDADES Y MODAL GENÉRICO
// ======================================
function inicializarEventosModal() {
    const modal = document.getElementById("admin-modal-detalles");
    const btnCerrarHeader = document.getElementById("btn-cerrar-modal");
    const btnCerrarFooter = document.getElementById("btn-cerrar-modal-footer");

    const cerrar = () => {
        if (modal) modal.classList.add("hidden");
    };

    if (btnCerrarHeader) btnCerrarHeader.addEventListener("click", cerrar);
    if (btnCerrarFooter) btnCerrarFooter.addEventListener("click", cerrar);

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) cerrar();
        });
    }
}

function escaparHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}