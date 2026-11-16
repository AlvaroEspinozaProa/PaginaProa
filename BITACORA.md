# Bitácora de Proyecto - Sitio Web Oficial Escuela PRoA

## 📌 Resumen del Proyecto
Rediseño y actualización de la plataforma web institucional de la Escuela PRoA (Despeñaderos / Córdoba), desarrollado en el marco de las pasantías escolares. El sistema cuenta con autenticación y gestión de datos vía Supabase e interfaz moderna inspirada en patrones Uiverse.

### 👥 Equipo de Trabajo (6 Integrantes)
- Avril Rincon
- Matias Mercado
- Bautista Galetto
- Agustina Carrizo
- Antonella Peralta
- Benjamin Monchietti

---

## 🛠️ Estado Tecnológico
- **Frontend:** HTML5, CSS3 (Vanilla CSS modular con diseño Uiverse), JavaScript (ES Modules).
- **Backend / Database:** Supabase (Autenticación PostgreSQL, Triggers, RLS, Storage & REST API).
- **Librerías Adicionales:** FontAwesome 6, html2pdf.js (exportación de horarios a PDF), EmailJS (notificaciones de pasantías).
- **Control de Versiones:** Git & GitHub.

---

## 🌐 Estructura de Secciones

1. **Home (`index.html`):**
   - Quiénes somos y orientación educativa en desarrollo de software.
   - Estructura escolar, materias y clubs.
   - Fotos reales del edificio institucional.

2. **ProA Projects (`proyectos.html` / `tarjeta.html`):**
   - Proyectos clave: Mentores digitales, Bike Spot, App Orchestra, Modelo ONU, Muestras visuales, Recicladores inteligentes, Mascotas escolares.

3. **Sports (`deporte.html`):**
   - Torneos y competencias institucionales (CBA Plays, campeonatos Libertad, Tecnobuho, camisetas deportivas).

4. **Student Center / Centro de Estudiantes (`cde.html`):**
   - Explicación del CDE, procesos de elecciones, campañas y actividades.

5. **Internships / Pasantías (`pasantias.html`):**
   - Información sobre pasantías y formulario dinámico para **empresas**.
   - Panel de administración para revisar, filtrar y cambiar estados de postulación con notificaciones vía EmailJS.

6. **Bulletin Board / Tablón (`tablon.html`):**
   - Panel de anuncios y novedades institucionales y del CDE con soporte CRUD completo para administradores.

7. **Schedules / Horarios (`horarios.html`):**
   - Grilla semanal proporcional por curso (1° a 6° Año) con ordenamiento cronológico automático de bloques, panel dinámico modal y exportación a PDF.

8. **User Profile / Mi Perfil (`perfil.html`):**
   - Gestión visual del perfil de usuario con tarjetas estilo Uiverse, avatar por defecto (DiceBear), badges dinámicos de rol (`admin`, `estudiante`, `comun`) y estado de postulación a pasantías.

---

## 🔐 Decisiones de Diseño y Reglas de Negocio (Actualizadas)

### 1. Asignación Automática de Roles y Filtros de Registro
- Los correos con el dominio institucional `@escuelasproa.edu.ar` reciben automáticamente el rol `estudiante`.
- Los correos externos (`gmail.com`, etc.) son asignados al rol `comun` (empresas / externos).
- El rol `admin` otorga privilegios totales sobre la gestión de contenidos (Tablón, Horarios y Pasantías).

### 2. Moderación y Privilegios de Administrador (Admin)
- **Rol `admin`:**
  - Control de publicación, edición y eliminación en el **Tablón de Novedades**.
  - Creación, edición y eliminación de bloques de horarios por curso.
  - Administración de postulaciones de empresas en el módulo de pasantías.

### 3. Navegación Global Uniforme y Estado de Sesión
- Barra de navegación global inyectada dinámicamente mediante `navigation.js`.
- Incluye acceso estandarizado a `perfil.html` en todas las páginas.
- Soporte dinámico para resaltar de forma silenciosa la sesión activa mediante un indicador verde en la pestaña "Mi Perfil".

