// ====================================================
// SISTEMA DE INTERNACIONALIZACIÓN (i18n) - ESCUELA PROA
// Español (ES) / Inglés (EN)
//
// Cómo funciona:
//  1) `diccionario` + atributos data-i18n  -> textos clave (navbar, home).
//  2) `FRASES` + `REGLAS`                  -> traducen el resto del sitio
//     recorriendo el DOM (texto, placeholder, title, aria-label, alt).
//  3) MutationObserver                     -> traduce lo que generan los
//     scripts después de cargar (tarjetas, tablas, toasts, modales).
//  4) alert() / confirm()                  -> también se traducen.
//  El idioma se guarda en localStorage y el español original se restaura
//  al volver a ES (sin recargar la página).
// ====================================================

export const STORAGE_KEY = "proa_idioma";

// ----------------------------------------------------
// 1. DICCIONARIO POR CLAVES (data-i18n y navbar)
// ----------------------------------------------------
export const diccionario = {
    es: {
        // Navegación Global
        "nav.inicio": "Inicio",
        "nav.novedades": "Novedades",
        "nav.proyectos": "Proyectos",
        "nav.pasantias": "Pasantías",
        "nav.cde": "CDE",
        "nav.deportes": "Deportes",
        "nav.horarios": "Horarios",
        "nav.subtitle": "Innovación en Educación",
        "nav.login": "Iniciar Sesión",
        "nav.perfil": "Mi Perfil",
        "nav.admin": "Panel Admin",
        "nav.logout": "Cerrar Sesión",
        "nav.role_admin": "Administrador",
        "nav.role_estudiante": "Estudiante",
        "nav.role_comun": "Externo",
        "nav.user_menu": "Menú de usuario",
        "nav.active_session": "Sesión activa",
        "nav.open_menu": "Abrir menú de navegación",
        "nav.close_menu": "Cerrar menú de navegación",
        "nav.lang_toggle_title": "Cambiar idioma (Español / Inglés)",
        "nav.lang_toggle_aria": "Alternar idioma de la página entre Español e Inglés",
        "nav.logo_aria": "Página principal Escuela PRoA",

        // Acciones comunes
        "common.loading": "Cargando...",
        "common.search": "Buscar...",
        "common.save": "Guardar",
        "common.cancel": "Cancelar",
        "common.filter": "Filtrar",
        "common.all": "Todos",
        "common.see_more": "Ver más",
        "common.read_more": "Leer más",
        "common.back": "Volver",
        "common.close": "Cerrar",

        // Hero (Inicio)
        "hero.tag": "¿Quiénes somos?",
        "hero.title": "Formación secundaria orientada al desarrollo de software",
        "hero.desc": "Somos una institución comprometida con la formación en desarrollo de software. Creemos firmemente que el respeto, la solidaridad y la innovación son fundamentales tanto en el crecimiento colectivo como en el personal.",
        "hero.btn": "Explorar Secciones",

        // Accesos directos (Inicio)
        "sections.title": "Explorá Nuestro Sitio",
        "sections.desc": "Accedé rápidamente a todas las secciones y novedades de la comunidad educativa.",
        "cards.horarios_title": "Horarios Escolares",
        "cards.horarios_desc": "Consultá el cronograma completo de clases, materias, docentes asignados y recreos por cada año.",
        "cards.horarios_badge": "Ver Horarios ➔",
        "cards.tablon_title": "Tablón de Noticias",
        "cards.tablon_desc": "Enterate de los avisos importantes, cronogramas, circulares y últimas novedades publicadas.",
        "cards.tablon_badge": "Ir al Tablón ➔",
        "cards.proyectos_title": "Proyectos",
        "cards.proyectos_desc": "Conocé los desarrollos de software, prototipos de hardware y trabajos tecnológicos creados por los alumnos.",
        "cards.proyectos_badge": "Ver Proyectos ➔",
        "cards.pasantias_title": "Pasantías",
        "cards.pasantias_desc": "Información sobre experiencias profesionales, prácticas profesionalizantes y vinculación laboral.",
        "cards.pasantias_badge": "Ver Pasantías ➔",
        "cards.cde_title": "Centro de Estudiantes",
        "cards.cde_desc": "Espacio de representación estudiantil, actividades, propuestas y comunicación del CDE.",
        "cards.cde_badge": "Visitar CDE ➔",

        // Formación PRoA
        "formacion.title": "Formación PRoA",
        "formacion.desc": "Brindamos una propuesta educativa innovadora que se adapta a los desafíos del mundo profesional moderno.",
        "formacion.c1_title": "Tecnología y Desarrollo",
        "formacion.c1_desc": "Promovemos el pensamiento lógico y la resolución de problemas en Programación, Desarrollo y Taller de Inglés Aplicado (TIA), llevando las ideas a la práctica con proyectos reales de automatización y robótica.",
        "formacion.c2_title": "Espacios de Interés",
        "formacion.c2_desc": "Hacemos un fuerte enfoque en el crecimiento personal de los estudiantes, incorporando espacios donde pueden desarrollar sus pasiones, como el Club de Ciencias, el Club de Arte y el Club de Deporte.",
        "formacion.c3_title": "Compromiso Educativo",
        "formacion.c3_desc": "El equilibrio entre la tecnología, el conocimiento y la ciudadanía es nuestro eje central. Asumimos la responsabilidad de formar estudiantes autónomos, con pensamiento crítico y responsabilidad social.",

        // Historia
        "historia.title": "¿Cómo comenzó?",
        "historia.p1": "El programa PRoA fue lanzado en 2014 por la provincia de Córdoba como una iniciativa innovadora orientada a las tecnologías de información y comunicación (TICs), con especialidades en Desarrollo de Software o Biotecnología.",
        "historia.p2": "Nuestras clases comenzaron en 2019 utilizando instalaciones provisionales. Tras mucho esfuerzo y crecimiento, en mayo de 2021 comenzó la construcción de nuestro edificio propio, inaugurándose finalmente con mucho orgullo en junio de 2022.",

        // Preguntas frecuentes (encabezado)
        "faq.tag": "Ayuda para familias",
        "faq.title": "¿Tenés alguna pregunta?",
        "faq.desc": "Encontrá rápidamente información sobre inscripción, preceptoría, documentación y trámites escolares.",

        // Estadísticas
        "stats.title": "Nuestra Comunidad en Números",
        "stats.desc": "Acompañamos el crecimiento constante de nuestros estudiantes desde 2019.",
        "stats.b1": "Inauguración Edificio",
        "stats.b2": "Estudiantes",
        "stats.b3": "Clubes Estudiantiles",

        // Mapa y Footer
        "map.title": "Cómo llegar",
        "map.desc": "Visitá nuestras instalaciones en Despeñaderos, Córdoba.",
        "footer.email_label": "Email Oficial",
        "footer.location_label": "Ubicación",
        "footer.location_val": "Despeñaderos, Córdoba",
        "footer.copy": "© 2026 Escuela PRoA - Desarrollado por los alumnos."
    },
    en: {
        // Global Navigation
        "nav.inicio": "Home",
        "nav.novedades": "News",
        "nav.proyectos": "Projects",
        "nav.pasantias": "Internships",
        "nav.cde": "CDE",
        "nav.deportes": "Sports",
        "nav.horarios": "Schedules",
        "nav.subtitle": "Innovation in Education",
        "nav.login": "Log In",
        "nav.perfil": "My Profile",
        "nav.admin": "Admin Panel",
        "nav.logout": "Log Out",
        "nav.role_admin": "Administrator",
        "nav.role_estudiante": "Student",
        "nav.role_comun": "Guest",
        "nav.user_menu": "User menu",
        "nav.active_session": "Active session",
        "nav.open_menu": "Open navigation menu",
        "nav.close_menu": "Close navigation menu",
        "nav.lang_toggle_title": "Change language (Spanish / English)",
        "nav.lang_toggle_aria": "Toggle page language between Spanish and English",
        "nav.logo_aria": "Escuela PRoA Homepage",

        // Common Actions
        "common.loading": "Loading...",
        "common.search": "Search...",
        "common.save": "Save",
        "common.cancel": "Cancel",
        "common.filter": "Filter",
        "common.all": "All",
        "common.see_more": "See more",
        "common.read_more": "Read more",
        "common.back": "Back",
        "common.close": "Close",

        // Hero
        "hero.tag": "Who are we?",
        "hero.title": "Secondary education focused on software development",
        "hero.desc": "We are an institution committed to education in software development. We firmly believe that respect, solidarity, and innovation are fundamental in both collective and personal growth.",
        "hero.btn": "Explore Sections",

        // Quick Shortcuts
        "sections.title": "Explore Our Site",
        "sections.desc": "Quickly access all sections and news from the educational community.",
        "cards.horarios_title": "School Schedules",
        "cards.horarios_desc": "Check the complete schedule of classes, subjects, assigned teachers, and breaks for each year.",
        "cards.horarios_badge": "View Schedules ➔",
        "cards.tablon_title": "News Board",
        "cards.tablon_desc": "Stay informed about important announcements, schedules, circulars, and latest news.",
        "cards.tablon_badge": "Go to Board ➔",
        "cards.proyectos_title": "Projects",
        "cards.proyectos_desc": "Discover software developments, hardware prototypes, and technology projects created by students.",
        "cards.proyectos_badge": "View Projects ➔",
        "cards.pasantias_title": "Internships",
        "cards.pasantias_desc": "Information on professional internships, career training, and industry connections.",
        "cards.pasantias_badge": "View Internships ➔",
        "cards.cde_title": "Student Council",
        "cards.cde_desc": "Space for student representation, activities, proposals, and student council communications.",
        "cards.cde_badge": "Visit CDE ➔",

        // PRoA Education
        "formacion.title": "PRoA Education",
        "formacion.desc": "We provide an innovative educational approach adapted to the challenges of the modern professional world.",
        "formacion.c1_title": "Technology & Development",
        "formacion.c1_desc": "We foster logical thinking and problem solving in Programming, Development, and Applied English Workshop (TIA), putting ideas into practice with real automation and robotics projects.",
        "formacion.c2_title": "Areas of Interest",
        "formacion.c2_desc": "We place a strong focus on students' personal growth, incorporating spaces where they can pursue their passions, such as the Science Club, Art Club, and Sports Club.",
        "formacion.c3_title": "Educational Commitment",
        "formacion.c3_desc": "The balance between technology, knowledge, and citizenship is our central pillar. We take responsibility for educating autonomous students with critical thinking and social responsibility.",

        // History
        "historia.title": "How did it begin?",
        "historia.p1": "The PRoA program was launched in 2014 by the province of Córdoba as an innovative initiative focused on Information and Communication Technologies (ICTs), with specializations in Software Development or Biotechnology.",
        "historia.p2": "Our classes began in 2019 using temporary facilities. After much effort and growth, construction of our own building started in May 2021, proudly opening in June 2022.",

        // FAQ header
        "faq.tag": "Help for families",
        "faq.title": "Do you have any questions?",
        "faq.desc": "Quickly find information about enrollment, preceptorship, documentation, and school procedures.",

        // Statistics
        "stats.title": "Our Community in Numbers",
        "stats.desc": "We accompany the constant growth of our students since 2019.",
        "stats.b1": "Building Inauguration",
        "stats.b2": "Students",
        "stats.b3": "Student Clubs",

        // Map and Footer
        "map.title": "How to get here",
        "map.desc": "Visit our facilities in Despeñaderos, Córdoba.",
        "footer.email_label": "Official Email",
        "footer.location_label": "Location",
        "footer.location_val": "Despeñaderos, Córdoba",
        "footer.copy": "© 2026 Escuela PRoA - Developed by students."
    }
};

