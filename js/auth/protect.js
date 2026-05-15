// Script para proteger páginas que requieren autenticación

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

// Verificar si hay una sesión activa y redirigir si no
async function verificarSesion() {
  try {
    await esperar(() => window.supabaseClient !== undefined);
    
    const { data } = await window.supabaseClient.auth.getSession();

    if (!data.session) {
      console.log("No hay sesión activa, redirigiendo a login");
      window.location.href = "../SIGNIN/signin.html";
    } else {
      console.log("Sesión activa para:", data.session.user.email);
    }
  } catch (error) {
    console.error("Error al verificar sesión:", error);
    window.location.href = "../SIGNIN/signin.html";
  }
}

// Ejecutar verificación al cargar la página
verificarSesion();