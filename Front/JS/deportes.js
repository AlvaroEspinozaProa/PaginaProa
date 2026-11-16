// ============================================================
// deportes.js — CRUD completo y visualización para Deportes
// Tabla Supabase: 'deportes'
// Columnas: id, titulo, descripcion, categoria, horario, imagen_url, created_at
// ============================================================
import supabase from "./supabase.js";
import { obtenerUsuarioActual, esAdmin, obtenerPerfil, cerrarSesion } from "./auth.js";

const TABLA = "deportes";
const BUCKET = "adjuntos_noticias";

// Referencias al DOM
const contenedor = document.getElementById("contenedor-deportes");
const seccionFormulario = document.getElementById("seccion-formulario");
const formulario = document.getElementById("formulario-deporte");
const btnToggleForm = document.getElementById("btn-toggle-form");
const formTituloModo = document.getElementById("form-titulo-modo");
const formIdDeporte = document.getElementById("form-id-deporte");
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
const modalExtra = document.getElementById("modal-contenedor-extra");
const btnCerrarModal = document.getElementById("cerrar-modal");

let actividades = [];
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

function iconoPorCategoria(cat) {
    const mapa = {
        "Competencias": "fa-solid fa-trophy",
        "Recreación": "fa-solid fa-table-tennis-paddle-ball",
        "Trabajo en Equipo": "fa-solid fa-futbol",
        "Torneos": "fa-solid fa-medal",
        "Entrenamientos": "fa-solid fa-dumbbell",
        "Eventos": "fa-solid fa-star"
    };
    return mapa[cat] || "fa-solid fa-trophy";
}