// ----------------------------------------------------
// 2. FRASES EXACTAS (ES -> EN) para el resto del sitio
//    Se comparan con el texto ya "compactado" (espacios simples).
// ----------------------------------------------------
export const FRASES = {
    // ---------- Global / header / footer ----------
    "Verificando sesión...": "Checking session...",
    "Navegación principal": "Main navigation",
    "Logo Escuela PRoA": "Escuela PRoA logo",
    "Logo PRoA": "PRoA logo",
    "Foto de perfil": "Profile picture",
    "Cargando...": "Loading...",
    "Cerrar": "Close",
    "Cancelar": "Cancel",
    "Guardar": "Save",
    "Email Oficial": "Official Email",
    "Ubicación": "Location",
    "© 2026 Escuela PRoA - Desarrollado por los alumnos.": "© 2026 Escuela PRoA - Developed by students.",
    "Innovación en Educación": "Innovation in Education",

    // ---------- Barra de sesión ----------
    "Cargando estado de usuario...": "Loading user status...",
    "Modo lectura": "Read-only mode",
    "Modo Visitante (Solo Lectura)": "Guest mode (read-only)",
    "Sesión activa:": "Active session:",
    "Nueva Publicación CDE": "New CDE Post",
    "Mi Perfil": "My Profile",
    "Iniciar Sesión": "Log In",
    "Cerrar Sesión": "Log Out",
    "Nueva Actividad Deportiva": "New Sports Activity",
    "Publicar Nuevo Proyecto": "Publish New Project",
    "Ver Horarios": "View Schedules",
    "Publicar Nueva Noticia": "Publish New Post",
    "Exportar PDF": "Export PDF",
    "Exportar horario actual a PDF": "Export current schedule to PDF",
    "Añadir Bloque Proporcional": "Add Proportional Block",
    "Iniciar Sesión (Admin)": "Log In (Admin)",

    // ---------- Títulos de página ----------
    "Inicio": "Home",
    "Tablón de Novedades Oficial": "Official News Board",
    "Proyectos Tecnológicos": "Technology Projects",
    "Pasantías & Prácticas Profesionalizantes": "Internships & Professional Practice",
    "Centro de Estudiantes": "Student Council",
    "Deportes": "Sports",
    "Horarios Escolares": "School Schedules",
    "Panel de Administración": "Administration Panel",
    "Registro de Cuenta": "Account Registration",

    // ---------- Index: FAQ ----------
    "Información": "Information",
    "Consultas frecuentes": "Frequent queries",
    "Inscripción": "Enrollment",
    "Ingreso y documentación": "Admission and documentation",
    "¿Qué documentación necesito para la inscripción?": "What documentation do I need for enrollment?",
    "Para realizar la inscripción se deberá presentar la documentación solicitada por la institución.": "To complete enrollment, the documentation requested by the institution must be submitted.",
    "Ficha de Inscripción / Matrícula": "Enrollment / Registration Form",
    "Partida de Nacimiento legalizada mediante CiDi": "Birth certificate legalized through CiDi",
    "CUS (Ficha de PRoA)": "CUS (PRoA form)",
    "ISA (Ficha de PRoA)": "ISA (PRoA form)",
    "Carnet de Vacunación": "Vaccination card",
    "DNI del estudiante y padres": "National ID (DNI) of the student and parents",
    "Certificado Original de 6° año": "Original 6th-grade certificate",
    "Autorización de imagen y voz": "Image and voice authorization",
    "Autorización de retiros": "Early pick-up authorization",
    "Autorización de visitas didácticas": "Educational field trip authorization",
    "El Certificado Original de 6° año": "The Original 6th-grade certificate",
    "no es la constancia de alumno regular.": "is not the proof of regular student status.",
    "¿Cómo descargo la partida de nacimiento digital?": "How do I download the digital birth certificate?",
    "Te mostramos cómo realizar el trámite mediante el Registro Civil de CiDi.": "We show you how to complete the process through the CiDi Civil Registry.",
    "Ver tutorial de CiDi": "Watch CiDi tutorial",
    "Video explicativo": "Explanatory video",
    "Preceptoría": "Preceptorship",
    "Asistencias y horarios": "Attendance and schedules",
    "¿Cuántas faltas tengo / tiene mi hijo?": "How many absences do I / does my child have?",
    "Podés consultar las asistencias de tu hijo/a directamente desde CiDi.": "You can check your child's attendance directly from CiDi.",
    "Cómo consultar asistencias": "How to check attendance",
    "Video explicativo de CiDi": "CiDi explanatory video",
    "¿Cuáles son los horarios de cada curso?": "What are the schedules for each grade?",
    "Consultá los horarios correspondientes a cada curso.": "Check the schedules for each grade.",
    "Ver horarios por curso": "View schedules by grade",
    "¿Las inasistencias justificadas también se cuentan?": "Do excused absences also count?",
    "Importante sobre las asistencias": "Important information about attendance",
    "Las inasistencias justificadas también se contabilizan. Al llegar a las": "Excused absences also count. Upon reaching",
    "25 inasistencias": "25 absences",
    ", el estudiante ingresa en TEA.": ", the student enters TEA.",
    "¿Cómo debo completar las autorizaciones y fichas?": "How should I fill out the authorizations and forms?",
    "Las autorizaciones y fichas deben completarse con": "Authorizations and forms must be filled out with",
    "letra clara, legible y en color negro.": "clear, legible handwriting in black ink.",
    "Legajo del estudiante": "Student file",
    "Documentación obligatoria": "Mandatory documentation",
    "¿Qué papeles deben traer para el legajo?": "What papers must be brought for the student file?",
    "¿Cómo legalizo la partida de nacimiento?": "How do I legalize the birth certificate?",
    "Podés consultar el procedimiento mediante el Registro Civil de CiDi.": "You can check the procedure through the CiDi Civil Registry.",
    "Ver tutorial": "Watch tutorial",
    "Partida de nacimiento en CiDi": "Birth certificate in CiDi",
    "¿Cuál es el Certificado Original de 6°?": "What is the Original 6th-grade Certificate?",
    "Acá podés incorporar una imagen de referencia para que las familias puedan identificar correctamente el certificado.": "Here you can add a reference image so families can correctly identify the certificate.",
    "Imagen del Certificado Original de 6°": "Image of the Original 6th-grade Certificate",
    "Guías y tutoriales": "Guides and tutorials",
    "Te ayudamos a realizar los trámites más frecuentes paso a paso.": "We help you complete the most common procedures step by step.",
    "Partida de nacimiento": "Birth certificate",
    "Tutorial de CiDi": "CiDi tutorial",
    "Consultar asistencias": "Check attendance",
    "Guía para familias": "Guide for families",
    "Documentación del legajo": "Student file documentation",
    "¿No encontraste lo que buscabas?": "Didn't find what you were looking for?",
    "Si tenés otra consulta, podés comunicarte directamente con la institución.": "If you have another question, you can contact the institution directly.",
    "Contactar a la escuela": "Contact the school",
    "Estudiantes de PRoA programando en el taller de informática": "PRoA students programming in the computer lab",
    "Edificio oficial de la Escuela PRoA Despeñaderos": "Official building of Escuela PRoA Despeñaderos",
    "Mapa de ubicación de la Escuela PRoA Despeñaderos": "Location map of Escuela PRoA Despeñaderos",

    // ---------- Categorías / estados / etiquetas ----------
    "Todas": "All",
    "Todos": "All",
    "Institucional": "Institutional",
    "Académico": "Academic",
    "Eventos": "Events",
    "General": "General",
    "Participación": "Participation",
    "Proyectos CDE": "CDE Projects",
    "Competencias": "Competitions",
    "Recreación": "Recreation",
    "Torneos": "Tournaments",
    "Entrenamientos": "Training",
    "Trabajo en Equipo": "Teamwork",
    "En desarrollo": "In development",
    "Completado": "Completed",
    "Pausado": "Paused",
    "Propuesta": "Proposal",
    "Sin estado": "No status",
    "Pendiente": "Pending",
    "Pendientes": "Pending",
    "Contactado": "Contacted",
    "Contactados": "Contacted",
    "Aprobado": "Approved",
    "Aprobados": "Approved",
    "Aprobadas": "Approved",
    "Aceptado": "Accepted",
    "Rechazado": "Rejected",
    "Rechazados": "Rejected",
    "Rechazadas": "Rejected",
    "En revisión": "Under review",
    "No postulado": "Not applied",

    // ---------- Tablón ----------
    "Comunicados & Anuncios": "Announcements & Notices",
    "Tablón de Novedades": "News Board",
    "Espacio institucional para la publicación y consulta de noticias oficiales, comunicados y novedades del Centro de Estudiantes.": "Institutional space for publishing and viewing official news, announcements, and updates from the Student Council.",
    "Buscar noticias por título, contenido o etiquetas...": "Search news by title, content or tags...",
    "Título de la Noticia": "News Title",
    "Etiqueta / Categoría": "Tag / Category",
    "Resumen Corto (Visualización en tarjeta)": "Short Summary (shown on the card)",
    "Subir Foto o Documento (Opcional)": "Upload Photo or Document (Optional)",
    "Las imágenes se muestran en la cabecera; documentos en formato descargable.": "Images are shown in the header; documents as downloadable files.",
    "Contenido Detallado": "Detailed Content",
    "Ej: Reporte Mensual de Operaciones": "E.g.: Monthly Operations Report",
    "Ej: Breve resumen del anuncio institicional...": "E.g.: Brief summary of the institutional announcement...",
    "Escribe aquí el comunicado completo...": "Write the full announcement here...",
    "Publicar en el Tablón": "Publish to the Board",
    "Cancelar Edición": "Cancel Editing",
    "Cerrar Novedad": "Close News",
    "Cargando novedades...": "Loading news...",
    "No hay noticias publicadas aún.": "No news published yet.",
    "No se encontraron noticias que coincidan con la búsqueda o el filtro seleccionado.": "No news found matching the search or the selected filter.",
    "Leer Más": "Read More",
    "Editar": "Edit",
    "Eliminar": "Delete",
    "Editar Noticia Existente": "Edit Existing News",
    "Guardar Cambios": "Save Changes",
    "Procesando...": "Processing...",

    // ---------- Proyectos ----------
    "Portafolio Escolar & Innovación": "School Portfolio & Innovation",
    "Iniciativas de desarrollo de software, automatización, robótica y compromiso social creadas por los estudiantes de la Escuela PRoA Despeñaderos.": "Software development, automation, robotics and social commitment initiatives created by the students of Escuela PRoA Despeñaderos.",
    "Título del Proyecto": "Project Title",
    "Estado del Proyecto": "Project Status",
    "Autor / Equipo (Opcional)": "Author / Team (Optional)",
    "Link al Repositorio o Sitio Web (Opcional)": "Link to Repository or Website (Optional)",
    "Foto / Imagen del Proyecto (Subir archivo o ingresar URL)": "Project Photo / Image (Upload a file or enter a URL)",
    "Ej: Bike Spot — Sistema de Movilidad Sostenible": "E.g.: Bike Spot — Sustainable Mobility System",
    "Ej: Alumnos de 5° Año — Grupo Software": "E.g.: 5th Year students — Software Group",
    "O pegar URL pública de imagen: https://ejemplo.com/foto.jpg": "Or paste a public image URL: https://example.com/photo.jpg",
    "Podés seleccionar una foto de tu dispositivo o pegar un enlace web directo.": "You can select a photo from your device or paste a direct web link.",
    "Descripción Detallada": "Detailed Description",
    "Describí los objetivos, tecnologías empleadas y alcance del proyecto...": "Describe the project's goals, technologies used and scope...",
    "Guardar Proyecto": "Save Project",
    "Cargando proyectos...": "Loading projects...",
    "No hay proyectos registrados en la plataforma aún.": "No projects registered on the platform yet.",
    "Hacé clic en \"Publicar Nuevo Proyecto\" para agregar el primero.": "Click \"Publish New Project\" to add the first one.",
    "Ocurrió un error inesperado al consultar los proyectos.": "An unexpected error occurred while loading the projects.",
    "Ver Enlace / Repositorio": "View Link / Repository",
    "Visitar Repositorio / Web": "Visit Repository / Website",
    "Autor/Equipo:": "Author/Team:",
    "Estado:": "Status:",
    "Editar Proyecto": "Edit Project",
    "Proyecto Institucional": "Institutional Project",

    // ---------- CDE ----------
    "Representación Estudiantil": "Student Representation",
    "Centro de Estudiantes (CDE)": "Student Council (CDE)",
    "Espacio institucional de participación democrática, debates, proyectos comunitarios y voz activa de los alumnos de la Escuela PRoA Despeñaderos.": "Institutional space for democratic participation, debates, community projects and the active voice of the students of Escuela PRoA Despeñaderos.",
    "Nueva Publicación del CDE": "New CDE Post",
    "Título de la Publicación": "Post Title",
    "Categoría": "Category",
    "Categoría:": "Category:",
    "Ej: Nueva Jornada de Convivencia Estudiantil": "E.g.: New Student Coexistence Day",
    "Escribí aquí el comunicado o descripción completa...": "Write the full announcement or description here...",
    "Publicar en CDE": "Publish to CDE",
    "Cargando publicaciones del CDE...": "Loading CDE posts...",
    "No hay publicaciones registradas en el Centro de Estudiantes aún.": "No posts registered in the Student Council yet.",
    "Hacé clic en \"Nueva Publicación CDE\" para agregar la primera.": "Click \"New CDE Post\" to add the first one.",
    "Ocurrió un error inesperado al consultar las publicaciones.": "An unexpected error occurred while loading the posts.",
    "Publicación del CDE": "CDE Post",
    "Editar Publicación CDE": "Edit CDE Post",
    "Guardando en Supabase...": "Saving to Supabase...",

    // ---------- Deportes ----------
    "Deportes & Salud": "Sports & Health",
    "Programas Deportivos y Recreativos": "Sports and Recreation Programs",
    "Impulsamos el trabajo en equipo, la convivencia escolar y la actividad física en la Escuela PRoA Despeñaderos.": "We promote teamwork, school coexistence and physical activity at Escuela PRoA Despeñaderos.",
    "Título de la Actividad o Torneo": "Activity or Tournament Title",
    "Horario / Fecha (Opcional)": "Schedule / Date (Optional)",
    "Foto / Imagen (Subir archivo o ingresar URL)": "Photo / Image (Upload a file or enter a URL)",
    "Ej: Torneo Intercolegial de Tenis de Mesa": "E.g.: Inter-school Table Tennis Tournament",
    "Ej: Viernes 15:00 hs — Canchas del Patio": "E.g.: Friday 3:00 PM — Courtyard Courts",
    "Describí la actividad deportiva, reglamento, participantes y objetivos...": "Describe the sports activity, rules, participants and goals...",
    "Guardar Actividad": "Save Activity",
    "Cargando actividades deportivas...": "Loading sports activities...",
    "No hay actividades deportivas registradas aún.": "No sports activities registered yet.",
    "Hacé clic en \"Nueva Actividad Deportiva\" para agregar la primera.": "Click \"New Sports Activity\" to add the first one.",
    "Ocurrió un error inesperado al consultar las actividades deportivas.": "An unexpected error occurred while loading the sports activities.",
    "Actividad Deportiva": "Sports Activity",
    "Editar Actividad Deportiva": "Edit Sports Activity",
    "Horario/Fecha:": "Schedule/Date:",

    // ---------- Horarios ----------
    "Gestión Institucional": "Institutional Management",
    "Horarios Escolares Oficiales": "Official School Schedules",
    "Cronograma visual con bloques proporcionales al tiempo de duración real.": "Visual schedule with blocks proportional to their actual duration.",
    "Lunes": "Monday",
    "Martes": "Tuesday",
    "Miércoles": "Wednesday",
    "Jueves": "Thursday",
    "Viernes": "Friday",
    "Añadir Bloque para": "Add Block for",
    "Editar Bloque para": "Edit Block for",
    "1. Día de la Semana *": "1. Day of the Week *",
    "2. Tipo de Bloque *": "2. Block Type *",
    "3. Hora de Inicio *": "3. Start Time *",
    "4. Hora de Fin *": "4. End Time *",
    "Materia de Clase": "Class Subject",
    "Recreo / Descanso": "Break / Rest",
    "Almuerzo / Comida": "Lunch / Meal",
    "Ingreso": "Arrival",
    "Salida": "Dismissal",
    "Detalles de la Materia": "Subject Details",
    "Nombre de la Materia *": "Subject Name *",
    "Ej: Programación / FVT": "E.g.: Programming / FVT",
    "¿Tiene Profesor Asignado?": "Does it have an assigned teacher?",
    "Sí, tiene profesor": "Yes, has a teacher",
    "No hay profesor": "No teacher",
    "Nombre del Profesor": "Teacher Name",
    "Ej: PROF. ALVARO ESPINOZA": "E.g.: PROF. ALVARO ESPINOZA",
    "Texto descriptivo": "Descriptive text",
    "Guardar Bloque Proporcional": "Save Proportional Block",
    "Actualizar bloque": "Update block",
    "Sin actividades": "No activities",
    "Error al cargar": "Error loading",
    "(Sin Profesor)": "(No Teacher)",
    "PROFESOR ASIGNADO": "ASSIGNED TEACHER",
    "RECREO": "BREAK",
    "ALMUERZO": "LUNCH",
    "INGRESO": "ARRIVAL",
    "SALIDA": "DISMISSAL",
    "Editar bloque": "Edit block",
    "Eliminar bloque": "Delete block",
    "Generando PDF (1 Hoja)...": "Generating PDF (1 page)...",
    "ESCUELA PRoA DESPEÑADEROS": "ESCUELA PRoA DESPEÑADEROS",
    "Educación Secundaria — Especialidad en Desarrollo de Software": "Secondary Education — Software Development Specialization",
    "CRONOGRAMA SEMANAL OFICIAL": "OFFICIAL WEEKLY SCHEDULE",
    "Escuela PRoA Despeñaderos — Documento Oficial de Horarios": "Escuela PRoA Despeñaderos — Official Schedule Document",
    "Horario correspondiente a:": "Schedule for:",

    // ---------- Admin ----------
    "Verificando credenciales de administrador...": "Verifying administrator credentials...",
    "Módulos de Control": "Control Modules",
    "Pasantías": "Internships",
    "Comunicados": "Announcements",
    "Horarios": "Schedules",
    "Usuarios": "Users",
    "Postulaciones de Empresas": "Company Applications",
    "Total": "Total",
    "Estado": "Status",
    "Buscar por empresa, contacto o correo...": "Search by company, contact or email...",
    "Todos los estados": "All statuses",
    "Cargando postulaciones...": "Loading applications...",
    "Gestión del Tablón de Novedades": "News Board Management",
    "Crear Comunicado": "Create Announcement",
    "Publicar Nuevo Comunicado": "Publish New Announcement",
    "Título del Comunicado": "Announcement Title",
    "Resumen Corto": "Short Summary",
    "Contenido Completo": "Full Content",
    "Archivo / Adjunto (Opcional - Imagen o PDF)": "File / Attachment (Optional - Image or PDF)",
    "Ej: Inscripciones abiertas para la Expo PRoA 2026": "E.g.: Registration open for Expo PRoA 2026",
    "Breve descripción que se mostrará en la vista previa": "Short description shown in the preview",
    "Escriba aquí el detalle completo de la noticia...": "Write the full details of the news here...",
    "Publicar": "Publish",
    "Cargando noticias...": "Loading news...",
    "Cargando comunicados...": "Loading announcements...",
    "Asistente de Horarios Escolares": "School Schedule Assistant",
    "Cargando gestión de horarios...": "Loading schedule management...",
    "Cuentas y Roles Registrados": "Registered Accounts and Roles",
    "Total Cuentas": "Total Accounts",
    "Admins": "Admins",
    "Estudiantes": "Students",
    "Comunes": "Common",
    "Buscar por nombre o correo electrónico...": "Search by name or email...",
    "Rol:": "Role:",
    "Todos los roles": "All roles",
    "Cargando perfiles de Supabase...": "Loading profiles from Supabase...",
    "Detalles de la Postulación": "Application Details",
    "Cerrar modal": "Close modal",
    "Confirmar Cambio de Rol": "Confirm Role Change",
    "¿Confirmas que deseas reasignar los privilegios y permisos de esta cuenta en el sistema?": "Do you confirm that you want to reassign the privileges and permissions of this account in the system?",
    "Usuario": "User",
    "Rol anterior": "Previous role",
    "Nuevo rol": "New role",
    "Confirmar cambio": "Confirm change",
    "Guardando...": "Saving...",
    "Publicando...": "Publishing...",
    "admin": "admin",
    "estudiante": "student",
    "comun": "common",
    "Super Admin": "Super Admin",
    "Principal": "Main",
    "Protegido": "Protected",
    "Solo lectura": "Read-only",
    "Usuario PRoA": "PRoA User",
    "Modo Super Administrador Activo:": "Super Administrator Mode Active:",
    "Tienes privilegios para reasignar roles (": "You have privileges to reassign roles (",
    ") de los usuarios registrados. Tu cuenta principal está protegida contra modificaciones accidentales.": ") of registered users. Your main account is protected against accidental changes.",
    "Modo Administrador (Vista de Solo Lectura):": "Administrator Mode (Read-Only View):",
    "Puedes consultar las cuentas y roles registrados en la plataforma. La asignación o modificación de roles está reservada exclusivamente para el Super Admin (": "You can view the accounts and roles registered on the platform. Assigning or changing roles is reserved exclusively for the Super Admin (",
    ").": ").",
    "Empresa / Rubro": "Company / Industry",
    "Contacto": "Contact",
    "Correo / Teléfono": "Email / Phone",
    "Vacantes": "Openings",
    "Acciones": "Actions",
    "Sin nombre": "No name",
    "No especificado": "Not specified",
    "No registrado": "Not registered",
    "Ver mensaje y detalles": "View message and details",
    "Eliminar postulación": "Delete application",
    "No se encontraron postulaciones registradas que coincidan con los criterios.": "No registered applications match the criteria.",
    "Error al recuperar las postulaciones.": "Error retrieving the applications.",
    "Rubro:": "Industry:",
    "Persona de Contacto:": "Contact Person:",
    "Correo Electrónico:": "Email:",
    "Teléfono:": "Phone:",
    "Vacantes ofrecidas:": "Openings offered:",
    "Fecha de Registro:": "Registration Date:",
    "Reciente": "Recent",
    "Mensaje de la Empresa:": "Company Message:",
    "Sin mensaje adicional.": "No additional message.",
    "Título": "Title",
    "Resumen": "Summary",
    "Adjunto": "Attachment",
    "Fecha": "Date",
    "Acción": "Action",
    "Ver adjunto": "View attachment",
    "Ninguno": "None",
    "Eliminar noticia": "Delete news",
    "Sin título": "Untitled",
    "No hay comunicados o noticias publicadas en el tablón.": "There are no announcements or news published on the board.",
    "Error al recuperar los comunicados.": "Error retrieving the announcements.",
    "Gestión del Asistente de Horarios Escolar": "School Schedule Assistant Management",
    "Consulta y edita los cronogramas por curso, materias y docentes.": "View and edit schedules by grade, subject and teacher.",
    "El módulo de horarios permite a estudiantes y docentes filtrar sus materias del día. Como administrador, puedes previsualizar y administrar las materias accediendo al asistente completo.": "The schedule module lets students and teachers filter their subjects for the day. As an administrator, you can preview and manage the subjects by accessing the full assistant.",
    "Abrir Asistente de Horarios": "Open Schedule Assistant",
    "Usuario / Nombre": "User / Name",
    "Correo Electrónico": "Email",
    "Rol Actual": "Current Role",
    "Gestión de Rol": "Role Management",
    "ID de Cuenta": "Account ID",
    "No se encontraron cuentas o perfiles que coincidan con los criterios de búsqueda o el filtro seleccionado.": "No accounts or profiles match the search criteria or the selected filter.",
    "La cuenta de Super Admin está protegida y no puede ser modificada.": "The Super Admin account is protected and cannot be modified.",
    "Al otorgar el rol de Administrador, el usuario tendrá acceso total a los módulos de Pasantías, Comunicados y Horarios.": "By granting the Administrator role, the user will have full access to the Internships, Announcements and Schedules modules.",
    "Al quitar el rol de Administrador, el usuario perderá de forma inmediata el acceso a este panel de administración.": "By removing the Administrator role, the user will immediately lose access to this administration panel.",
    "La cuenta de Super Administrador está protegida contra modificaciones.": "The Super Administrator account is protected against modifications.",
    "La cuenta de Super Administrador está protegida y no puede modificarse.": "The Super Administrator account is protected and cannot be modified.",
    "Solo el Super Administrador está facultado para modificar roles.": "Only the Super Administrator is authorized to modify roles.",
    "El rol seleccionado no es válido.": "The selected role is not valid.",

    // ---------- Pasantías ----------
    "Prácticas Profesionalizantes": "Professional Practice",
    "Vinculando Estudiantes con el Sector Productivo": "Connecting Students with the Productive Sector",
    "Impulsamos el talento técnico de las Escuelas PRoA conectando a nuestros estudiantes de desarrollo de software con empresas e instituciones comprometidas con la formación profesional.": "We boost the technical talent of the PRoA Schools by connecting our software development students with companies and institutions committed to professional training.",
    "Postular Empresa / Solicitar Pasantes": "Apply as a Company / Request Interns",
    "Conocer el Proceso": "Learn About the Process",
    "Panel de Administrador: Postulaciones de Empresas": "Administrator Panel: Company Applications",
    "Gestioná las postulaciones o accede a todas las herramientas en el panel de administración.": "Manage the applications or access all the tools in the administration panel.",
    "Abrir Panel Admin": "Open Admin Panel",
    "Cargando postulaciones de empresas desde Supabase...": "Loading company applications from Supabase...",
    "Beneficios": "Benefits",
    "¿Para quién es Conecta Pasantías?": "Who is Conecta Pasantías for?",
    "Un ecosistema colaborativo donde estudiantes, empresas y la institución educativa crecen juntos.": "A collaborative ecosystem where students, companies and the educational institution grow together.",
    "Acceso a prácticas reales en desarrollo de software, robótica y tecnología, adquiriendo experiencia profesional antes de graduarse.": "Access to real internships in software development, robotics and technology, gaining professional experience before graduating.",
    "Empresas": "Companies",
    "Incorporación de talento joven capacitado en tecnologías modernas, apoyando la formación técnica y dinamizando sus proyectos.": "Hiring young talent trained in modern technologies, supporting technical education and energizing their projects.",
    "Institución": "Institution",
    "Supervisión pedagógica y coordinación continua para asegurar el cumplimiento de los objetivos formativos y convenios marco.": "Pedagogical supervision and ongoing coordination to ensure compliance with training objectives and framework agreements.",
    "Paso a Paso": "Step by Step",
    "¿Cómo Funciona el Proceso?": "How Does the Process Work?",
    "Transparente, ágil y respaldado por las Escuelas PRoA.": "Transparent, agile and backed by the PRoA Schools.",
    "Postulación de Empresa": "Company Application",
    "La empresa completa el formulario de solicitud indicando el perfil deseado y la cantidad de vacantes.": "The company fills out the request form indicating the desired profile and number of openings.",
    "Revisión Institucional": "Institutional Review",
    "El equipo docente audita la solicitud y contacta a la empresa a través del correo oficial.": "The teaching team reviews the request and contacts the company through the official email.",
    "Selección & Convenio": "Selection & Agreement",
    "Se firman los acuerdos institucionales y se asignan los estudiantes postulantes.": "Institutional agreements are signed and the applicant students are assigned.",
    "Práctica & Seguimiento": "Practice & Follow-up",
    "Los pasantes desarrollan sus horas de práctica supervisadas periódicamente por la escuela.": "Interns complete their practice hours, periodically supervised by the school.",
    "Cargando sesión...": "Loading session...",
    "Subir Reseña": "Submit Review",
    "Experiencias & Testimonios": "Experiences & Testimonials",
    "Reseñas de Pasantías Profesionalizantes": "Professional Internship Reviews",
    "Conoce las opiniones y vivencias de las empresas que colaboran con los pasantes de la Escuela PRoA.": "Learn about the opinions and experiences of the companies that work with the interns of Escuela PRoA.",
    "Email Oficial de Pasantías": "Official Internships Email",
    "Ubicación Institucional": "Institutional Location",
    "Escuelas PRoA — Despeñaderos / Córdoba": "PRoA Schools — Despeñaderos / Córdoba",
    "Atención a Empresas": "Company Support",
    "Lunes a Viernes · Horario Escolar": "Monday to Friday · School Hours",
    "Proyecto de Pasantías & Tesina — Escuela PRoA": "Internship & Thesis Project — Escuela PRoA",
    "Conecta Pasantías © 2026": "Conecta Pasantías © 2026",
    "Registro de Empresa para Pasantías": "Company Registration for Internships",
    "Nombre de la Empresa / Organización *": "Company / Organization Name *",
    "Rubro o Sector": "Industry or Sector",
    "Persona de Contacto *": "Contact Person *",
    "Correo Electrónico *": "Email *",
    "Teléfono de Contacto": "Contact Phone",
    "Cantidad de Pasantes Solicitados": "Number of Interns Requested",
    "Perfil Deseado / Comentarios": "Desired Profile / Comments",
    "Ej: Tech Solution S.A.": "E.g.: Tech Solution S.A.",
    "Ej: Software, Hardware, Industria": "E.g.: Software, Hardware, Industry",
    "Ej: Ing. María Pérez": "E.g.: Eng. María Pérez",
    "Ej: 3564 123456": "E.g.: 3564 123456",
    "Describe brevemente las tareas o perfil técnico que necesitas...": "Briefly describe the tasks or technical profile you need...",
    "Enviar Postulación de Empresa": "Submit Company Application",
    "Enviando postulación...": "Submitting application...",
    "Publicar Reseña de Pasantía": "Publish Internship Review",
    "Avatar Empresa": "Company avatar",
    "Empresa / Institución (Fijo por Sesión)": "Company / Institution (Fixed per Session)",
    "Cargando empresa...": "Loading company...",
    "Calificación de la Pasantía *": "Internship Rating *",
    "Comentario u Opinión *": "Comment or Opinion *",
    "Describe el desempeño de los pasantes, los proyectos desarrollados o la experiencia de trabajo con la Escuela PRoA...": "Describe the interns' performance, the projects developed or the experience of working with Escuela PRoA...",
    "Imágenes de la Pasantía (Opcional)": "Internship Images (Optional)",
    "Puedes seleccionar múltiples fotos (JPG, PNG, WEBP).": "You can select multiple photos (JPG, PNG, WEBP).",
    "Enviar Reseña": "Submit Review",
    "Editar Reseña (Administración)": "Edit Review (Administration)",
    "Modificar Calificación *": "Edit Rating *",
    "Modificar Comentario *": "Edit Comment *",
    "Imagen de la Pasantía": "Internship Image",
    "Previsualización Imagen Adjunta": "Attached image preview",
    "Eliminar foto adjunta actual": "Delete current attached photo",
    "Subir o reemplazar imágenes (Opcional):": "Upload or replace images (Optional):",
    "Modo lectura · Inicia sesión para publicar reseñas": "Read-only mode · Log in to publish reviews",
    "Cargando reseñas de pasantías...": "Loading internship reviews...",
    "Aún no hay reseñas publicadas": "No reviews published yet",
    "Sé la primera empresa en compartir la experiencia de pasantías con nuestros estudiantes.": "Be the first company to share your internship experience with our students.",
    "Fecha no especificada": "Date not specified",
    "Empresa Colaboradora": "Partner Company",
    "Me gusta": "Like",
    "Editar Reseña": "Edit Review",
    "Eliminar Reseña": "Delete Review",
    "Sin contacto": "No contact",
    "Sin teléfono": "No phone",
    "No hay postulaciones de empresas registradas aún.": "No company applications registered yet.",
    "Publicando reseña...": "Publishing review...",
    "Guardando cambios...": "Saving changes...",

    // ---------- Perfil ----------
    "Rol de Usuario:": "User Role:",
    "Postulación a Pasantías:": "Internship Application:",
    "Los estudiantes con correo @escuelasproa.edu.ar tendrán funciones especiales próximamente.": "Students with an @escuelasproa.edu.ar email will have special features soon.",
    "Administrador": "Administrator",
    "Estudiante": "Student",
    "Externo / Empresa": "Guest / Company",
    "Hacé click o arrastrá una imagen para cambiar tu foto": "Click or drag an image to change your photo",
    "Cambiar foto": "Change photo",
    "Subiendo...": "Uploading...",
    "Subiendo tu nueva foto...": "Uploading your new photo...",
    "¡Foto de perfil actualizada!": "Profile picture updated!",
    "Formato no válido. Usá una imagen PNG, JPEG o WEBP.": "Invalid format. Use a PNG, JPEG or WEBP image.",
    "No se seleccionó ningún archivo.": "No file was selected.",
    "Tu sesión expiró, iniciá sesión de nuevo.": "Your session expired, please log in again.",
    "No se pudo subir la foto. Probá de nuevo.": "The photo could not be uploaded. Please try again.",

    // ---------- Login / Registro ----------
    "Acceso a la plataforma de la Escuela PRoA": "Access to the Escuela PRoA platform",
    "Correo electrónico": "Email address",
    "Contraseña": "Password",
    "¿Olvidaste tu contraseña?": "Forgot your password?",
    "Ingresar": "Sign in",
    "¿No tienes una cuenta aún?": "Don't have an account yet?",
    "Regístrate aquí": "Sign up here",
    "Crear Cuenta": "Create Account",
    "Registro para estudiantes y empresas colaboradoras": "Registration for students and partner companies",
    "Nombre completo o Empresa": "Full name or Company",
    "Contraseña (mínimo 6 caracteres)": "Password (minimum 6 characters)",
    "Confirmar contraseña": "Confirm password",
    "Registrarse": "Sign up",
    "¿Ya tienes una cuenta?": "Already have an account?",
    "Inicia sesión aquí": "Log in here",
    "Por favor, completa todos los campos.": "Please fill in all fields.",
    "Iniciando sesión...": "Logging in...",
    "¡Inicio de sesión exitoso! Redirigiendo...": "Login successful! Redirecting...",
    "Error al iniciar sesión. Revisa tus credenciales.": "Login error. Check your credentials.",
    "Ingresa tu correo en el campo de Email para recuperar la contraseña.": "Enter your email in the Email field to recover your password.",
    "Enviando enlace de recuperación...": "Sending recovery link...",
    "¡Enlace enviado! Revisa la bandeja de entrada de tu correo.": "Link sent! Check your email inbox.",
    "Error al solicitar la recuperación.": "Error requesting recovery.",
    "Nueva Contraseña": "New Password",
    "Ingresa tu nueva contraseña para acceder a la plataforma.": "Enter your new password to access the platform.",
    "Nueva contraseña (mínimo 6 caracteres)": "New password (minimum 6 characters)",
    "Repite tu nueva contraseña": "Repeat your new password",
    "Guardar Nueva Contraseña": "Save New Password",
    "La contraseña debe tener al menos 6 caracteres.": "The password must be at least 6 characters long.",
    "Las contraseñas no coinciden.": "The passwords do not match.",
    "Guardando nueva contraseña...": "Saving new password...",
    "Error al actualizar la contraseña.": "Error updating the password.",
    "¡Contraseña actualizada con éxito! Redirigiendo a tu perfil...": "Password updated successfully! Redirecting to your profile...",
    "Por favor, completa todos los campos del formulario.": "Please fill in all the form fields.",
    "Las contraseñas ingresadas no coinciden.": "The passwords entered do not match.",
    "La contraseña debe contener al menos 6 caracteres.": "The password must contain at least 6 characters.",
    "Procesando registro...": "Processing registration...",
    "Error durante el registro. Inténtalo nuevamente.": "Error during registration. Please try again.",
    "¡Registro exitoso! Redirigiendo a tu perfil...": "Registration successful! Redirecting to your profile...",

    // ---------- Mensajes (alert / confirm / toasts) ----------
    "Atención: Solo los administradores pueden publicar noticias.": "Attention: Only administrators can publish news.",
    "Atención: Solo los administradores pueden realizar publicaciones.": "Attention: Only administrators can make posts.",
    "Atención: Solo los administradores pueden realizar publicaciones o modificaciones.": "Attention: Only administrators can make posts or modifications.",
    "Atención: Solo los administradores pueden publicar proyectos.": "Attention: Only administrators can publish projects.",
    "Atención: Solo los administradores pueden publicar actividades deportivas.": "Attention: Only administrators can publish sports activities.",
    "Atención: Solo los administradores pueden editar publicaciones.": "Attention: Only administrators can edit posts.",
    "Atención: Solo los administradores pueden editar proyectos.": "Attention: Only administrators can edit projects.",
    "Atención: Solo los administradores pueden editar actividades.": "Attention: Only administrators can edit activities.",
    "Atención: Solo los administradores pueden eliminar publicaciones.": "Attention: Only administrators can delete posts.",
    "Atención: Solo los administradores pueden eliminar proyectos.": "Attention: Only administrators can delete projects.",
    "Atención: Solo los administradores pueden eliminar actividades.": "Attention: Only administrators can delete activities.",
    "Por favor completá el título y el contenido.": "Please fill in the title and the content.",
    "Por favor completá el título y la descripción del proyecto.": "Please fill in the project title and description.",
    "Por favor completá el título y la descripción de la actividad.": "Please fill in the activity title and description.",
    "Ocurrió un error al guardar la noticia en Supabase.": "An error occurred while saving the news to Supabase.",
    "¿Seguro que deseas eliminar esta publicación del sistema?": "Are you sure you want to delete this post from the system?",
    "No se pudo eliminar la noticia de Supabase.": "The news could not be deleted from Supabase.",
    "Solo los administradores pueden añadir bloques.": "Only administrators can add blocks.",
    "Ingresa el nombre de la materia.": "Enter the subject name.",
    "Por favor, ingresa la hora de finalización.": "Please enter the end time.",
    "La hora de finalización debe ser posterior a la hora de inicio.": "The end time must be later than the start time.",
    "¿Deseas descartar los cambios?": "Do you want to discard the changes?",
    "¿Estás seguro de eliminar este bloque?": "Are you sure you want to delete this block?",
    "No se encontró la grilla de horarios para exportar.": "The schedule grid to export was not found.",
    "Acceso restringido: Esta sección requiere rol de Administrador.": "Restricted access: This section requires the Administrator role.",
    "Error al actualizar el estado en el servidor.": "Error updating the status on the server.",
    "No se pudo eliminar la postulación.": "The application could not be deleted.",
    "¿Deseas eliminar permanentemente este comunicado del tablón?": "Do you want to permanently delete this announcement from the board?",
    "Error al eliminar la noticia.": "Error deleting the news.",
    "Por favor completa los campos obligatorios del comunicado.": "Please fill in the required announcement fields.",
    "No se pudo publicar la noticia. Revisa la consola para más detalles.": "The news could not be published. Check the console for details.",
    "Ocurrió un error inesperado al publicar.": "An unexpected error occurred while publishing.",
    "¡Postulación recibida con éxito!": "Application received successfully!",
    "Se ha enviado una notificación al correo institucional.": "A notification has been sent to the institutional email.",
    "Ocurrió un error al enviar la postulación. Por favor verifica los datos o intenta nuevamente.": "An error occurred while submitting the application. Please check the data or try again.",
    "No se pudo actualizar el estado de la postulación.": "The application status could not be updated.",
    "¿Seguro que deseas borrar esta postulación de empresa?": "Are you sure you want to delete this company application?",
    "No se pudo borrar la postulación.": "The application could not be deleted.",
    "Debes iniciar sesión para publicar una reseña.": "You must log in to publish a review.",
    "¡Muchas gracias! Tu reseña ha sido publicada exitosamente.": "Thank you very much! Your review has been published successfully.",
    "Reseña actualizada correctamente.": "Review updated successfully.",
    "No se pudo actualizar la reseña. Verifica tus permisos o intenta nuevamente.": "The review could not be updated. Check your permissions or try again.",
    "Debes iniciar sesión para dar 'Me gusta' a una reseña.": "You must log in to like a review.",
    "Debes iniciar sesión para dar 'Me gusta'.": "You must log in to like a review.",
    "¿Estás seguro de que deseas borrar esta reseña? Esta acción no se puede deshacer.": "Are you sure you want to delete this review? This action cannot be undone.",
    "No se pudo eliminar la reseña.": "The review could not be deleted."
};

