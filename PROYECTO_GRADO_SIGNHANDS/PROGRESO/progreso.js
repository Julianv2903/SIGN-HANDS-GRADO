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

function formatearFecha(fecha) {
  if (!fecha) return "-";
  const d = new Date(fecha);
  return d.toLocaleString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatearDuracion(segundos) {
  if (!segundos || segundos <= 0) return "0s";
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segundosRestantes = segundos % 60;
  const partes = [];
  if (horas) partes.push(`${horas}h`);
  if (minutos) partes.push(`${minutos}m`);
  if (segundosRestantes || partes.length === 0) partes.push(`${segundosRestantes}s`);
  return partes.join(" ");
}

function mostrarMensaje(texto) {
  const contenedor = document.getElementById("sesiones-container");
  if (!contenedor) return;
  contenedor.innerHTML = `<p class="mensaje-empty">${texto}</p>`;
}

function obtenerHistorialLocal() {
  try {
    return JSON.parse(localStorage.getItem("signhandsSessionHistory") || "[]");
  } catch (error) {
    return [];
  }
}

function mostrarHistorialLocal() {
  const historial = obtenerHistorialLocal();
  if (!historial || historial.length === 0) {
    mostrarMensaje("Aún no hay sesiones registradas.");
    return;
  }

  document.getElementById("registro-sesiones").textContent = `${historial.length} registros locales`;

  const tabla = document.createElement("table");
  tabla.id = "sesiones-table";
  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Inicio</th>
        <th>Fin</th>
        <th>Duración</th>
      </tr>
    </thead>
    <tbody>
      ${historial.map(sesion => `
        <tr>
          <td>${formatearFecha(sesion.login_at)}</td>
          <td>${formatearFecha(sesion.logout_at) || "Sin cierre"}</td>
          <td>${formatearDuracion(sesion.duration_seconds)}</td>
        </tr>
      `).join("")}
    </tbody>
  `;

  const contenedor = document.getElementById("sesiones-container");
  if (contenedor) {
    contenedor.innerHTML = "";
    contenedor.appendChild(tabla);
  }
}

async function cargarProgreso() {
  try {
    await esperar(() => window.supabaseClient !== undefined);

    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) {
      window.location.href = "../SIGNIN/signin.html";
      return;
    }

    const { data: usuario, error: usuarioError } = await window.supabaseClient
      .from("usuarios")
      .select("nombre, correo, fecha_registro, ultima_sesion, ultima_logout, dias_conectados, tiempo_activo_total")
      .eq("id", user.id)
      .single();

    if (usuarioError) {
      console.warn("⚠️ No se pudo cargar el perfil de usuario:", usuarioError);
    }

    const resumen = {
      ultima_sesion: usuario?.ultima_sesion || "Aún no hay inicio de sesión registrado",
      dias_conectados: usuario?.dias_conectados ?? 0,
      tiempo_total: formatearDuracion(usuario?.tiempo_activo_total || 0),
      sesiones_registradas: "-"
    };

    document.getElementById("ultima-sesion").textContent = formatearFecha(resumen.ultima_sesion);
    document.getElementById("dias-conectados").textContent = `${resumen.dias_conectados}`;
    document.getElementById("tiempo-total").textContent = resumen.tiempo_total;

    const { data: sesiones, error: sesionesError } = await window.supabaseClient
      .from("sesiones")
      .select("id, login_at, logout_at, duration_seconds")
      .eq("user_id", user.id)
      .order("login_at", { ascending: false })
      .limit(20);

    if (sesionesError) {
      console.warn("⚠️ No se pudo cargar el historial de sesiones:", sesionesError);
      document.getElementById("registro-sesiones").textContent = "No disponible";
      mostrarMensaje("No se encontró un historial de sesiones en Supabase. Usando historial local si existe.");
      mostrarHistorialLocal();
      return;
    }

    if (!sesiones || sesiones.length === 0) {
      const historialLocal = obtenerHistorialLocal();
      if (historialLocal && historialLocal.length > 0) {
        mostrarMensaje("No hay sesiones guardadas en Supabase. Mostrando historial local.");
        mostrarHistorialLocal();
        return;
      }

      document.getElementById("registro-sesiones").textContent = "0 registros";
      mostrarMensaje("Aún no hay sesiones registradas.");
      return;
    }

    document.getElementById("registro-sesiones").textContent = `${sesiones.length} registros`;

    const tabla = document.createElement("table");
    tabla.id = "sesiones-table";
    tabla.innerHTML = `
      <thead>
        <tr>
          <th>Inicio</th>
          <th>Fin</th>
          <th>Duración</th>
        </tr>
      </thead>
      <tbody>
        ${sesiones.map(sesion => `
          <tr>
            <td>${formatearFecha(sesion.login_at)}</td>
            <td>${formatearFecha(sesion.logout_at) || "Sin cierre"}</td>
            <td>${formatearDuracion(sesion.duration_seconds)}</td>
          </tr>
        `).join("")}
      </tbody>
    `;

    const contenedor = document.getElementById("sesiones-container");
    if (contenedor) {
      contenedor.innerHTML = "";
      contenedor.appendChild(tabla);
    }
  } catch (error) {
    console.error("❌ Error al cargar el progreso:", error);
    mostrarMensaje("Ocurrió un error al cargar el progreso. Intenta recargar la página.");
  }
}

document.addEventListener("DOMContentLoaded", cargarProgreso);
