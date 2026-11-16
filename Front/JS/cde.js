// ============================================================
// cde.js — CRUD completo y visualización para Centro de Estudiantes
// Tabla Supabase: 'centro_estudiantes'
// Columnas: id, titulo, contenido, categoria, archivo_url, fecha, created_at
// ============================================================
import supabase from "./supabase.js";
import { obtenerUsuarioActual, esAdmin, obtenerPerfil, cerrarSesion } from "./auth.js";

const TABLA = "centro_estudiantes";
const BUCKET = "adjuntos_noticias";

// Referencias al DOM
const contenedor = document.getElementById("contenedor-cde");
const seccionFormulario = document.getElementById("seccion-formulario");
const formulario = document.getElementById("formulario-cde");
const btnToggleForm = document.getElementById("btn-toggle-form");
const formTituloModo = document.getElementById("form-titulo-modo");
const formIdCde = document.getElementById("form-id-cde");
const btnSubmitForm = document.getElementById("btn-submit-form");
const btnCancelarEdicion = document.getElementById("btn-cancelar-edicion");
const txtUsuarioEstado = document.getElementById("txt-usuario-estado");
const btnLoginLink = document.getElementById("btn-login-link");
const btnPerfilLink = document.getElementById("btn-perfil-link");
const btnLogout = document.getElementById("btn-logout");

// Modal Leer Más
const modalUnico = document.getElementById("modal-unico");
const modalCabecera = document.getElementById("modal-cabecera");
const modalImagen = document.getElementById("modal-imagen");
const modalTitulo = document.getElementById("modal-titulo");
const modalTextoLargo = document.getElementById("modal-texto-largo");
const modalDescarga = document.getElementById("modal-contenedor-descarga");
const btnCerrarModal = document.getElementById("cerrar-modal");

let publicaciones = [];
let usuarioActual = null;
let esUsuarioAdmin = false;

// ============================================================
// HELPERS GENERALES
// ============================================================
function escaparHTML(texto) {
    if (texto === null || texto === undefined) return "";
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function esImagenURL(url) {
    if (!url) return false;
    const limpia = url.split("?")[0].toLowerCase();
    return /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/.test(limpia);
}

function obtenerNombreArchivo(url) {
    if (!url) return "adjunto";
    try {
        const limpia = url.split("?")[0];
        const partes = limpia.split("/");
        let nombre = decodeURIComponent(partes[partes.length - 1] || "adjunto");
        nombre = nombre.replace(/^\d{10,}_/, "");
        return nombre || "adjunto";
    } catch (_) {
        return "adjunto";
    }
}

function iconoPorCategoria(cat) {
    const mapa = {
        "Institucional": "fa-solid fa-flag",
        "Participación": "fa-solid fa-comments",
        "Proyectos CDE": "fa-solid fa-couch",
        "Eventos": "fa-solid fa-star",
        "General": "fa-solid fa-users"
    };
    return mapa[cat] || "fa-solid fa-users";
}

// ============================================================
// SUBIDA DE ARCHIVOS A SUPABASE STORAGE
// ============================================================
async function subirArchivo(file) {
    if (!file) return null;

    const nombreLimpio = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_");

    const nombreArchivo = `cde_${Date.now()}_${nombreLimpio}`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(nombreArchivo, file, { cacheControl: "3600", upsert: false });

    if (error) {
        console.error("Error al subir archivo a Storage:", error);
        throw new Error(`No se pudo subir el archivo: ${error.message}`);
    }

    const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(nombreArchivo);

    return data.publicUrl;
}

// ============================================================
// INICIALIZACIÓN DE SESIÓN Y ROL
// ============================================================
async function inicializarSesion() {
    try {
        usuarioActual = await obtenerUsuarioActual();
        const adminCheck = await esAdmin();
        const perfil = await obtenerPerfil();
        esUsuarioAdmin = Boolean(adminCheck || (perfil?.rol && perfil.rol.toLowerCase() === "admin"));

        if (usuarioActual) {
            const etiquetaRol = esUsuarioAdmin ? " (Admin)" : "";
            if (txtUsuarioEstado) {
                txtUsuarioEstado.textContent = `Sesión activa: ${usuarioActual.email}${etiquetaRol}`;
            }

            if (btnLoginLink) btnLoginLink.classList.add("hidden");
            if (btnLogout) btnLogout.classList.remove("hidden");
            if (btnPerfilLink) btnPerfilLink.classList.remove("hidden");

            if (btnToggleForm) {
                btnToggleForm.classList.toggle("hidden", !esUsuarioAdmin);
            }
        } else {
            if (txtUsuarioEstado) txtUsuarioEstado.textContent = "Modo lectura";
            if (btnLoginLink) btnLoginLink.classList.remove("hidden");
            if (btnLogout) btnLogout.classList.add("hidden");
            if (btnPerfilLink) btnPerfilLink.classList.add("hidden");
            if (btnToggleForm) btnToggleForm.classList.add("hidden");
            if (seccionFormulario) seccionFormulario.classList.add("hidden");
        }
    } catch (err) {
        console.error("Error al inicializar sesión en CDE:", err);
        usuarioActual = null;
        esUsuarioAdmin = false;
        if (txtUsuarioEstado) txtUsuarioEstado.textContent = "Modo lectura";
        if (btnToggleForm) btnToggleForm.classList.add("hidden");
    }
}

if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
        await cerrarSesion();
        window.location.reload();
    });
}