// ----------------------------------------------------
// 3. REGLAS (textos dinámicos con datos variables)
// ----------------------------------------------------
const ORDINALES = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th" };
const MESES = {
    enero: "January", febrero: "February", marzo: "March", abril: "April",
    mayo: "May", junio: "June", julio: "July", agosto: "August",
    septiembre: "September", setiembre: "September", octubre: "October",
    noviembre: "November", diciembre: "December"
};

function escaparRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Prefijos "Mensaje: <detalle>" donde solo se traduce el prefijo
const PREFIJOS = [
    ["Sesión activa: ", "Active session: "],
    ["Descargar: ", "Download: "],
    ["Guardar adjunto: ", "Save attachment: "],
    ["Descargar adjunto: ", "Download attachment: "],
    ["No se pudieron cargar los proyectos: ", "Could not load the projects: "],
    ["No se pudieron cargar las publicaciones: ", "Could not load the posts: "],
    ["No se pudieron cargar las actividades deportivas: ", "Could not load the sports activities: "],
    ["No se pudo actualizar el proyecto: ", "Could not update the project: "],
    ["No se pudo publicar el proyecto: ", "Could not publish the project: "],
    ["No se pudo actualizar la actividad: ", "Could not update the activity: "],
    ["No se pudo publicar la actividad: ", "Could not publish the activity: "],
    ["No se pudo actualizar la publicación: ", "Could not update the post: "],
    ["No se pudo publicar: ", "Could not publish: "],
    ["Error al subir la imagen: ", "Error uploading the image: "],
    ["Error al subir el archivo adjunto: ", "Error uploading the attached file: "],
    ["No se pudo eliminar de Supabase: ", "Could not delete from Supabase: "],
    ["Ocurrió un error inesperado al intentar borrar: ", "An unexpected error occurred while trying to delete: "],
    ["Ocurrió un error al publicar la reseña: ", "An error occurred while publishing the review: "],
    ["Ocurrió un error: ", "An error occurred: "],
    ["Error al guardar: ", "Error saving: "],
    ["Error al eliminar: ", "Error deleting: "],
    ["Error al actualizar rol: ", "Error updating role: "],
    ["Error al recuperar perfiles de Supabase: ", "Error retrieving profiles from Supabase: "],
    ["Postulación: ", "Application: "],
    ["Cambiar rol de ", "Change role of "],
    ["Añadir bloque para ", "Add block for "]
].map(([es, en]) => [new RegExp("^" + escaparRegex(es) + "([\\s\\S]*)$"), en]);

