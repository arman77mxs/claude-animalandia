-- Asignar rol admin al usuario admin@miapp.com (existente y futuros registros)

-- 1) Actualizar perfil existente si ya está registrado
UPDATE profiles
SET rol = 'admin'
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'admin@miapp.com');

-- 2) Trigger: al crear un perfil para admin@miapp.com, asignar rol admin automáticamente
CREATE OR REPLACE FUNCTION public.set_admin_role_for_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.user_id AND email = 'admin@miapp.com') THEN
    NEW.rol := 'admin';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_admin_on_insert ON profiles;
CREATE TRIGGER profiles_set_admin_on_insert
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_admin_role_for_email();
