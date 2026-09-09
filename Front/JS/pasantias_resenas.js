import {
    obtenerUsuarioActual,
    esAdmin,
    obtenerPerfil
} from "./auth.js";

import {
    obtenerResenasConLikes,
    crearResena,
    actualizarResena,
    eliminarResena,
    toggleLikeResena
} from "./resenas_service.js";

// Estado local del módulo de reseñas
let usuarioActual = null;
let esUsuarioAdmin = false;
let perfilUsuario = null;

let calificacionCrear = 5;
let calificacionEditar = 5;
let listaResenasCache = [];

// ======================================
// 1. INICIALIZACIÓN DEL MÓDULO
// ======================================
export async function inicializarModuloResenas() {
    try {
        usuarioActual = await obtenerUsuarioActual();
        esUsuarioAdmin = await esAdmin();
        
        if (usuarioActual) {
            perfilUsuario = await obtenerPerfil();
        }

        actualizarBarraAccesoSesion();
        configurarStarPickers();
        configurarModales();
        configurarFormularios();
        configurarDelegacionEventosGrid();

        await cargarYRenderizarResenas();
    } catch (err) {
        console.error("Error al inicializar el Módulo de Reseñas:", err);
    }
}

// ======================================
// 2. CONTROL DE BARRA DE ACCESO Y SESIÓN
// ======================================
function actualizarBarraAccesoSesion() {
    const txtEstadoSesion = document.getElementById("txt-resenas-sesion-estado");
    const btnSubirResena = document.getElementById("btn-abrir-modal-resena");
    const avatarPreview = document.getElementById("resena-empresa-avatar-img");
    const inputNombreEmpresa = document.getElementById("resena-empresa-nombre");

    const nombreMostrar = perfilUsuario?.nombre || perfilUsuario?.nombre_empresa || usuarioActual?.email?.split('@')[0] || "Empresa Colaboradora";
    const avatarUrl = perfilUsuario?.avatar_url || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

    if (txtEstadoSesion) {
        if (usuarioActual) {
            const rolBadge = esUsuarioAdmin ? " (Admin)" : "";
            txtEstadoSesion.innerHTML = `<i class="fa-solid fa-building-circle-check"></i> Sesión activa: <strong>${nombreMostrar}</strong>${rolBadge}`;
        } else {
            txtEstadoSesion.innerHTML = `<i class="fa-solid fa-lock"></i> Modo lectura · Inicia sesión para publicar reseñas`;
        }
    }

    if (btnSubirResena) {
        if (usuarioActual) {
            btnSubirResena.classList.remove("hidden");
            btnSubirResena.style.display = "inline-flex";
        } else {
            btnSubirResena.classList.add("hidden");
            btnSubirResena.style.display = "none";
        }
    }

    // Precargar datos fijos en el modal de creación (Read-Only)
    if (inputNombreEmpresa) {
        inputNombreEmpresa.value = nombreMostrar;
    }
    if (avatarPreview) {
        avatarPreview.src = avatarUrl;
    }
}

// ======================================
// 3. CARGA Y RENDERIZADO DINÁMICO DE TARJETAS
// ======================================
export async function cargarYRenderizarResenas() {
    const gridContainer = document.getElementById("resenas-grid");
    if (!gridContainer) return;

    gridContainer.innerHTML = `
        <div class="resenas-loading">
            <i class="fa-solid fa-spinner fa-spin" style="font-size:2rem; color:#0077cc;"></i>
            <p style="margin-top:10px; color:#64748b;">Cargando reseñas de pasantías...</p>
        </div>
    `;

    const userId = usuarioActual ? usuarioActual.id : null;
    listaResenasCache = await obtenerResenasConLikes(userId);

    dibujarTarjetasResenas(listaResenasCache);
}

