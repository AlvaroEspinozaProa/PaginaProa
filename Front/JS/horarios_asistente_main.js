import supabase from "./supabase.js";
import { esAdmin, obtenerUsuarioActual, cerrarSesion } from "./auth.js";


let cursoActual = "6° Año";
let esUsuarioAdmin = false;
let usuarioActual = null;
let editandoId = null;
let todosLosEventos = [];


document.addEventListener("DOMContentLoaded", async () => {
    const txtEstado = document.getElementById("txt-usuario-estado");
    const adminAccionesContainer = document.getElementById("admin-acciones-container");
    const btnTogglePanel = document.getElementById("btn-toggle-panel");
    const panelCarga = document.getElementById("panel-carga");
    const btnCerrarPanel = document.getElementById("btn-cerrar-panel");
    const tipoBloqueSelect = document.getElementById("g-tipo-bloque");
    const seccionMateria = document.getElementById("seccion-materia-datos");
    const seccionRecreo = document.getElementById("seccion-recreo-datos");
    const selectTieneProfe = document.getElementById("g-tiene-profe");
    const grupoProfeNombre = document.getElementById("grupo-profe-nombre");
    const grupoHoraFin = document.getElementById("grupo-hora-fin");
    const inputHoraFin = document.getElementById("g-hora-fin");
    const formGuiado = document.getElementById("form-guiado");
    const lblCursoActivo = document.getElementById("lbl-curso-activo");
    const btnLoginLink = document.getElementById("btn-login-link");
    const btnLogout = document.getElementById("btn-logout");


    try {
        usuarioActual = await obtenerUsuarioActual();
        esUsuarioAdmin = await esAdmin();


        if (usuarioActual) {
            const email = usuarioActual.email || "";
            txtEstado.textContent = `Sesión activa: ${email}${esUsuarioAdmin ? " (Admin)" : ""}`;
            if (btnLoginLink) btnLoginLink.classList.add("hidden");
            if (btnLogout) btnLogout.classList.remove("hidden");
            if (esUsuarioAdmin && adminAccionesContainer) adminAccionesContainer.classList.remove("hidden");
            
            // Mostrar botones "+" contextuales si es administrador
            if (esUsuarioAdmin) {
                document.querySelectorAll(".btn-agregar-contextual").forEach(btn => {
                    btn.classList.remove("hidden");
                });
            }
        } else {
            txtEstado.textContent = "Modo Visitante (Solo Lectura)";
            if (btnLoginLink) btnLoginLink.classList.remove("hidden");
            if (btnLogout) btnLogout.classList.add("hidden");
            if (adminAccionesContainer) adminAccionesContainer.classList.add("hidden");
            
            // Ocultar botones "+" contextuales
            document.querySelectorAll(".btn-agregar-contextual").forEach(btn => {
                btn.classList.add("hidden");
            });
        }
    } catch (err) {
        console.error("Error comprobando sesión:", err);
    }


    if (btnLogout) {
        btnLogout.addEventListener("click", async () => {
            await cerrarSesion();
            window.location.reload();
        });
    }

    const btnExportarPdf = document.getElementById("btn-exportar-pdf");
    if (btnExportarPdf) {
        btnExportarPdf.addEventListener("click", () => {
            exportarHorarioAPDF();
        });
    }


    await cargarGrillaProporcional(cursoActual);


    document.querySelectorAll(".btn-curso").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            document.querySelectorAll(".btn-curso").forEach(b => b.classList.remove("active"));
            e.currentTarget.classList.add("active");
            cursoActual = e.currentTarget.getAttribute("data-curso");
            document.getElementById("titulo-curso-actual").textContent = `Horario ${cursoActual}`;
            if (lblCursoActivo) lblCursoActivo.textContent = cursoActual;
            await cargarGrillaProporcional(cursoActual);
        });
    });


    function resetearFormularioCarga() {
        editandoId = null;
        if (formGuiado) formGuiado.reset();
        
        // Restaurar cabecera y botón de guardar del modal
        const modalH3 = document.querySelector("#panel-carga h3");
        if (modalH3) {
            modalH3.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Añadir Bloque para <span id="lbl-curso-activo">${cursoActual}</span>`;
        }
        const btnSubmit = document.querySelector("#form-guiado button[type='submit']");
        if (btnSubmit) {
            btnSubmit.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Guardar Bloque Proporcional`;
        }
        // Re-disparar cambios para esconder/mostrar campos por defecto
        const tipoSelect = document.getElementById("g-tipo-bloque");
        if (tipoSelect) tipoSelect.dispatchEvent(new Event("change"));
    }

    if (btnTogglePanel) {
        btnTogglePanel.addEventListener("click", () => {
            if (panelCarga.classList.contains("hidden")) {
                resetearFormularioCarga();
                panelCarga.classList.remove("hidden");
            } else {
                panelCarga.classList.add("hidden");
            }
        });
    }

    if (btnCerrarPanel) {
        btnCerrarPanel.addEventListener("click", () => {
            const hayNombre = document.getElementById("g-materia-nombre").value.trim() !== "";
            const esEdicion = editandoId !== null;
            if (hayNombre || esEdicion) {
                if (!confirm("¿Deseas descartar los cambios?")) {
                    return;
                }
            }
            resetearFormularioCarga();
            panelCarga.classList.add("hidden");
        });
    }

    // Event listeners para los botones "+" contextuales en las cabeceras de los días
    document.querySelectorAll(".btn-agregar-contextual").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const dia = e.currentTarget.getAttribute("data-dia");
            resetearFormularioCarga();
            
            const selectDia = document.getElementById("g-dia");
            if (selectDia) {
                selectDia.value = dia;
            }
            if (panelCarga) {
                panelCarga.classList.remove("hidden");
            }
        });
    });


    if (tipoBloqueSelect) {
        tipoBloqueSelect.addEventListener("change", (e) => {
            const val = e.target.value;
            const recreoInput = document.getElementById("g-recreo-texto");
            if (val === "materia") {
                seccionMateria.classList.remove("hidden");
                seccionRecreo.classList.add("hidden");
                grupoHoraFin.classList.remove("hidden");
                inputHoraFin.setAttribute("required", "true");
            } else if (val === "recreo" || val === "almuerzo") {
                seccionMateria.classList.add("hidden");
                seccionRecreo.classList.remove("hidden");
                grupoHoraFin.classList.remove("hidden");
                inputHoraFin.setAttribute("required", "true");
                if (recreoInput) recreoInput.value = val === "recreo" ? "RECREO" : "ALMUERZO";
            } else if (val === "ingreso" || val === "salida") {
                seccionMateria.classList.add("hidden");
                seccionRecreo.classList.remove("hidden");
                grupoHoraFin.classList.add("hidden");
                inputHoraFin.removeAttribute("required");
                if (recreoInput) recreoInput.value = val.toUpperCase();
            }
        });
    }


    if (selectTieneProfe) {
        selectTieneProfe.addEventListener("change", (e) => {
            if (e.target.value === "no") grupoProfeNombre.classList.add("hidden");
            else grupoProfeNombre.classList.remove("hidden");
        });
    }


    if (formGuiado) {
        formGuiado.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!esUsuarioAdmin) {
                alert("Solo los administradores pueden añadir bloques.");
                return;
            }


            const dia = document.getElementById("g-dia").value;
            const tipo = document.getElementById("g-tipo-bloque").value;
            const horaInicio = document.getElementById("g-hora-inicio").value;
           
            let horaFin = "";
            let tituloStr = "";
            let profeStr = "";


            if (tipo === "ingreso" || tipo === "salida") {
                horaFin = horaInicio;
                tituloStr = tipo.toUpperCase();
            } else {
                horaFin = document.getElementById("g-hora-fin").value;
                if (tipo === "materia") {
                    const nombreMat = document.getElementById("g-materia-nombre").value.trim();
                    const tieneProfe = document.getElementById("g-tiene-profe").value;
                    if (!nombreMat) { alert("Ingresa el nombre de la materia."); return; }
                    tituloStr = nombreMat;
                    profeStr = tieneProfe === "si" ? (document.getElementById("g-profe-nombre").value.trim().toUpperCase() || "PROFESOR ASIGNADO") : "(Sin Profesor)";
                } else {
                    tituloStr = document.getElementById("g-recreo-texto").value.trim() || tipo.toUpperCase();
                }
            }


            let minInicio = convertirMinutos(horaInicio);
            let minFin = (tipo === "ingreso" || tipo === "salida") ? minInicio + 30 : convertirMinutos(horaFin);

            if (tipo !== "ingreso" && tipo !== "salida") {
                if (!horaFin) {
                    alert("Por favor, ingresa la hora de finalización.");
                    return;
                }
                if (minFin <= minInicio) {
                    alert("La hora de finalización debe ser posterior a la hora de inicio.");
                    return;
                }
            }

            let duracionMinutos = (tipo === "ingreso" || tipo === "salida") ? 30 : (minFin - minInicio);


            // Guardamos el orden exacto con base en los minutos de la hora de inicio (ej: 08:00 = 480 min)
            const nuevoEvento = {
                curso: cursoActual,
                dia,
                hora_inicio: horaInicio,
                hora_fin: (tipo === "ingreso" || tipo === "salida") ? horaInicio : horaFin,
                tipo,
                contenido: JSON.stringify({ titulo: tituloStr, profe: profeStr }),
                orden: minInicio,
                duracion: duracionMinutos
            };


            let resultado;
            if (editandoId) {
                resultado = await supabase
                    .from("horarios_por_curso")
                    .update(nuevoEvento)
                    .eq("id", editandoId);
            } else {
                resultado = await supabase
                    .from("horarios_por_curso")
                    .insert([nuevoEvento]);
            }

            const { error: err } = resultado;
            if (err) {
                alert("Error al guardar: " + err.message);
            } else {
                resetearFormularioCarga();
                panelCarga.classList.add("hidden");
                await cargarGrillaProporcional(cursoActual);
            }
        });
    }
});


