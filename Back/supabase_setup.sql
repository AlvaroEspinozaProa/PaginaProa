-- ====================================================================
-- ESQUEMA Y POLÍTICAS DE SEGURIDAD (RLS) - ESCUELA PROA
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. TABLA PERFILES Y TRIGGERS DE SEGURIDAD
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    email TEXT UNIQUE NOT NULL,
    nombre TEXT,
    rol TEXT DEFAULT 'comun' CHECK (rol IN ('admin', 'estudiante', 'comun')),
    avatar_url TEXT,
    estado_postulacion TEXT DEFAULT 'No postulado'
);

-- Trigger: Creación automática de perfil al registrarse un nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_role text;
    user_name text;
    user_avatar text;
BEGIN
    -- Asignación de rol según dominio del correo electrónico institucional
    IF NEW.email LIKE '%@escuelasproa.edu.ar' THEN
        user_role := 'estudiante';
    ELSE
        user_role := 'comun';
    END IF;

    -- Obtener nombre desde raw_user_meta_data o usar prefijo del email
    user_name := COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1));
    
    -- Avatar por defecto con inicial/identicon
    user_avatar := 'https://api.dicebear.com/7.x/identicon/svg?seed=' || encode(NEW.email::bytea, 'hex');

    -- Insertar en la tabla perfiles
    INSERT INTO public.perfiles (id, email, nombre, rol, avatar_url, estado_postulacion)
    VALUES (
        NEW.id,
        NEW.email,
        user_name,
        user_role,
        user_avatar,
        'No postulado'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        nombre = COALESCE(EXCLUDED.nombre, perfiles.nombre),
        rol = EXCLUDED.rol;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Protección estricta de columnas privilegiadas (SEC-03)
-- Impide que un usuario modifique su propio rol, correo o estado de postulación
CREATE OR REPLACE FUNCTION public.proteger_campos_perfil()
RETURNS trigger AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin') THEN
        NEW.rol := OLD.rol;
        NEW.email := OLD.email;
        NEW.estado_postulacion := OLD.estado_postulacion;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_proteger_campos_perfil ON public.perfiles;
CREATE TRIGGER trigger_proteger_campos_perfil
BEFORE UPDATE ON public.perfiles
FOR EACH ROW EXECUTE FUNCTION public.proteger_campos_perfil();

-- Habilitar RLS en perfiles
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura de perfiles propia o admin" ON public.perfiles;
CREATE POLICY "Lectura de perfiles propia o admin"
ON public.perfiles FOR SELECT
USING (
    auth.uid() = id OR EXISTS (
        SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'
    )
);

DROP POLICY IF EXISTS "Actualización de perfil propio" ON public.perfiles;
CREATE POLICY "Actualización de perfil propio"
ON public.perfiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND (
        rol = (SELECT p.rol FROM public.perfiles p WHERE p.id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.rol = 'admin')
    )
);

DROP POLICY IF EXISTS "Acceso total para administradores" ON public.perfiles;
CREATE POLICY "Acceso total para administradores"
ON public.perfiles FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'
    )
);

-- --------------------------------------------------------------------
-- 2. TABLA POSTULACIONES DE EMPRESAS (SEC-03)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.postulaciones_empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    nombre_empresa TEXT NOT NULL,
    rubro TEXT DEFAULT 'General',
    contacto_nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    vacantes INT DEFAULT 1,
    mensaje TEXT,
    estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Contactado', 'Aprobado', 'Rechazado'))
);

ALTER TABLE public.postulaciones_empresas ENABLE ROW LEVEL SECURITY;

-- Cualquier visitante puede enviar una postulación pública
DROP POLICY IF EXISTS "Inserción pública de postulaciones" ON public.postulaciones_empresas;
CREATE POLICY "Inserción pública de postulaciones"
ON public.postulaciones_empresas FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Solo administradores pueden ver, editar o borrar postulaciones (protege teléfonos y emails privados)
DROP POLICY IF EXISTS "Gestión exclusiva de postulaciones para administradores" ON public.postulaciones_empresas;
CREATE POLICY "Gestión exclusiva de postulaciones para administradores"
ON public.postulaciones_empresas FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'
    )
);

-- --------------------------------------------------------------------
-- 3. RESEÑAS DE PASANTÍAS Y LIKES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resenas_pasantias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nombre_empresa TEXT,
    foto_empresa TEXT,
    calificacion INT DEFAULT 5 CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT NOT NULL,
    imagen_url TEXT,
    likes_count INT DEFAULT 0
);

ALTER TABLE public.resenas_pasantias ENABLE ROW LEVEL SECURITY;

-- Lectura pública para cualquier usuario
DROP POLICY IF EXISTS "Lectura pública de reseñas" ON public.resenas_pasantias;
CREATE POLICY "Lectura pública de reseñas"
ON public.resenas_pasantias FOR SELECT
TO anon, authenticated
USING (true);

-- Usuarios autenticados pueden crear sus propias reseñas
DROP POLICY IF EXISTS "Creación de reseñas por usuarios autenticados" ON public.resenas_pasantias;
CREATE POLICY "Creación de reseñas por usuarios autenticados"
ON public.resenas_pasantias FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- El autor o un administrador pueden modificar su propia reseña
DROP POLICY IF EXISTS "Actualización de reseña por autor o admin" ON public.resenas_pasantias;
CREATE POLICY "Actualización de reseña por autor o admin"
ON public.resenas_pasantias FOR UPDATE
TO authenticated
USING (
    auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'
    )
);

-- El autor o un administrador pueden eliminar su reseña
DROP POLICY IF EXISTS "Eliminación de reseña por autor o admin" ON public.resenas_pasantias;
CREATE POLICY "Eliminación de reseña por autor o admin"
ON public.resenas_pasantias FOR DELETE
TO authenticated
USING (
    auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'
    )
);

-- Tabla de Likes
CREATE TABLE IF NOT EXISTS public.resenas_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resena_id UUID REFERENCES public.resenas_pasantias(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(resena_id, user_id)
);

ALTER TABLE public.resenas_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de likes" ON public.resenas_likes;
CREATE POLICY "Lectura pública de likes"
ON public.resenas_likes FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Gestión de likes propios" ON public.resenas_likes;
CREATE POLICY "Gestión de likes propios"
ON public.resenas_likes FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 4. TABLÓN DE NOVEDADES Y HORARIOS POR CURSO
-- --------------------------------------------------------------------
ALTER TABLE IF EXISTS public."Tablon" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública del Tablon" ON public."Tablon";
CREATE POLICY "Lectura pública del Tablon"
ON public."Tablon" FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Gestión de Tablon solo por admin" ON public."Tablon";
CREATE POLICY "Gestión de Tablon solo por admin"
ON public."Tablon" FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'
    )
);

ALTER TABLE IF EXISTS public.horarios_por_curso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de horarios" ON public.horarios_por_curso;
CREATE POLICY "Lectura pública de horarios"
ON public.horarios_por_curso FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Gestión de horarios solo por admin" ON public.horarios_por_curso;
CREATE POLICY "Gestión de horarios solo por admin"
ON public.horarios_por_curso FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'
    )
);
