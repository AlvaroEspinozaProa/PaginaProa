import supabase from "./supabase.js";

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
        console.error(error);
        return null;
    }

    return data;
}

// ===============================
// OBTENER ROL
// ===============================

export async function obtenerRol() {

    const perfil = await obtenerPerfil();

    if (!perfil) return null;

    return perfil.rol;
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