const REGLAS = [
    // Fechas: "20 de noviembre de 2026" -> "November 20, 2026"
    [/^(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre) de (\d{4})$/i,
        (m) => `${MESES[m[2].toLowerCase()]} ${parseInt(m[1], 10)}, ${m[3]}`],
    // Cursos
    [/^([1-6])° Año$/, (m) => `${ORDINALES[m[1]]} Year`],
    [/^Horario ([1-6])° Año$/, (m) => `${ORDINALES[m[1]]} Year Schedule`],
    [/^HORARIO ([1-6])° AÑO$/, (m) => `${ORDINALES[m[1]].toUpperCase()} YEAR SCHEDULE`],
    // Rango horario "08:00 a 10:00"
    [/^(\d{1,2}:\d{2}) a (\d{1,2}:\d{2})$/, (m) => `${m[1]} to ${m[2]}`],
    // Reseñas
    [/^(\d+) fotos$/, (m) => `${m[1]} photos`],
    [/^Foto Pasantía (\d+)$/, (m) => `Internship photo ${m[1]}`],
    // Perfil
    [/^La imagen no puede pesar más de (\d+)MB\.$/, (m) => `The image cannot be larger than ${m[1]}MB.`],
    // Admin
    [/^Solo el Super Administrador \((.*)\) puede reasignar roles\.$/, (m) => `Only the Super Administrator (${m[1]}) can reassign roles.`],
    [/^El rol de (.*) \((.*)\) se actualizó a "(.*)" con éxito\.$/, (m) => `The role of ${m[1]} (${m[2]}) was updated to "${traducirNucleo(m[3]) || m[3]}" successfully.`],
    [/^¿Estás seguro de que deseas eliminar la postulación de "(.*)"\?$/, (m) => `Are you sure you want to delete the application from "${m[1]}"?`],
    [/^No se encontraron postulaciones con estado '(.*)'\.$/, (m) => `No applications found with status '${traducirNucleo(m[1]) || m[1]}'.`],
    // Confirmaciones de borrado
    [/^¿Seguro que deseas eliminar "(.*)" del sistema\? Esta acción no se puede deshacer\.$/, (m) => `Are you sure you want to delete "${m[1]}" from the system? This action cannot be undone.`],
    [/^¿Seguro que deseas eliminar el proyecto "(.*)" del sistema\? Esta acción no se puede deshacer\.$/, (m) => `Are you sure you want to delete the project "${m[1]}" from the system? This action cannot be undone.`],
    // Alert de postulación de empresa
    [/^Muchas gracias, (.*)\. Hemos registrado la solicitud de (.*)\.$/, (m) => `Thank you very much, ${m[1]}. We have registered the request from ${m[2]}.`],
    // Prefijos "Texto: detalle"
    ...PREFIJOS.map(([re, en]) => [re, (m) => en + m[1]])
];