function convertirMinutos(hhmm) {
    if (!hhmm) return 0;
    const partes = hhmm.split(":");
    return (parseInt(partes[0]) || 0) * 60 + (parseInt(partes[1]) || 0);
}


// ==========================================================
// RENDERIZADOR CON ORDENAMIENTO CRONOLÓGICO AUTOMÁTICO
// ==========================================================
async function cargarGrillaProporcional(curso) {
    const dias = ["lunes", "martes", "miercoles", "jueves", "viernes"];
    const contenedores = {};


    dias.forEach(d => {
        contenedores[d] = document.getElementById(`bloques-${d}`);
        if (contenedores[d]) {
            contenedores[d].innerHTML = `<p style="text-align:center; color:#94a3b8; font-size:0.85rem; padding:15px;">Cargando...</p>`;
        }
    });


    const { data: eventos, error } = await supabase
        .from("horarios_por_curso")
        .select("*")
        .eq("curso", curso);


    if (error) {
        dias.forEach(d => { if (contenedores[d]) contenedores[d].innerHTML = `<p style="color:#ef4444; font-size:0.85rem; padding:15px;">Error al cargar</p>`; });
        return;
    }

    todosLosEventos = eventos || [];


    dias.forEach(d => { if (contenedores[d]) contenedores[d].innerHTML = ""; });


    if (!eventos || eventos.length === 0) {
        dias.forEach(d => {
            if (contenedores[d]) {
                contenedores[d].innerHTML = `<p style="text-align:center; color:#94a3b8; font-size:0.85rem; padding:15px; margin:0;">Sin actividades</p>`;
            }
        });
        return;
    }


    const eventosPorDia = { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [] };
    eventos.forEach(item => { if (item.dia && eventosPorDia[item.dia]) eventosPorDia[item.dia].push(item); });


    dias.forEach(d => {
        const contenedor = contenedores[d];
        if (!contenedor) return;
        let lista = eventosPorDia[d];


        if (!lista || lista.length === 0) {
            contenedor.innerHTML = `<p style="text-align:center; color:#94a3b8; font-size:0.85rem; padding:15px; margin:0;">Sin actividades</p>`;
            return;
        }


        // ====================================================================
        // ORDENAMIENTO CRONOLÓGICO ESTRICTO AUTOMÁTICO POR HORA DE INICIO
        // ====================================================================
        lista.sort((a, b) => {
            const minA = convertirMinutos(a.hora_inicio);
            const minB = convertirMinutos(b.hora_inicio);
            return minA - minB; // De menor a mayor (ej: 08:00 va antes de 14:00)
        });


        lista.forEach(evento => {
            const card = document.createElement("div");
           
            let claseTipo = "tipo-materia";
            if (evento.tipo === 'ingreso') claseTipo = "tipo-ingreso";
            else if (evento.tipo === 'recreo') claseTipo = "tipo-recreo";
            else if (evento.tipo === 'almuerzo') claseTipo = "tipo-almuerzo";
            else if (evento.tipo === 'salida') claseTipo = "tipo-salida";


            card.className = `bloque-item ${claseTipo}`;


            // Altura proporcional basada en la duración real en minutos
            let minutos = evento.duracion || 60;
            let alturaCss = Math.max(50, Math.round((minutos / 60) * 65));
            card.style.minHeight = `${alturaCss}px`;


            let rangoHorario = evento.hora_inicio;
            if (evento.hora_fin && evento.hora_fin !== evento.hora_inicio) {
                rangoHorario = `${evento.hora_inicio} a ${evento.hora_fin}`;
            }


            let tituloMateria = evento.tipo.toUpperCase();
            let profeTexto = "";


            try {
                const parsed = JSON.parse(evento.contenido);
                tituloMateria = parsed.titulo || evento.tipo.toUpperCase();
                profeTexto = parsed.profe ? `<span style="font-size: 0.8rem; color: #475569; display: block; margin-top: 3px; font-weight: 600;">${parsed.profe}</span>` : "";
            } catch {
                tituloMateria = evento.contenido;
            }


            let accionesHtml = esUsuarioAdmin ? `
                <div class="bloque-acciones">
                    <button class="btn-editar-bloque" data-id="${evento.id}" title="Editar bloque">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-borrar-bloque" data-id="${evento.id}" title="Eliminar bloque">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>` : "";


            card.innerHTML = `
                <div>
                    <span class="hora-etiqueta"><i class="fa-regular fa-clock"></i> ${rangoHorario}</span>
                    ${accionesHtml}
                </div>
                <div class="contenido-texto">
                    <strong style="font-size: 0.95rem; color: #0f172a; display: block; margin-top: 2px;">${tituloMateria}</strong>
                    ${profeTexto}
                </div>
            `;


            contenedor.appendChild(card);
        });
    });


    if (esUsuarioAdmin) {
        // Enlazar eventos de borrado
        document.querySelectorAll(".btn-borrar-bloque").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const idEv = e.currentTarget.getAttribute("data-id");
                if (confirm("¿Estás seguro de eliminar este bloque?")) {
                    const { error: err } = await supabase.from("horarios_por_curso").delete().eq("id", idEv);
                    if (err) alert("Error al eliminar: " + err.message);
                    else await cargarGrillaProporcional(cursoActual);
                }
            });
        });

        // Enlazar eventos de edición
        document.querySelectorAll(".btn-editar-bloque").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const idEv = e.currentTarget.getAttribute("data-id");
                const evento = todosLosEventos.find(ev => ev.id == idEv);
                if (!evento) return;

                // Guardar id que se está editando
                editandoId = evento.id;

                // Rellenar formulario
                document.getElementById("g-dia").value = evento.dia;
                document.getElementById("g-tipo-bloque").value = evento.tipo;
                document.getElementById("g-hora-inicio").value = evento.hora_inicio;
                document.getElementById("g-hora-fin").value = evento.hora_fin;

                // Disparar cambio en tipo para mostrar sección correcta
                document.getElementById("g-tipo-bloque").dispatchEvent(new Event("change"));

                // Rellenar datos específicos del tipo
                if (evento.tipo === "materia") {
                    try {
                        const parsed = JSON.parse(evento.contenido);
                        document.getElementById("g-materia-nombre").value = parsed.titulo || "";
                        if (parsed.profe && parsed.profe !== "(Sin Profesor)") {
                            document.getElementById("g-tiene-profe").value = "si";
                            document.getElementById("g-profe-nombre").value = parsed.profe;
                        } else {
                            document.getElementById("g-tiene-profe").value = "no";
                            document.getElementById("g-profe-nombre").value = "";
                        }
                    } catch {
                        document.getElementById("g-materia-nombre").value = evento.contenido || "";
                        document.getElementById("g-tiene-profe").value = "no";
                        document.getElementById("g-profe-nombre").value = "";
                    }
                    document.getElementById("g-tiene-profe").dispatchEvent(new Event("change"));
                } else if (evento.tipo === "recreo" || evento.tipo === "almuerzo") {
                    try {
                        const parsed = JSON.parse(evento.contenido);
                        document.getElementById("g-recreo-texto").value = parsed.titulo || evento.tipo.toUpperCase();
                    } catch {
                        document.getElementById("g-recreo-texto").value = evento.contenido || evento.tipo.toUpperCase();
                    }
                }

                // Cambiar textos del modal para modo edición
                const modalH3 = document.querySelector("#panel-carga h3");
                if (modalH3) {
                    modalH3.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editar Bloque para <span id="lbl-curso-activo">${cursoActual}</span>`;
                }
                const btnSubmit = document.querySelector("#form-guiado button[type='submit']");
                if (btnSubmit) {
                    btnSubmit.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Actualizar bloque`;
                }

                // Abrir modal
                const panelCarga = document.getElementById("panel-carga");
                if (panelCarga) {
                    panelCarga.classList.remove("hidden");
                }
            });
        });
    }
}

