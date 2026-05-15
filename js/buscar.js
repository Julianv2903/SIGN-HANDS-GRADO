// Función para escapar caracteres HTML y prevenir XSS
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Índice de búsqueda del sitio con contenido multimedia
const siteSearchIndex = [
  {
    title: "Alfabeto de señas",
    description: "Aprende el alfabeto colombiano de señas letra por letra con soporte visual.",
    category: "Alfabeto",
    thumbnail: "../ALFABETO/imagenes/a.jpg",
    tags: ["alfabeto", "letras", "señas", "colombiano", "abecedario"]
  },
  {
    title: "Vocabulario general",
    description: "Explora vocabulario en diferentes temas para mejorar tu comunicación en señas.",
    category: "Vocabulario",
    thumbnail: "../imagenes/logoblack.png",
    tags: ["vocabulario", "palabras", "temas", "señas"]
  },
  {
    title: "Animales",
    description: "Aprende el vocabulario de animales en lenguaje de señas.",
    category: "Vocabulario",
    thumbnail: "../VOCABULARIO/IMAGENES/ANIMALES.jpg",
    tags: ["animales", "mascotas", "naturaleza", "zoo"]
  },
  {
    title: "Capitales",
    description: "Descubre signos para capitales y lugares importantes.",
    category: "Vocabulario",
    thumbnail: "../VOCABULARIO/IMAGENES/CAPITALES.jpg",
    tags: ["capitales", "lugares", "geografía"]
  },
  {
    title: "Comida",
    description: "Aprende signos relacionados con alimentos y restaurantes.",
    category: "Vocabulario",
    thumbnail: "../VOCABULARIO/IMAGENES/COMIDA.jpg",
    tags: ["comida", "bebidas", "gastronomía"]
  },
  {
    title: "Educación",
    description: "Signos útiles para el contexto educativo y de aprendizaje.",
    category: "Vocabulario",
    thumbnail: "../VOCABULARIO/IMAGENES/EDUCACION.jpg",
    tags: ["educación", "escuela", "clases"]
  },
  {
    title: "Emociones",
    description: "Explora cómo expresar emociones con lenguaje de señas.",
    category: "Vocabulario",
    thumbnail: "../VOCABULARIO/IMAGENES/EMOCIONES.jpg",
    tags: ["emociones", "sentimientos", "estado de ánimo"]
  },
  {
    title: "Familia",
    description: "Aprende signos relacionados con miembros de la familia.",
    category: "Vocabulario",
    thumbnail: "../VOCABULARIO/IMAGENES/FAMILIA.jpg",
    tags: ["familia", "parientes", "hogar"]
  },
  {
    title: "Lugares",
    description: "Signos para describir lugares, zonas y ubicaciones.",
    category: "Vocabulario",
    thumbnail: "../VOCABULARIO/IMAGENES/DIRECCIONES.jpg",
    tags: ["lugares", "ciudad", "sitios"]
  },
  {
    title: "Salud",
    description: "Vocabulario de salud y partes del cuerpo en señas.",
    category: "Vocabulario",
    thumbnail: "../VOCABULARIO/IMAGENES/SALUD.jpg",
    tags: ["salud", "cuerpo", "medicina"]
  },
  {
    title: "Tiempo",
    description: "Aprende signos relacionados con el tiempo y las estaciones.",
    category: "Vocabulario",
    thumbnail: "../VOCABULARIO/IMAGENES/TIEMPO.jpg",
    tags: ["tiempo", "fecha", "clima"]
  },
  {
    title: "Verbos",
    description: "Domina los signos de los verbos más usados en el lenguaje de señas.",
    category: "Vocabulario",
    thumbnail: "../VOCABULARIO/IMAGENES/VERBOS.jpg",
    tags: ["verbos", "acciones", "gramática"]
  },
  {
    title: "Juego de palabras",
    description: "Ejercita tu vocabulario con juegos interactivos de palabras.",
    category: "Aprendizaje",
    thumbnail: "../imagenes/hand-3035665_1280.jpg",
    tags: ["juego", "palabras", "actividad", "interactivo"]
  },
  {
    title: "Progreso",
    description: "Revisa tu avance y el historial de aprendizaje.",
    category: "Mi progreso",
    thumbnail: "../imagenes/user.png",
    tags: ["progreso", "avance", "estadísticas", "historial"]
  },
  {
    title: "Evaluaciones",
    description: "Pon a prueba tus conocimientos con ejercicios y evaluaciones.",
    category: "Evaluación",
    thumbnail: "../imagenes/user.png",
    tags: ["evaluaciones", "pruebas", "examen", "test"]
  }
];

function renderSearchResults(resultados, query) {
  const resultsSection = document.getElementById("search-preview");
  const searchMessage = document.getElementById("search-message");
  if (!resultsSection || !searchMessage) return;

  if (!query) {
    searchMessage.textContent = "Describe lo que buscas en el área izquierda y aquí verás el recurso solicitado.";
  } else if (resultados.length === 0) {
    searchMessage.textContent = "No tenemos ese recurso disponible en el momento.";
  } else {
    searchMessage.textContent = `Resultados para "${escapeHtml(query)}"`;
  }

  resultsSection.innerHTML = resultados
    .map((item) => {
      const thumbnail = item.thumbnail
        ? `<div class="result-thumbnail"><img src="${item.thumbnail}" alt="${escapeHtml(item.title)}"></div>`
        : `<div class="result-thumbnail result-placeholder">Sin vista previa</div>`;

      return `
        <article class="comment-card search-result-card">
          ${thumbnail}
          <div class="comment-header">
            <span class="comment-user">${escapeHtml(item.title)}</span>
            <span class="comment-date">${escapeHtml(item.category)}</span>
          </div>
          <div class="comment-body">${escapeHtml(item.description)}</div>
        </article>
      `;
    })
    .join("");
}


function buscarContenido(query) {
  const consulta = String(query || "").trim().toLowerCase();

  if (!consulta) {
    return siteSearchIndex;
  }

  return siteSearchIndex.filter((item) => {
    const texto = [
      item.title,
      item.description,
      item.category,
      ...(item.tags || [])
    ]
      .join(" ")
      .toLowerCase();

    return texto.includes(consulta);
  });
}

function iniciarBusquedaContenido() {
  const searchInput = document.getElementById("busqueda-contenido");
  const searchButton = document.getElementById("btn-buscar");

  if (!searchInput || !searchButton) {
    console.error("Elementos de búsqueda no encontrados");
    return;
  }

  const ejecutarBusqueda = () => {
    const query = searchInput.value.trim();
    const resultados = buscarContenido(query);
    renderSearchResults(resultados, query);
  };

  searchButton.addEventListener("click", ejecutarBusqueda);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      ejecutarBusqueda();
    }
  });

  renderSearchResults(siteSearchIndex, "");
}

window.addEventListener("DOMContentLoaded", iniciarBusquedaContenido);
