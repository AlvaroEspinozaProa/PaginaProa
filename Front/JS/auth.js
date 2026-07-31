import supabase from "./supabase.js";

// ===============================
// VALIDAR CORREO INSTITUCIONAL
// ===============================

export function esCorreoInstitucional(email) {
    if (!email) return false;
    return email.trim().toLowerCase().endsWith("@escuelasproa.edu.ar");
}

// ===============================
// OBTENER USUARIO ACTUAL
// ===============================

export async function obtenerUsuarioActual() {

    const {
        data: { user },
        error
    } = await supabase.auth.getUser();

    if (error) {
        console.error(error);
        return null;
    }

    return user;
}

// ===============================
// OBTENER PERFIL
// ===============================

export async function obtenerPerfil() {

    const usuario = await obtenerUsuarioActual();

    if (!usuario) return null;

    const { data, error } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id", usuario.id)
        .single();

    if (error) {
        console.warn("No se encontró perfil en tabla 'perfiles' o ocurrió un error:", error.message);
        return null;
    }

    return data;
}

// Lista de correos administradores por defecto (Para pruebas y respaldo)
const CORREOS_ADMIN_INICIALES = [
    "aeperalta@escuelasproa.edu.ar",
    "admin@escuelasproa.edu.ar"
];

// ===============================
// OBTENER ROL
// ===============================

export async function obtenerRol() {

    const usuario = await obtenerUsuarioActual();

    if (!usuario) return null;

    // 1. Verificar si existe registro en la tabla 'perfiles' de Supabase
    const perfil = await obtenerPerfil();

    if (perfil && perfil.rol) {
        return perfil.rol;
    }

    // 2. Verificar metadatos de usuario en Supabase Auth
    if (usuario.user_metadata && usuario.user_metadata.rol) {
        return usuario.user_metadata.rol;
    }

    // 3. Verificación rápida por correo para el equipo de desarrollo/pasantía
    const emailNormalizado = (usuario.email || "").toLowerCase().trim();
    if (CORREOS_ADMIN_INICIALES.includes(emailNormalizado)) {
        return "admin";
    }

    return "estudiante";
}


// ===============================
// ¿ESTÁ LOGUEADO?
// ===============================

export async function estaLogueado() {

    const usuario = await obtenerUsuarioActual();

    return usuario !== null;
}

// ===============================
// ¿ES ADMIN?
// ===============================

export async function esAdmin() {

    const rol = await obtenerRol();

    return rol === "admin";
}

// ===============================
// LOGIN
// ===============================

export async function iniciarSesion(email, password) {

    return await supabase.auth.signInWithPassword({

        email,
        password

    });

}

// ===============================
// LOGOUT
// ===============================

export async function cerrarSesion() {

    return await supabase.auth.signOut();

}