import { esAdmin, obtenerUsuarioActual, cerrarSesion } from "./auth.js";
import { obtenerPostulacionesEmpresas, actualizarEstadoPostulacion, eliminarPostulacionEmpresa } from "./pasantias_service.js"; 
import { obtenerNoticias, publicarNoticia, eliminarNoticia } from "./tablon.js"; 
import supabase from "./supabase.js";

// Estado global local del controlador
let postulacionesCache = [];

document.addEventListener("DOMContentLoaded", async () => { 
    // 1. Protección estricta de seguridad
    try {
        const usuario = await obtenerUsuarioActual(); 
        const esAdministrador = await esAdmin(); 
        
        if (!usuario || !esAdministrador) { 
            alert("Acceso restringido: Esta sección requiere rol de Administrador."); 
            window.location.href = "index.html"; 
            return; 
        } 
            
        const txtEstado = document.getElementById("txt-usuario-estado");
        if (txtEstado) {
            txtEstado.textContent = `Admin: ${usuario.email}`;
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
    inicializarFiltrosPasantias();
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
        if (estadoActual === "Aprobado") badgeClass = "badge-aprobado";
        else if (estadoActual === "Rechazado") badgeClass = "badge-rechazado";
        else if (estadoActual === "En revisión") badgeClass = "badge-en-revision";

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
                    <option value="En revisión" ${estadoActual === "En revisión" ? "selected" : ""}>En revisión</option>
                    <option value="Aprobado" ${estadoActual === "Aprobado" ? "selected" : ""}>Aprobado</option>
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
async function cargarUsuariosAdmin() {
    const contenedor = document.getElementById("contenedor-usuarios-admin");
    if (!contenedor) return;

    contenedor.innerHTML = `<p><i class="fa-solid fa-spinner fa-spin"></i> Cargando perfiles de usuario...</p>`;

    try {
        const { data: perfiles, error } = await supabase
            .from("perfiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        if (!perfiles || perfiles.length === 0) {
            contenedor.innerHTML = `<div style="text-align: center; padding: 40px; color: #64748b;">
                <i class="fa-solid fa-users-slash" style="font-size: 2.5rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                No se registraron perfiles de usuario en la base de datos.
            </div>`;
            return;
        }

        let html = `<div class="admin-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Usuario / Nombre</th>
                        <th>Correo Electrónico</th>
                        <th>Rol Asignado</th>
                        <th>ID de Cuenta</th>
                    </tr>
                </thead>
                <tbody>`;

        perfiles.forEach(usr => {
            const esAdminRole = usr.rol === "admin";
            const roleBadgeClass = esAdminRole ? "badge-role-admin" : "badge-role";

            html += `<tr>
                <td>
                    <strong>${escaparHTML(usr.nombre || "Usuario PRoA")}</strong>
                </td>
                <td>${escaparHTML(usr.email || "-")}</td>
                <td>
                    <span class="${roleBadgeClass}">
                        <i class="${esAdminRole ? 'fa-solid fa-shield-halved' : 'fa-solid fa-user'}"></i> ${escaparHTML(usr.rol || "estudiante")}
                    </span>
                </td>
                <td style="font-family: monospace; font-size: 0.8rem; color: #64748b;">${usr.id || "-"}</td>
            </tr>`;
        });

        html += `</tbody></table></div>`;
        contenedor.innerHTML = html;
    } catch (err) {
        console.error("Error al cargar usuarios de Supabase:", err);
        contenedor.innerHTML = `<p style="color: #64748b; font-size: 0.9rem;">
            <i class="fa-solid fa-circle-info"></i> La vista de perfiles muestra la lista de cuentas sincronizadas en Supabase.
        </p>`;
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