// ============================================================
// CARGA Y RENDERIZADO DE PUBLICACIONES DESDE SUPABASE
// ============================================================
async function cargarPublicaciones() {
    if (!contenedor) return;

    contenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted);">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary); margin-bottom: 10px;"></i>
        <p>Cargando publicaciones del CDE...</p>
    </div>`;

    try {
        const { data, error } = await supabase
            .from(TABLA)
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            console.error("Error al cargar publicaciones de centro_estudiantes:", error);
            contenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #ef4444;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 12px;"></i>
                <p>No se pudieron cargar las publicaciones: ${escaparHTML(error.message)}</p>
            </div>`;
            return;
        }

        publicaciones = data || [];
        renderizarTarjetas(publicaciones);
    } catch (err) {
        console.error("Excepción al cargar centro_estudiantes:", err);
        contenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #ef4444;">
            <p>Ocurrió un error inesperado al consultar las publicaciones.</p>
        </div>`;
    }
}

function renderizarTarjetas(lista = publicaciones) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: var(--text-muted);">
            <i class="fa-solid fa-folder-open" style="font-size: 2.8rem; margin-bottom: 12px; color: var(--primary);"></i>
            <p style="font-size: 1.05rem;">No hay publicaciones registradas en el Centro de Estudiantes aún.</p>
            ${esUsuarioAdmin ? '<p style="font-size: 0.85rem; margin-top: 6px;">Hacé clic en "Nueva Publicación CDE" para agregar la primera.</p>' : ''}
        </div>`;
        return;
    }

    const html = lista.map(pub => {
        const esImagen = esImagenURL(pub.archivo_url);
        const nombreArchivo = obtenerNombreArchivo(pub.archivo_url);
        const icono = iconoPorCategoria(pub.categoria);

        let cabeceraHTML = "";
        if (pub.archivo_url && esImagen) {
            cabeceraHTML = `<div class="tarjeta-cabecera"><img src="${pub.archivo_url}" alt="${escaparHTML(pub.titulo)}" loading="lazy"></div>`;
        } else {
            cabeceraHTML = `<div class="tarjeta-cabecera" style="background: linear-gradient(135deg, #be123c, #9f1239);"></div>`;
        }

        let adjuntoHTML = "";
        if (pub.archivo_url && !esImagen) {
            adjuntoHTML = `<a href="${pub.archivo_url}" target="_blank" download="${escaparHTML(nombreArchivo)}" class="doc-badge">📁 Descargar: ${escaparHTML(nombreArchivo)}</a>`;
        }

        let botonesAdminHTML = "";
        if (esUsuarioAdmin) {
            botonesAdminHTML = `
                <div style="display: flex; gap: 4px;">
                    <button data-id="${pub.id}" type="button" class="btn-edit btn-editar-cde" title="Editar"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button data-id="${pub.id}" type="button" class="btn-delete btn-borrar-cde" title="Eliminar"><i class="fa-solid fa-trash"></i> Eliminar</button>
                </div>
            `;
        }

        // Resumen corto del contenido para la tarjeta
        const contenidoPlano = pub.contenido || "";
        const resumenCorto = contenidoPlano.length > 160 ? contenidoPlano.substring(0, 160) + "..." : contenidoPlano;

        return `
            <div class="tarjeta-uiverse" id="cde-tarjeta-${pub.id}">
                ${cabeceraHTML}
                <div class="tarjeta-cuerpo">
                    <span class="badge-tag"><i class="${icono}"></i> ${escaparHTML(pub.categoria || "General")}</span>
                    <h5>${escaparHTML(pub.titulo)}</h5>
                    <p>${escaparHTML(resumenCorto)}</p>
                    ${adjuntoHTML}
                </div>
                <div class="tarjeta-acciones">
                    <button data-id="${pub.id}" type="button" class="btn-read-more btn-leer-cde">Leer Más</button>
                    ${botonesAdminHTML}
                </div>
            </div>
        `;
    }).join("");

    contenedor.innerHTML = html;
}