// ----------------------------------------------------
// 4. NÚCLEO DE TRADUCCIÓN
// ----------------------------------------------------
const FRASES_MAP = new Map(Object.entries(FRASES));
const RE_EMOJI_PREFIJO = /^([\p{Extended_Pictographic}\uFE0F\u200D\s]+)(.+)$/u;

function compactar(s) {
    return String(s).replace(/\s+/g, " ").trim();
}

// Traduce un texto ya compactado. Devuelve null si no hay traducción.
export function traducirNucleo(core) {
    if (!core) return null;

    if (FRASES_MAP.has(core)) return FRASES_MAP.get(core);

    // Prefijo de emoji/ícono: "📁 Descargar: archivo.pdf", "💻 Proyectos Tecnológicos"
    const mEmoji = core.match(RE_EMOJI_PREFIJO);
    if (mEmoji) {
        const resto = traducirNucleo(mEmoji[2].trim());
        if (resto !== null) return mEmoji[1] + resto;
    }

    for (const [re, fn] of REGLAS) {
        const m = core.match(re);
        if (m) return fn(m);
    }
    return null;
}

// Traduce conservando espacios iniciales/finales. Devuelve null si no aplica.
export function traducirTexto(raw) {
    if (typeof raw !== "string") return null;
    const core = compactar(raw);
    if (!core) return null;
    const trad = traducirNucleo(core);
    if (trad === null) return null;
    const ini = raw.match(/^\s*/)[0];
    const fin = raw.match(/\s*$/)[0];
    return ini + trad + fin;
}

