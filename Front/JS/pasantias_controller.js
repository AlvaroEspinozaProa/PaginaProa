import {
    crearPostulacionEmpresa,
    obtenerPostulacionesEmpresas,
    actualizarEstadoPostulacion,
    eliminarPostulacionEmpresa
} from "./pasantias_service.js";

import {
    obtenerUsuarioActual,
    esAdmin,
    cerrarSesion
} from "./auth.js";

// Elementos DOM principales
const txtUsuarioEstado = document.getElementById('txt-usuario-estado');
const btnLoginLink = document.getElementById('btn-login-link');
const btnLogout = document.getElementById('btn-logout');

const btnAbrirPostulacion = document.getElementById('btn-abrir-postulacion');
const btnCerrarModalEmpresa = document.getElementById('btn-cerrar-modal-empresa');
const modalEmpresa = document.getElementById('modal-empresa');
const formPostulacion = document.getElementById('formulario-postulacion-empresa');

const seccionAdmin = document.getElementById('seccion-admin-pasantias');
const contenedorTabla = document.getElementById('contenedor-tabla-postulaciones');

let listaPostulaciones = [];
let filtroActual = "Todos";
let esUsuarioAdmin = false;

// ====================================================
// INICIALIZACIÓN DE SESIÓN Y ROL
// ====================================================
async function inicializarSesion() {
    try {
        const usuarioActual = await obtenerUsuarioActual();
        esUsuarioAdmin = await esAdmin();

        // Buscamos la sección en el DOM
        const seccionAdmin = document.getElementById('seccion-admin-pasantias');

        if (usuarioActual && esUsuarioAdmin) {
            // ==========================================
            // CASO 1: ES ADMINISTRADOR
            // ==========================================
            txtUsuarioEstado.textContent = `Sesión activa: ${usuarioActual.email} (Admin)`;
            btnLoginLink.classList.add('hidden');
            btnLogout.classList.remove('hidden');

            if (seccionAdmin) {
                seccionAdmin.classList.remove('hidden');
                seccionAdmin.style.display = 'block'; // Muestra el panel al admin
                await cargarYDibujarPostulacionesAdmin();
            }
        } else {
            // ==========================================
            // CASO 2: USUARIO COMÚN O NO LOGUEADO
            // ==========================================
            txtUsuarioEstado.textContent = "Modo lectura";
            btnLoginLink.classList.remove('hidden');
            btnLogout.classList.add('hidden');
            
            if (seccionAdmin) {
                seccionAdmin.classList.add('hidden');
                seccionAdmin.style.display = 'none'; // Oculta estrictamente al usuario común
            }
        }
    } catch (err) {
        console.error("Error al inicializar sesión:", err);
        const seccionAdmin = document.getElementById('seccion-admin-pasantias');
        if (seccionAdmin) {
            seccionAdmin.classList.add('hidden');
            seccionAdmin.style.display = 'none'; // Por seguridad si ocurre un error
        }
    }
}

// Evento Cerrar Sesión
if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
        await cerrarSesion();
        window.location.reload();
    });
}

// ====================================================
// MODAL DE POSTULACIÓN DE EMPRESAS
// ====================================================
if (btnAbrirPostulacion) {
    btnAbrirPostulacion.addEventListener('click', () => {
        modalEmpresa.classList.remove('hidden');
        modalEmpresa.style.display = 'flex';
    });
}

function cerrarModal() {
    if (modalEmpresa) {
        modalEmpresa.classList.add('hidden');
        modalEmpresa.style.display = 'none';
        formPostulacion.reset();
    }
}

if (btnCerrarModalEmpresa) {
    btnCerrarModalEmpresa.addEventListener('click', cerrarModal);
}

if (modalEmpresa) {
    modalEmpresa.addEventListener('click', (e) => {
        if (e.target === modalEmpresa) cerrarModal();
    });
}

// Enviar formulario de empresa
if (formPostulacion) {
    formPostulacion.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnSubmit = document.getElementById('btn-submit-empresa');
        const textoOriginal = btnSubmit.textContent;
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Enviando postulación...";

        const datosEmpresa = {
            nombre_empresa: document.getElementById('empresa-nombre').value.trim(),
            rubro: document.getElementById('empresa-rubro').value.trim(),
            contacto_nombre: document.getElementById('empresa-contacto').value.trim(),
            email: document.getElementById('empresa-email').value.trim(),
            telefono: document.getElementById('empresa-telefono').value.trim(),
            vacantes: document.getElementById('empresa-vacantes').value,
            mensaje: document.getElementById('empresa-mensaje').value.trim()
        };

        const resultado = await crearPostulacionEmpresa(datosEmpresa);

        btnSubmit.disabled = false;
        btnSubmit.textContent = textoOriginal;

        if (resultado.exito) {
            alert(
                `¡Postulación recibida con éxito!\n\n` +
                `Muchas gracias, ${datosEmpresa.contacto_nombre}. Hemos registrado la solicitud de ${datosEmpresa.nombre_empresa}.\n` +
                `Se ha generado una notificación al correo institucional de pasantías:\n` +
                `despenaderos.ds@escuelasproa.edu.ar\n\n` +
                `El equipo directivo se pondrá en contacto a la brevedad.`
            );
            cerrarModal();
            if (esUsuarioAdmin) {
                await cargarYDibujarPostulacionesAdmin();
            }
        } else {
            alert("Ocurrió un error al enviar la postulación. Por favor verifica los datos o intenta nuevamente.");
        }
    });
}

