import supabase from "./supabase.js";

const TABLA_RESENAS = "resenas_pasantias";
const TABLA_LIKES = "resenas_likes";
const TABLA_PERFILES = "perfiles";
const BUCKET_IMAGENES = "resenas_pasantias";

// ======================================
// 1. OBTENER RESEÑAS CON AUTOR DE PERFILES Y CONTEO DE LIKES
// ======================================
export async function obtenerResenasConLikes(usuarioActualId = null) {
    try {
        // Consultar todas las reseñas ordenadas por fecha descendente
        const { data: resenas, error } = await supabase
            .from(TABLA_RESENAS)
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error al obtener reseñas en Supabase:", error);
            return [];
        }

        if (!resenas || resenas.length === 0) return [];

        // 1. Consultar perfiles de los autores mediante user_id
        const userIds = [...new Set(resenas.map(r => r.user_id).filter(Boolean))];
        let perfilesMap = {};

        if (userIds.length > 0) {
            const { data: perfiles, error: perfilesErr } = await supabase
                .from(TABLA_PERFILES)
                .select("id, nombre, avatar_url, nombre_empresa")
                .in("id", userIds);

            if (!perfilesErr && perfiles) {
                perfiles.forEach(p => {
                    perfilesMap[p.id] = p;
                });
            }
        }

        // 2. Consultar los likes asociados
        const resenaIds = resenas.map(r => r.id);
        const { data: likes, error: likesErr } = await supabase
            .from(TABLA_LIKES)
            .select("resena_id, user_id")
            .in("resena_id", resenaIds);

        if (likesErr) {
            console.warn("Advertencia al obtener likes:", likesErr);
        }

        const likesData = likes || [];

        // 3. Combinar datos
        return resenas.map(r => {
            const perfil = r.user_id ? perfilesMap[r.user_id] : null;

            // Priorizar datos actualizados de la tabla perfiles
            const nombreAutor = perfil?.nombre || perfil?.nombre_empresa || r.nombre_empresa || "Empresa Colaboradora";
            const avatarAutor = perfil?.avatar_url || r.foto_empresa || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

            const likesDeEstaResena = likesData.filter(l => l.resena_id === r.id);
            const totalLikes = likesDeEstaResena.length;
            const leGustaAlUsuario = usuarioActualId 
                ? likesDeEstaResena.some(l => l.user_id === usuarioActualId)
                : false;

            return {
                ...r,
                nombre_empresa: nombreAutor,
                foto_empresa: avatarAutor,
                likes_count: totalLikes,
                user_liked: leGustaAlUsuario
            };
        });
    } catch (err) {
        console.error("Error inesperado al obtener reseñas:", err);
        return [];
    }
}

// ======================================
// 2. SUBIR UNA O MÚLTIPLES IMÁGENES AL BUCKET SUPABASE STORAGE
// ======================================
export async function subirImagenesResena(filesInput) {
    if (!filesInput) return null;

    let filesArray = [];
    if (filesInput instanceof FileList || Array.isArray(filesInput)) {
        filesArray = Array.from(filesInput);
    } else if (filesInput instanceof File) {
        filesArray = [filesInput];
    }

    if (filesArray.length === 0) return null;

    const urls = [];

    for (const file of filesArray) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = `adjuntos/${fileName}`;

            const { data, error } = await supabase.storage
                .from(BUCKET_IMAGENES)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error("Error al subir imagen a Supabase Storage:", error);
                continue;
            }

            const { data: publicUrlData } = supabase.storage
                .from(BUCKET_IMAGENES)
                .getPublicUrl(filePath);

            if (publicUrlData?.publicUrl) {
                urls.push(publicUrlData.publicUrl);
            }
        } catch (err) {
            console.error("Error en iteración de subida de imagen:", err);
        }
    }

    return urls.length > 0 ? urls.join(",") : null;
}

// Compatibilidad
export async function subirImagenResena(file) {
    return await subirImagenesResena(file);
}

