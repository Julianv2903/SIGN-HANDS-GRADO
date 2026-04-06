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

// Mostrar el nombre del usuario en el header (si está logueado)
async function mostrarHeaderUsuario() {
  try {
    await esperar(() => window.supabaseClient !== undefined);

    const { data: { session } } = await window.supabaseClient.auth.getSession();

    if (!session) {
      console.log("No hay sesión activa");
      return;
    }

    const usuario = await obtenerUsuarioActual();

    if (!usuario) {
      console.log("No se encontraron datos del usuario");
      return;
    }

    // Buscar el elemento del dropdown
    const userDropdown = document.querySelector(".user-dropdown span");
    const dropdownMenu = document.getElementById("dropdown-menu");

    if (userDropdown && dropdownMenu) {
      // Mostrar nombre de usuario en lugar del icono
      userDropdown.textContent = usuario.nombre || usuario.correo;
      userDropdown.style.cursor = "pointer";
      userDropdown.style.padding = "8px 12px";
      userDropdown.style.borderRadius = "4px";
      userDropdown.style.backgroundColor = "#2563eb";
      userDropdown.style.color = "white";
      userDropdown.style.display = "inline-block";

      console.log("Header actualizado con usuario:", usuario.nombre);
    }
  } catch (error) {
    console.error("Error al mostrar header del usuario:", error);
  }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", mostrarHeaderUsuario);
