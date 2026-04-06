# Guía de Integración de Scripts de Autenticación

## Archivos Modificados Correctamente ✓

### 1. **supabase.js** - Inicializador de Supabase
- Ahora verifica si la biblioteca de Supabase está cargada
- Establece `window.supabaseClient` disponible globalmente
- Incluye manejo de errores con logs en consola

### 2. **register.js** - Registro de Usuarios
- Espera a que Supabase esté listo antes de ejecutar
- Valida todos los campos (nombre, correo, contraseña)
- Requiere contraseña mínimo 6 caracteres
- Valida formato de correo
- Captura el nombre del usuario en los datos del perfil
- Mejor manejo de errores con mensajes descriptivos
- Logs en consola para debugging

### 3. **login.js** - Inicio de Sesión
- Espera a que Supabase esté listo
- Valida que ambos campos estén completos
- Mejor manejo de errores
- Logs en consola para debugging

### 4. **protect.js** - Protección de Páginas
- Espera a que Supabase esté listo
- Verifica si hay una sesión activa
- Redirige a login si no hay sesión
- Usa rutas relativas correctas
- Logs para debugging

### 5. **logout.js** - Cierre de Sesión
- Espera a que Supabase esté listo
- Cierra la sesión correctamente
- Redirige a la página de login
- Manejo de errores

## Cómo Usar en tus Páginas

### Para Páginas de Autenticación (signup.html y signin.html)
```html
<!-- Al final del <body> -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script src="../js/supabase.js"></script>
<script src="../js/auth/register.js"></script>  <!-- Para signup.html -->
<!-- O -->
<script src="../js/auth/login.js"></script>     <!-- Para signin.html -->
```

### Para Páginas Protegidas (que requieren login)
```html
<!-- El primero en <head> o al inicio del <body> -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script src="../js/supabase.js"></script>
<script src="../js/auth/protect.js"></script>  <!-- Esto verificará la sesión -->
```

### Para Botón de Logout
```html
<button onclick="logout()">Cerrar sesión</button>

<!-- Scripts necesarios -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script src="../js/supabase.js"></script>
<script src="../js/auth/logout.js"></script>
```

## Orden IMPORTANTE de Carga de Scripts

1. Primero: `@supabase/supabase-js` (la biblioteca oficial)
2. Segundo: `supabase.js` (inicializa la conexión)
3. Tercero: El script de autenticación específico

## Pruebas en Navegador

1. Abre el navegador con F12 o Ctrl+Shift+I
2. Ve a la pestaña "Console"
3. Busca estos mensajes:
   - ✓ "Supabase inicializado correctamente"
   - ✓ "Registrando usuario: {...}"
   - ✓ "Usuario registrado: {...}"

## Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| "window.supabaseClient is undefined" | Supabase no está cargado | Verifica que supabase.js se carga antes |
| "Email format is invalid" | Correo sin @ | Valida el formato del correo |
| "Password should be at least 6 characters" | Contraseña muy corta | Usa mínimo 6 caracteres |
| "User already registered" | Email ya existe | Usa otro correo |

## Próximos Pasos Recomendados

1. **Crear tabla de usuarios en Supabase** para guardar datos adicionales
2. **Implementar verificación de email** (opcional)
3. **Agregar más validaciones** (teléfono, fecha de nacimiento, etc.)
4. **Protegeción de páginas** - Agregar protect.js a páginas que requieran login
