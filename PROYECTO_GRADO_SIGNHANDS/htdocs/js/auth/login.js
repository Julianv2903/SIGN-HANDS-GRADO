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

async function obtenerDatosUsuario(userId) {
  try {
    const { data, error } = await window.supabaseClient
      .from("usuarios")
      .select("nombre, correo, ultima_sesion")
      .eq("id", userId)
      .single();

    if (error) {
      console.warn("Error al obtener datos:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error al obtener datos del usuario:", err);
    return null;
  }
}

async function actualizarUltimaSesion(userId) {
  try {
    const { error } = await window.supabaseClient
      .from("usuarios")
      .update({ ultima_sesion: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.warn("Error al actualizar última sesión:", error);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await esperar(() => window.supabaseClient !== undefined);

    const form = document.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const correo = document.querySelector("#correo")?.value || "";
      const password = document.querySelector("#password")?.value || "";

      if (!correo || !password) {
        alert("Por favor completa todos los campos");
        return;
      }

      try {
        console.log("Iniciando sesión con:", correo);

        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
          email: correo,
          password: password
        });

        if (error) {
          console.error("Error de login:", error);
          alert("Error: " + error.message);
        } else {
          console.log("Login exitoso:", data);

          // Obtener datos del usuario
          if (data.user) {
            const datosUsuario = await obtenerDatosUsuario(data.user.id);
            
            if (datosUsuario) {
              console.log("Datos del usuario obtenidos:", datosUsuario);
              alert("Bienvenido " + (datosUsuario.nombre || "Usuario"));
              
              // Actualizar última sesión
              await actualizarUltimaSesion(data.user.id);
            } else {
              alert("Bienvenido");
            }
          }

          window.location.href = "../index.html";
        }
      } catch (err) {
        console.error("Error al iniciar sesión:", err);
        alert("Error inesperado: " + err.message);
      }
    });
  } catch (err) {
    console.error("Error al inicializar:", err);
    alert("Error al conectar con el servidor. Por favor, recarga la página.");
  }
});