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

verificarSesion();