// Inverso (EN -> ES) para limpiar textos que quedaron en inglés
let FRASES_INVERSO = null;
function obtenerInverso() {
    if (FRASES_INVERSO) return FRASES_INVERSO;
    FRASES_INVERSO = new Map();
    for (const [es, en] of Object.entries(FRASES)) {
        if (en !== es && !FRASES_INVERSO.has(en)) FRASES_INVERSO.set(en, es);
    }
    return FRASES_INVERSO;
}

// ----------------------------------------------------
// 5. IDIOMA ACTUAL (localStorage)
// ----------------------------------------------------
export function obtenerIdioma() {
    try {
        const guardado = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("proa_lang");
        if (guardado === "en" || guardado === "es") return guardado;
    } catch (_) {}
    return "es";
}

export function guardarIdioma(idioma) {
    try {
        localStorage.setItem(STORAGE_KEY, idioma);
        localStorage.setItem("proa_lang", idioma);
    } catch (_) {}
}

export function t(clave, idioma = null, fallback = "") {
    const lang = idioma || obtenerIdioma();
    if (diccionario[lang] && diccionario[lang][clave] !== undefined) return diccionario[lang][clave];
    if (diccionario.es && diccionario.es[clave] !== undefined) return diccionario.es[clave];
    return fallback || clave;
}