function dibujarTarjetasResenas(resenas) {
    const gridContainer = document.getElementById("resenas-grid");
    if (!gridContainer) return;

    if (!resenas || resenas.length === 0) {
        gridContainer.innerHTML = `
            <div class="resenas-empty">
                <i class="fa-solid fa-comments" style="font-size: 2.5rem; color: #cbd5e1; margin-bottom: 12px;"></i>
                <h3>Aún no hay reseñas publicadas</h3>
                <p>Sé la primera empresa en compartir la experiencia de pasantías con nuestros estudiantes.</p>
            </div>
        `;
        return;
    }

    let html = "";

    resenas.forEach(r => {
        const fechaFormatted = r.created_at 
            ? new Date(r.created_at).toLocaleDateString("es-AR", {
                day: "numeric",
                month: "long",
                year: "numeric"
            })
            : "Fecha no especificada";

        // Nombre y Foto de la empresa / usuario autor
        const nombreAutor = r.nombre_empresa || "Empresa Colaboradora";
        const avatarImg = r.foto_empresa || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

        const estrellasHtml = generarEstrellasHTML(r.calificacion || 5);
        const meGustaClase = r.user_liked ? "activo" : "";
        const meGustaIcono = r.user_liked ? "fa-solid fa-heart" : "fa-regular fa-heart";

        // Determinar si se muestran los botones de control admin (es admin o el creador de la reseña)
        const puedeEditarOBorrar = esUsuarioAdmin || (usuarioActual && usuarioActual.id === r.user_id);

        // Parsear imágenes (Manejo dinámico: si no hay imagen, no se genera el contenedor)
        const imagenesAdjuntas = obtenerListaImagenes(r.imagen_url);
        const htmlImagenes = generarContenedorImagenesHTML(imagenesAdjuntas);

        html += `
            <article class="resena-card" data-id="${r.id}">
                <header class="resena-card-header">
                    <img src="${avatarImg}" alt="${escaparHTML(nombreAutor)}" class="resena-avatar" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'">
                    <div class="resena-autor-info">
                        <h4 class="resena-empresa-titulo">${escaparHTML(nombreAutor)}</h4>
                        <span class="resena-fecha"><i class="fa-regular fa-calendar-check"></i> ${fechaFormatted}</span>
                    </div>
                    ${puedeEditarOBorrar ? `
                        <div class="resena-admin-acciones">
                            <button type="button" class="resena-btn-admin-edit" data-id="${r.id}" title="Editar Reseña">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button type="button" class="resena-btn-admin-delete" data-id="${r.id}" title="Eliminar Reseña">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    ` : ""}
                </header>

                <div class="resena-calificacion-bar">
                    ${estrellasHtml}
                    <span class="resena-puntaje-num">${r.calificacion || 5}.0 / 5</span>
                </div>

                <p class="resena-comentario-texto">${escaparHTML(r.comentario)}</p>

                ${htmlImagenes}

                <footer class="resena-card-footer">
                    <button type="button" class="resena-btn-like ${meGustaClase}" data-id="${r.id}">
                        <i class="${meGustaIcono}"></i>
                        <span>Me gusta</span>
                        <strong class="resena-like-count">${r.likes_count || 0}</strong>
                    </button>
                </footer>
            </article>
        `;
    });

    gridContainer.innerHTML = html;
}

// Auxiliar para separar imágenes (string único, coma separada o array)
function obtenerListaImagenes(imagenUrl) {
    if (!imagenUrl) return [];
    if (Array.isArray(imagenUrl)) return imagenUrl.filter(Boolean);
    return String(imagenUrl)
        .split(",")
        .map(url => url.trim())
        .filter(url => url.length > 0);
}

// Generar HTML del carrusel/contenedor dinámico de imágenes
function generarContenedorImagenesHTML(imagenes) {
    if (!imagenes || imagenes.length === 0) return "";

    const esMultiples = imagenes.length > 1;
    const claseMultiples = esMultiples ? "resena-carousel-multi" : "";

    let itemsHtml = imagenes.map((url, idx) => `
        <img src="${url}" alt="Foto Pasantía ${idx + 1}" loading="lazy" class="resena-carousel-item" onerror="this.style.display='none'">
    `).join("");

    return `
        <div class="resena-imagen-adjunta ${claseMultiples}">
            <div class="resena-carousel-track">
                ${itemsHtml}
            </div>
            ${esMultiples ? `
                <span class="resena-carousel-badge">
                    <i class="fa-solid fa-images"></i> ${imagenes.length} fotos
                </span>
            ` : ""}
        </div>
    `;
}

