import { obtenerNoticias, publicarNoticia, eliminarNoticia } from "./tablon.js";

const contenedor = document.getElementById('contenedor-noticias');
const formulario = document.getElementById('formulario-noticia');
const seccionFormulario = document.getElementById('seccion-formulario');
const btnToggleForm = document.getElementById('btn-toggle-form');

let misNoticias = [];

// Mostrar / Ocultar formulario
btnToggleForm.addEventListener('click', () => {
    seccionFormulario.classList.toggle('hidden');
});

// Función auxiliar: Detecta si la URL guardada en Supabase pertenece a una imagen
function esImagenURL(url) {
    if (!url) return false;
    const extensionesImagen = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
    const urlLimpia = url.split('?')[0].toLowerCase();
    return extensionesImagen.some(ext => urlLimpia.endsWith(ext));
}

// Función auxiliar: Extrae un nombre de archivo legible desde la URL de Supabase
function obtenerNombreArchivo(url) {
    if (!url) return "Archivo adjunto";
    const parteFinal = url.split('/').pop();
    // Remueve el prefijo de fecha (Date.now() + "_") si existe
    return parteFinal.includes('_') ? parteFinal.split('_').slice(1).join('_') : parteFinal;
}

// ====================================================
// CARGAR Y DIBUJAR NOTICIAS DESDE SUPABASE
// ====================================================
async function cargarYDibujarNoticias() {
    contenedor.innerHTML = "<p style='text-align:center; grid-column: 1 / -1; color:#64748b;'>Cargando novedades...</p>";
    
    misNoticias = await obtenerNoticias();

    if (!misNoticias || misNoticias.length === 0) {
        contenedor.innerHTML = "<p style='text-align:center; grid-column: 1 / -1; color:#64748b;'>No hay noticias publicadas aún.</p>";
        return;
    }

    dibujarTarjetas();
}

function dibujarTarjetas() {
    contenedor.innerHTML = ""; 
    
    misNoticias.forEach(noticia => {
        let cabeceraTarjetaHTML = "";
        let adjuntoHTML = "";

        const esImagen = esImagenURL(noticia.archivo_url);
        const nombreArchivo = obtenerNombreArchivo(noticia.archivo_url);

        // Cabecera con imagen o degradado por defecto
        if (noticia.archivo_url && esImagen) {
            cabeceraTarjetaHTML = `<div class="tarjeta-cabecera"><img src="${noticia.archivo_url}" alt="${noticia.titulo}"></div>`;
        } else {
            cabeceraTarjetaHTML = `<div class="tarjeta-cabecera"></div>`;
        }

        // Botón de descarga si es un PDF o documento
        if (noticia.archivo_url && !esImagen) {
            adjuntoHTML = `<a href="${noticia.archivo_url}" target="_blank" download="${nombreArchivo}" class="doc-badge">📁 Descargar: ${nombreArchivo}</a>`;
        }

        const tarjetaHTML = `
            <div class="tarjeta-uiverse">
              ${cabeceraTarjetaHTML}
              <div class="tarjeta-cuerpo">
                <h5>${noticia.titulo}</h5>
                <p>${noticia.resumen}</p>
                ${adjuntoHTML}
              </div>
              <div class="tarjeta-acciones">
                <button onclick="abrirNoticiaCompleta('${noticia.id}')" type="button" class="btn-read-more">Leer Más</button>
                <button onclick="borrarNoticia('${noticia.id}')" type="button" class="btn-delete">Eliminar</button>
              </div>
            </div>
        `;
        contenedor.innerHTML += tarjetaHTML;
    });
}

// ====================================================
// FORMULARIO: PUBLICAR NOTICIA A SUPABASE
// ====================================================
formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btnSubmit = formulario.querySelector('.btn-submit');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Publicando...";

    const fileInput = document.getElementById('form-archivo');
    const file = fileInput.files[0] || null;

    const exito = await publicarNoticia({
        titulo: document.getElementById('form-titulo').value.trim(),
        resumen: document.getElementById('form-resumen').value.trim(),
        contenido: document.getElementById('form-contenido').value.trim(),
        archivo: file
    });

    btnSubmit.disabled = false;
    btnSubmit.textContent = textoOriginal;

    if (exito) {
        formulario.reset();
        seccionFormulario.classList.add('hidden');
        await cargarYDibujarNoticias(); // Recarga las noticias de Supabase
    } else {
        alert("Ocurrió un error al publicar la noticia en Supabase.");
    }
});

// ====================================================
// ELIMINAR NOTICIA
// ====================================================
window.borrarNoticia = async function(idNoticia) {
    if (confirm("¿Seguro que deseas eliminar esta publicación del sistema?")) {
        const exito = await eliminarNoticia(idNoticia);
        if (exito) {
            await cargarYDibujarNoticias();
        } else {
            alert("No se pudo eliminar la noticia.");
        }
    }
}

// ====================================================
// ABRIR VENTANA EMERGENTE (MODAL)
// ====================================================
window.abrirNoticiaCompleta = function(idNoticia) {
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
            contenedorDescarga.innerHTML = `<a href="${noticia.archivo_url}" target="_blank" download="${nombreArchivo}" class="doc-badge" style="margin-top:0;">📁 Guardar adjunto: ${nombreArchivo}</a>`;
        }
        
        modal.classList.remove('hidden');
        modal.style.display = "flex";
    }
}

// Eventos de cierre de modal
document.getElementById('cerrar-modal').addEventListener('click', () => {
    document.getElementById('modal-unico').style.display = "none";
});
document.getElementById('modal-unico').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-unico')) {
        document.getElementById('modal-unico').style.display = "none";
    }
});

// Cargar noticias al iniciar la página
document.addEventListener("DOMContentLoaded", cargarYDibujarNoticias);