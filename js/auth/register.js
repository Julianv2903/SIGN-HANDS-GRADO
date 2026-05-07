// ====== FUNCIÓN DE ESPERA ======
// Espera a que Supabase se inicialice antes de ejecutar cualquier acción
// Esto evita errores de "supabaseClient is undefined"
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

// ====== FUNCIÓN PARA GUARDAR DATOS DEL USUARIO ======
// Después de que Supabase registre el usuario en auth.users,
// esta función guarda los datos personales en la tabla "usuarios"
async function guardarDatosUsuario(userId, nombre, correo) {
  try {
    const { error } = await window.supabaseClient
      .from("usuarios")
      .insert([
        {
          id: userId,                              // Vinculado con auth.users.id
          nombre: nombre,                          // Nombre del usuario
          correo: correo,                          // Email del usuario
          fecha_registro: new Date().toISOString() // Fecha actual
        }
      ]);

    if (error) {
      console.error("❌ Error al guardar datos del usuario:", error);
      return false;
    }

    console.log("✓ Datos del usuario guardados en la tabla 'usuarios'");
    return true;
  } catch (err) {
    console.error("❌ Error al guardar datos:", err);
    return false;
  }
}

// ====== VALIDACIONES ADICIONALES ======
// Función para validar el formato del correo
function validarCorreo(correo) {
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexCorreo.test(correo);
}

// Función para validar la fortaleza de la contraseña
function validarContraseña(password) {
  // Mínimo 6 caracteres
  if (password.length < 6) {
    return { valido: false, mensaje: "La contraseña debe tener al menos 6 caracteres" };
  }
  
  // Puede incluir mayúsculas, minúsculas, números y símbolos
  return { valido: true, mensaje: "" };
}

// ====== MANEJADOR DEL FORMULARIO DE REGISTRO ======
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Esperar a que Supabase esté listo
    await esperar(() => window.supabaseClient !== undefined);
    console.log("✓ Supabase inicializado correctamente");

    const form = document.querySelector("form");
    if (!form) {
      console.log("❌ Formulario no encontrado");
      return;
    }

    // Agregar evento al enviar el formulario
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // Evitar que se recargue la página

      // ====== OBTENER VALORES DEL FORMULARIO ======
      const nombre = document.querySelector("#nombre")?.value?.trim() || "";
      const correo = document.querySelector("#correo")?.value?.trim() || "";
      const password = document.querySelector("#password")?.value || "";

      // ====== VALIDACIONES ======
      // 1. Verificar que todos los campos estén completos
      if (!nombre || !correo || !password) {
        alert("⚠️ Por favor completa todos los campos");
        return;
      }

      // 2. Validar que el nombre tenga al menos 3 caracteres
      if (nombre.length < 3) {
        alert("⚠️ El nombre debe tener al menos 3 caracteres");
        return;
      }

      // 3. Validar formato del correo
      if (!validarCorreo(correo)) {
        alert("⚠️ Por favor ingresa un correo válido (ejemplo: usuario@dominio.com)");
        return;
      }

      // 4. Validar contraseña
      const validacionPassword = validarContraseña(password);
      if (!validacionPassword.valido) {
        alert("⚠️ " + validacionPassword.mensaje);
        return;
      }

      try {
        console.log("📝 Registrando usuario:", { nombre, correo });

        // ====== REGISTRAR EN SUPABASE AUTH ======
        // Supabase crea el usuario en la tabla "auth.users" con la contraseña encriptada
        const { data, error } = await window.supabaseClient.auth.signUp({
          email: correo,
          password: password,
          options: {
            data: {
              nombre: nombre // Guardar nombre en metadata del usuario
            }
          }
        });

        if (error) {
          console.error("❌ Error de Supabase:", error);
          
          // Manejar errores específicos
          if (error.message?.includes("already registered")) {
            alert("❌ Este correo ya está registrado. Intenta con otro o inicia sesión.");
          } else if (error.message?.includes("Invalid email")) {
            alert("❌ El correo ingresado no es válido");
          } else {
            alert("❌ Error al registrar: " + (error.message || JSON.stringify(error)));
          }
          return;
        }

        console.log("✓ Usuario registrado en auth.users:", data);

        // ====== GUARDAR DATOS EN LA TABLA "usuarios" ======
        // Después del registro exitoso en auth, guardar datos adicionales
        // NOTA: Esto requiere que el usuario esté autenticado, por lo que se hace inmediatamente después del registro
        if (data.user) {
          console.log("Intentando guardar datos del usuario con ID:", data.user.id);

          // Intentar guardar los datos (puede fallar si RLS no está configurado correctamente)
          const guardado = await guardarDatosUsuario(data.user.id, nombre, correo);
          if (guardado) {
            console.log("✓ Perfil de usuario creado correctamente");
            alert("✓ Usuario creado exitosamente. Ahora puedes iniciar sesión.");

            // Redirigir a la página de login después de 1 segundo
            setTimeout(() => {
              window.location.href = "../SIGNIN/signin.html";
            }, 1000);
          } else {
            console.log("⚠️ Usuario creado en auth.users pero falló guardar en tabla usuarios");
            alert("✓ Usuario creado exitosamente, pero hubo un problema al guardar los datos adicionales. Intenta iniciar sesión de todas formas.");

            // Redirigir de todas formas
            setTimeout(() => {
              window.location.href = "../SIGNIN/signin.html";
            }, 2000);
          }
        } else {
          alert("⚠️ Error: No se pudo obtener la información del usuario");
        }

      } catch (err) {
        console.error("❌ Error al registrar:", err);
        alert("❌ Error inesperado: " + err.message);
      }
    });

    const toggleButton = document.getElementById("toggle-password-signup");
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
    console.error("❌ Error al inicializar el formulario:", err);
    alert("Error al conectar con el servidor. Por favor, recarga la página.");
  }
});