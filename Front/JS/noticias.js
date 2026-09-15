import { obtenerNoticias, publicarNoticia, eliminarNoticia, actualizarNoticia } from "./tablon.js";
import { obtenerUsuarioActual, esAdmin, cerrarSesion } from "./auth.js";

// ====================================================
// REFERENCIAS AL DOM
// ====================================================
const contenedor = document.getElementById('contenedor-noticias');
const formulario = document.getElementById('formulario-noticia');
const seccionFormulario = document.getElementById('seccion-formulario');
const btnToggleForm = document.getElementById('btn-toggle-form');
const formTituloModo = document.getElementById('form-titulo-modo');
const formIdNoticia = document.getElementById('form-id-noticia');
const btnSubmitForm = document.getElementById('btn-submit-form');
const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');
const txtUsuarioEstado = document.getElementById('txt-usuario-estado');
const btnLoginLink = document.getElementById('btn-login-link');
const btnPerfilLink = document.getElementById('btn-perfil-link');
const btnLogout = document.getElementById('btn-logout');

// Elementos de búsqueda y etiquetas
const inputBusqueda = document.getElementById('input-busqueda-noticias');
const contenedorEtiquetas = document.getElementById('contenedor-etiquetas');
const selectEtiquetaForm = document.getElementById('form-etiqueta');

let misNoticias = [];
let usuarioActual = null;
let esUsuarioAdmin = false;
let etiquetaActiva = "todas";
let textoBusqueda = "";

// ====================================================
// HELPERS GENERALES
// ====================================================

