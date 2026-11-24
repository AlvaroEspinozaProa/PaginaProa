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

        // La cuenta principal de Super Admin posee rol de administrador garantizado
        if (user.email && user.email.toLowerCase().trim() === 'despenaderos.ds@escuelasproa.edu.ar') {
            return true;
        }

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

        if (!error && data) {
            const esSuperAdmin = user.email && user.email.toLowerCase().trim() === 'despenaderos.ds@escuelasproa.edu.ar';
            return {
                ...data,
                email: data.email || user.email,
                nombre: data.nombre || user.user_metadata?.nombre || (user.email ? user.email.split('@')[0] : "Usuario"),
                rol: esSuperAdmin ? 'admin' : (data.rol || (esCorreoInstitucional(user.email) ? 'estudiante' : 'comun'))
            };
        }

        // Fallback resiliente: el usuario está autenticado en Supabase pero aún no tiene fila en 'perfiles'
        const esSuperAdmin = Boolean(user.email && user.email.toLowerCase().trim() === 'despenaderos.ds@escuelasproa.edu.ar');
        return {
            id: user.id,
            email: user.email,
            nombre: user.user_metadata?.nombre || (user.email ? user.email.split('@')[0] : "Usuario"),
            rol: esSuperAdmin ? 'admin' : (esCorreoInstitucional(user.email) ? 'estudiante' : 'comun'),
            avatar_url: null,
            estado_postulacion: 'No postulado'
        };
    } catch (err) {
        console.warn("Excepción al obtener perfil:", err);
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

// Actualizar contraseña tras recuperación (PASSWORD_RECOVERY)
export async function actualizarContraseña(nuevaPassword) {
    try {
        const { data, error } = await supabase.auth.updateUser({
            password: nuevaPassword
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