---

## 🚀 Modificaciones Recientes e Hitos Implementados

### 1. Corrección del Trigger en Supabase (`handle_new_user`) y Políticas RLS
- **Script SQL:** Creado en `Back/supabase_setup.sql`.
- **Automatización de Roles y Avatares:** El trigger `handle_new_user` captura la creación de usuarios en `auth.users`, asigna el rol `estudiante` si el correo finaliza en `@escuelasproa.edu.ar` o `comun` en caso contrario, y asigna un avatar por defecto utilizando la API de DiceBear.
- **Prevención de Error 500:** Se incorporó un bloque de excepciones (`EXCEPTION WHEN OTHERS THEN RETURN NEW;`) dentro del trigger para evitar fallos de servidor (500) en el proceso de registro.
- **Políticas RLS en `perfiles`:** Configuración de reglas para permitir la lectura y actualización del propio perfil y otorgar acceso total de administración a usuarios con rol `admin`.

### 2. Vista y Gestión de Perfiles (`perfil.html`)
- **Interfaz Uiverse:** Diseño de tarjeta centralizada con gradientes modernos, avatar circular dinámico y soporte de fallback si falla la imagen.
- **Badges Dinámicos de Rol:**
  - `Admin`: Badge destacado en gradiente rojo con icono de corona.
  - `Estudiante`: Badge azul con icono de graduación y mensaje informativo institucional.
  - `Externo / Empresa`: Badge gris con icono de edificio.
- **Estado de Postulación:** Visualización del estado del trámite de pasantía (`Pendiente`, `Contactado`, `Aceptado`, `Rechazado`, `No postulado`) mediante etiquetas de colores.
- **Cierre de Sesión:** Integración limpia con la función `cerrarSesion()` de `auth.js`.

### 3. Unificación y Optimización del Módulo de Horarios (`horarios.html` y `./JS/horarios_asistente_main.js`)
- **Ordenamiento Cronológico Estricto:** Algoritmo que convierte la hora de inicio a minutos desde medianoche (`convertirMinutos()`) para ordenar automáticamente todos los bloques del día sin importar el orden de inserción.
- **Panel de Carga Dinámico:** Modal guiado (`#panel-carga`) que adapta sus campos según el tipo de bloque seleccionado (`materia`, `recreo`, `almuerzo`, `ingreso`, `salida`) y gestiona la asignación de profesores.
- **Exportación a PDF:** Inclusión del SDK `html2pdf.js` y función `exportarHorarioAPDF()` para descargar la grilla de horarios del curso seleccionado en formato PDF horizontal (A4), incluyendo un fallback automático a `window.print()` con reglas `@media print`.

### 4. Estandarización de la Barra de Navegación Global (`JS/navigation.js`)
- Unificación del menú en todos los archivos HTML del sitio.
- Inclusión homogénea de la opción `Mi Perfil` (`perfil.html`).
- Verificación asíncrona y silenciosa del estado de sesión (`obtenerUsuarioActual()`) para mostrar un indicador activo verde sin interferir con la navegación de usuarios no autenticados.

---

## 📋 Próximas Tareas y Hoja de Ruta
- [x] Integrar la verificación de dominio `@escuelasproa.edu.ar` en autenticación.
- [x] Crear e integrar el script SQL `handle_new_user` y políticas RLS para `perfiles`.
- [x] Desarrollar la vista de perfil de usuario (`perfil.html`) con badges y estado de pasantías.
- [x] Unificar el módulo de horarios con ordenamiento cronológico y exportación a PDF.
- [x] Estandarizar la navegación global (`navigation.js`) con indicador dinámico de sesión.
- [x] Completar el CRUD del **Tablón de Novedades** con Supabase.
- [x] Implementar CRUD completo para **Centro de Estudiantes** (`cde.html` / `cde.js`).
- [x] Implementar CRUD completo para **Proyectos Institucionales** (`proyectos.html` / `proyectos.js`).
- [x] Implementar CRUD completo para **Deportes** (`deporte.html` / `deportes.js`).
- [ ] Diseñar y desarrollar la estructura del **Foro Estudiantil**.
- [ ] Implementar herramientas avanzadas de moderación del Foro para administradores.
- [ ] Configurar políticas RLS en Supabase para las tablas `centro_estudiantes`, `proyectos` y `deportes`.