// ====================================================
// EXPORTACIÓN DE HORARIOS A FORMATO PDF (UNA SOLA HOJA ESTRICTA)
// ====================================================
async function exportarHorarioAPDF() {
    const grillaOriginal = document.querySelector(".grilla-semanal-container");
    const btnExportar = document.getElementById("btn-exportar-pdf");
    if (!grillaOriginal) {
        alert("No se encontró la grilla de horarios para exportar.");
        return;
    }

    const textoOriginal = btnExportar ? btnExportar.innerHTML : "";
    if (btnExportar) {
        btnExportar.disabled = true;
        btnExportar.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generando PDF (1 Hoja)...`;
    }

    // 1. Contenedor temporal de exportación con dimensiones fijas de escritorio (1120px)
    // Se posiciona en top: 0, left: 0 en capa oculta para que html2canvas lo capture
    // sin errores de viewport, tanto en celular/móvil como en computadora.
    const exportWrapper = document.createElement("div");
    exportWrapper.id = "pdf-export-wrapper";
    exportWrapper.style.position = "absolute";
    exportWrapper.style.top = "0";
    exportWrapper.style.left = "0";
    exportWrapper.style.width = "1120px";
    exportWrapper.style.backgroundColor = "#ffffff";
    exportWrapper.style.padding = "16px 20px";
    exportWrapper.style.boxSizing = "border-box";
    exportWrapper.style.fontFamily = "'Poppins', system-ui, -apple-system, sans-serif";
    exportWrapper.style.zIndex = "-99999";
    exportWrapper.style.pointerEvents = "none";
    exportWrapper.style.opacity = "1";

    // 2. Encabezado institucional destacado indicando notablemente el CURSO
    const cursoNombre = (cursoActual || "Curso").toUpperCase();
    const headerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0057B8; padding-bottom: 10px; margin-bottom: 12px; background: #ffffff;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="logo.png" style="height: 48px; width: 48px; object-fit: contain;" alt="Logo PRoA" onerror="this.style.display='none'">
                <div>
                    <div style="font-size: 1.2rem; color: #0057B8; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase;">
                        ESCUELA PRoA DESPEÑADEROS
                    </div>
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 600;">
                        Educación Secundaria — Especialidad en Desarrollo de Software
                    </div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="background: #0057B8; color: #ffffff; padding: 6px 18px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,87,184,0.3);">
                    <div style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; font-weight: 700;">CRONOGRAMA SEMANAL OFICIAL</div>
                    <div style="font-size: 1.25rem; font-weight: 900; letter-spacing: 0.5px;">HORARIO ${cursoNombre}</div>
                </div>
            </div>
        </div>
    `;

    // 3. Clonación de la grilla y estandarización a 5 columnas (Lunes a Viernes)
    const grillaClon = grillaOriginal.cloneNode(true);
    grillaClon.style.display = "grid";
    grillaClon.style.gridTemplateColumns = "repeat(5, 1fr)";
    grillaClon.style.gap = "8px";
    grillaClon.style.width = "100%";
    grillaClon.style.margin = "0";

    // 4. Eliminación total de botones de edición, eliminación o adición (+)
    grillaClon.querySelectorAll("button, .btn-agregar-contextual, .bloque-acciones, .btn-editar-bloque, .btn-borrar-bloque, .acciones-bloque").forEach(el => el.remove());

    // 5. Ajuste proporcional y compacto de bloques en el clon para garantizar una sola hoja nítida
    grillaClon.querySelectorAll(".columna-dia-card").forEach(col => {
        col.style.borderRadius = "8px";
        col.style.border = "1.5px solid #cbd5e1";
        col.style.background = "#ffffff";
        col.style.overflow = "hidden";
        col.style.boxShadow = "none";
        col.style.display = "flex";
        col.style.flexDirection = "column";
        col.style.width = "auto";
    });

    grillaClon.querySelectorAll(".encabezado-dia").forEach(hd => {
        hd.style.backgroundColor = "#0f172a";
        hd.style.color = "#ffffff";
        hd.style.padding = "6px 8px";
        hd.style.fontWeight = "800";
        hd.style.fontSize = "0.85rem";
        hd.style.textAlign = "center";
        hd.style.justifyContent = "center";
        hd.style.display = "flex";
        hd.style.textTransform = "uppercase";
    });

    grillaClon.querySelectorAll(".bloques-wrapper").forEach(wrap => {
        wrap.style.padding = "6px";
        wrap.style.gap = "6px";
        wrap.style.background = "#f8fafc";
        wrap.style.display = "flex";
        wrap.style.flexDirection = "column";
    });

    // Ajustar los bloques para que sean compactos, proporcionales y entren en 1 hoja
    grillaClon.querySelectorAll(".bloque-item").forEach(item => {
        item.style.transform = "none";
        item.style.boxShadow = "none";
        item.style.padding = "6px 8px";

        const minHeightActual = parseInt(item.style.minHeight) || 45;
        item.style.minHeight = Math.max(30, Math.min(Math.round(minHeightActual * 0.72), 65)) + "px";

        const badgeHora = item.querySelector(".hora-etiqueta");
        if (badgeHora) {
            badgeHora.style.fontSize = "0.68rem";
            badgeHora.style.padding = "1px 4px";
            badgeHora.style.marginBottom = "3px";
        }

        const texto = item.querySelector(".contenido-texto");
        if (texto) {
            texto.style.fontSize = "0.78rem";
            texto.style.lineHeight = "1.2";
            const strong = texto.querySelector("strong");
            if (strong) strong.style.fontSize = "0.82rem";
            const profe = texto.querySelector("span");
            if (profe) profe.style.fontSize = "0.68rem";
        }
    });

    // 6. Pie de página institucional en el documento
    const footerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 6px; border-top: 1px solid #cbd5e1; font-size: 0.68rem; color: #64748b;">
            <span>Escuela PRoA Despeñaderos — Documento Oficial de Horarios</span>
            <span>Horario correspondiente a: <strong style="color: #0057B8;">${cursoNombre}</strong></span>
        </div>
    `;

    exportWrapper.innerHTML = headerHTML;
    exportWrapper.appendChild(grillaClon);
    exportWrapper.insertAdjacentHTML("beforeend", footerHTML);
    document.body.appendChild(exportWrapper);

    try {
        // Pausa breve para asegurar el renderizado en el DOM
        await new Promise(resolve => setTimeout(resolve, 80));

        // Captura con html2canvas
        const canvas = await html2canvas(exportWrapper, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: "#ffffff",
            width: 1120
        });

        const nombreArchivo = `Horario_Escuela_PRoA_${cursoActual.replace(/\s+/g, '_')}.pdf`;

        // Acceder a jsPDF (soporta window.jsPDF o window.jspdf.jsPDF)
        const JsPdfConstructor = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);

        if (JsPdfConstructor) {
            // A4 Landscape: 297 mm x 210 mm (llamada posicional universal para evitar fallos de versiones)
            const pdf = new JsPdfConstructor('landscape', 'mm', 'a4');

            const anchoPagina = 297;
            const altoPagina = 210;
            const margenX = 8;
            const margenY = 6;
            const anchoDisponible = anchoPagina - margenX * 2; // 281 mm
            const altoDisponible = altoPagina - margenY * 2;   // 198 mm

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratioCanvas = canvasWidth / canvasHeight;
            const ratioDisponible = anchoDisponible / altoDisponible;

            let finalWidth, finalHeight;

            // Escala matemática estricta: NUNCA supera los límites de 1 sola hoja
            if (ratioCanvas >= ratioDisponible) {
                // Ajustado por ancho
                finalWidth = anchoDisponible;
                finalHeight = anchoDisponible / ratioCanvas;
            } else {
                // Ajustado por alto (cuando hay muchos bloques en el día)
                finalHeight = altoDisponible;
                finalWidth = altoDisponible * ratioCanvas;
            }

            // Centrado en la hoja
            const posX = margenX + (anchoDisponible - finalWidth) / 2;
            const posY = margenY + (altoDisponible - finalHeight) / 2;

            const imgData = canvas.toDataURL("image/jpeg", 0.98);
            pdf.addImage(imgData, "JPEG", posX, posY, finalWidth, finalHeight);
            pdf.save(nombreArchivo);
        } else if (typeof html2pdf !== "undefined") {
            // Fallback con html2pdf sobre el elemento clonado
            const opcionesFallback = {
                margin: [6, 8, 6, 8],
                filename: nombreArchivo,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
                pagebreak: { mode: [] }
            };
            await html2pdf().set(opcionesFallback).from(exportWrapper).save();
        } else {
            console.warn("Librería PDF no disponible");
        }
    } catch (err) {
        console.error("Error al exportar horario a PDF:", err);
        // Fallback secundario silencioso con html2pdf si el primer método fallara
        try {
            if (typeof html2pdf !== "undefined") {
                const nombreArchivo = `Horario_Escuela_PRoA_${cursoActual.replace(/\s+/g, '_')}.pdf`;
                await html2pdf().set({
                    margin: [6, 8, 6, 8],
                    filename: nombreArchivo,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 1.5, useCORS: true, backgroundColor: "#ffffff" },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
                    pagebreak: { mode: [] }
                }).from(exportWrapper).save();
            }
        } catch (fallbackErr) {
            console.error("Fallo crítico en exportación PDF:", fallbackErr);
        }
    } finally {
        // Limpieza garantizada del DOM
        if (exportWrapper.parentNode) {
            exportWrapper.parentNode.removeChild(exportWrapper);
        }
        if (btnExportar) {
            btnExportar.disabled = false;
            btnExportar.innerHTML = textoOriginal;
        }
    }
}