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

// Función para guardar datos de usuario en la tabla
async function guardarDatosUsuario(userId, nombre, correo) {
  try {
    const { error } = await window.supabaseClient
      .from("usuarios")
      .insert([
        {
          id: userId,
          nombre: nombre,
          correo: correo,
          fecha_registro: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error("Error al guardar datos del usuario:", error);
      return false;
    }

    console.log("Datos del usuario guardados correctamente");
    return true;
  } catch (err) {
    console.error("Error al guardar datos:", err);
    return false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Esperar a que supabaseClient esté disponible
    await esperar(() => window.supabaseClient !== undefined);

    const form = document.querySelector("form");
    if (!form) {
      console.log("Formulario no encontrado");
      return;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.querySelector("#nombre")?.value || "";
      const correo = document.querySelector("#correo")?.value || "";
      const password = document.querySelector("#password")?.value || "";

      // Validaciones
      if (!nombre || !correo || !password) {
        alert("Por favor completa todos los campos");
        return;
      }

      if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres");
        return;
      }

      if (!correo.includes("@")) {
        alert("Por favor ingresa un correo válido");
        return;
      }

      try {
        console.log("Registrando usuario:", { nombre, correo });

        const { data, error } = await window.supabaseClient.auth.signUp({
          email: correo,
          password: password,
          options: {
            data: {
              nombre: nombre
            }
          }
        });

        if (error) {
          console.error("Error Supabase:", error);
          alert("Error al registrar: " + error.message);
        } else {
          console.log("Usuario registrado:", data);

          // Guardar datos adicionales en la tabla usuarios
          if (data.user) {
            const guardado = await guardarDatosUsuario(data.user.id, nombre, correo);
            if (guardado) {
              console.log("Perfil de usuario creado correctamente");
            }
          }

          alert("Usuario creado exitosamente. Ahora puedes iniciar sesión.");
          window.location.href = "../SIGNIN/signin.html";
        }
      } catch (err) {
        console.error("Error al registrar:", err);
        alert("Error inesperado: " + err.message);
      }
    });
  } catch (err) {
    console.error("Error al inicializar:", err);
    alert("Error al conectar con el servidor. Por favor, recarga la página.");
  }
});