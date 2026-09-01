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
            let duracionMinutos = Math.max(30, minFin - minInicio);


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

    // ====================================================
    // LÓGICA ACORDEÓN DESPLEGABLE DE DÍAS (RESPONSIVE)
    // ====================================================
    document.addEventListener("click", (e) => {
        const btnDia = e.target.closest(".dia-header-btn");
        if (!btnDia) return;

        const tarjeta = btnDia.closest(".columna-dia-card");
        const cuerpo = tarjeta.querySelector(".dia-cuerpo");

        if (cuerpo) {
            btnDia.classList.toggle("activo");
            cuerpo.classList.toggle("desplegado");
        }
    });
}

// ====================================================
// EXPORTACIÓN DE HORARIOS A FORMATO PDF
// ====================================================
function exportarHorarioAPDF() {
    const elemento = document.querySelector(".grilla-semanal-container");
    const btnExportar = document.getElementById("btn-exportar-pdf");
    if (!elemento) {
        alert("No se encontró la grilla de horarios para exportar.");
        return;
    }

    if (typeof html2pdf !== "undefined") {
        const nombreArchivo = `Horario_Escuela_PRoA_${cursoActual.replace(/\s+/g, '_')}.pdf`;
        const opciones = {
            margin: [0.3, 0.3, 0.3, 0.3],
            filename: nombreArchivo,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
        };

        const textoOriginal = btnExportar ? btnExportar.innerHTML : "";
        if (btnExportar) {
            btnExportar.disabled = true;
            btnExportar.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generando PDF...`;
        }

        html2pdf().set(opciones).from(elemento).save().then(() => {
            if (btnExportar) {
                btnExportar.disabled = false;
                btnExportar.innerHTML = textoOriginal;
            }
        }).catch(err => {
            console.error("Error exportando PDF con html2pdf:", err);
            if (btnExportar) {
                btnExportar.disabled = false;
                btnExportar.innerHTML = textoOriginal;
            }
            window.print();
        });
    } else {
        window.print();
    }
}
