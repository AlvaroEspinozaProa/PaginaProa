// ============================================================
// proyectos.js — CRUD completo y visualización para Proyectos
// Tabla Supabase: 'proyectos'
// Columnas: id, titulo, descripcion, autor, estado, link_repositorio, imagen_url, created_at
// ============================================================
import supabase from "./supabase.js";
import { obtenerUsuarioActual, esAdmin, obtenerPerfil, cerrarSesion } from "./auth.js";

const TABLA = "proyectos";
const BUCKET = "adjuntos_noticias";

// Referencias al DOM
const contenedor = document.getElementById("contenedor-proyectos");
const seccionFormulario = document.getElementById("seccion-formulario");
const formulario = document.getElementById("formulario-proyecto");
const btnToggleForm = document.getElementById("btn-toggle-form");
const formTituloModo = document.getElementById("form-titulo-modo");
const formIdProyecto = document.getElementById("form-id-proyecto");
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

let proyectos = [];
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

function badgePorEstado(estado) {
    const mapa = {
        "En desarrollo": { icon: "fa-solid fa-code", color: "#7c3aed" },
        "Completado": { icon: "fa-solid fa-circle-check", color: "#15803d" },
        "Pausado": { icon: "fa-solid fa-pause", color: "#b45309" },
        "Propuesta": { icon: "fa-regular fa-lightbulb", color: "#0077cc" }
    };
    const cfg = mapa[estado] || { icon: "fa-solid fa-diagram-project", color: "#64748b" };
    return `<span class="badge-tag" style="background:${cfg.color}15;color:${cfg.color};border:1px solid ${cfg.color}40;">
        <i class="${cfg.icon}"></i> ${escaparHTML(estado || "Sin estado")}
    </span>`;
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

    const nombreArchivo = `proy_${Date.now()}_${nombreLimpio}`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(nombreArchivo, file, { cacheControl: "3600", upsert: false });

    if (error) {
        console.error("Error al subir imagen a Storage:", error);
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
        console.error("Error al inicializar sesión en Proyectos:", err);
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
// CARGA Y RENDERIZADO DE PROYECTOS DESDE SUPABASE
// ============================================================
async function cargarProyectos() {
    if (!contenedor) return;

    contenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted);">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary); margin-bottom: 10px;"></i>
        <p>Cargando proyectos...</p>
    </div>`;

    try {
        const { data, error } = await supabase
            .from(TABLA)
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            console.error("Error al cargar proyectos:", error);
            contenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #ef4444;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 12px;"></i>
                <p>No se pudieron cargar los proyectos: ${escaparHTML(error.message)}</p>
            </div>`;
            return;
        }

        proyectos = data || [];
        renderizarTarjetas(proyectos);
    } catch (err) {
        console.error("Excepción al cargar proyectos:", err);
        contenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #ef4444;">
            <p>Ocurrió un error inesperado al consultar los proyectos.</p>
        </div>`;
    }
}

function renderizarTarjetas(lista = proyectos) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: var(--text-muted);">
            <i class="fa-solid fa-code-branch" style="font-size: 2.8rem; margin-bottom: 12px; color: var(--primary);"></i>
            <p style="font-size: 1.05rem;">No hay proyectos registrados en la plataforma aún.</p>
            ${esUsuarioAdmin ? '<p style="font-size: 0.85rem; margin-top: 6px;">Hacé clic en "Publicar Nuevo Proyecto" para agregar el primero.</p>' : ''}
        </div>`;
        return;
    }

    const html = lista.map(p => {
        let cabeceraHTML = "";
        if (p.imagen_url) {
            cabeceraHTML = `<div class="tarjeta-cabecera"><img src="${p.imagen_url}" alt="${escaparHTML(p.titulo)}" loading="lazy" onerror="this.parentElement.style.background='linear-gradient(135deg, #7c3aed, #5b21b6)'; this.style.display='none';"></div>`;
        } else {
            cabeceraHTML = `<div class="tarjeta-cabecera" style="background: linear-gradient(135deg, #7c3aed, #5b21b6);"></div>`;
        }

        const badge = badgePorEstado(p.estado);
        const autorHTML = p.autor
            ? `<span style="font-size:0.8rem; color:var(--text-muted); float:right;"><i class="fa-solid fa-user"></i> ${escaparHTML(p.autor)}</span>`
            : "";

        let repoLinkHTML = "";
        if (p.link_repositorio) {
            repoLinkHTML = `<a href="${p.link_repositorio}" target="_blank" rel="noopener" class="doc-badge" style="margin-top:8px; display:inline-block;"><i class="fa-brands fa-github"></i> Ver Enlace / Repositorio</a>`;
        }

        let botonesAdminHTML = "";
        if (esUsuarioAdmin) {
            botonesAdminHTML = `
                <div style="display: flex; gap: 4px;">
                    <button data-id="${p.id}" type="button" class="btn-edit btn-editar-proyecto" title="Editar"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button data-id="${p.id}" type="button" class="btn-delete btn-borrar-proyecto" title="Eliminar"><i class="fa-solid fa-trash"></i> Eliminar</button>
                </div>
            `;
        }

        const descripcionPlana = p.descripcion || "";
        const resumenCorto = descripcionPlana.length > 160 ? descripcionPlana.substring(0, 160) + "..." : descripcionPlana;

        return `
            <div class="tarjeta-uiverse" id="proyecto-tarjeta-${p.id}">
                ${cabeceraHTML}
                <div class="tarjeta-cuerpo">
                    <div style="margin-bottom: 8px; overflow: hidden;">
                        ${badge}
                        ${autorHTML}
                    </div>
                    <h5 style="clear: both; margin-top: 6px;">${escaparHTML(p.titulo)}</h5>
                    <p>${escaparHTML(resumenCorto)}</p>
                    ${repoLinkHTML}
                </div>
                <div class="tarjeta-acciones">
                    <button data-id="${p.id}" type="button" class="btn-read-more btn-leer-proyecto">Leer Más</button>
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
    if (formIdProyecto) formIdProyecto.value = "";
    if (formTituloModo) formTituloModo.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Publicar Nuevo Proyecto`;
    if (btnSubmitForm) btnSubmitForm.textContent = "Guardar Proyecto";
    if (btnCancelarEdicion) btnCancelarEdicion.classList.add("hidden");
}

function abrirFormularioNuevo() {
    if (!esUsuarioAdmin) {
        alert("Atención: Solo los administradores pueden publicar proyectos.");
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
        const estado = document.getElementById("form-estado")?.value || "En desarrollo";
        const autor = document.getElementById("form-autor")?.value.trim() || null;
        const link = document.getElementById("form-link")?.value.trim() || null;
        const imagenUrlInput = document.getElementById("form-imagen-url")?.value.trim() || null;
        const fileInput = document.getElementById("form-archivo-imagen");
        const file = fileInput && fileInput.files[0] ? fileInput.files[0] : null;
        const descripcion = document.getElementById("form-descripcion")?.value.trim();
        const idEditar = formIdProyecto ? formIdProyecto.value : null;

        if (!titulo || !descripcion) {
            alert("Por favor completá el título y la descripción del proyecto.");
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
                estado,
                autor,
                link_repositorio: link
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
                    console.error("Error al actualizar proyecto:", error);
                    alert(`No se pudo actualizar el proyecto: ${error.message}`);
                } else {
                    limpiarFormulario();
                    if (seccionFormulario) seccionFormulario.classList.add("hidden");
                    await cargarProyectos();
                }
            } else {
                // Modo CREACIÓN
                const { error } = await supabase
                    .from(TABLA)
                    .insert(payload);

                if (error) {
                    console.error("Error al insertar proyecto:", error);
                    alert(`No se pudo publicar el proyecto: ${error.message}`);
                } else {
                    limpiarFormulario();
                    if (seccionFormulario) seccionFormulario.classList.add("hidden");
                    await cargarProyectos();
                }
            }
        } catch (ex) {
            console.error("Excepción en el formulario de Proyectos:", ex);
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
function editarProyecto(id) {
    if (!esUsuarioAdmin) {
        alert("Atención: Solo los administradores pueden editar proyectos.");
        return;
    }

    const p = proyectos.find(x => String(x.id) === String(id));
    if (!p) return;

    if (formIdProyecto) formIdProyecto.value = p.id;
    const inputTitulo = document.getElementById("form-titulo");
    const inputEstado = document.getElementById("form-estado");
    const inputAutor = document.getElementById("form-autor");
    const inputLink = document.getElementById("form-link");
    const inputImagenUrl = document.getElementById("form-imagen-url");
    const inputDescripcion = document.getElementById("form-descripcion");

    if (inputTitulo) inputTitulo.value = p.titulo || "";
    if (inputEstado) inputEstado.value = p.estado || "En desarrollo";
    if (inputAutor) inputAutor.value = p.autor || "";
    if (inputLink) inputLink.value = p.link_repositorio || "";
    if (inputImagenUrl) inputImagenUrl.value = p.imagen_url || "";
    if (inputDescripcion) inputDescripcion.value = p.descripcion || "";

    if (formTituloModo) formTituloModo.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editar Proyecto`;
    if (btnSubmitForm) btnSubmitForm.textContent = "Guardar Cambios";
    if (btnCancelarEdicion) btnCancelarEdicion.classList.remove("hidden");

    if (seccionFormulario) {
        seccionFormulario.classList.remove("hidden");
        seccionFormulario.scrollIntoView({ behavior: "smooth" });
    }
}

// ============================================================
// ELIMINAR PROYECTO
// ============================================================
async function borrarProyecto(id) {
    if (!esUsuarioAdmin) {
        alert("Atención: Solo los administradores pueden eliminar proyectos.");
        return;
    }

    const p = proyectos.find(x => String(x.id) === String(id));
    const nombre = p ? p.titulo : "este proyecto";

    if (!confirm(`¿Seguro que deseas eliminar el proyecto "${nombre}" del sistema? Esta acción no se puede deshacer.`)) {
        return;
    }

    try {
        const { error } = await supabase
            .from(TABLA)
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error al eliminar proyecto:", error);
            alert(`No se pudo eliminar de Supabase: ${error.message}`);
            return;
        }

        proyectos = proyectos.filter(x => String(x.id) !== String(id));
        renderizarTarjetas(proyectos);
    } catch (err) {
        console.error("Excepción al borrar proyecto:", err);
        alert(`Ocurrió un error inesperado al intentar borrar: ${err.message}`);
    }
}

// ============================================================
// MODAL LEER MÁS (AMPLIAR TARJETA)
// ============================================================
function abrirModalLeer(id) {
    const p = proyectos.find(x => String(x.id) === String(id));
    if (!p || !modalUnico) return;

    if (modalTitulo) modalTitulo.textContent = p.titulo || "Proyecto Institucional";
    if (modalTextoLargo) modalTextoLargo.textContent = p.descripcion || "";
    if (modalExtra) modalExtra.innerHTML = "";

    if (modalImagen && modalCabecera) {
        if (p.imagen_url) {
            modalImagen.src = p.imagen_url;
            modalImagen.classList.remove("hidden");
            modalCabecera.style.backgroundImage = "none";
        } else {
            modalImagen.classList.add("hidden");
            modalCabecera.style.backgroundImage = "linear-gradient(135deg, #7c3aed, #5b21b6)";
        }
    }

    let extraHTML = "";
    if (p.autor) {
        extraHTML += `<span style="font-size:0.9rem; color:var(--text-muted); display:inline-block; margin-right: 15px;"><i class="fa-solid fa-user"></i> Autor/Equipo: <strong>${escaparHTML(p.autor)}</strong></span>`;
    }
    if (p.estado) {
        extraHTML += `<span style="font-size:0.9rem; color:var(--text-muted); display:inline-block; margin-right: 15px;"><i class="fa-solid fa-code-branch"></i> Estado: <strong>${escaparHTML(p.estado)}</strong></span>`;
    }
    if (p.link_repositorio) {
        extraHTML += `<a href="${p.link_repositorio}" target="_blank" rel="noopener" class="doc-badge" style="margin-top:8px; display:inline-block;"><i class="fa-brands fa-github"></i> Visitar Repositorio / Web</a>`;
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
        const btnDelete = e.target.closest(".btn-borrar-proyecto");
        if (btnDelete) {
            e.preventDefault();
            borrarProyecto(btnDelete.dataset.id);
            return;
        }

        const btnEdit = e.target.closest(".btn-editar-proyecto");
        if (btnEdit) {
            e.preventDefault();
            editarProyecto(btnEdit.dataset.id);
            return;
        }

        const btnRead = e.target.closest(".btn-leer-proyecto");
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
    await cargarProyectos();
});
