function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

async function cargarResultadosBusqueda(query = "") {
  const resultsSection = document.getElementById("search-results");
  const searchMessage = document.getElementById("search-message");
  if (!resultsSection || !searchMessage) return;

  const builder = window.supabaseClient
    .from("comentarios")
    .select("id, mensaje, nombre, created_at")
    .order("created_at", { ascending: false });

  if (query) {
    const filtro = `%${query.replace(/%/g, "\\%")}%`;
    builder.or(`mensaje.ilike.${filtro},nombre.ilike.${filtro}`);
  }

  const { data: comentarios, error } = await builder;

  if (error) {
    console.error("Error buscando comentarios:", error);
    searchMessage.textContent = "No se pudo buscar en el foro. Intenta de nuevo más tarde.";
    searchMessage.classList.remove("hidden", "success");
    searchMessage.classList.add("error");
    resultsSection.innerHTML = "";
    return;
  }

  if (!comentarios || comentarios.length === 0) {
    searchMessage.textContent = query
      ? `No se encontraron comentarios para "${escapeHtml(query)}".`
      : "Aún no hay comentarios en el foro.";
    resultsSection.innerHTML = "";
    return;
  }

  searchMessage.textContent = query
    ? `Resultados para "${escapeHtml(query)}"` 
    : `Mostrando los últimos ${comentarios.length} comentarios del foro.`;
  searchMessage.classList.remove("hidden", "error");
  searchMessage.classList.add("success");

  resultsSection.innerHTML = comentarios
    .map((comentario) => `
      <article class="comment-card">
        <div class="comment-header">
          <span class="comment-user">${escapeHtml(comentario.nombre || "Usuario")}</span>
          <span class="comment-date">${formatearFecha(comentario.created_at)}</span>
        </div>
        <div class="comment-body">${escapeHtml(comentario.mensaje).replace(/\n/g, "<br>")}</div>
      </article>
    `)
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("busqueda-comentarios");
  const searchButton = document.getElementById("btn-buscar");

  if (!searchInput || !searchButton) {
    console.error("Elementos de búsqueda no encontrados");
    return;
  }

  searchButton.addEventListener("click", async () => {
    await cargarResultadosBusqueda(searchInput.value.trim());
  });

  searchInput.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      await cargarResultadosBusqueda(searchInput.value.trim());
    }
  });

  cargarResultadosBusqueda();
});
