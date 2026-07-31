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

        console.error(error);
        return [];

    }

    return data;

}

//======================================
// SUBIR ARCHIVO
//======================================

export async function subirArchivo(file) {

    if (!file) return null;

    const nombreArchivo =
        Date.now() + "_" + file.name.replaceAll(" ", "_");

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(nombreArchivo, file);

    if (error) {

        console.error(error);
        return null;

    }

    const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(nombreArchivo);

    return data.publicUrl;

}

//======================================
// CREAR NOTICIA
//======================================

export async function publicarNoticia({

    titulo,
    resumen,
    contenido,
    archivo

}) {

    let archivo_url = null;

    if (archivo) {

        archivo_url = await subirArchivo(archivo);

    }

    const { error } = await supabase
        .from(TABLA)
        .insert({

            titulo,
            resumen,
            contenido,
            archivo_url

        });

    if (error) {

        console.error(error);
        return false;

    }

    return true;

}

//======================================
// ELIMINAR
//======================================

export async function eliminarNoticia(id) {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq("id", id);

    if (error) {

        console.error(error);
        return false;

    }

    return true;

}

//======================================
// ACTUALIZAR / EDITAR NOTICIA
//======================================

export async function actualizarNoticia(id, {

    titulo,
    resumen,
    contenido,
    archivo

}) {

    const datosActualizar = {

        titulo,
        resumen,
        contenido

    };

    if (archivo) {

        const archivo_url = await subirArchivo(archivo);
        if (archivo_url) {
            datosActualizar.archivo_url = archivo_url;
        }

    }

    const { error } = await supabase
        .from(TABLA)
        .update(datosActualizar)
        .eq("id", id);

    if (error) {

        console.error(error);
        return false;

    }

    return true;

}