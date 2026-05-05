// ====== FUNCIÓN DE ESPERA ======
// Espera a que Supabase se inicialice antes de ejecutar el login
function esperar(condicion, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const inicio = Date.now();
    const intervalo = setInterval(() => {
      if (condicion()) {
        clearInterval(intervalo);
        resolve();
      }
      if (Date.now() - inicio > timeout) {
        clearInterval(intervalo);
        reject(new Error("Supabase tardó demasiado en inicializar"));
      }
    }, 100);
  });
}

// ====== OBTENER DATOS DEL USUARIO ======
// Obtiene la información personal del usuario desde la tabla "usuarios"
async function obtenerDatosUsuario(userId) {
  try {
    const { data, error } = await window.supabaseClient
      .from("usuarios")
      .select("nombre, correo, ultima_sesion")
      .eq("id", userId)
      .single();

    if (error) {
      console.warn("⚠️ Error al obtener datos:", error);
      return null;
    }

    console.log("✓ Datos del usuario obtenidos:", data);
    return data;
  } catch (err) {
    console.error("❌ Error al obtener datos del usuario:", err);
    return null;
  }
}

// ====== ACTUALIZAR ÚLTIMA SESIÓN ======
// Registra cuándo fue el último login del usuario
async function actualizarUltimaSesion(userId) {
  try {
    const { error } = await window.supabaseClient
      .from("usuarios")
      .update({ ultima_sesion: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.warn("⚠️ Error al actualizar última sesión:", error);
    } else {
      console.log("✓ Última sesión actualizada");
    }
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

// ====== REGISTRO DE SESIÓN ACTIVA ======
function obtenerFechaYMD(fecha) {
  return fecha.toISOString().slice(0, 10);
}

function obtenerHistorialLocal() {
  try {
    return JSON.parse(localStorage.getItem("signhandsSessionHistory") || "[]");
  } catch (error) {
    return [];
  }
}

function guardarHistorialLocal(historial) {
  localStorage.setItem("signhandsSessionHistory", JSON.stringify(historial));
}

function agregarSesionLocal(loginAt, sessionId = null) {
  const historial = obtenerHistorialLocal();
  historial.unshift({
    sessionId,
    login_at: loginAt,
    logout_at: null,
    duration_seconds: 0
  });
  guardarHistorialLocal(historial.slice(0, 50));
}

function actualizarSesionLocal(sessionId, logoutAt, durationSeconds) {
  const historial = obtenerHistorialLocal();
  const index = historial.findIndex((sesion) => sesion.sessionId && sesion.sessionId === sessionId);
  if (index === -1) {
    historial.unshift({ sessionId, login_at: null, logout_at: logoutAt, duration_seconds: durationSeconds });
  } else {
    historial[index].logout_at = logoutAt;
    historial[index].duration_seconds = durationSeconds;
  }
  guardarHistorialLocal(historial.slice(0, 50));
}

async function registrarInicioSesion(userId) {
  try {
    await esperar(() => window.supabaseClient !== undefined);

    const ahora = new Date();
    const fechaHoy = obtenerFechaYMD(ahora);
    localStorage.setItem("signhandsSessionStart", ahora.toISOString());
    localStorage.setItem("signhandsSessionDate", fechaHoy);

    // Guardar una entrada de sesión si la tabla existe
    try {
      const { data, error } = await window.supabaseClient
        .from("sesiones")
        .insert([{ user_id: userId, login_at: ahora.toISOString() }])
        .select("id")
        .single();

      if (error) {
        console.warn("⚠️ No se pudo insertar en sesiones:", error.message || error);
      } else if (data?.id) {
        localStorage.setItem("signhandsSessionId", data.id);
        agregarSesionLocal(ahora.toISOString(), data.id);
      } else {
        agregarSesionLocal(ahora.toISOString());
      }
    } catch (error) {
      console.warn("⚠️ No se pudo crear el registro de sesión:", error);
      agregarSesionLocal(ahora.toISOString());
    }

    const { data: usuario, error: selectError } = await window.supabaseClient
      .from("usuarios")
      .select("dias_conectados, ultimo_dia_conectado, tiempo_activo_total")
      .eq("id", userId)
      .single();

    const actualizaciones = { ultima_sesion: ahora.toISOString() };

    if (selectError) {
      console.warn("⚠️ No se pudo obtener datos de progreso:", selectError);
    } else {
      const diasConectados = usuario?.dias_conectados || 0;

      if (!usuario?.ultimo_dia_conectado || usuario.ultimo_dia_conectado !== fechaHoy) {
        actualizaciones.dias_conectados = diasConectados + 1;
        actualizaciones.ultimo_dia_conectado = fechaHoy;
      }

      if (usuario?.tiempo_activo_total === undefined) {
        actualizaciones.tiempo_activo_total = usuario?.tiempo_activo_total || 0;
      }
    }

    const { error: updateError } = await window.supabaseClient
      .from("usuarios")
      .update(actualizaciones)
      .eq("id", userId);

    if (updateError) {
      console.warn("⚠️ Error al actualizar progreso del usuario:", updateError);
    } else {
      console.log("✓ Progreso de inicio de sesión actualizado");
    }
  } catch (error) {
    console.warn("⚠️ No se pudo registrar inicio de sesión:", error);
  }
}

// ====== CREAR PERFIL SI NO EXISTE ======
// Si el usuario ya se autenticó pero no tiene fila en la tabla "usuarios",
// la crea usando los datos disponibles.
async function crearPerfilUsuarioSiNoExiste(userId, nombre, correo) {
  try {
    const { data, error } = await window.supabaseClient
      .from("usuarios")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("⚠️ Error al verificar perfil existente:", error);
      return false;
    }

    if (data) {
      console.log("✓ Perfil de usuario ya existe");
      return true;
    }

    const { error: insertError } = await window.supabaseClient
      .from("usuarios")
      .insert([
        {
          id: userId,
          nombre: nombre || "Usuario",
          correo: correo,
          fecha_registro: new Date().toISOString()
        }
      ]);

    if (insertError) {
      console.warn("⚠️ Error al crear perfil de usuario:", insertError);
      return false;
    }

    console.log("✓ Perfil de usuario creado después del login");
    return true;
  } catch (err) {
    console.error("❌ Error en crearPerfilUsuarioSiNoExiste:", err);
    return false;
  }
}

// ====== MANEJADOR DEL FORMULARIO DE LOGIN ======
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Esperar a que Supabase esté listo
    await esperar(() => window.supabaseClient !== undefined);
    console.log("✓ Supabase inicializado para login");

    const form = document.querySelector("form");
    if (!form) {
      console.log("❌ Formulario no encontrado");
      return;
    }

    // Agregar evento al enviar el formulario
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // Evitar que se recargue la página

      // ====== OBTENER VALORES DEL FORMULARIO ======
      const correo = document.querySelector("#correo")?.value?.trim() || "";
      const password = document.querySelector("#password")?.value || "";

      // ====== VALIDACIONES ======
      if (!correo || !password) {
        alert("⚠️ Por favor completa todos los campos");
        return;
      }

      try {
        console.log("🔐 Intentando iniciar sesión con:", correo);

        // ====== AUTENTICAR CON SUPABASE ======
        // Valida el correo y contraseña contra la tabla "auth.users"
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
          email: correo,
          password: password
        });

        if (error) {
          console.error("❌ Error de autenticación:", error);
          
          // Manejar errores específicos
          if (error.message.includes("Invalid login credentials")) {
            alert("❌ Correo o contraseña incorrectos");
          } else if (error.message.includes("Email not confirmed")) {
            alert("❌ Por favor confirma tu correo antes de iniciar sesión");
          } else {
            alert("❌ Error: " + error.message);
          }
          return;
        }

        console.log("✓ Autenticación exitosa");

        // ====== OBTENER DATOS PERSONALES DEL USUARIO ======
        // Busca el nombre y otros datos en la tabla "usuarios"
        if (data.user) {
          let datosUsuario = await obtenerDatosUsuario(data.user.id);

          if (datosUsuario) {
            console.log("✓ Datos del usuario obtenidos:", datosUsuario);
            alert("✓ Bienvenido " + (datosUsuario.nombre || "Usuario"));
          } else {
            console.log("⚠️ No existe fila de perfil en 'usuarios'. Creando perfil...");
            const nombreMeta = data.user.user_metadata?.nombre || "Usuario";
            const perfilCreado = await crearPerfilUsuarioSiNoExiste(data.user.id, nombreMeta, correo);
            if (perfilCreado) {
              alert("✓ Bienvenido " + nombreMeta);
            } else {
              alert("✓ Bienvenido a SignHands");
            }
          }

          await registrarInicioSesion(data.user.id);
        }

        // ====== REDIRIGIR A LA PÁGINA PRINCIPAL ======
        // Después del login exitoso, llevar al usuario a index.html
        console.log("📍 Redirigiendo a página principal...");
        window.location.href = "../index.html";

      } catch (err) {
        console.error("❌ Error al iniciar sesión:", err);
        alert("❌ Error inesperado: " + err.message);
      }
    });

    const toggleButton = document.getElementById("toggle-password-login");
    if (toggleButton) {
      toggleButton.addEventListener("click", () => {
        const passwordInput = document.getElementById("password");
        if (!passwordInput) return;
        const tipo = passwordInput.type === "password" ? "text" : "password";
        passwordInput.type = tipo;
        toggleButton.textContent = tipo === "password" ? "👁️" : "🙈";
      });
    }

  } catch (err) {
    console.error("❌ Error al inicializar el formulario de login:", err);
    alert("Error al conectar con el servidor. Por favor, recarga la página.");
  }
});