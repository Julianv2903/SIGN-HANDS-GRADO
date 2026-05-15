// Funciones para manejar el logout y gestión de sesiones

// Esperar a que Supabase se inicialice
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

// Obtener información de la sesión activa desde localStorage
function obtenerSesionActiva() {
  const inicio = localStorage.getItem("signhandsSessionStart");
  const sessionId = localStorage.getItem("signhandsSessionId");
  return { inicio: inicio ? new Date(inicio) : null, sessionId };
}

// Obtener historial de sesiones desde localStorage
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

function borrarSesionActivaLocal() {
  localStorage.removeItem("signhandsSessionStart");
  localStorage.removeItem("signhandsSessionId");
  localStorage.removeItem("signhandsSessionDate");
}

async function actualizarRegistroSesion(sessionId, logoutAt, durationSeconds) {
  try {
    const { error } = await window.supabaseClient
      .from("sesiones")
      .update({ logout_at: logoutAt, duration_seconds: durationSeconds })
      .eq("id", sessionId);

    if (error) {
      console.warn("⚠️ No se pudo guardar la sesión de cierre:", error.message || error);
    } else {
      console.log("✓ Registro de sesión actualizado");
    }
  } catch (error) {
    console.warn("⚠️ Error al actualizar registro de sesión:", error);
  }
}

async function finalizarSesion() {
  const { inicio, sessionId } = obtenerSesionActiva();

  if (!inicio) {
    return;
  }

  try {
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) {
      borrarSesionActivaLocal();
      return;
    }

    const ahora = new Date();
    const durationSeconds = Math.max(0, Math.floor((ahora.getTime() - inicio.getTime()) / 1000));
    const logoutAt = ahora.toISOString();

    if (sessionId) {
      await actualizarRegistroSesion(sessionId, logoutAt, durationSeconds);
    }

    try {
      const { data: usuario, error: selectError } = await window.supabaseClient
        .from("usuarios")
        .select("tiempo_activo_total")
        .eq("id", user.id)
        .single();

      if (!selectError && usuario) {
        const tiempoTotal = (usuario.tiempo_activo_total || 0) + durationSeconds;
        await window.supabaseClient
          .from("usuarios")
          .update({ tiempo_activo_total: tiempoTotal, ultima_logout: logoutAt })
          .eq("id", user.id);
      }
    } catch (error) {
      console.warn("⚠️ No se pudo actualizar el tiempo total en usuarios:", error);
    }
  } catch (error) {
    console.warn("⚠️ No se pudo finalizar la sesión antes del logout:", error);
  } finally {
    // Guarda el cierre en local aún si Supabase no responde.
    if (sessionId) {
      actualizarSesionLocal(sessionId, new Date().toISOString(), Math.max(0, Math.floor((new Date().getTime() - inicio.getTime()) / 1000)));
    }
    borrarSesionActivaLocal();
  }
}

function mostrarSplashSalida() {
  const splash = document.createElement("div");
  splash.id = "logout-splash";
  splash.style.position = "fixed";
  splash.style.inset = "0";
  splash.style.background = "rgba(15, 23, 42, 0.92)";
  splash.style.display = "flex";
  splash.style.alignItems = "center";
  splash.style.justifyContent = "center";
  splash.style.zIndex = "9999";
  splash.innerHTML = `
    <div style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); backdrop-filter: blur(14px); padding: 2rem 2.5rem; border-radius: 18px; text-align: center; max-width: 420px; width: 90%;">
      <h2 style="margin:0 0 1rem; color:#f8fafc; font-size:2rem;">Te esperamos de nuevo</h2>
      <p style="margin:0; color:#d1d5db; font-size:1rem;">Gracias por visitar SignHands. Tu sesión ha terminado.</p>
    </div>
  `;
  document.body.appendChild(splash);

  return new Promise((resolve) => {
    setTimeout(() => {
      splash.remove();
      resolve();
    }, 1700);
  });
}

function obtenerRutaSalida() {
  const path = window.location.pathname;
  const estaEnEvaluate = path.toLowerCase().includes("/evaluacion/");

  if (estaEnEvaluate) {
    console.log("Usuario estaba en Evaluate, redirigiendo a index.html");
    return "../index.html";
  }

  console.log("Usuario no estaba en Evaluate, recargando la misma página:", path);
  return window.location.href;
}

async function logout() {
  try {
    await esperar(() => window.supabaseClient !== undefined);
    console.log("Cerrando sesión...");
    await finalizarSesion();
    await window.supabaseClient.auth.signOut();
    console.log("Sesión cerrada exitosamente");
    await mostrarSplashSalida();
    window.location.replace(obtenerRutaSalida());
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    await mostrarSplashSalida();
    window.location.replace(obtenerRutaSalida());
  }
}