// Generar íconos de estrellas visuales (1 a 5)
function generarEstrellasHTML(calificacion) {
    let estrellas = "";
    for (let i = 1; i <= 5; i++) {
        if (i <= calificacion) {
            estrellas += `<i class="fa-solid fa-star estrella-llena"></i>`;
        } else {
            estrellas += `<i class="fa-regular fa-star estrella-vacia"></i>`;
        }
    }
    return `<div class="resena-estrellas-list">${estrellas}</div>`;
}

// ======================================
// 4. SELECTORES INTERACTIVOS DE ESTRELLAS
// ======================================
function configurarStarPickers() {
    // Star picker del Modal Crear
    const estrellasCrear = document.querySelectorAll("#star-picker-crear .star-icon");
    const inputCalificacionCrear = document.getElementById("resena-calificacion");

    estrellasCrear.forEach(star => {
        star.addEventListener("click", () => {
            calificacionCrear = parseInt(star.getAttribute("data-val"));
            if (inputCalificacionCrear) inputCalificacionCrear.value = calificacionCrear;
            actualizarVisualStarPicker(estrellasCrear, calificacionCrear);
        });

        star.addEventListener("mouseenter", () => {
            const val = parseInt(star.getAttribute("data-val"));
            actualizarVisualStarPicker(estrellasCrear, val);
        });
    });

    const pickerCrearBox = document.getElementById("star-picker-crear");
    if (pickerCrearBox) {
        pickerCrearBox.addEventListener("mouseleave", () => {
            actualizarVisualStarPicker(estrellasCrear, calificacionCrear);
        });
    }

    // Star picker del Modal Editar
    const estrellasEditar = document.querySelectorAll("#star-picker-editar .star-icon");
    const inputCalificacionEdit = document.getElementById("resena-edit-calificacion");

    estrellasEditar.forEach(star => {
        star.addEventListener("click", () => {
            calificacionEditar = parseInt(star.getAttribute("data-val"));
            if (inputCalificacionEdit) inputCalificacionEdit.value = calificacionEditar;
            actualizarVisualStarPicker(estrellasEditar, calificacionEditar);
        });

        star.addEventListener("mouseenter", () => {
            const val = parseInt(star.getAttribute("data-val"));
            actualizarVisualStarPicker(estrellasEditar, val);
        });
    });

    const pickerEditarBox = document.getElementById("star-picker-editar");
    if (pickerEditarBox) {
        pickerEditarBox.addEventListener("mouseleave", () => {
            actualizarVisualStarPicker(estrellasEditar, calificacionEditar);
        });
    }
}

function actualizarVisualStarPicker(estrellasNodes, valor) {
    estrellasNodes.forEach(star => {
        const starVal = parseInt(star.getAttribute("data-val"));
        if (starVal <= valor) {
            star.classList.remove("fa-regular", "star-off");
            star.classList.add("fa-solid", "star-on");
        } else {
            star.classList.remove("fa-solid", "star-on");
            star.classList.add("fa-regular", "star-off");
        }
    });
}

// ======================================
// 5. MANEJO DE MODALES
// ======================================
function configurarModales() {
    const modalCrear = document.getElementById("modal-crear-resena");
    const btnAbrirCrear = document.getElementById("btn-abrir-modal-resena");
    const btnCerrarCrear = document.getElementById("btn-cerrar-modal-resena");

    const modalEditar = document.getElementById("modal-editar-resena");
    const btnCerrarEditar = document.getElementById("btn-cerrar-modal-edit-resena");

    if (btnAbrirCrear && modalCrear) {
        btnAbrirCrear.addEventListener("click", () => {
            modalCrear.classList.remove("hidden");
            modalCrear.style.display = "flex";
        });
    }

    if (btnCerrarCrear && modalCrear) {
        btnCerrarCrear.addEventListener("click", () => {
            cerrarModalCrear();
        });
    }

    if (modalCrear) {
        modalCrear.addEventListener("click", (e) => {
            if (e.target === modalCrear) cerrarModalCrear();
        });
    }

    if (btnCerrarEditar && modalEditar) {
        btnCerrarEditar.addEventListener("click", () => {
            cerrarModalEditar();
        });
    }

    if (modalEditar) {
        modalEditar.addEventListener("click", (e) => {
            if (e.target === modalEditar) cerrarModalEditar();
        });
    }
}

