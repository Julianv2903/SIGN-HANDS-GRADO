// Script para gestionar la información del usuario autenticado

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

// Obtener información del usuario actual
async function obtenerUsuarioActual() {
  try {
    await esperar(() => window.supabaseClient !== undefined);

    const { data: { user } } = await window.supabaseClient.auth.getUser();
    
    if (!user) {
      console.log("No hay usuario autenticado");
      return null;
    }

    console.log("Usuario autenticado:", user.email);

    // Obtener datos adicionales del usuario de la tabla
    const { data: datosUsuario, error } = await window.supabaseClient
      .from("usuarios")
      .select("nombre, correo, fecha_registro")
      .eq("id", user.id)
      .single();

    if (error) {
      console.warn("Error al obtener datos del usuario:", error);
      return {
        id: user.id,
        correo: user.email,
        nombre: user.user_metadata?.nombre || "Usuario"
      };
    }

    return {
      id: user.id,
      ...datosUsuario
    };
  } catch (error) {
    console.error("Error en obtenerUsuarioActual:", error);
    return null;
  }
}

// Actualiza los elementos de navegación según si el usuario está logueado
function actualizarNavSesion(estaLogueado) {
  const evaluacionesLink = document.getElementById("evaluaciones-link");
  const loginLink = document.getElementById("login-link");
  const signupLink = document.getElementById("signup-link");
  const userDropdown = document.getElementById("user-dropdown");
  let logoutButton = document.getElementById("logout-button");

  if (estaLogueado) {
    if (evaluacionesLink) evaluacionesLink.style.display = "inline-block";
    if (loginLink) loginLink.style.display = "none";
    if (signupLink) signupLink.style.display = "none";
    if (userDropdown) userDropdown.style.display = "inline-block";

    // Crear botón de logout si aún no existe
    if (!logoutButton && userDropdown) {
      logoutButton = document.createElement("button");
      logoutButton.id = "logout-button";
      logoutButton.type = "button";
      logoutButton.className = "logout-button";
      logoutButton.textContent = "Cerrar sesión";
      logoutButton.addEventListener("click", (event) => {
        event.preventDefault();
        logout();
      });

      userDropdown.insertAdjacentElement("afterend", logoutButton);
    }

    if (logoutButton) {
      logoutButton.style.display = "inline-block";
    }
    return;
  }

  if (evaluacionesLink) evaluacionesLink.style.display = "none";
  if (loginLink) loginLink.style.display = "inline-block";
  if (signupLink) signupLink.style.display = "inline-block";
  if (userDropdown) userDropdown.style.display = "none";
  if (logoutButton) logoutButton.style.display = "none";
}

// Mostrar el nombre del usuario en el header (si está logueado)
async function mostrarHeaderUsuario() {
  try {
    await esperar(() => window.supabaseClient !== undefined);

    // Verificar si hay sesión activa
    const { data: { session } } = await window.supabaseClient.auth.getSession();

    if (!session) {
      console.log("No hay sesión activa - Usuario no logueado");
      actualizarNavSesion(false);
      return;
    }

    console.log("Sesión activa detectada");

    actualizarNavSesion(true);

    // Obtener información del usuario
    const usuario = await obtenerUsuarioActual();

    if (!usuario) {
      console.log("No se encontraron datos del usuario");
      return;
    }

    // Buscar el elemento del dropdown para mostrar el nombre del usuario
    const userDropdownSpan = document.querySelector(".user-dropdown span");

    if (userDropdownSpan) {
      // Mostrar nombre de usuario en el header
      userDropdownSpan.textContent = usuario.nombre || usuario.correo;
      userDropdownSpan.style.cursor = "pointer";
      userDropdownSpan.style.padding = "8px 12px";
      userDropdownSpan.style.borderRadius = "4px";
      userDropdownSpan.style.backgroundColor = "#2563eb";
      userDropdownSpan.style.color = "white";
      userDropdownSpan.style.display = "inline-block";

      console.log("✓ Header actualizado con usuario:", usuario.nombre);
    }
  } catch (error) {
    console.error("Error al mostrar header del usuario:", error);
  }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", mostrarHeaderUsuario);