---

## 🗄️ Esquema de Base de Datos (Supabase)

### Tabla `perfiles`:
- `id` (UUID, clave primaria, FK a `auth.users.id`)
- `created_at` (TIMESTAMPTZ)
- `email` (TEXT, único, NOT NULL)
- `nombre` (TEXT)
- `rol` (TEXT: `'admin'` | `'estudiante'` | `'comun'`)
- `avatar_url` (TEXT)
- `estado_postulacion` (TEXT)

### Tabla `Tablon`:
- `id` (BIGINT / UUID, clave primaria)
- `created_at` (TIMESTAMPTZ)
- `titulo` (TEXT)
- `resumen` (TEXT)
- `contenido` (TEXT)
- `archivo_url` (TEXT, opcional)

### Tabla `horarios_por_curso`:
- `id` (BIGINT / UUID, clave primaria)
- `curso` (TEXT, ej: `'6° Año'`)
- `dia` (TEXT, ej: `'lunes'`)
- `hora_inicio` (TEXT, ej: `'08:00'`)
- `hora_fin` (TEXT, ej: `'09:20'`)
- `tipo` (TEXT: `'materia'` | `'recreo'` | `'almuerzo'` | `'ingreso'` | `'salida'`)
- `contenido` (JSONTEXT, titulo y profesor)
- `orden` (INT)
- `duracion` (INT, en minutos)

---

### 5. CRUD Completo — Centro de Estudiantes, Proyectos y Deportes

#### Centro de Estudiantes (`cde.html` / `JS/cde.js`)
- Conexión con la tabla `centro_estudiantes` de Supabase (columnas: `id`, `titulo`, `contenido`, `categoria`, `archivo_url`, `fecha`).
- Grilla dinámica que carga publicaciones desde Supabase al iniciar la página, con estados de carga, vacío y error.
- **Panel de administración** protegido (visible solo con sesión admin activa via `esAdmin()` de `auth.js`):
  - Botón "Nueva Publicación" que abre un modal con formulario completo (título, categoría, contenido, archivo adjunto).
  - Botones **Editar** y **Borrar** inyectados dinámicamente en cada tarjeta solo cuando el usuario es admin.
  - Edición en modal reutilizable con pre-carga de datos del registro.
  - Borrado con `confirm()` de confirmación previa antes de ejecutar el DELETE en Supabase.
  - Subida de archivos adjuntos al bucket `adjuntos_noticias` de Supabase Storage con sanitización de nombres.
- Las tarjetas estáticas originales se conservan como contenido fijo, y las dinámicas se cargan en su propia sección separada.

#### Proyectos Institucionales (`proyectos.html` / `JS/proyectos.js`)
- Conexión con la tabla `proyectos` de Supabase (columnas: `id`, `titulo`, `descripcion`, `autor`, `estado`, `link_repositorio`, `imagen_url`).
- Grilla dinámica con tarjetas que incluyen badge de estado coloreado (`En desarrollo`, `Completado`, `Pausado`, `Propuesta`).
- **Panel de administración** protegido:
  - Formulario modal para crear proyectos con campos: título, descripción, autor, estado (dropdown), link de repositorio y URL de imagen.
  - Botones **Editar** y **Borrar** en cada tarjeta dinámica solo para admins.
  - Pre-carga completa de datos en edición; actualización vía `UPDATE` en Supabase.
  - Confirmación antes de borrar con feedback visual de éxito/error.
- Proyectos estáticos originales se mantienen intactos en la misma página.

