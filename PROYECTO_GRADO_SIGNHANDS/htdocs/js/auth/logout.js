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

async function logout() {
  try {
    await esperar(() => window.supabaseClient !== undefined);
    console.log("Cerrando sesión...");
    await window.supabaseClient.auth.signOut();
    console.log("Sesión cerrada exitosamente");
    window.location.href = "../SIGNIN/signin.html";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    window.location.href = "../SIGNIN/signin.html";
  }
}