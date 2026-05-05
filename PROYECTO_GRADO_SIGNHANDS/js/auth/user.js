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

  if (estaLogueado) {
    if (evaluacionesLink) evaluacionesLink.style.display = "inline-block";
    if (loginLink) loginLink.style.display = "none";
    if (signupLink) signupLink.style.display = "none";
    if (userDropdown) userDropdown.style.display = "inline-block";
    crearBotonLogout(userDropdown);
    return;
  }

  if (evaluacionesLink) evaluacionesLink.style.display = "none";
  if (loginLink) loginLink.style.display = "inline-block";
  if (signupLink) signupLink.style.display = "inline-block";
  if (userDropdown) userDropdown.style.display = "none";

  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.style.display = "none";
  }
}

function obtenerRutaProgreso() {
  const path = window.location.pathname;
  const partes = path.split("/").filter(Boolean);

  // Si la app se sirve desde el workspace root o desde la carpeta del proyecto,
  // devolvemos la ruta correcta según la estructura actual.
  if (partes[0] === "PROYECTO_GRADO_SIGNHANDS") {
    return "/PROYECTO_GRADO_SIGNHANDS/PROGRESO/progreso.html";
  }

  if (partes.includes("PROGRESO")) {
    return "progreso.html";
  }

  return partes.length > 1 ? "../PROGRESO/progreso.html" : "PROGRESO/progreso.html";
}


function getRutaRelativa(rutaRelativa) {
  const partes = window.location.pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  const tienePrefijo = partes[0] === "PROYECTO_GRADO_SIGNHANDS";
  if (tienePrefijo) partes.shift();

  const nivel = Math.max(0, partes.length - 1);
  const prefijo = nivel === 0 ? "" : "../".repeat(nivel);
  return prefijo + rutaRelativa;
}

function crearMenuHerramientas() {
  const navLinks = document.querySelector(".nav-links");
  if (!navLinks || document.getElementById("tools-dropdown-container")) {
    return;
  }

  const herramientasLink = Array.from(navLinks.querySelectorAll("a")).find((element) => {
    const texto = element.textContent.trim();
    return texto === "Herramientas" || element.getAttribute("href")?.includes("tools.html");
  });

  const toolsHref = getRutaRelativa("tools.html");

  let menuLink = herramientasLink;
  if (!menuLink) {
    menuLink = document.createElement("a");
    menuLink.href = toolsHref;
    menuLink.textContent = "Herramientas";
    navLinks.insertBefore(menuLink, navLinks.firstChild);
  } else {
    menuLink.href = toolsHref;
  }

  const wrapper = document.createElement("div");
  wrapper.id = "tools-dropdown-container";
  wrapper.className = "tools-dropdown";
  menuLink.parentElement.replaceChild(wrapper, menuLink);
  wrapper.appendChild(menuLink);

  const dropdownMenu = document.createElement("div");
  dropdownMenu.className = "dropdown-menu";

  const herramientas = [
    { texto: "Alfabeto", ruta: "ALFABETO/alfabeto.html" },
    { texto: "Palabra del Día", ruta: "PALABRADIA/palabra.html" },
    { texto: "Vocabulario", ruta: "VOCABULARIO/vocabulario.html" }
  ];

  herramientas.forEach((item) => {
    const link = document.createElement("a");
    link.href = getRutaRelativa(item.ruta);
    link.textContent = item.texto;
    dropdownMenu.appendChild(link);
  });

  wrapper.appendChild(dropdownMenu);
}

function crearMenuUsuario(usuario) {
  const userDropdown = document.getElementById("user-dropdown");
  if (!userDropdown) {
    return;
  }

  let userDropdownSpan = userDropdown.querySelector("span");
  if (!userDropdownSpan) {
    userDropdownSpan = document.createElement("span");
    userDropdown.appendChild(userDropdownSpan);
  }

  userDropdownSpan.textContent = usuario.nombre || usuario.correo;
  userDropdownSpan.classList.add("user-name-link");

  let dropdownMenu = userDropdown.querySelector(".dropdown-menu");
  if (!dropdownMenu) {
    dropdownMenu = document.createElement("div");
    dropdownMenu.className = "dropdown-menu";
    userDropdown.appendChild(dropdownMenu);
  }

  dropdownMenu.innerHTML = "";

  const opciones = [
    { texto: "Ver progreso", href: obtenerRutaProgreso() }
  ];

  opciones.forEach((item) => {
    const link = document.createElement("a");
    link.textContent = item.texto;
    link.href = item.href;
    dropdownMenu.appendChild(link);
  });

  configurarDropdownUsuario(userDropdown);
  marcarPaginaActiva();
}

function obtenerRutaNormalizada(ruta) {
  const url = new URL(ruta, window.location.origin);
  const rutaLimpia = url.pathname.replace(/^\/+/g, "").replace(/^PROYECTO_GRADO_SIGNHANDS\//, "");
  return rutaLimpia;
}

function marcarPaginaActiva() {
  const currentPath = obtenerRutaNormalizada(window.location.pathname);
  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") {
      link.classList.remove("active-link");
      return;
    }

    const linkPath = obtenerRutaNormalizada(href);
    const isToolsLink = linkPath === "tools.html";
    const isToolsSection = ["ALFABETO/", "PALABRADIA/", "VOCABULARIO/"].some((prefijo) => currentPath.startsWith(prefijo));

    if (linkPath === currentPath || (isToolsLink && isToolsSection)) {
      link.classList.add("active-link");
    } else {
      link.classList.remove("active-link");
    }
  });

  const userDropdownSpan = document.querySelector(".user-dropdown span");
  const progresoPath = obtenerRutaNormalizada(obtenerRutaProgreso());
  if (userDropdownSpan) {
    if (currentPath === progresoPath) {
      userDropdownSpan.classList.add("active-link");
    } else {
      userDropdownSpan.classList.remove("active-link");
    }
  }

  const userDropdownLinks = document.querySelectorAll(".user-dropdown .dropdown-menu a");
  userDropdownLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") {
      link.classList.remove("active-link");
      return;
    }
    const linkPath = obtenerRutaNormalizada(href);
    if (currentPath === progresoPath && linkPath === progresoPath) {
      link.classList.add("active-link");
    } else {
      link.classList.remove("active-link");
    }
  });
}

function crearBotonLogout(userDropdown) {
  if (!userDropdown) return;

  let logoutButton = document.getElementById("logout-button");
  if (!logoutButton) {
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

  logoutButton.style.display = "inline-block";
}

function configurarDropdownUsuario(userDropdown) {
  if (!userDropdown) return;

  userDropdown.addEventListener("mouseenter", () => {
    userDropdown.classList.add("open");
  });

  userDropdown.addEventListener("mouseleave", () => {
    userDropdown.classList.remove("open");
  });

  userDropdown.addEventListener("focusin", () => {
    userDropdown.classList.add("open");
  });

  userDropdown.addEventListener("focusout", () => {
    userDropdown.classList.remove("open");
  });
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

    crearMenuUsuario(usuario);
    console.log("✓ Header actualizado con usuario:", usuario.nombre);
  } catch (error) {
    console.error("Error al mostrar header del usuario:", error);
  }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  crearMenuHerramientas();
  marcarPaginaActiva();
  mostrarHeaderUsuario();
});
