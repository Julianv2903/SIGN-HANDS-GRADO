// Funciones para manejar el foro de comentarios con Supabase

// Obtener la sesión actual del usuario
async function obtenerSesionSupabase() {
  const { data: { session }, error } = await window.supabaseClient.auth.getSession();
  if (error) {
    console.warn("Error al obtener sesión de Supabase:", error);
    return null;
  }
  return session;
}

let forumUsuarioActual = null;

// Formatear fecha ISO a formato legible en español
function formatearFecha(fechaISO) {
  if (!fechaISO) return "";
  try {
    return new Date(fechaISO).toLocaleString("es-CO", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (error) {
    return fechaISO;
  }
}

// Escapar caracteres HTML para prevenir XSS
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Cargar comentarios desde Supabase
async function cargarComentarios() {
  const commentsSection = document.getElementById("comments-section");
  const forumMessage = document.getElementById("forum-message");
  if (!commentsSection || !forumMessage) return;

  const { data: comentarios, error } = await window.supabaseClient
    .from("comentarios")
    .select("id, mensaje, nombre, user_id, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando comentarios:", error);
    forumMessage.textContent = "No se pudieron cargar los comentarios. Intenta recargar la página.";
    return;
  }

  if (!comentarios || comentarios.length === 0) {
    commentsSection.innerHTML = "<div class='forum-message'>Aún no hay comentarios. Sé el primero en escribir.</div>";
    return;
  }

  commentsSection.innerHTML = comentarios
    .map((comentario) => {
      const esPropio = forumUsuarioActual && comentario.user_id === forumUsuarioActual.id;
      const acciones = esPropio
        ? `<div class="comment-actions">
            <button type="button" onclick="editarComentario('${comentario.id}')">Editar</button>
            <button type="button" onclick="eliminarComentario('${comentario.id}')">Eliminar</button>
          </div>`
        : "";

      return `
        <article class="comment-card">
          <div class="comment-header">
            <span class="comment-user">${escapeHtml(comentario.nombre || "Usuario")}</span>
            <span class="comment-date">${formatearFecha(comentario.created_at)}</span>
          </div>
          <div class="comment-body" id="comment-body-${comentario.id}">${escapeHtml(comentario.mensaje).replace(/\n/g, "<br>")}</div>
          ${acciones}
        </article>
      `;
    })
    .join("");
}

// Mostrar mensaje de estado para acciones de comentarios
function mostrarEstadoComentario(texto, tipo = "success") {
  const statusBox = document.getElementById("comment-status");
  if (!statusBox) return;

  statusBox.textContent = texto;
  statusBox.classList.remove("hidden", "success", "error");
  statusBox.classList.add(tipo);

  setTimeout(() => {
    statusBox.classList.add("hidden");
  }, 2500);
}

// Verificar conexión con Supabase
async function comprobarConexionSupabase() {
  try {
    const { error } = await window.supabaseClient
      .from("comentarios")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Error de conexión Supabase:", error);
      return error;
    }

    return null;
  } catch (error) {
    console.error("Error inesperado al comprobar Supabase:", error);
    return { message: error.message || "Error desconocido" };
  }
}

async function eliminarComentario(id) {
  if (!confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
    return;
  }

  const { error } = await window.supabaseClient
    .from("comentarios")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar comentario:", error);
    alert("No se pudo eliminar el comentario. Intenta de nuevo.");
    return;
  }

  await cargarComentarios();
}

// Editar un comentario existente
async function editarComentario(id) {
  const bodyEl = document.getElementById(`comment-body-${id}`);
  if (!bodyEl) return;

  const mensajeActual = bodyEl.textContent.trim();
  const mensajeNuevo = prompt("Editar comentario:", mensajeActual);
  if (mensajeNuevo === null) {
    return;
  }

  const texto = mensajeNuevo.trim();
  if (!texto) {
    alert("El comentario no puede quedar vacío.");
    return;
  }

  const { error } = await window.supabaseClient
    .from("comentarios")
    .update({ mensaje: texto })
    .eq("id", id);

  if (error) {
    console.error("Error al actualizar comentario:", error);
    alert("No se pudo actualizar el comentario. Intenta de nuevo.");
    return;
  }

  await cargarComentarios();
}

async function initForum() {
  await esperar(() => window.supabaseClient !== undefined);

  const forumMessage = document.getElementById("forum-message");
  const loginWarning = document.getElementById("login-warning");
  const commentStatus = document.getElementById("comment-status");
  const commentFormSection = document.getElementById("comment-form-section");
  const commentForm = document.getElementById("comment-form");
  const commentText = document.getElementById("comment-text");

  if (!forumMessage || !loginWarning || !commentStatus || !commentFormSection || !commentForm || !commentText) {
    console.error("Elementos del foro no encontrados");
    return;
  }

  const conexionError = await comprobarConexionSupabase();
  if (conexionError) {
    forumMessage.textContent = `No se pudo conectar a Supabase: ${conexionError.message || conexionError}`;
    commentStatus.textContent = "Revisa la tabla comentarios y las políticas de RLS en Supabase.";
    commentStatus.classList.remove("hidden");
    commentStatus.classList.add("error");
    loginWarning.classList.add("hidden");
    commentFormSection.classList.add("hidden");
    return;
  }

  const session = await obtenerSesionSupabase();
  const usuario = session ? await obtenerUsuarioActual() : null;

  forumUsuarioActual = usuario;

  if (!session) {
    forumMessage.textContent = "Solo los usuarios registrados pueden comentar.";
    loginWarning.classList.remove("hidden");
    commentFormSection.classList.add("hidden");
  } else {
    forumMessage.textContent = `Bienvenido ${usuario.nombre || usuario.correo || "Usuario"}. Puedes dejar tu comentario aquí.`;
    loginWarning.classList.add("hidden");
    commentFormSection.classList.remove("hidden");

    commentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const mensaje = commentText.value.trim();

      if (!mensaje) {
        alert("Escribe un comentario antes de enviar.");
        return;
      }

      const comentario = {
        user_id: usuario.id,
        nombre: usuario.nombre || usuario.correo || "Usuario",
        mensaje,
      };

      const { error } = await window.supabaseClient
        .from("comentarios")
        .insert([comentario]);

      if (error) {
        console.error("Error al enviar comentario:", error);
        mostrarEstadoComentario("No se pudo publicar el comentario. Intenta de nuevo.", "error");
        return;
      }

      commentText.value = "";
      mostrarEstadoComentario("Comentario publicado correctamente.", "success");
      await cargarComentarios();
    });
  }

  await cargarComentarios();
}

// Inicializar el foro cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  initForum().catch((error) => {
    console.error("Error inicializando el foro:", error);
    const forumMessage = document.getElementById("forum-message");
    if (forumMessage) {
      forumMessage.textContent = "Ocurrió un error al cargar el foro. Recarga la página.";
    }
  });
});