// ======================================
// 3. CREAR NUEVA RESEÑA
// ======================================
export async function crearResena({
    empresa_nombre,
    empresa_avatar,
    comentario,
    calificacion,
    imagen_files,
    user_id
}) {
    try {
        let imagen_url = null;

        if (imagen_files) {
            imagen_url = await subirImagenesResena(imagen_files);
        }

        const nuevaResena = {
            nombre_empresa: empresa_nombre || "Empresa Colaboradora",
            foto_empresa: empresa_avatar || null,
            comentario: comentario.trim(),
            calificacion: parseInt(calificacion) || 5,
            imagen_url: imagen_url,
            user_id: user_id || null,
            likes_count: 0
        };

        const { data, error } = await supabase
            .from(TABLA_RESENAS)
            .insert(nuevaResena)
            .select();

        if (error) {
            console.error("Error al insertar reseña en Supabase:", error);
            return { exito: false, error: error.message };
        }

        return { exito: true, data: data[0] };
    } catch (err) {
        console.error("Error inesperado al crear reseña:", err);
        return { exito: false, error: err.message };
    }
}

// ======================================
// 4. ACTUALIZAR RESEÑA (ADMIN O AUTOR)
// ======================================
export async function actualizarResena(id, {
    comentario,
    calificacion,
    nuevas_imagenes_files = null,
    eliminar_imagen = false,
    imagen_url_actual = null
}) {
    try {
        let finalImagenUrl = imagen_url_actual;

        if (eliminar_imagen) {
            finalImagenUrl = null;
        }

        if (nuevas_imagenes_files) {
            const urlsSubidas = await subirImagenesResena(nuevas_imagenes_files);
            if (urlsSubidas) {
                if (finalImagenUrl && !eliminar_imagen) {
                    finalImagenUrl = `${finalImagenUrl},${urlsSubidas}`;
                } else {
                    finalImagenUrl = urlsSubidas;
                }
            }
        }

        const datosActualizar = {
            comentario: comentario.trim(),
            calificacion: parseInt(calificacion),
            imagen_url: finalImagenUrl
        };

        const { error } = await supabase
            .from(TABLA_RESENAS)
            .update(datosActualizar)
            .eq("id", id);

        if (error) {
            console.error("Error al actualizar reseña en Supabase:", error);
            return false;
        }

        return true;
    } catch (err) {
        console.error("Error inesperado al actualizar reseña:", err);
        return false;
    }
}

// ======================================
// 5. ELIMINAR RESEÑA (ADMIN O AUTOR)
// ======================================
export async function eliminarResena(id) {
    try {
        const { error } = await supabase
            .from(TABLA_RESENAS)
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error al eliminar reseña en Supabase:", error);
            return false;
        }

        return true;
    } catch (err) {
        console.error("Error inesperado al eliminar reseña:", err);
        return false;
    }
}

// ======================================
// 6. ALTERNAR LIKE ("ME GUSTA") EN UNA RESEÑA Y ACTUALIZAR LIKES_COUNT
// ======================================
export async function toggleLikeResena(resenaId, userId) {
    if (!userId) {
        return { exito: false, mensaje: "Debes iniciar sesión para dar 'Me gusta'." };
    }

    try {
        // Verificar si ya existe el me gusta
        const { data: existente, error: checkError } = await supabase
            .from(TABLA_LIKES)
            .select("id")
            .eq("resena_id", resenaId)
            .eq("user_id", userId)
            .maybeSingle();

        if (checkError) {
            console.error("Error al verificar me gusta:", checkError);
        }

        let liked = false;

        if (existente) {
            // Eliminar me gusta (unlike)
            const { error: delError } = await supabase
                .from(TABLA_LIKES)
                .delete()
                .eq("id", existente.id);

            if (delError) {
                console.error("Error al quitar me gusta:", delError);
                return { exito: false, error: delError.message };
            }
            liked = false;
        } else {
            // Insertar nuevo me gusta
            const { error: insError } = await supabase
                .from(TABLA_LIKES)
                .insert({
                    resena_id: resenaId,
                    user_id: userId
                });

            if (insError) {
                console.error("Error al dar me gusta:", insError);
                return { exito: false, error: insError.message };
            }
            liked = true;
        }

        // Actualizar la columna likes_count en resenas_pasantias
        const { count, error: countError } = await supabase
            .from(TABLA_LIKES)
            .select("*", { count: "exact", head: true })
            .eq("resena_id", resenaId);

        const totalActualizado = countError ? 0 : (count || 0);

        await supabase
            .from(TABLA_RESENAS)
            .update({ likes_count: totalActualizado })
            .eq("id", resenaId);

        return { exito: true, liked, totalLikes: totalActualizado };
    } catch (err) {
        console.error("Error inesperado en toggleLikeResena:", err);
        return { exito: false, error: err.message };
    }
}
