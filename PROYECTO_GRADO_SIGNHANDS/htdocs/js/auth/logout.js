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
    await window.supabaseClient.auth.signOut();
    console.log("Sesión cerrada exitosamente");
    alert("Sesión cerrada correctamente.");
    window.location.replace(obtenerRutaSalida());
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    alert("Sesión cerrada correctamente.");
    window.location.replace(obtenerRutaSalida());
  }
}