function cerrarModalCrear() {
    const modalCrear = document.getElementById("modal-crear-resena");
    const formCrear = document.getElementById("form-crear-resena");
    if (modalCrear) {
        modalCrear.classList.add("hidden");
        modalCrear.style.display = "none";
    }
    if (formCrear) {
        formCrear.reset();
        calificacionCrear = 5;
        const estrellas = document.querySelectorAll("#star-picker-crear .star-icon");
        actualizarVisualStarPicker(estrellas, 5);
    }
}

function cerrarModalEditar() {
    const modalEditar = document.getElementById("modal-editar-resena");
    const formEditar = document.getElementById("form-editar-resena");
    if (modalEditar) {
        modalEditar.classList.add("hidden");
        modalEditar.style.display = "none";
    }
    if (formEditar) formEditar.reset();
}

// ======================================
// 6. ENVÍO DE FORMULARIOS
// ======================================
function configurarFormularios() {
    const formCrear = document.getElementById("form-crear-resena");
    const formEditar = document.getElementById("form-editar-resena");

    // Formulario Crear Reseña
    if (formCrear) {
        formCrear.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (!usuarioActual) {
                alert("Debes iniciar sesión para publicar una reseña.");
                return;
            }

            const btnSubmit = document.getElementById("btn-submit-resena");
            const textoOriginal = btnSubmit.textContent;
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Publicando reseña...`;

            const comentario = document.getElementById("resena-comentario").value;
            const fileInput = document.getElementById("resena-imagen-file");
            const imagenFiles = fileInput && fileInput.files && fileInput.files.length > 0 ? fileInput.files : null;

            const nombreEmpresa = perfilUsuario?.nombre || perfilUsuario?.nombre_empresa || usuarioActual.email.split('@')[0];
            const avatarEmpresa = perfilUsuario?.avatar_url || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

            const resultado = await crearResena({
                empresa_nombre: nombreEmpresa,
                empresa_avatar: avatarEmpresa,
                comentario: comentario,
                calificacion: calificacionCrear,
                imagen_files: imagenFiles,
                user_id: usuarioActual.id
            });

            if (resultado.exito) {
                alert("¡Muchas gracias! Tu reseña ha sido publicada exitosamente.");
                cerrarModalCrear();
                await cargarYRenderizarResenas();
            } else {
                alert("Ocurrió un error al publicar la reseña: " + (resultado.error || "Intente más tarde."));
            }

            btnSubmit.disabled = false;
            btnSubmit.textContent = textoOriginal;
        });
    }

    // Formulario Editar Reseña (Administrador)
    if (formEditar) {
        formEditar.addEventListener("submit", async (e) => {
            e.preventDefault();

            const btnSubmit = document.getElementById("btn-submit-edit-resena");
            const textoOriginal = btnSubmit.textContent;
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando cambios...`;

            const resenaId = document.getElementById("resena-edit-id").value;
            const comentario = document.getElementById("resena-edit-comentario").value;
            const checkEliminarImagen = document.getElementById("resena-edit-eliminar-imagen-check");
            const fileInputEdit = document.getElementById("resena-edit-imagen-file");

            const eliminarImagen = checkEliminarImagen ? checkEliminarImagen.checked : false;
            const nuevasImagenesFiles = fileInputEdit && fileInputEdit.files && fileInputEdit.files.length > 0 ? fileInputEdit.files : null;

            const resenaActual = listaResenasCache.find(r => r.id === resenaId);

            const exito = await actualizarResena(resenaId, {
                comentario: comentario,
                calificacion: calificacionEditar,
                nuevas_imagenes_files: nuevasImagenesFiles,
                eliminar_imagen: eliminarImagen,
                imagen_url_actual: resenaActual?.imagen_url || null
            });

            if (exito) {
                alert("Reseña actualizada correctamente.");
                cerrarModalEditar();
                await cargarYRenderizarResenas();
            } else {
                alert("No se pudo actualizar la reseña. Verifica tus permisos o intenta nuevamente.");
            }

            btnSubmit.disabled = false;
            btnSubmit.textContent = textoOriginal;
        });
    }
}

