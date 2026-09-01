import supabase from "./supabase.js";

// Helper para verificar si un correo pertenece al dominio de estudiantes
export function esCorreoInstitucional(email) {
    return Boolean(email && email.toLowerCase().endsWith("@escuelasproa.edu.ar"));
}

// Verificar si el usuario actual es admin (silencioso en try/catch)
export async function esAdmin() {
    try {
        const user = await obtenerUsuarioActual();
        if (!user) return false;

        const { data, error } = await supabase
            .from('perfiles')
            .select('rol')
            .eq('id', user.id)
            .maybeSingle();

        if (error || !data) return false;
        return data.rol === 'admin';
    } catch (err) {
        return false;
    }
}

// Obtener usuario actual autenticado (silencioso en try/catch)
export async function obtenerUsuarioActual() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) return null;
        return session.user;
    } catch (err) {
        return null;
    }
}

// Obtener perfil completo (nombre, rol, avatar_url, estado_postulacion)
export async function obtenerPerfil() {
    try {
        const user = await obtenerUsuarioActual();
        if (!user) return null;

        const { data, error } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (error || !data) return null;
        return data;
    } catch (err) {
        return null;
    }
}

// Iniciar sesión
export async function iniciarSesion(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });
    return { data, error };
}

// Registrar usuario
export async function registrarUsuario(email, password, nombre) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { nombre }
            }
        });
        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
}

// Recuperar contraseña
export async function recuperarContraseña(email) {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/sesion.html',
        });
        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
}

// Cerrar sesión
export async function cerrarSesion() {
    try {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            window.location.href = "index.html";
        }
    } catch (err) {
        window.location.href = "index.html";
    }
}