#### Sección Deportes (`deporte.html` / `JS/deportes.js`)
- Conexión con la tabla `deportes` de Supabase (columnas: `id`, `titulo`, `descripcion`, `categoria`, `horario`, `imagen_url`).
- Grilla dinámica para torneos, entrenamientos y eventos deportivos con icono dinámico por categoría.
- **Panel de administración** protegido:
  - Formulario modal para agregar actividades: título, categoría (Competencias, Recreación, Torneos, Entrenamientos, Trabajo en Equipo, Eventos), descripción, horario/fecha y URL de imagen.
  - Botones **Editar** y **Borrar** en cada tarjeta dinámica solo para admins.
  - Misma lógica de creación, edición y borrado con confirmación.

#### Verificaciones Generales (las 3 páginas)
- `esAdmin()` consultado al inicio via `auth.js` → oculta/muestra barras admin y botones CRUD dinámicamente.
- `data-seccion` en `<body>` de cada página para aplicar la paleta de colores CSS correcta del tema (`cde`, `proyectos`, `deportes`).
- Estilos compartidos para modales, botones admin y estados de UI agregados al final de `proa.css`.
- Marcador de conflicto Git residual (`>>>>>>> f93853e...`) en `proa.css` eliminado.

---

## 📋 Próximas Tareas y Hoja de Ruta
- [x] Integrar la verificación de dominio `@escuelasproa.edu.ar` en autenticación.
- [x] Crear e integrar el script SQL `handle_new_user` y políticas RLS para `perfiles`.
- [x] Desarrollar la vista de perfil de usuario (`perfil.html`) con badges y estado de pasantías.
- [x] Unificar el módulo de horarios con ordenamiento cronológico y exportación a PDF.
- [x] Estandarizar la navegación global (`navigation.js`) con indicador dinámico de sesión.
- [x] Completar el CRUD del **Tablón de Novedades** con Supabase.
- [x] Implementar CRUD completo para **Centro de Estudiantes** (`cde.html` / `cde.js`).
- [x] Implementar CRUD completo para **Proyectos Institucionales** (`proyectos.html` / `proyectos.js`).
- [x] Implementar CRUD completo para **Deportes** (`deporte.html` / `deportes.js`).
- [ ] Diseñar y desarrollar la estructura del **Foro Estudiantil**.
- [ ] Implementar herramientas avanzadas de moderación del Foro para administradores.
- [ ] Configurar políticas RLS en Supabase para las tablas `centro_estudiantes`, `proyectos` y `deportes`.

---

## 🗄️ Esquema de Base de Datos (Supabase)


### Tabla `centro_estudiantes`:
- `id` (BIGINT / UUID, clave primaria)
- `titulo` (TEXT, NOT NULL)
- `contenido` (TEXT)
- `categoria` (TEXT: `'Institucional'` | `'Participación'` | `'Proyectos CDE'` | `'Eventos'` | `'General'`)
- `archivo_url` (TEXT, opcional — URL pública de Supabase Storage)
- `fecha` (TIMESTAMPTZ)

### Tabla `proyectos`:
- `id` (BIGINT / UUID, clave primaria)
- `titulo` (TEXT, NOT NULL)
- `descripcion` (TEXT)
- `autor` (TEXT, opcional)
- `estado` (TEXT: `'En desarrollo'` | `'Completado'` | `'Pausado'` | `'Propuesta'`)
- `link_repositorio` (TEXT, opcional)
- `imagen_url` (TEXT, opcional)

### Tabla `deportes`:
- `id` (BIGINT / UUID, clave primaria)
- `titulo` (TEXT, NOT NULL)
- `descripcion` (TEXT)
- `categoria` (TEXT: `'Competencias'` | `'Recreación'` | `'Torneos'` | `'Entrenamientos'` | `'Trabajo en Equipo'` | `'Eventos'`)
- `horario` (TEXT, opcional — texto libre: ej. `'Viernes 15:00 hs'`)
- `imagen_url` (TEXT, opcional)

> **Nota RLS pendiente:** Las tres tablas requieren políticas de Row Level Security en Supabase:
> - `SELECT` público (anon).
> - `INSERT`, `UPDATE`, `DELETE` restringidos a usuarios con `rol = 'admin'` en la tabla `perfiles`.