// ====================================================
// PANEL DE ADMINISTRACIÓN DE POSTULACIONES
// ====================================================
async function cargarYDibujarPostulacionesAdmin() {
    if (!contenedorTabla) return;

    contenedorTabla.innerHTML = "<p style='text-align:center; color:#64748b; padding:20px;'>Cargando postulaciones desde Supabase...</p>";
    listaPostulaciones = await obtenerPostulacionesEmpresas();

    dibujarTabla();
}

function dibujarTabla() {
    if (!listaPostulaciones || listaPostulaciones.length === 0) {
        contenedorTabla.innerHTML = "<p style='text-align:center; color:#64748b; padding:30px;'>No hay postulaciones de empresas registradas aún.</p>";
        return;
    }

    const postulacionesFiltradas = listaPostulaciones.filter(p => {
        if (filtroActual === "Todos") return true;
        return p.estado === filtroActual;
    });

    if (postulacionesFiltradas.length === 0) {
        contenedorTabla.innerHTML = `<p style='text-align:center; color:#64748b; padding:20px;'>No se encontraron postulaciones con estado '${filtroActual}'.</p>`;
        return;
    }

    let html = `
        <table class="pasantias-tabla">
            <thead>
                <tr>
                    <th>Empresa / Rubro</th>
                    <th>Contacto</th>
                    <th>Correo / Teléfono</th>
                    <th>Vacantes</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    postulacionesFiltradas.forEach(p => {
        const fecha = new Date(p.created_at).toLocaleDateString('es-AR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        const claseBadge = obtenerClaseBadge(p.estado);

        html += `
            <tr>
                <td>
                    <strong>${p.nombre_empresa}</strong><br>
                    <span style="font-size:0.78rem; color:#64748b;">${p.rubro || 'General'}</span>
                </td>
                <td>${p.contacto_nombre}</td>
                <td>
                    <a href="mailto:${p.email}" style="color:#0077cc; text-decoration:none;">${p.email}</a><br>
                    <span style="font-size:0.78rem; color:#64748b;">${p.telefono || 'Sin teléfono'}</span>
                </td>
                <td><strong style="color:#0057B8;">${p.vacantes || 1}</strong></td>
                <td>${fecha}</td>
                <td>
                    <select onchange="cambiarEstadoPostulacion('${p.id}', this.value)" class="select-estado ${claseBadge}">
                        <option value="Pendiente" ${p.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="Contactado" ${p.estado === 'Contactado' ? 'selected' : ''}>Contactado</option>
                        <option value="Aprobado" ${p.estado === 'Aprobado' ? 'selected' : ''}>Aprobado</option>
                        <option value="Rechazado" ${p.estado === 'Rechazado' ? 'selected' : ''}>Rechazado</option>
                    </select>
                </td>
                <td>
                    <button onclick="eliminarPostulacion('${p.id}')" type="button" class="btn-delete" style="padding:6px 10px;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    contenedorTabla.innerHTML = html;
}

function obtenerClaseBadge(estado) {
    switch (estado) {
        case "Pendiente": return "status-pendiente";
        case "Contactado": return "status-contactado";
        case "Aprobado": return "status-aprobado";
        case "Rechazado": return "status-rechazado";
        default: return "status-pendiente";
    }
}

// Cambiar estado desde la tabla admin
window.cambiarEstadoPostulacion = async function(id, nuevoEstado) {
    const exito = await actualizarEstadoPostulacion(id, nuevoEstado);
    if (exito) {
        const item = listaPostulaciones.find(p => p.id === id);
        if (item) item.estado = nuevoEstado;
        dibujarTabla();
    } else {
        alert("No se pudo actualizar el estado de la postulación.");
    }
};

// Eliminar postulación desde la tabla admin
window.eliminarPostulacion = async function(id) {
    if (confirm("¿Seguro que deseas borrar esta postulación de empresa?")) {
        const exito = await eliminarPostulacionEmpresa(id);
        if (exito) {
            await cargarYDibujarPostulacionesAdmin();
        } else {
            alert("No se pudo borrar la postulación.");
        }
    }
};

// Filtros de estado
const botonesFiltro = document.querySelectorAll('.btn-filtro');
botonesFiltro.forEach(btn => {
    btn.addEventListener('click', (e) => {
        botonesFiltro.forEach(b => b.classList.remove('activo'));
        e.target.classList.add('activo');
        
        filtroActual = e.target.textContent.trim();
        if (filtroActual === "Todas") filtroActual = "Todos";
        if (filtroActual === "Pendientes") filtroActual = "Pendiente";
        if (filtroActual === "Contactados") filtroActual = "Contactado";
        if (filtroActual === "Aprobados") filtroActual = "Aprobado";
        if (filtroActual === "Rechazados") filtroActual = "Rechazado";

        dibujarTabla();
    });
});

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => {
    await inicializarSesion();
});