// ============================================================
// SUBIDA DE IMAGEN A SUPABASE STORAGE
// ============================================================
async function subirImagen(file) {
    if (!file) return null;

    const nombreLimpio = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_");

    const nombreArchivo = `dep_${Date.now()}_${nombreLimpio}`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(nombreArchivo, file, { cacheControl: "3600", upsert: false });

    if (error) {
        console.error("Error al subir imagen de deportes a Storage:", error);
        throw new Error(`No se pudo subir la imagen: ${error.message}`);
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
        console.error("Error al inicializar sesión en Deportes:", err);
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
// CARGA Y RENDERIZADO DE ACTIVIDADES DESDE SUPABASE
// ============================================================
async function cargarActividades() {
    if (!contenedor) return;

    contenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted);">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary); margin-bottom: 10px;"></i>
        <p>Cargando actividades deportivas...</p>
    </div>`;

    try {
        const { data, error } = await supabase
            .from(TABLA)
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            console.error("Error al cargar actividades de deportes:", error);
            contenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #ef4444;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 12px;"></i>
                <p>No se pudieron cargar las actividades deportivas: ${escaparHTML(error.message)}</p>
            </div>`;
            return;
        }

        actividades = data || [];
        renderizarTarjetas(actividades);
    } catch (err) {
        console.error("Excepción al cargar deportes:", err);
        contenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #ef4444;">
            <p>Ocurrió un error inesperado al consultar las actividades deportivas.</p>
        </div>`;
    }
}

function renderizarTarjetas(lista = actividades) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: var(--text-muted);">
            <i class="fa-solid fa-trophy" style="font-size: 2.8rem; margin-bottom: 12px; color: var(--primary);"></i>
            <p style="font-size: 1.05rem;">No hay actividades deportivas registradas aún.</p>
            ${esUsuarioAdmin ? '<p style="font-size: 0.85rem; margin-top: 6px;">Hacé clic en "Nueva Actividad Deportiva" para agregar la primera.</p>' : ''}
        </div>`;
        return;
    }

    const html = lista.map(ev => {
        let cabeceraHTML = "";
        if (ev.imagen_url) {
            cabeceraHTML = `<div class="tarjeta-cabecera"><img src="${ev.imagen_url}" alt="${escaparHTML(ev.titulo)}" loading="lazy" onerror="this.parentElement.style.background='linear-gradient(135deg, #15803d, #166534)'; this.style.display='none';"></div>`;
        } else {
            cabeceraHTML = `<div class="tarjeta-cabecera" style="background: linear-gradient(135deg, #15803d, #166534);"></div>`;
        }

        const icono = iconoPorCategoria(ev.categoria);
        const horarioHTML = ev.horario
            ? `<span style="font-size:0.8rem; color:var(--text-muted); float:right;"><i class="fa-regular fa-clock"></i> ${escaparHTML(ev.horario)}</span>`
            : "";

        let botonesAdminHTML = "";
        if (esUsuarioAdmin) {
            botonesAdminHTML = `
                <div style="display: flex; gap: 4px;">
                    <button data-id="${ev.id}" type="button" class="btn-edit btn-editar-deporte" title="Editar"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button data-id="${ev.id}" type="button" class="btn-delete btn-borrar-deporte" title="Eliminar"><i class="fa-solid fa-trash"></i> Eliminar</button>
                </div>
            `;
        }

        const descripcionPlana = ev.descripcion || "";
        const resumenCorto = descripcionPlana.length > 160 ? descripcionPlana.substring(0, 160) + "..." : descripcionPlana;

        return `
            <div class="tarjeta-uiverse" id="deporte-tarjeta-${ev.id}">
                ${cabeceraHTML}
                <div class="tarjeta-cuerpo">
                    <div style="margin-bottom: 8px; overflow: hidden;">
                        <span class="badge-tag"><i class="${icono}"></i> ${escaparHTML(ev.categoria || "Competencias")}</span>
                        ${horarioHTML}
                    </div>
                    <h5 style="clear: both; margin-top: 6px;">${escaparHTML(ev.titulo)}</h5>
                    <p>${escaparHTML(resumenCorto)}</p>
                </div>
                <div class="tarjeta-acciones">
                    <button data-id="${ev.id}" type="button" class="btn-read-more btn-leer-deporte">Leer Más</button>
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
    if (formIdDeporte) formIdDeporte.value = "";
    if (formTituloModo) formTituloModo.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Nueva Actividad Deportiva`;
    if (btnSubmitForm) btnSubmitForm.textContent = "Guardar Actividad";
    if (btnCancelarEdicion) btnCancelarEdicion.classList.add("hidden");
}

function abrirFormularioNuevo() {
    if (!esUsuarioAdmin) {
        alert("Atención: Solo los administradores pueden publicar actividades deportivas.");
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
        const categoria = document.getElementById("form-categoria")?.value || "Competencias";
        const horario = document.getElementById("form-horario")?.value.trim() || null;
        const imagenUrlInput = document.getElementById("form-imagen-url")?.value.trim() || null;
        const fileInput = document.getElementById("form-archivo-imagen");
        const file = fileInput && fileInput.files[0] ? fileInput.files[0] : null;
        const descripcion = document.getElementById("form-descripcion")?.value.trim();
        const idEditar = formIdDeporte ? formIdDeporte.value : null;

        if (!titulo || !descripcion) {
            alert("Por favor completá el título y la descripción de la actividad.");
            return;
        }

        const btnSubmit = btnSubmitForm || formulario.querySelector(".btn-submit");
        const textoOriginal = btnSubmit ? btnSubmit.textContent : "Guardar";
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = "Guardando en Supabase...";
        }

        try {
            let imagen_url = imagenUrlInput;
            if (file) {
                try {
                    imagen_url = await subirImagen(file);
                } catch (subidaErr) {
                    alert(`Error al subir la imagen: ${subidaErr.message}`);
                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        btnSubmit.textContent = textoOriginal;
                    }
                    return;
                }
            }

            const payload = {
                titulo,
                descripcion,
                categoria,
                horario
            };
            if (imagen_url) {
                payload.imagen_url = imagen_url;
            }

            if (idEditar) {
                // Modo EDICIÓN
                const { error } = await supabase
                    .from(TABLA)
                    .update(payload)
                    .eq("id", idEditar);

                if (error) {
                    console.error("Error al actualizar actividad deportiva:", error);
                    alert(`No se pudo actualizar la actividad: ${error.message}`);
                } else {
                    limpiarFormulario();
                    if (seccionFormulario) seccionFormulario.classList.add("hidden");
                    await cargarActividades();
                }
            } else {
                // Modo CREACIÓN
                const { error } = await supabase
                    .from(TABLA)
                    .insert(payload);

                if (error) {
                    console.error("Error al insertar actividad deportiva:", error);
                    alert(`No se pudo publicar la actividad: ${error.message}`);
                } else {
                    limpiarFormulario();
                    if (seccionFormulario) seccionFormulario.classList.add("hidden");
                    await cargarActividades();
                }
            }
        } catch (ex) {
            console.error("Excepción en el formulario de Deportes:", ex);
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
function editarDeporte(id) {
    if (!esUsuarioAdmin) {
        alert("Atención: Solo los administradores pueden editar actividades.");
        return;
    }

    const ev = actividades.find(x => String(x.id) === String(id));
    if (!ev) return;

    if (formIdDeporte) formIdDeporte.value = ev.id;
    const inputTitulo = document.getElementById("form-titulo");
    const inputCategoria = document.getElementById("form-categoria");
    const inputHorario = document.getElementById("form-horario");
    const inputImagenUrl = document.getElementById("form-imagen-url");
    const inputDescripcion = document.getElementById("form-descripcion");

    if (inputTitulo) inputTitulo.value = ev.titulo || "";
    if (inputCategoria) inputCategoria.value = ev.categoria || "Competencias";
    if (inputHorario) inputHorario.value = ev.horario || "";
    if (inputImagenUrl) inputImagenUrl.value = ev.imagen_url || "";
    if (inputDescripcion) inputDescripcion.value = ev.descripcion || "";

    if (formTituloModo) formTituloModo.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editar Actividad Deportiva`;
    if (btnSubmitForm) btnSubmitForm.textContent = "Guardar Cambios";
    if (btnCancelarEdicion) btnCancelarEdicion.classList.remove("hidden");

    if (seccionFormulario) {
        seccionFormulario.classList.remove("hidden");
        seccionFormulario.scrollIntoView({ behavior: "smooth" });
    }
}

// ============================================================
// ELIMINAR ACTIVIDAD
// ============================================================
async function borrarDeporte(id) {
    if (!esUsuarioAdmin) {
        alert("Atención: Solo los administradores pueden eliminar actividades.");
        return;
    }

    const ev = actividades.find(x => String(x.id) === String(id));
    const nombre = ev ? ev.titulo : "esta actividad";

    if (!confirm(`¿Seguro que deseas eliminar "${nombre}" del sistema? Esta acción no se puede deshacer.`)) {
        return;
    }

    try {
        const { error } = await supabase
            .from(TABLA)
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error al eliminar actividad:", error);
            alert(`No se pudo eliminar de Supabase: ${error.message}`);
            return;
        }

        actividades = actividades.filter(x => String(x.id) !== String(id));
        renderizarTarjetas(actividades);
    } catch (err) {
        console.error("Excepción al borrar actividad deportiva:", err);
        alert(`Ocurrió un error inesperado al intentar borrar: ${err.message}`);
    }
}

// ============================================================
// MODAL LEER MÁS (AMPLIAR TARJETA)
// ============================================================
function abrirModalLeer(id) {
    const ev = actividades.find(x => String(x.id) === String(id));
    if (!ev || !modalUnico) return;

    if (modalTitulo) modalTitulo.textContent = ev.titulo || "Actividad Deportiva";
    if (modalTextoLargo) modalTextoLargo.textContent = ev.descripcion || "";
    if (modalExtra) modalExtra.innerHTML = "";

    if (modalImagen && modalCabecera) {
        if (ev.imagen_url) {
            modalImagen.src = ev.imagen_url;
            modalImagen.classList.remove("hidden");
            modalCabecera.style.backgroundImage = "none";
        } else {
            modalImagen.classList.add("hidden");
            modalCabecera.style.backgroundImage = "linear-gradient(135deg, #15803d, #166534)";
        }
    }

    let extraHTML = "";
    if (ev.categoria) {
        extraHTML += `<span style="font-size:0.9rem; color:var(--text-muted); display:inline-block; margin-right: 15px;"><i class="${iconoPorCategoria(ev.categoria)}"></i> Categoría: <strong>${escaparHTML(ev.categoria)}</strong></span>`;
    }
    if (ev.horario) {
        extraHTML += `<span style="font-size:0.9rem; color:var(--text-muted); display:inline-block;"><i class="fa-regular fa-clock"></i> Horario/Fecha: <strong>${escaparHTML(ev.horario)}</strong></span>`;
    }

    if (modalExtra) {
        modalExtra.innerHTML = extraHTML;
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
        const btnDelete = e.target.closest(".btn-borrar-deporte");
        if (btnDelete) {
            e.preventDefault();
            borrarDeporte(btnDelete.dataset.id);
            return;
        }

        const btnEdit = e.target.closest(".btn-editar-deporte");
        if (btnEdit) {
            e.preventDefault();
            editarDeporte(btnEdit.dataset.id);
            return;
        }

        const btnRead = e.target.closest(".btn-leer-deporte");
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
    await cargarActividades();
});