// ----------------------------------------------------
// 6. TRADUCTOR DE DOM (texto + atributos)
// ----------------------------------------------------
const ATRIBUTOS = ["placeholder", "title", "aria-label", "alt"];
const SEL_ATRIBUTOS = "[placeholder],[title],[aria-label],[alt]";
const TAGS_OMITIDOS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "NOSCRIPT"]);
// Contenido escrito por usuarios (no se traduce): títulos/resúmenes de tarjetas,
// comentarios de reseñas, nombre/email del usuario, texto largo del modal.
const SEL_OMITIR =
    "[data-no-i18n], .nav-user-name, .nav-user-email, h5, .tarjeta-cuerpo p, " +
    ".resena-comentario-texto, .resena-empresa-titulo, #modal-titulo, #modal-texto-largo, .modal-texto";

const textosTraducidos = new Map(); // nodo de texto -> { orig, trans }
const attrsTraducidos = new Map();  // elemento -> { attr: { orig, trans } }
let tituloOriginal = null;

function debeOmitir(el) {
    return !el || TAGS_OMITIDOS.has(el.tagName) || !!el.closest(SEL_OMITIR);
}

function procesarTexto(nodo) {
    const padre = nodo.parentElement;
    if (debeOmitir(padre)) return;
    const rec = textosTraducidos.get(nodo);
    if (rec && nodo.data === rec.trans) return;
    const original = nodo.data;
    const trad = traducirTexto(original);
    if (trad !== null && trad !== original) {
        textosTraducidos.set(nodo, { orig: original, trans: trad });
        nodo.data = trad;
    }
}