// ============================================================
// FORMULARIO: CREACIÓN Y EDICIÓN
// ============================================================
function limpiarFormulario() {
    if (formulario) formulario.reset();
    if (formIdCde) formIdCde.value = "";
    if (formTituloModo) formTituloModo.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Nueva Publicación del CDE`;
    if (btnSubmitForm) btnSubmitForm.textContent = "Publicar en CDE";
    if (btnCancelarEdicion) btnCancelarEdicion.classList.add("hidden");
}

function abrirFormularioNuevo() {
    if (!esUsuarioAdmin) {
        alert("Atención: Solo los administradores pueden realizar publicaciones.");
        return;
    }
    limpiarFormulario();
    if (seccionFormulario) {
        seccionFormulario.classList.remove("hidden");
        seccionFormulario.scrollIntoView({ behavior: "smooth" });
    }
}

if (btnToggleForm) {
    btnToggleForm.addEventListener("click", abrirFormularioNuevo);
}

if (btnCancelarEdicion) {
    btnCancelarEdicion.addEventListener("click", () => {
        limpiarFormulario();
        if (seccionFormulario) seccionFormulario.classList.add("hidden");
    });
}

if (formulario) {
    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!esUsuarioAdmin) {
            alert("Atención: Solo los administradores pueden realizar publicaciones o modificaciones.");
            return;
        }

        const titulo = document.getElementById("form-titulo")?.value.trim();
        const categoria = document.getElementById("form-categoria")?.value || "General";
        const contenido = document.getElementById("form-contenido")?.value.trim();
        const fileInput = document.getElementById("form-archivo");
        const file = fileInput && fileInput.files[0] ? fileInput.files[0] : null;
        const idEditar = formIdCde ? formIdCde.value : null;

        if (!titulo || !contenido) {
            alert("Por favor completá el título y el contenido.");
            return;
        }

        const btnSubmit = btnSubmitForm || formulario.querySelector(".btn-submit");
        const textoOriginal = btnSubmit ? btnSubmit.textContent : "Guardar";
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = "Guardando en Supabase...";
        }

        try {
            let archivo_url = null;
            if (file) {
                try {
                    archivo_url = await subirArchivo(file);
                } catch (subidaErr) {
                    alert(`Error al subir el archivo adjunto: ${subidaErr.message}`);
                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        btnSubmit.textContent = textoOriginal;
                    }
                    return;
                }
            }

            const payload = {
                titulo,
                contenido,
                categoria
            };
            if (archivo_url) {
                payload.archivo_url = archivo_url;
            }

            if (idEditar) {
                // Modo EDICIÓN
                const { error } = await supabase
                    .from(TABLA)
                    .update(payload)
                    .eq("id", idEditar);

                if (error) {
                    console.error("Error al actualizar publicación:", error);
                    alert(`No se pudo actualizar la publicación: ${error.message}`);
                } else {
                    limpiarFormulario();
                    if (seccionFormulario) seccionFormulario.classList.add("hidden");
                    await cargarPublicaciones();
                }
            } else {
                // Modo CREACIÓN
                payload.fecha = new Date().toISOString();
                const { error } = await supabase
                    .from(TABLA)
                    .insert(payload);

                if (error) {
                    console.error("Error al insertar publicación en centro_estudiantes:", error);
                    alert(`No se pudo publicar: ${error.message}`);
                } else {
                    limpiarFormulario();
                    if (seccionFormulario) seccionFormulario.classList.add("hidden");
                    await cargarPublicaciones();
                }
            }
        } catch (ex) {
            console.error("Excepción en el formulario CDE:", ex);
            alert(`Ocurrió un error: ${ex.message}`);
        } finally {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = textoOriginal;
            }
        }
    });
}

// ============================================================
// CARGAR DATOS PARA EDICIÓN
// ============================================================
function editarPublicacion(id) {
    if (!esUsuarioAdmin) {
        alert("Atención: Solo los administradores pueden editar publicaciones.");
        return;
    }

    const pub = publicaciones.find(p => String(p.id) === String(id));
    if (!pub) return;

    if (formIdCde) formIdCde.value = pub.id;
    const inputTitulo = document.getElementById("form-titulo");
    const inputCategoria = document.getElementById("form-categoria");
    const inputContenido = document.getElementById("form-contenido");

    if (inputTitulo) inputTitulo.value = pub.titulo || "";
    if (inputCategoria) inputCategoria.value = pub.categoria || "General";
    if (inputContenido) inputContenido.value = pub.contenido || "";

    if (formTituloModo) formTituloModo.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editar Publicación CDE`;
    if (btnSubmitForm) btnSubmitForm.textContent = "Guardar Cambios";
    if (btnCancelarEdicion) btnCancelarEdicion.classList.remove("hidden");

    if (seccionFormulario) {
        seccionFormulario.classList.remove("hidden");
        seccionFormulario.scrollIntoView({ behavior: "smooth" });
    }
}

