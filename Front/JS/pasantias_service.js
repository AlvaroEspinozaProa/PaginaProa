import supabase from "./supabase.js";

const TABLA_PASANTIAS = "postulaciones_empresas";

// ======================================
// 1. CREAR POSTULACIÓN DE EMPRESA
// ======================================
export async function crearPostulacionEmpresa({
    nombre_empresa,
    rubro,
    contacto_nombre,
    email,
    telefono,
    vacantes,
    mensaje
}) {
    const { data, error } = await supabase
        .from(TABLA_PASANTIAS)
        .insert({
            nombre_empresa,
            rubro: rubro || "No especificado",
            contacto_nombre,
            email,
            telefono: telefono || "",
            vacantes: parseInt(vacantes) || 1,
            mensaje: mensaje || "",
            estado: "Pendiente",
        })
        .select();

    if (error) {
        console.error("Error al registrar postulación de empresa en Supabase:", error);
        return { exito: false, error: error.message };
    }

    return { exito: true, data };
}

// ======================================
// 2. OBTENER TODAS LAS POSTULACIONES (ADMIN)
// ======================================
export async function obtenerPostulacionesEmpresas() {
    const { data, error } = await supabase
        .from(TABLA_PASANTIAS)
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error al obtener postulaciones en Supabase:", error);
        return [];
    }

    return data || [];
}

// ======================================
// 3. ACTUALIZAR ESTADO DE POSTULACIÓN (ADMIN)
// ======================================
export async function actualizarEstadoPostulacion(id, nuevoEstado) {
    const { error } = await supabase
        .from(TABLA_PASANTIAS)
        .update({ estado: nuevoEstado })
        .eq("id", id);

    if (error) {
        console.error("Error al actualizar estado en Supabase:", error);
        return false;
    }

    return true;
}

// ======================================
// 4. ELIMINAR POSTULACIÓN (ADMIN)
// ======================================
export async function eliminarPostulacionEmpresa(id) {
    const { error } = await supabase
        .from(TABLA_PASANTIAS)
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error al eliminar postulación en Supabase:", error);
        return false;
    }

    return true;
}