// Evita inyección de HTML al insertar texto proveniente de Supabase
function escaparHTML(texto) {
    if (texto === null || texto === undefined) return "";
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

// Determina si la URL de un adjunto corresponde a una imagen
function esImagenURL(url) {
    if (!url) return false;
    const limpia = url.split("?")[0].toLowerCase();
    return /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/.test(limpia);
}

// Extrae un nombre de archivo legible desde la URL pública de Supabase Storage
function obtenerNombreArchivo(url) {
    if (!url) return "adjunto";
    try {
        const limpia = url.split("?")[0];
        const partes = limpia.split("/");
        let nombre = decodeURIComponent(partes[partes.length - 1] || "adjunto");
        // Quita el timestamp que antepone tablon.js al subir el archivo (Date.now()_)
        nombre = nombre.replace(/^\d{10,}_/, "");
        return nombre || "adjunto";
    } catch (e) {
        return "adjunto";
    }
}

// Helper: Extraer o inferir la etiqueta de una noticia
function obtenerEtiquetaNoticia(noticia) {
    if (noticia.etiqueta && noticia.etiqueta.trim() !== "") {
        return noticia.etiqueta;
    }
    // Buscar prefijo [Etiqueta] en resumen o titulo
    const matchResumen = (noticia.resumen || "").match(/^\[(.*?)\]/);
    if (matchResumen) return matchResumen[1];

    const matchTitulo = (noticia.titulo || "").match(/^\[(.*?)\]/);
    if (matchTitulo) return matchTitulo[1];

    // Inferir por palabras clave
    const texto = `${noticia.titulo || ''} ${noticia.resumen || ''} ${noticia.contenido || ''}`.toLowerCase();
    if (texto.includes("cde") || texto.includes("centro de estudiantes") || texto.includes("elecciones")) return "CDE";
    if (texto.includes("deporte") || texto.includes("torneo") || texto.includes("fútbol") || texto.includes("ping pong")) return "Deportes";
    if (texto.includes("pasantía") || texto.includes("empresa") || texto.includes("práctica")) return "Pasantías";
    if (texto.includes("evento") || texto.includes("muestra") || texto.includes("acto") || texto.includes("feria")) return "Eventos";
    if (texto.includes("examen") || texto.includes("materia") || texto.includes("clase") || texto.includes("horario")) return "Académico";

    return "Institucional";
}

// Helper: Limpiar prefijo [Etiqueta] del texto para visualización limpia
function limpiarPrefijoEtiqueta(texto) {
    if (!texto) return "";
    return texto.replace(/^\[.*?\]\s*/, '');
}

// ====================================================
// SESIÓN Y ROL DE USUARIO
// ====================================================
async function inicializarSesion() {
    try {
        usuarioActual = await obtenerUsuarioActual();
        esUsuarioAdmin = await esAdmin();

        if (usuarioActual) {
            const etiquetaRol = esUsuarioAdmin ? " (Admin)" : "";
            if (txtUsuarioEstado) {
                txtUsuarioEstado.textContent = `Sesión activa: ${usuarioActual.email}${etiquetaRol}`;
            }

            if (btnLoginLink) btnLoginLink.classList.add('hidden');
            if (btnLogout) btnLogout.classList.remove('hidden');
            if (btnPerfilLink) btnPerfilLink.classList.remove('hidden');

            // El botón para publicar noticias solo debe verse para administradores
            if (btnToggleForm) {
                btnToggleForm.classList.toggle('hidden', !esUsuarioAdmin);
            }
        } else {
            if (txtUsuarioEstado) txtUsuarioEstado.textContent = "Modo lectura";
            if (btnLoginLink) btnLoginLink.classList.remove('hidden');
            if (btnLogout) btnLogout.classList.add('hidden');
            if (btnPerfilLink) btnPerfilLink.classList.add('hidden');
            if (btnToggleForm) btnToggleForm.classList.add('hidden');
            if (seccionFormulario) seccionFormulario.classList.add('hidden');
        }
    } catch (err) {
        console.error("Error al inicializar sesión:", err);
        usuarioActual = null;
        esUsuarioAdmin = false;
        if (txtUsuarioEstado) txtUsuarioEstado.textContent = "Modo lectura";
        if (btnToggleForm) btnToggleForm.classList.add('hidden');
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
// CARGAR Y DIBUJAR NOTICIAS DESDE SUPABASE
// ====================================================
async function cargarYDibujarNoticias() {
    if (!contenedor) return;

    contenedor.innerHTML = "<p style='text-align:center; grid-column: 1 / -1; color:#64748b;'>Cargando novedades...</p>";

    misNoticias = await obtenerNoticias();

    if (!misNoticias || misNoticias.length === 0) {
        contenedor.innerHTML = "<p style='text-align:center; grid-column: 1 / -1; color:#64748b;'>No hay noticias publicadas aún.</p>";
        return;
    }

    filtrarYRenderizarNoticias();
}

function filtrarYRenderizarNoticias() {
    const q = textoBusqueda.trim().toLowerCase();

    const noticiasFiltradas = misNoticias.filter(noticia => {
        const etiquetaNoticia = obtenerEtiquetaNoticia(noticia);
        const coincideEtiqueta = (etiquetaActiva === "todas" || etiquetaNoticia.toLowerCase() === etiquetaActiva.toLowerCase());

        const tituloLimpio = limpiarPrefijoEtiqueta(noticia.titulo).toLowerCase();
        const resumenLimpio = limpiarPrefijoEtiqueta(noticia.resumen).toLowerCase();
        const contenido = (noticia.contenido || "").toLowerCase();
        const etiquetaTexto = etiquetaNoticia.toLowerCase();

        const coincideBusqueda = !q ||
            tituloLimpio.includes(q) ||
            resumenLimpio.includes(q) ||
            contenido.includes(q) ||
            etiquetaTexto.includes(q);

        return coincideEtiqueta && coincideBusqueda;
    });

    dibujarTarjetas(noticiasFiltradas);
}

function dibujarTarjetas(listaNoticias = misNoticias) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    if (listaNoticias.length === 0) {
        contenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted);">
            <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 12px; color: var(--primary);"></i>
            <p>No se encontraron noticias que coincidan con la búsqueda o el filtro seleccionado.</p>
        </div>`;
        return;
    }

    const html = listaNoticias.map(noticia => {
        let cabeceraTarjetaHTML = "";
        let adjuntoHTML = "";

        const esImagen = esImagenURL(noticia.archivo_url);
        const nombreArchivo = obtenerNombreArchivo(noticia.archivo_url);
        const etiquetaNoticia = obtenerEtiquetaNoticia(noticia);
        const tituloLimpio = escaparHTML(limpiarPrefijoEtiqueta(noticia.titulo));
        const resumenLimpio = escaparHTML(limpiarPrefijoEtiqueta(noticia.resumen));

        // Cabecera con imagen o degradado por defecto
        if (noticia.archivo_url && esImagen) {
            cabeceraTarjetaHTML = `<div class="tarjeta-cabecera"><img src="${noticia.archivo_url}" alt="${tituloLimpio}"></div>`;
        } else {
            cabeceraTarjetaHTML = `<div class="tarjeta-cabecera"></div>`;
        }

        // Botón de descarga si es un PDF o documento
        if (noticia.archivo_url && !esImagen) {
            adjuntoHTML = `<a href="${noticia.archivo_url}" target="_blank" download="${escaparHTML(nombreArchivo)}" class="doc-badge">📁 Descargar: ${escaparHTML(nombreArchivo)}</a>`;
        }

        // Botones de administración (Solo visibles para Admin)
        let botonesAdminHTML = "";
        if (esUsuarioAdmin) {
            botonesAdminHTML = `
                <div style="display: flex; gap: 4px;">
                    <button data-id="${noticia.id}" type="button" class="btn-edit"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button data-id="${noticia.id}" type="button" class="btn-delete"><i class="fa-solid fa-trash"></i> Eliminar</button>
                </div>
            `;
        }

        return `
            <div class="tarjeta-uiverse">
              ${cabeceraTarjetaHTML}
              <div class="tarjeta-cuerpo">
                <span class="badge-tag"><i class="fa-solid fa-tag"></i> ${escaparHTML(etiquetaNoticia)}</span>
                <h5>${tituloLimpio}</h5>
                <p>${resumenLimpio}</p>
                ${adjuntoHTML}
              </div>
              <div class="tarjeta-acciones">
                <button data-id="${noticia.id}" type="button" class="btn-read-more">Leer Más</button>
                ${botonesAdminHTML}
              </div>
            </div>
        `;
    }).join("");

    contenedor.innerHTML = html;
}

// Configurar eventos de búsqueda y filtros de etiquetas
if (inputBusqueda) {
    inputBusqueda.addEventListener('input', (e) => {
        textoBusqueda = e.target.value;
        filtrarYRenderizarNoticias();
    });
}

if (contenedorEtiquetas) {
    contenedorEtiquetas.addEventListener('click', (e) => {
        const btnPill = e.target.closest('.tag-pill');
        if (!btnPill) return;

        contenedorEtiquetas.querySelectorAll('.tag-pill').forEach(btn => btn.classList.remove('active'));
        btnPill.classList.add('active');

        etiquetaActiva = btnPill.dataset.tag || "todas";
        filtrarYRenderizarNoticias();
    });
}

// ====================================================
// ABRIR / CERRAR FORMULARIO (CREAR O CANCELAR)
// ====================================================
function limpiarFormularioModo() {
    if (formulario) formulario.reset();
    if (formIdNoticia) formIdNoticia.value = "";
    if (formTituloModo) formTituloModo.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Publicar Nueva Noticia`;
    if (btnSubmitForm) btnSubmitForm.textContent = "Publicar en el Tablón";
    if (btnCancelarEdicion) btnCancelarEdicion.classList.add('hidden');
}

function abrirFormularioNuevaNoticia() {
    if (!esUsuarioAdmin) {
        alert("Atención: Solo los administradores pueden publicar noticias.");
        return;
    }
    limpiarFormularioModo();
    if (seccionFormulario) {
        seccionFormulario.classList.remove('hidden');
        seccionFormulario.scrollIntoView({ behavior: 'smooth' });
    }
}

if (btnToggleForm) {
    btnToggleForm.addEventListener('click', abrirFormularioNuevaNoticia);
}

if (btnCancelarEdicion) {
    btnCancelarEdicion.addEventListener('click', () => {
        limpiarFormularioModo();
        if (seccionFormulario) seccionFormulario.classList.add('hidden');
    });
}

// ====================================================
// FORMULARIO: PUBLICAR O EDITAR NOTICIA EN SUPABASE
// ====================================================
if (formulario) {
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!esUsuarioAdmin) {
            alert("Atención: Solo los administradores pueden realizar publicaciones o modificaciones.");
            return;
        }

        const btnSubmit = btnSubmitForm || formulario.querySelector('.btn-submit');
        const textoOriginal = btnSubmit.textContent;
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Procesando...";

        const idEditar = formIdNoticia.value;
        const fileInput = document.getElementById('form-archivo');
        const file = fileInput && fileInput.files[0] ? fileInput.files[0] : null;
        const etiquetaValor = selectEtiquetaForm ? selectEtiquetaForm.value : "Institucional";

        let exito = false;

        if (idEditar) {
            // MODO EDICIÓN
            exito = await actualizarNoticia(idEditar, {
                titulo: document.getElementById('form-titulo').value.trim(),
                resumen: document.getElementById('form-resumen').value.trim(),
                contenido: document.getElementById('form-contenido').value.trim(),
                archivo: file,
                etiqueta: etiquetaValor
            });
        } else {
            // MODO CREACIÓN
            exito = await publicarNoticia({
                titulo: document.getElementById('form-titulo').value.trim(),
                resumen: document.getElementById('form-resumen').value.trim(),
                contenido: document.getElementById('form-contenido').value.trim(),
                archivo: file,
                etiqueta: etiquetaValor
            });
        }

        btnSubmit.disabled = false;
        btnSubmit.textContent = textoOriginal;

        if (exito) {
            limpiarFormularioModo();
            if (seccionFormulario) seccionFormulario.classList.add('hidden');
            await cargarYDibujarNoticias(); // Recarga noticias de Supabase
        } else {
            alert("Ocurrió un error al guardar la noticia en Supabase.");
        }
    });
}