// ======================================
// 7. DELEGACIÓN GLOBAL DE EVENTOS (Likes, Editar, Borrar)
// ======================================
function configurarDelegacionEventosGrid() {
    const gridContainer = document.getElementById("resenas-grid");
    if (!gridContainer) return;

    gridContainer.addEventListener("click", async (e) => {
        // Botón Me Gusta
        const btnLike = e.target.closest(".resena-btn-like");
        if (btnLike) {
            e.preventDefault();

            if (!usuarioActual) {
                alert("Debes iniciar sesión para dar 'Me gusta' a una reseña.");
                return;
            }

            const resenaId = btnLike.getAttribute("data-id");
            btnLike.disabled = true;

            const res = await toggleLikeResena(resenaId, usuarioActual.id);
            if (res.exito) {
                const icono = btnLike.querySelector("i");
                const countElem = btnLike.querySelector(".resena-like-count");

                if (res.liked) {
                    btnLike.classList.add("activo");
                    if (icono) icono.className = "fa-solid fa-heart";
                } else {
                    btnLike.classList.remove("activo");
                    if (icono) icono.className = "fa-regular fa-heart";
                }

                if (countElem) {
                    countElem.textContent = res.totalLikes !== undefined ? res.totalLikes : 0;
                }
            } else if (res.mensaje) {
                alert(res.mensaje);
            }

            btnLike.disabled = false;
            return;
        }

        // Botón Editar Reseña (Admin)
        const btnEdit = e.target.closest(".resena-btn-admin-edit");
        if (btnEdit) {
            e.preventDefault();
            const resenaId = btnEdit.getAttribute("data-id");
            abrirModalEditar(resenaId);
            return;
        }

        // Botón Eliminar Reseña (Admin)
        const btnDelete = e.target.closest(".resena-btn-admin-delete");
        if (btnDelete) {
            e.preventDefault();
            const resenaId = btnDelete.getAttribute("data-id");
            
            if (confirm("¿Estás seguro de que deseas borrar esta reseña? Esta acción no se puede deshacer.")) {
                btnDelete.disabled = true;
                const exito = await eliminarResena(resenaId);
                if (exito) {
                    await cargarYRenderizarResenas();
                } else {
                    alert("No se pudo eliminar la reseña.");
                    btnDelete.disabled = false;
                }
            }
            return;
        }
    });
}

function abrirModalEditar(resenaId) {
    const resena = listaResenasCache.find(r => r.id === resenaId);
    if (!resena) return;

    const modalEditar = document.getElementById("modal-editar-resena");
    const inputId = document.getElementById("resena-edit-id");
    const inputComentario = document.getElementById("resena-edit-comentario");
    const inputCalificacion = document.getElementById("resena-edit-calificacion");

    const previewBox = document.getElementById("resena-edit-imagen-preview-box");
    const previewImg = document.getElementById("resena-edit-imagen-preview-img");
    const checkEliminar = document.getElementById("resena-edit-eliminar-imagen-check");
    const fileInputEdit = document.getElementById("resena-edit-imagen-file");

    if (inputId) inputId.value = resena.id;
    if (inputComentario) inputComentario.value = resena.comentario;
    
    calificacionEditar = resena.calificacion || 5;
    if (inputCalificacion) inputCalificacion.value = calificacionEditar;

    const estrellasEditar = document.querySelectorAll("#star-picker-editar .star-icon");
    actualizarVisualStarPicker(estrellasEditar, calificacionEditar);

    // Configurar previsualización de imagen adjunta actual
    if (checkEliminar) checkEliminar.checked = false;
    if (fileInputEdit) fileInputEdit.value = "";

    const imagenes = obtenerListaImagenes(resena.imagen_url);
    if (imagenes.length > 0) {
        if (previewImg) previewImg.src = imagenes[0];
        if (previewBox) {
            previewBox.classList.remove("hidden");
            previewBox.style.display = "block";
        }
    } else {
        if (previewBox) {
            previewBox.classList.add("hidden");
            previewBox.style.display = "none";
        }
    }

    if (modalEditar) {
        modalEditar.classList.remove("hidden");
        modalEditar.style.display = "flex";
    }
}

// Auxiliar para escapar texto HTML y prevenir XSS
function escaparHTML(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
