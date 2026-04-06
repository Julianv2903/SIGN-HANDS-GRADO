# 🚀 REFERENCIA RÁPIDA - Sistema de Usuarios

## 1️⃣ SQL para Supabase (PRIMERO)

Copia esto en SQL Editor de Supabase:

```sql
CREATE TABLE public.usuarios (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id),
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL UNIQUE,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  ultima_sesion TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);
```

---

## 2️⃣ Scripts en tus Páginas HTML

### 📄 Para TODAS las páginas (agregar antes de </body>):

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script src="[ruta]/js/supabase.js"></script>
<script src="[ruta]/js/auth/user.js"></script>
```

**Ejemplos de [ruta]:**
- Si estás en `index.html` → `js/supabase.js`
- Si estás en `SIGNUP/signup.html` → `../js/supabase.js`
- Si estás en `EVALUACION/Evaluaciones.html` → `../../js/supabase.js`

---

## 3️⃣ Flujo del Sistema

```
┌──────────────────────────────────────────────┐
│  Usuario llena formulario de REGISTRO        │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  register.js         │
        │  Validar datos       │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Supabase Auth       │
        │  signUp()            │
        └──────────┬───────────┘
                   │
        ┌──────────▼───────────┐
        │ Exitoso?             │
        └──────────┬───────────┘
                   │
        ┌──────────▼───────────┐
        │ Guardar en tabla     │
        │ usuarios (nombre,    │
        │ correo, fecha_reg)   │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Redirigir a LOGIN    │
        └──────────────────────┘
```

---

## 4️⃣ Lo que Sucede en LOGIN

```
┌──────────────────────────────────────────────┐
│  Usuario inicia sesión                       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  login.js            │
        │  Validar email/pass  │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Supabase Auth       │
        │  signInWithPassword()│
        └──────────┬───────────┘
                   │
        ┌──────────▼───────────┐
        │ Exitoso?             │
        └──────────┬───────────┘
                   │
        ┌──────────▼───────────┐
        │ Obtener datos de     │
        │ tabla usuarios       │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Mostrar:             │
        │ "Bienvenido [Nombre]"│
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Guardar última sesión│
        │ en tabla             │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Redirigir a INDEX    │
        └──────────────────────┘
```

---

## 5️⃣ Lo que Sucede en INDEX.html

```
┌────────────────────────────────┐
│  Página carga (index.html)     │
└────────────┬───────────────────┘
             │
             ▼
    ┌────────────────────┐
    │  user.js carga     │
    │  DOMContentLoaded  │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │  Verificar sesión  │
    │  activa            │
    └────────┬───────────┘
             │
    ┌────────▼──────────┐
    │  ¿Hay sesión?     │
    └────────┬──────────┘
             │
    ┌────────▼──────────────────────┐
    │ SI: Obtener nombre de usuario │
    │ de tabla usuarios             │
    └────────┬──────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │ Mostrar en header: │
    │ [Nombre Usuario]   │
    │ (reemplaza ícono)  │
    └────────────────────┘
```

---

## 6️⃣ Estructura de Carpetas

```
htdocs/
│
├── index.html                    ← Agregar scripts aquí ✓
├── SIGNUP/
│   ├── signup.html               ← Ya tiene scripts ✓
│   └── signup.css
│
├── SIGNIN/
│   ├── signin.html               ← Ya tiene scripts ✓
│   └── signin.css
│
├── EVALUACION/
│   ├── Evaluaciones.html         ← Agregar scripts aquí
│   └── ...
│
├── VOCABULARIO/
│   ├── vocabulario.html          ← Agregar scripts aquí
│   └── ...
│
├── FORO/
│   ├── foro.html                 ← Agregar scripts aquí
│   └── ...
│
├── js/
│   ├── supabase.js               ← ✓ Inicializa Supabase
│   └── auth/
│       ├── register.js           ← ✓ Guarda en tabla usuarios
│       ├── login.js              ← ✓ Obtiene nombre de usuario
│       ├── user.js               ← ✓ NUEVO - Muestra en header
│       ├── protect.js            ← Verifica sesión
│       └── logout.js             ← Cierra sesión
│
└── GUIA_USUARIOS_COMPLETA.md
```

---

## 7️⃣ Puertos de Ruta (IMPORTANTE)

Cuando incluyas scripts en diferentes niveles:

| Página Ubicación | Ruta Relativa |
|---|---|
| `index.html` | `js/supabase.js` |
| `SIGNUP/signup.html` | `../js/supabase.js` |
| `SIGNIN/signin.html` | `../js/supabase.js` |
| `EVALUACION/Evaluaciones.html` | `../../js/supabase.js` |
| `VOCABULARIO/vocabulario.html` | `../../js/supabase.js` |
| `FORO/foro.html` | `../../js/supabase.js` |

**Regla:** Contar carpetas hacia atrás con `../`, luego hacia adelante con la carpeta destino.

---

## 8️⃣ Consola (Debugging)

Presiona **F12** en tu navegador → **Console**

**Mensajes esperados:**

| Acción | Mensaje esperado |
|---|---|
| Página carga | `Supabase inicializado correctamente` |
| Registro | `Registrando usuario: {...}` |
| Registro exitoso | `Datos del usuario guardados correctamente` |
| Login | `Iniciando sesión con: email@domain.com` |
| Login exitoso | `Datos del usuario obtenidos: {...}` |
| En index.html | `Usuario autenticado: email@domain.com` |

---

## 📞 Errores Comunes

| Error | Causa | Solución |
|---|---|---|
| `usuarios table not found` | Tabla no fue creada | Ejecuta SQL del Paso 1 |
| `window.supabaseClient undefined` | Script supabase.js no cargó | Verifica ruta y orden de scripts |
| `Email already registered` | Correo duplicado | Usa otro correo |
| `Password too short` | < 6 caracteres | Usa mínimo 6 caracteres |
| Nombre no aparece en header | user.js no cargó | Verifica orden de scripts |

---

## ✅ CHECKLIST DE TAREAS

- [ ] Ejecutar SQL en Supabase ✓
- [ ] Verificar archivos JS actualizados ✓
- [ ] Agregar scripts a index.html ✓
- [ ] Agregar scripts a EVALUACION/Evaluaciones.html
- [ ] Agregar scripts a VOCABULARIO/vocabulario.html
- [ ] Agregar scripts a FORO/foro.html
- [ ] Agregar scripts a ALFABETO/alfabeto.html
- [ ] Agregar scripts a PALABRADIA/palabra.html
- [ ] Probar registro
- [ ] Probar login
- [ ] Verificar nombre en header

---

¡Listo para implementar! 🚀