// ====================================================
// CARGAR DATOS EN FORMULARIO PARA EDICIÓN
// ====================================================
window.editarNoticia = function (idNoticia) {
    if (!esUsuarioAdmin) return;

    const noticia = misNoticias.find(n => n.id == idNoticia);
    if (!noticia) return;

    formIdNoticia.value = noticia.id;
    document.getElementById('form-titulo').value = limpiarPrefijoEtiqueta(noticia.titulo);
    document.getElementById('form-resumen').value = limpiarPrefijoEtiqueta(noticia.resumen);
    document.getElementById('form-contenido').value = noticia.contenido;
    if (selectEtiquetaForm) {
        selectEtiquetaForm.value = obtenerEtiquetaNoticia(noticia);
    }

    if (formTituloModo) formTituloModo.textContent = "Editar Noticia Existente";
    if (btnSubmitForm) btnSubmitForm.textContent = "Guardar Cambios";
    if (btnCancelarEdicion) btnCancelarEdicion.classList.remove('hidden');

    seccionFormulario.classList.remove('hidden');
    seccionFormulario.scrollIntoView({ behavior: 'smooth' });
};

// ====================================================
// ELIMINAR NOTICIA
// ====================================================
window.borrarNoticia = async function (idNoticia) {
    if (!esUsuarioAdmin) {
        alert("Atención: Solo los administradores pueden eliminar publicaciones.");
        return;
    }

    if (confirm("¿Seguro que deseas eliminar esta publicación del sistema?")) {
        const exito = await eliminarNoticia(idNoticia);
        if (exito) {
            await cargarYDibujarNoticias();
        } else {
            alert("No se pudo eliminar la noticia de Supabase.");
        }
    }
};

