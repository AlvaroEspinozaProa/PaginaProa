# Bitácora de Proyecto - Sitio Web Oficial Escuela PRoA

## 📌 Resumen del Proyecto
Rediseño y actualización del sitio web institucional de la Escuela PRoA (Despeñaderos / Córdoba), desarrollado en el marco de las pasantías escolares.

### 👥 Equipo de Trabajo (6 Integrantes)
- Avril Rincon
- Matias Mercado
- Bautista Galetto
- Agustina Carrizo
- Antonella Peralta
- Benjamin Monchietti

---

## 🛠️ Estado Tecnológico
- **Frontend:** HTML5, CSS3 (Vanilla CSS modular), JavaScript (ES Modules).
- **Backend / Database:** Supabase (Autenticación, Base de datos PostgreSQL, Panel de administración).
- **Control de Versiones:** Git & GitHub.

---

## 🌐 Estructura de Secciones

1. **Home (`index.html`):**
   - Quiénes somos y orientación educativa.
   - Estructura escolar, materias y clubs.
   - Fotos reales del edificio institucional.

2. **ProA Projects (`proyectos.html` / `tarjeta.html`):**
   - Proyectos clave: Mentores digitales, Bike Spot, App Orchestra, Modelo ONU, Muestras visuales, Recicladores inteligentes, Objetos reciclados, Mascotas escolares, etc.

3. **Sports (`deporte.html`):**
   - Torneos y competencias institucionales (CBA Plays, campeonatos Libertad, Tecnobuho, camisetas deportivas).

4. **Student Center / Centro de Estudiantes (`cde.html`):**
   - Explicación del CDE, procesos de elecciones, campañas y actividades (stands, conferencias, eventos de cumpleaños).

5. **Internships / Pasantías (`pasantias.html`):**
   - Información sobre las pasantías, testimonios/experiencias, beneficios.
   - Formulario de contacto y postulación destinado a **empresas**.

6. **Bulletin Board / Tablón (`tablon.html`):**
   - Panel de anuncios y novedades institucionales y del CDE.

---

## 🔐 Decisiones de Diseño y Reglas de Negocio (Actualizadas)

### 1. Sistema de Cuentas y Foro (Implementación a Futuro)
- Los estudiantes podrán registrarse e iniciar sesión para interactuar en un **Foro Estudiantil**.

### 2. Filtro Estricto de Registro (Seguridad)
- Restricción de registro y acceso exclusivo para cuentas institucionales con el dominio oficial:
  $$\text{email} \in \{ @escuelasproa.edu.ar \}$$
- Se denegará el registro a cualquier dirección con dominios externos (`gmail.com`, `hotmail.com`, etc.).

### 3. Moderación y Privilegios de Administrador (Admin)
- **Rol `admin`:**
  - Control de publicación y edición en el **Tablón de Novedades**.
  - Supervisión del **Foro Estudiantil**: capacidad de auditar publicaciones y eliminar cualquier contenido inapropiado o violatorio de las normas escolares.

### 4. Decisiones de Secciones Descartadas
- **Sección de empleo descartada:** Se eliminó la propuesta de postulación directa de empleos para alumnos por conflictos de interés institucional. Se mantiene únicamente el enfoque de pasantías con empresas.

---

## 🗄️ Esquema de Base de Datos (Supabase)

### Tabla `perfiles`:
- `id` (uuid, clave primaria, FK a `auth.users.id`)
- `created_at` (timestamptz)
- `nombre` (text, opcional)
- `rol` (text: `'admin'` | `'estudiante'`)

### Tabla `Tablon`:
- `id` (uuid / int8, clave primaria)
- `created_at` (timestamptz)
- `titulo` (text)
- `resumen` (text)
- `contenido` (text)
- `archivo_url` (text, opcional)

---

## 📋 Próximas Tareas y Hoja de Ruta
- [x] Integrar la verificación de dominio `@escuelasproa.edu.ar` en autenticación (`auth.js` y `login.js`).
- [x] Completar el CRUD del **Tablón de Novedades** con Supabase (Crear, Leer, Editar, Borrar).
- [x] Implementar la interfaz dinámica responsiva y adaptativa según rol (`admin` / `estudiante`).
- [ ] Diseñar y desarrollar la interfaz y la estructura para el **Foro Estudiantil**.
- [ ] Implementar herramientas avanzadas de moderación del Foro para administradores.