// ============================================================
// ELIMINAR PUBLICACIÓN
// ============================================================
async function borrarPublicacion(id) {
    if (!esUsuarioAdmin) {
        alert("Atención: Solo los administradores pueden eliminar publicaciones.");
        return;
    }

    const pub = publicaciones.find(p => String(p.id) === String(id));
    const nombre = pub ? pub.titulo : "esta publicación";

    if (!confirm(`¿Seguro que deseas eliminar "${nombre}" del sistema? Esta acción no se puede deshacer.`)) {
        return;
    }

    try {
        const { error } = await supabase
            .from(TABLA)
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error al eliminar publicación:", error);
            alert(`No se pudo eliminar de Supabase: ${error.message}`);
            return;
        }

        // Intento opcional de limpiar archivo adjunto huérfano de Storage
        if (pub && pub.archivo_url) {
            try {
                const partes = pub.archivo_url.split("/");
                const pathArchivo = partes[partes.length - 1];
                if (pathArchivo) {
                    await supabase.storage.from(BUCKET).remove([decodeURIComponent(pathArchivo)]);
                }
            } catch (_) {}
        }

        publicaciones = publicaciones.filter(p => String(p.id) !== String(id));
        renderizarTarjetas(publicaciones);
    } catch (err) {
        console.error("Excepción al borrar publicación:", err);
        alert(`Ocurrió un error inesperado al intentar borrar: ${err.message}`);
    }
}

// ============================================================
// MODAL LEER MÁS (AMPLIAR TARJETA)
// ============================================================
function abrirModalLeer(id) {
    const pub = publicaciones.find(p => String(p.id) === String(id));
    if (!pub || !modalUnico) return;

    if (modalTitulo) modalTitulo.textContent = pub.titulo || "Publicación del CDE";
    if (modalTextoLargo) modalTextoLargo.textContent = pub.contenido || "";
    if (modalDescarga) modalDescarga.innerHTML = "";

    const esImagen = esImagenURL(pub.archivo_url);
    const nombreArchivo = obtenerNombreArchivo(pub.archivo_url);

    if (modalImagen && modalCabecera) {
        if (pub.archivo_url && esImagen) {
            modalImagen.src = pub.archivo_url;
            modalImagen.classList.remove("hidden");
            modalCabecera.style.backgroundImage = "none";
        } else {
            modalImagen.classList.add("hidden");
            modalCabecera.style.backgroundImage = "linear-gradient(135deg, #be123c, #9f1239)";
        }
    }

    if (pub.archivo_url && !esImagen && modalDescarga) {
        modalDescarga.innerHTML = `<a href="${pub.archivo_url}" target="_blank" download="${escaparHTML(nombreArchivo)}" class="doc-badge" style="margin-top:0;">📁 Descargar adjunto: ${escaparHTML(nombreArchivo)}</a>`;
    }

    modalUnico.classList.remove("hidden");
}

function cerrarModal() {
    if (modalUnico) {
        modalUnico.classList.add("hidden");
    }
}

if (btnCerrarModal) {
    btnCerrarModal.addEventListener("click", cerrarModal);
}

if (modalUnico) {
    modalUnico.addEventListener("click", (e) => {
        if (e.target === modalUnico) {
            cerrarModal();
        }
    });
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        cerrarModal();
    }
});

// ============================================================
// ESCUCHADOR GLOBAL DE ACCIONES EN LAS TARJETAS (DELEGACIÓN)
// ============================================================
if (contenedor) {
    contenedor.addEventListener("click", (e) => {
        const btnDelete = e.target.closest(".btn-borrar-cde");
        if (btnDelete) {
            e.preventDefault();
            borrarPublicacion(btnDelete.dataset.id);
            return;
        }

        const btnEdit = e.target.closest(".btn-editar-cde");
        if (btnEdit) {
            e.preventDefault();
            editarPublicacion(btnEdit.dataset.id);
            return;
        }

        const btnRead = e.target.closest(".btn-leer-cde");
        if (btnRead) {
            e.preventDefault();
            abrirModalLeer(btnRead.dataset.id);
            return;
        }
    });
}

// ============================================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
    await inicializarSesion();
    await cargarPublicaciones();
});
