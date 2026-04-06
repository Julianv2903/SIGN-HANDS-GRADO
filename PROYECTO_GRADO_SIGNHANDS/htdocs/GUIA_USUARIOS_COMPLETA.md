# Guía Completa: Sistema de Usuarios y Registro en Supabase

## 📊 PASO 1: Crear la Tabla en Supabase (IMPORTANTE)

**Esto DEBE hacerse primero**

1. Ve a tu proyecto Supabase: https://supabase.com
2. En el menu lado izquierdo, selecciona "SQL Editor"
3. Haz clic en "New Query"
4. Copia y pega este código SQL:

```sql
-- Crear tabla de usuarios
CREATE TABLE public.usuarios (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id),
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL UNIQUE,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  ultima_sesion TIMESTAMP DEFAULT NOW()
);

-- Permitir que los usuarios puedan leer su propio perfil
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);
```

5. Haz clic en "Run" o presiona Ctrl+Enter
6. Si ves un mensaje de éxito ✓, continúa con el siguiente paso

---

## 🔧 PASO 2: Archivos Actualizados

### A. `js/auth/register.js` ✓ (Actualizado)
- Ahora captura el nombre del usuario
- Guarda los datos en la tabla `usuarios` después del registro
- Validación mejorada

**Flujo:**
1. Usuario se registra → signUp() en Supabase Auth
2. Si es exitoso → guardarDatosUsuario() en tabla usuarios
3. Redirige a login

### B. `js/auth/login.js` ✓ (Actualizado)
- Obtiene los datos del usuario de la tabla
- Muestra el nombre en el mensaje de bienvenida
- Actualiza la última sesión

**Flujo:**
1. Usuario inicia sesión → signInWithPassword()
2. Si es exitoso → obtenerDatosUsuario() de la tabla
3. Muestra "Bienvenido [Nombre]"
4. Actualiza última_sesion
5. Redirige a index.html

### C. `js/auth/user.js` ✓ (NUEVO)
- Obtiene información del usuario autenticado
- Muestra el nombre en el header/dropdown
- Se ejecuta automáticamente al cargar cualquier página

**Flujo:**
1. Página carga → DOMContentLoaded
2. Verifica si hay sesión activa
3. Obtiene datos del usuario
4. Muestra nombre en el elemento `.user-dropdown span`

---

## 🎯 PASO 3: Cómo Usar en tus Páginas HTML

### Para index.html (HECHO ✓)
```html
<!-- Al final del <body>, antes de </body> -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script src="js/supabase.js"></script>
<script src="js/auth/user.js"></script>  <!-- Muestra nombre de usuario -->
```

### Para SIGNUP/signup.html (YA TIENE ✓)
```html
<!-- Ya tiene los scripts correctos -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script src="../js/supabase.js"></script>
<script src="../js/auth/register.js"></script>
```

### Para SIGNIN/signin.html (YA TIENE ✓)
```html
<!-- Ya tiene los scripts correctos -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script src="../js/supabase.js"></script>
<script src="../js/auth/login.js"></script>
```

### Para Otras Páginas (EVALUACION, VOCABULARIO, FORO, etc.)
Necesitas agregar estos scripts al final de cada página:

```html
<!-- Al final del <body>, antes de </body> -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script src="../../js/supabase.js"></script>
<script src="../../js/auth/user.js"></script>
<script src="../../js/auth/protect.js"></script>  <!-- Opcional: verifica sesión -->
```

---

## 🧪 PASO 4: Pruebas en tu Navegador

### Prueba 1: Registrar un usuario
1. Ve a `SIGNUP/signup.html`
2. Abre la consola (F12 → Console)
3. Completa el formulario:
   - Nombre: `Juan Pérez`
   - Correo: `juan@example.com`
   - Contraseña: `123456`
4. Haz clic en "Registrarse"
5. **Deberías ver en la consola:**
   ```
   ✓ Supabase inicializado correctamente
   ✓ Registrando usuario: {nombre: 'Juan Pérez', correo: 'juan@example.com'}
   ✓ Usuario registrado: {...}
   ✓ Datos del usuario guardados correctamente
   ✓ Perfil de usuario creado correctamente
   ```
6. Alert: "Usuario creado exitosamente. Ahora puedes iniciar sesión."

### Prueba 2: Iniciar sesión
1. Ve a `SIGNIN/signin.html`
2. Abre la consola (F12 → Console)
3. Completa el formulario:
   - Correo: `juan@example.com`
   - Contraseña: `123456`
4. Haz clic en "Entrar"
5. **Deberías ver en la consola:**
   ```
   ✓ Iniciando sesión con: juan@example.com
   ✓ Login exitoso: {...}
   ✓ Datos del usuario obtenidos: {nombre: 'Juan Pérez', ...}
   ```
6. Alert: "Bienvenido Juan Pérez"

### Prueba 3: Ver nombre en el header
1. Después de iniciar sesión, ve a `index.html`
2. En el header (esquina superior derecha), deberías ver tu nombre
3. Si haces clic, aparecerá el dropdown con "Cerrar sesión"

---

## 📋 RESUMEN DE LA BASE DE DATOS

### Tabla: `usuarios`
```
┌─────────────────────────────────┐
│         usuarios                │
├─────────────────────────────────┤
│ id (UUID)                       │  ← Vinculado con auth.users(id)
│ nombre (VARCHAR)                │  
│ correo (VARCHAR UNIQUE)         │
│ fecha_registro (TIMESTAMP)      │
│ ultima_sesion (TIMESTAMP)       │
└─────────────────────────────────┘
```

---

## 🐛 Solucionar Problemas

### Error: "No hay tabla usuarios"
**Solución:** Ejecuta el SQL del Paso 1 en Supabase

### Error: "row-level security"
**Solución:** Los RLS ya están configurados. Si recibe errores, vuelve a ejecutar el SQL

### No aparece el nombre en el header
**Solución:** 
1. Verifica que user.js esté cargado (en consola busca los logs)
2. Abre la consola y verifica que no haya errores
3. Asegúrate de estar logueado

### ConflictError al registrar
**Solución:** Ese correo ya existe. Usa otro correo diferente.

---

## 🚀 LISTA DE ARCHIVOS MODIFICADOS

✓ `/htdocs/js/auth/register.js` - Guarda datos en tabla usuarios  
✓ `/htdocs/js/auth/login.js` - Obtiene y muestra nombre de usuario  
✓ `/htdocs/js/auth/user.js` - (NUEVO) Muestra nombre en header  
✓ `/htdocs/index.html` - Agregados scripts de autenticación  

---

## ✅ SIGUIENTE PASO

Agregua los scripts (`supabase.js`, `user.js`, `protect.js`) a todas las demás páginas que requieran que el usuario esté logueado:
- EVALUACION/Evaluaciones.html
- VOCABULARIO/vocabulario.html
- FORO/foro.html
- ALFABETO/alfabeto.html
- PALABRADIA/palabra.html

¿Necesitas ayuda para agregar los scripts a esas páginas?