function procesarAtributos(el) {
    if (el.closest("[data-no-i18n]")) return;
    for (const a of ATRIBUTOS) {
        const v = el.getAttribute(a);
        if (v === null) continue;
        let rec = attrsTraducidos.get(el);
        const r = rec && rec[a];
        if (r && v === r.trans) continue;
        const trad = traducirTexto(v);
        if (trad !== null && trad !== v) {
            if (!rec) { rec = {}; attrsTraducidos.set(el, rec); }
            rec[a] = { orig: v, trans: trad };
            el.setAttribute(a, trad);
        }
    }
}

function listarTextos(raiz) {
    if (raiz.nodeType === 3) return [raiz];
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    const lista = [];
    let n;
    while ((n = w.nextNode())) lista.push(n);
    return lista;
}

function traducirArbol(raiz) {
    if (!raiz) return;
    listarTextos(raiz).forEach(procesarTexto);
    if (raiz.nodeType === 1) {
        procesarAtributos(raiz);
        raiz.querySelectorAll(SEL_ATRIBUTOS).forEach(procesarAtributos);
    }
}

function traducirTitulo() {
    if (tituloOriginal === null) tituloOriginal = document.title;
    const m = tituloOriginal.match(/^(.*) - Escuela PRoA$/);
    if (m) {
        const trad = traducirNucleo(compactar(m[1]));
        if (trad) document.title = `${trad} - Escuela PRoA`;
    } else {
        const trad = traducirNucleo(compactar(tituloOriginal));
        if (trad) document.title = trad;
    }
}

function restaurarTitulo() {
    if (tituloOriginal !== null) document.title = tituloOriginal;
}

function restaurarTodo() {
    // 1) Nodos y atributos que guardamos
    textosTraducidos.forEach((rec, nodo) => {
        if (nodo.data === rec.trans) nodo.data = rec.orig;
    });
    textosTraducidos.clear();
    attrsTraducidos.forEach((rec, el) => {
        for (const a in rec) {
            if (el.getAttribute(a) === rec[a].trans) el.setAttribute(a, rec[a].orig);
        }
    });
    attrsTraducidos.clear();

    // 2) Red de seguridad: textos en inglés creados mientras estaba activo EN
    //    (p. ej. un botón que restauró su texto desde textContent).
    const inverso = obtenerInverso();
    listarTextos(document.body).forEach(nodo => {
        if (debeOmitir(nodo.parentElement)) return;
        const core = compactar(nodo.data);
        const es = inverso.get(core);
        if (es) {
            const ini = nodo.data.match(/^\s*/)[0];
            const fin = nodo.data.match(/\s*$/)[0];
            nodo.data = ini + es + fin;
        }
    });
    document.querySelectorAll(SEL_ATRIBUTOS).forEach(el => {
        ATRIBUTOS.forEach(a => {
            const v = el.getAttribute(a);
            if (v === null) return;
            const es = inverso.get(compactar(v));
            if (es) el.setAttribute(a, es);
        });
    });
}

function podarDesconectados() {
    textosTraducidos.forEach((_, nodo) => { if (!nodo.isConnected) textosTraducidos.delete(nodo); });
    attrsTraducidos.forEach((_, el) => { if (!el.isConnected) attrsTraducidos.delete(el); });
}

// ----------------------------------------------------
// 7. data-i18n (claves del diccionario)
// ----------------------------------------------------
function aplicarDataI18n(lang) {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        const valor = key && diccionario[lang] && diccionario[lang][key];
        if (valor !== undefined && valor !== null && valor !== "" && el.textContent !== valor) {
            el.textContent = valor;
        }
    });
    [["data-i18n-placeholder", "placeholder"], ["data-i18n-title", "title"]].forEach(([dataAttr, attr]) => {
        document.querySelectorAll(`[${dataAttr}]`).forEach(el => {
            const valor = diccionario[lang] && diccionario[lang][el.getAttribute(dataAttr)];
            if (valor) el.setAttribute(attr, valor);
        });
    });
}

// ----------------------------------------------------
// 8. OBSERVADOR (contenido generado por JavaScript)
// ----------------------------------------------------
let observador = null;
let pendientes = [];
let programado = false;

function opcionesObservador() {
    return { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATRIBUTOS };
}

function procesarPendientes() {
    programado = false;
    if (obtenerIdioma() !== "en" || !observador) { pendientes = []; return; }

    observador.disconnect(); // evita que nuestros propios cambios disparen más mutaciones
    const lista = pendientes;
    pendientes = [];
    lista.forEach(nodo => {
        if (!nodo.isConnected) return;
        if (nodo.nodeType === 3) procesarTexto(nodo);
        else if (nodo.nodeType === 1) traducirArbol(nodo);
    });
    podarDesconectados();
    observador.observe(document.body, opcionesObservador());
}

function programar() {
    if (programado) return;
    programado = true;
    (window.requestAnimationFrame || window.setTimeout)(procesarPendientes);
}

function iniciarObservador() {
    if (observador || !document.body) return;
    observador = new MutationObserver(mutaciones => {
        for (const m of mutaciones) {
            if (m.type === "childList") m.addedNodes.forEach(n => pendientes.push(n));
            else pendientes.push(m.target); // characterData o attributes
        }
        programar();
    });
    observador.observe(document.body, opcionesObservador());
}

function detenerObservador() {
    if (observador) {
        observador.disconnect();
        observador = null;
    }
    pendientes = [];
}

// ----------------------------------------------------
// 9. API PÚBLICA
// ----------------------------------------------------
export function aplicarTraducciones(idioma) {
    const lang = idioma === "en" ? "en" : "es";
    document.documentElement.lang = lang;

    detenerObservador();
    aplicarDataI18n(lang);

    if (lang === "en") {
        traducirArbol(document.body);
        traducirTitulo();
        iniciarObservador();
    } else {
        restaurarTodo();
        restaurarTitulo();
    }

    window.dispatchEvent(new CustomEvent("proa:idiomaCambiado", { detail: { idioma: lang } }));
}

export function alternarIdioma() {
    const nuevo = obtenerIdioma() === "es" ? "en" : "es";
    guardarIdioma(nuevo);
    aplicarTraducciones(nuevo);
    return nuevo;
}

// ----------------------------------------------------
// 10. alert() y confirm() TRADUCIDOS
// ----------------------------------------------------
export function traducirMensaje(msg) {
    if (obtenerIdioma() !== "en") return msg;
    const s = String(msg);
    const completo = traducirNucleo(compactar(s));
    if (completo !== null) return completo;
    return s.split("\n").map(linea => {
        const core = compactar(linea);
        if (!core) return linea;
        const trad = traducirNucleo(core);
        return trad === null ? linea : trad;
    }).join("\n");
}

if (typeof window !== "undefined" && !window.__proaDialogosTraducidos) {
    window.__proaDialogosTraducidos = true;
    const alertOriginal = window.alert.bind(window);
    const confirmOriginal = window.confirm.bind(window);
    window.alert = (msg) => alertOriginal(traducirMensaje(msg));
    window.confirm = (msg) => confirmOriginal(traducirMensaje(msg));
}

// ----------------------------------------------------
// 11. TRADUCCIÓN TEMPRANA (evita ver español un instante)
// ----------------------------------------------------
if (typeof document !== "undefined" && typeof window !== "undefined") {
    const inicio = () => { if (obtenerIdioma() === "en") aplicarTraducciones("en"); };
    if (document.readyState === "complete") inicio();
    else document.addEventListener("DOMContentLoaded", inicio);
}