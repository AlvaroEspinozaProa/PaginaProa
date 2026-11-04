import supabase from "./supabase.js";

const BUCKET = "adjuntos_noticias";
const TABLA = "Tablon";

//======================================
// OBTENER TODAS LAS NOTICIAS
//======================================
export async function obtenerNoticias() {
    const { data, error } = await supabase
        .from(TABLA)
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error al obtener noticias:", error);
        return [];
    }

    return data || [];
}

//======================================
// SUBIR ARCHIVO (REL-07)
//======================================
export async function subirArchivo(file) {
    if (!file) return null;

    // Sanitización robusta: normalizar tildes, eñes, espacios y caracteres no ASCII
    const nombreLimpio = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_");

    const nombreArchivo = `${Date.now()}_${nombreLimpio}`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(nombreArchivo, file, {
            cacheControl: "3600",
            upsert: false
        });

    if (error) {
        console.error("Error al subir archivo a Storage:", error);
        throw new Error(`No se pudo subir el archivo: ${error.message}`);
    }

    const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(nombreArchivo);

    return data.publicUrl;
}

//======================================
// CREAR NOTICIA (REL-19 & SEC-04)
//======================================
export async function publicarNoticia({
    titulo,
    resumen,
    contenido,
    archivo,
    etiqueta
}) {
    let archivo_url = null;

    if (archivo) {
        try {
            archivo_url = await subirArchivo(archivo);
        } catch (err) {
            console.error(err);
            return { exito: false, error: err.message };
        }
    }

    // No se antepone [Etiqueta] al texto del resumen (REL-19)
    const payload = {
        titulo: titulo.trim(),
        resumen: resumen.trim(),
        contenido: contenido.trim(),
        archivo_url
    };

    if (etiqueta && etiqueta.trim() !== "") {
        payload.etiqueta = etiqueta.trim();
    }

    let { data, error } = await supabase
        .from(TABLA)
        .insert(payload)
        .select();

    // Fallback por si la columna "etiqueta" aún no fue creada en la tabla de Supabase
    if (error && error.message && error.message.includes("etiqueta")) {
        delete payload.etiqueta;
        const result = await supabase.from(TABLA).insert(payload).select();
        data = result.data;
        error = result.error;
    }

    if (error) {
        console.error("Error al publicar noticia en Supabase:", error);
        return { exito: false, error: error.message };
    }

    if (!data || data.length === 0) {
        return { exito: false, error: "No se pudo insertar la noticia (bloqueo RLS)." };
    }

    return { exito: true, data: data[0] };
}

//======================================
// ELIMINAR NOTICIA (SEC-04)
//======================================
export async function eliminarNoticia(id) {
    // Si la noticia tenía un archivo adjunto, intentamos borrarlo de Storage
    try {
        const { data: noticia } = await supabase
            .from(TABLA)
            .select("archivo_url")
            .eq("id", id)
            .maybeSingle();

        if (noticia && noticia.archivo_url) {
            const partes = noticia.archivo_url.split("/");
            const pathArchivo = partes[partes.length - 1];
            if (pathArchivo) {
                await supabase.storage.from(BUCKET).remove([decodeURIComponent(pathArchivo)]);
            }
        }
    } catch (e) {
        console.warn("No se pudo limpiar el archivo adjunto huérfano de Storage:", e);
    }

    const { data, error } = await supabase
        .from(TABLA)
        .delete()
        .eq("id", id)
        .select();

    if (error) {
        console.error("Error al eliminar noticia:", error);
        return false;
    }

    if (!data || data.length === 0) {
        console.warn("No se eliminó ninguna fila (posible bloqueo RLS).");
        return false;
    }

    return true;
}

//======================================
// ACTUALIZAR / EDITAR NOTICIA (REL-19 & SEC-04)
//======================================
export async function actualizarNoticia(id, {
    titulo,
    resumen,
    contenido,
    archivo,
    etiqueta
}) {
    const datosActualizar = {
        titulo: titulo.trim(),
        resumen: resumen.trim(),
        contenido: contenido.trim()
    };

    if (archivo) {
        try {
            const archivo_url = await subirArchivo(archivo);
            if (archivo_url) {
                datosActualizar.archivo_url = archivo_url;
            }
        } catch (err) {
            console.error("Error al subir nuevo archivo en edición:", err);
            return false;
        }
    }

    if (etiqueta && etiqueta.trim() !== "") {
        datosActualizar.etiqueta = etiqueta.trim();
    }

    let { data, error } = await supabase
        .from(TABLA)
        .update(datosActualizar)
        .eq("id", id)
        .select();

    // Fallback si no existe la columna etiqueta
    if (error && error.message && error.message.includes("etiqueta")) {
        delete datosActualizar.etiqueta;
        const result = await supabase.from(TABLA).update(datosActualizar).eq("id", id).select();
        data = result.data;
        error = result.error;
    }

    if (error) {
        console.error("Error al actualizar noticia:", error);
        return false;
    }

    if (!data || data.length === 0) {
        console.warn("No se afectó ninguna noticia al actualizar (posible bloqueo RLS).");
        return false;
    }

    return true;
}