// ====================================================
// ABRIR VENTANA EMERGENTE (MODAL)
// ====================================================
window.abrirNoticiaCompleta = function (idNoticia) {
    const modal = document.getElementById('modal-unico');
    const cabecera = document.getElementById('modal-cabecera');
    const img = document.getElementById('modal-imagen');
    const contenedorDescarga = document.getElementById('modal-contenedor-descarga');

    const noticia = misNoticias.find(n => n.id == idNoticia);
    if (noticia) {
        document.getElementById('modal-titulo').innerText = noticia.titulo;
        document.getElementById('modal-texto-largo').innerText = noticia.contenido;
        contenedorDescarga.innerHTML = "";

        const esImagen = esImagenURL(noticia.archivo_url);
        const nombreArchivo = obtenerNombreArchivo(noticia.archivo_url);

        if (noticia.archivo_url && esImagen) {
            img.src = noticia.archivo_url;
            img.classList.remove('hidden');
            cabecera.style.backgroundImage = "none";
        } else {
            img.classList.add('hidden');
            cabecera.style.backgroundImage = "linear-gradient(to right, #3b82f6, #2563eb)";
        }

        if (noticia.archivo_url && !esImagen) {
            contenedorDescarga.innerHTML = `<a href="${noticia.archivo_url}" target="_blank" download="${escaparHTML(nombreArchivo)}" class="doc-badge" style="margin-top:0;">📁 Guardar adjunto: ${escaparHTML(nombreArchivo)}</a>`;
        }

        modal.classList.remove('hidden');
        modal.style.display = "flex";
    }
};

// Eventos de cierre de modal
function cerrarModalUnico() {
    const modal = document.getElementById('modal-unico');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = "none";
    }
}

const btnCerrarModal = document.getElementById('cerrar-modal');
const modalUnico = document.getElementById('modal-unico');
if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModalUnico);
if (modalUnico) {
    modalUnico.addEventListener('click', (e) => {
        if (e.target === modalUnico) {
            cerrarModalUnico();
        }
    });
}

// ====================================================
// ESCUCHADOR GLOBAL DE CLICS PARA LAS TARJETAS
// ====================================================
if (contenedor) {
    contenedor.addEventListener('click', (e) => {
        // Botón ELIMINAR
        const btnDelete = e.target.closest('.btn-delete');
        if (btnDelete) {
            window.borrarNoticia(btnDelete.dataset.id);
            return;
        }

        // Botón EDITAR
        const btnEdit = e.target.closest('.btn-edit');
        if (btnEdit) {
            window.editarNoticia(btnEdit.dataset.id);
            return;
        }

        // Botón LEER MÁS
        const btnRead = e.target.closest('.btn-read-more');
        if (btnRead) {
            window.abrirNoticiaCompleta(btnRead.dataset.id);
            return;
        }
    });
}

// ====================================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ====================================================
document.addEventListener("DOMContentLoaded", async () => {
    await inicializarSesion();
    await cargarYDibujarNoticias();
});