-- ====================================================================
-- ESQUEMA Y TRIGGER DE AUTENTICACIÓN / ROLES - ESCUELA PROA
-- ====================================================================

-- 1. Tabla de Perfiles vinculada a auth.users
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    email TEXT UNIQUE NOT NULL,
    nombre TEXT,
    rol TEXT DEFAULT 'comun' CHECK (rol IN ('admin', 'estudiante', 'comun')),
    avatar_url TEXT,
    estado_postulacion TEXT DEFAULT 'No postulado'
);

-- 2. Función Trigger: Manejo automático de nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_role text;
    user_name text;
    user_avatar text;
BEGIN
    -- Asignación de rol según dominio del correo electrónico
    IF NEW.email LIKE '%@escuelasproa.edu.ar' THEN
        user_role := 'estudiante';
    ELSE
        user_role := 'comun';
    END IF;

    -- Obtener nombre desde raw_user_meta_data si existe, o usar prefijo del email
    user_name := COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1));
    
    -- Avatar por defecto dinámico con DiceBear SVG
    user_avatar := 'https://api.dicebear.com/7.x/identicon/svg?seed=' || encode(NEW.email::bytea, 'hex');

    -- Insertar en la tabla perfiles ignorando duplicados o actualizando
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
    -- Prevenir Error 500 en registro y permitir la creación del usuario en auth.users
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Asociar Trigger a la tabla auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- Política 1: Lectura de perfil propio o si es administrador
CREATE POLICY "Lectura de perfiles propia o admin"
ON public.perfiles FOR SELECT
USING (
    auth.uid() = id OR EXISTS (
        SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'
    )
);

-- Política 2: Actualización de perfil propio
CREATE POLICY "Actualización de perfil propio"
ON public.perfiles FOR UPDATE
USING (auth.uid() = id);

-- Política 3: Administración total para el rol admin
CREATE POLICY "Acceso total para administradores"
ON public.perfiles FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'
    )
);
