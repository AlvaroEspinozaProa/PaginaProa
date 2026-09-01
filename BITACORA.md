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

## 📋 Próximas Tareas y Hoja de Ruta
- [x] Integrar la verificación de dominio `@escuelasproa.edu.ar` en autenticación (`auth.js` y `registro.js`).
- [x] Crear e integrar el script SQL `handle_new_user` y políticas RLS para la tabla `perfiles`.
- [x] Desarrollar la vista de perfil de usuario (`perfil.html`) con badges y estado de pasantías.
- [x] Unificar el módulo de horarios con ordenamiento cronológico y exportación a PDF.
- [x] Estandarizar la navegación global (`navigation.js`) con indicador dinámico de sesión.
- [x] Completar el CRUD del **Tablón de Novedades** con Supabase.
- [ ] Diseñar y desarrollar la estructura del **Foro Estudiantil**.
- [ ] Implementar herramientas avanzadas de moderación del Foro para administradores.
