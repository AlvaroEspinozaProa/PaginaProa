// Tarjetas iniciales limpias con el degradado azul corporativo por defecto
        const noticiasIniciales = [
            {
                id: 1,
                titulo: "Actualización del Sistema",
                resumen: "Implementamos mejoras críticas de velocidad y estabilidad global en la interfaz.",
                archivoData: "", // Vacío usa el gradiente original
                esImagen: false,
                nombreArchivo: ""
            }
        ];

        let misNoticias = JSON.parse(localStorage.getItem('tablon_uiverse_localfiles')) || noticiasIniciales;

        const contenedor = document.getElementById('contenedor-noticias');
        const formulario = document.getElementById('formulario-noticia');
        const seccionFormulario = document.getElementById('seccion-formulario');
        const btnToggleForm = document.getElementById('btn-toggle-form');

        btnToggleForm.addEventListener('click', () => {
            seccionFormulario.classList.toggle('hidden');
        });

        // FUNCIÓN PRINCIPAL: Dibuja las tarjetas y detecta si es foto o archivo local
        function dibujarTarjetas() {
            contenedor.innerHTML = ""; 
            
            misNoticias.forEach(noticia => {
                let cabeceraTarjetaHTML = "";
                let adjuntoHTML = "";

                // Si el archivo cargado es una imagen, la inserta en la cabecera. Si no, deja el azul corporativo
                if (noticia.archivoData && noticia.esImagen) {
                    cabeceraTarjetaHTML = `<div class="tarjeta-cabecera"><img src="${noticia.archivoData}" alt=""></div>`;
                } else {
                    cabeceraTarjetaHTML = `<div class="tarjeta-cabecera"></div>`;
                }

                // Si es un documento adjunto (no imagen), dibuja el botón de descarga en la tarjeta
                if (noticia.archivoData && !noticia.esImagen) {
                    adjuntoHTML = `<a href="${noticia.archivoData}" download="${noticia.nombreArchivo}" class="doc-badge">📁 Descargar: ${noticia.nombreArchivo}</a>`;
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
                        <button onclick="abrirNoticiaCompleta(${noticia.id})" type="button" class="btn-read-more">Read More</button>
                        <button onclick="eliminarNoticia(${noticia.id})" type="button" class="btn-delete">Eliminar</button>
                      </div>
                    </div>
                `;
                contenedor.innerHTML += tarjetaHTML
            });
        }

        // PROCESADOR: Lee el formulario y transforma archivos del disco a texto Base64
        formulario.addEventListener('submit', (e) => {
            e.preventDefault();

            const fileInput = document.getElementById('form-archivo');
            const file = fileInput.files[0];

            const nuevaNoticia = {
                id: Date.now(),
                titulo: document.getElementById('form-titulo').value,
                resumen: document.getElementById('form-resumen').value,
                archivoData: "",
                esImagen: false,
                nombreArchivo: "",
                contenidoCompleto: document.getElementById('form-contenido').value
            };

            // Si el usuario subió un archivo, lo procesamos de forma local inmediata
            if (file) {
                const reader = new FileReader();
                nuevaNoticia.nombreArchivo = file.name;
                nuevaNoticia.esImagen = file.type.startsWith('image/');

                reader.onload = function (e) {
                    nuevaNoticia.archivoData = e.target.result; // El archivo convertido a string
                    guardarYRenderizar(nuevaNoticia);
                };
                reader.readAsDataURL(file);
            } else {
                guardarYRenderizar(nuevaNoticia);
            }
        });

        function guardarYRenderizar(nuevaNoticia) {
            misNoticias.unshift(nuevaNoticia);
            try {
                localStorage.setItem('tablon_uiverse_localfiles', JSON.stringify(misNoticias));
            } catch (e) {
                alert("El archivo es demasiado grande para la memoria del navegador. Intenta con un archivo más ligero o una foto optimizada.");
                misNoticias.shift();
                return;
            }
            dibujarTarjetas();
            formulario.reset();
            seccionFormulario.classList.add('hidden');
        }

        window.eliminarNoticia = function(idNoticia) {
            if(confirm("¿Seguro que deseas eliminar esta publicación del sistema?")) {
                misNoticias = misNoticias.filter(n => n.id !== idNoticia);
                localStorage.setItem('tablon_uiverse_localfiles', JSON.stringify(misNoticias));
                dibujarTarjetas();
            }
        }

        window.abrirNoticiaCompleta = function(idNoticia) {
            const modal = document.getElementById('modal-unico');
            const cabecera = document.getElementById('modal-cabecera');
            const img = document.getElementById('modal-imagen');
            const contenedorDescarga = document.getElementById('modal-contenedor-descarga');
            
            const noticia = misNoticias.find(n => n.id === idNoticia);
            if (noticia) {
                document.getElementById('modal-titulo').innerText = noticia.titulo;
                document.getElementById('modal-texto-largo').innerText = noticia.contenidoCompleto;
                contenedorDescarga.innerHTML = ""; // Limpiamos descargas anteriores
                
                if (noticia.archivoData && noticia.esImagen) {
                    img.src = noticia.archivoData;
                    img.classList.remove('hidden');
                    cabecera.style.backgroundImage = "none";
                } else {
                    img.classList.add('hidden');
                    cabecera.style.backgroundImage = "linear-gradient(to right, #3b82f6, #2563eb)";
                }

                if (noticia.archivoData && !noticia.esImagen) {
                    contenedorDescarga.innerHTML = `<a href="${noticia.archivoData}" download="${noticia.nombreArchivo}" class="doc-badge" style="margin-top:0;">📁 Guardar adjunto: ${noticia.nombreArchivo}</a>`;
                }
                
                modal.classList.remove('hidden');
                modal.style.display = "flex";
            }
        }

        document.getElementById('cerrar-modal').addEventListener('click', () => {
            document.getElementById('modal-unico').style.display = "none";
        });
        document.getElementById('modal-unico').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal-unico')) {
                document.getElementById('modal-unico').style.display = "none";
            }
        });

        document.addEventListener("DOMContentLoaded", dibujarTarjetas);