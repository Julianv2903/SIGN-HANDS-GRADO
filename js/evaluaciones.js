// Script para gestionar evaluaciones y cálculo de puntos

// ==========================================
// DATOS DE EVALUACIONES (servirán como base para las preguntas)
// ==========================================

const EVALUACIONES_DATA = {
  basico: {
    nombre: "Evaluación Básica",
    dificultad: "basico",
    puntos_maximos: 50,
    preguntas: [
      {
        id: 1,
        enunciado: "¿Cuál es la seña para 'Hola'?",
        tipo: "seleccion_multiple",
        imagen: "../imagenes/hola.png",
        opciones: ["A", "B", "C", "D"],
        respuesta_correcta: "A",
        puntos: 10
      },
      {
        id: 2,
        enunciado: "¿Cuál es la seña para 'Gracias'?",
        tipo: "seleccion_multiple",
        imagen: "../imagenes/gracias.png",
        opciones: ["A", "B", "C", "D"],
        respuesta_correcta: "B",
        puntos: 10
      },
      {
        id: 3,
        enunciado: "¿Cuál es la seña para 'Adiós'?",
        tipo: "seleccion_multiple",
        imagen: "../imagenes/adios.png",
        opciones: ["A", "B", "C", "D"],
        respuesta_correcta: "C",
        puntos: 10
      },
      {
        id: 4,
        enunciado: "¿Cuál es la seña para 'Sí'?",
        tipo: "seleccion_multiple",
        imagen: "../imagenes/si.png",
        opciones: ["A", "B", "C", "D"],
        respuesta_correcta: "A",
        puntos: 10
      },
      {
        id: 5,
        enunciado: "¿Cuál es la seña para 'No'?",
        tipo: "seleccion_multiple",
        imagen: "../imagenes/no.png",
        opciones: ["A", "B", "C", "D"],
        respuesta_correcta: "D",
        puntos: 10
      }
    ]
  },
  medio: {
    nombre: "Evaluación Media",
    dificultad: "medio",
    puntos_maximos: 75,
    preguntas: [
      {
        id: 1,
        enunciado: "Empareja la seña con la palabra",
        tipo: "emparejamiento",
        pares: [
          { imagen: "../imagenes/familia.png", opciones: ["Familia", "Casa", "Gente"], correcta: "Familia" },
          { imagen: "../imagenes/comida.png", opciones: ["Comida", "Comer", "Plato"], correcta: "Comida" },
          { imagen: "../imagenes/escuela.png", opciones: ["Escuela", "Libro", "Educación"], correcta: "Escuela" }
        ],
        puntos: 25
      },
      {
        id: 2,
        enunciado: "Ordena la secuencia de señas correcta",
        tipo: "ordenamiento",
        secuencia: ["Buenos días", "Mi nombre es", "Estudiante"],
        ordenes: [2, 3, 1],
        puntos: 25
      },
      {
        id: 3,
        enunciado: "Cuestionario sobre emociones básicas",
        tipo: "seleccion_multiple",
        imagen: "../imagenes/emociones.png",
        opciones: ["Alegría", "Tristeza", "Enojo", "Miedo"],
        respuesta_correcta: "Alegría",
        puntos: 25
      }
    ]
  },
  avanzado: {
    nombre: "Evaluación Avanzada",
    dificultad: "avanzado",
    puntos_maximos: 100,
    preguntas: [
      {
        id: 1,
        enunciado: "Interpreta la situación: Un cliente entra a una tienda y necesita ayuda",
        tipo: "situacional",
        imagen: "../imagenes/situacion1.png",
        opciones: [
          "Ignorar al cliente",
          "Saludar y preguntar cómo puedo ayudarte",
          "Señalar la puerta",
          "Hablar en voz alta"
        ],
        respuesta_correcta: "Saludar y preguntar cómo puedo ayudarte",
        puntos: 20
      },
      {
        id: 2,
        enunciado: "Completa la conversación: 'Hola, ¿Cuál es tu...?'",
        tipo: "seleccion_multiple",
        opciones: ["Nombre", "Casa", "Color", "Animal"],
        respuesta_correcta: "Nombre",
        puntos: 20
      },
      {
        id: 3,
        enunciado: "Identifica la seña correcta en contexto profesional",
        tipo: "seleccion_multiple",
        imagen: "../imagenes/profesional.png",
        opciones: ["A - Informal", "B - Formal", "C - No existe", "D - Ambigua"],
        respuesta_correcta: "B - Formal",
        puntos: 20
      },
      {
        id: 4,
        enunciado: "Empareja emociones avanzadas con sus recitales",
        tipo: "emparejamiento",
        pares: [
          { imagen: "../imagenes/sorpresa.png", opciones: ["Sorpresa", "Asombro", "Conmoción"], correcta: "Sorpresa" },
          { imagen: "../imagenes/frustracion.png", opciones: ["Frustración", "Enojo", "Impaciencia"], correcta: "Frustración" }
        ],
        puntos: 20
      },
      {
        id: 5,
        enunciado: "Crea una frase completa señando los 3 elementos",
        tipo: "ordenamiento",
        secuencia: ["Yo", "Quiero", "Aprender"],
        ordenes: [1, 2, 3],
        puntos: 20
      }
    ]
  }
};

// ==========================================
// FUNCIONES PARA MANEJAR EVALUACIONES
// ==========================================

async function cargarEvaluacion(dificultad) {
  try {
    await esperar(() => window.supabaseClient !== undefined);
    
    // Obtener datos de evaluación desde Supabase
    const { data, error } = await window.supabaseClient
      .from("evaluaciones")
      .select("*")
      .eq("slug", dificultad)
      .single();
    
    if (error) {
      console.warn("Error cargando evaluación de Supabase, usando datos locales:", error);
      return EVALUACIONES_DATA[dificultad] || null;
    }
    
    return {
      ...data,
      preguntas: EVALUACIONES_DATA[dificultad]?.preguntas || []
    };
  } catch (error) {
    console.error("Error en cargarEvaluacion:", error);
    return EVALUACIONES_DATA[dificultad] || null;
  }
}

async function guardarResultadoEvaluacion(dificultad, score, puntosGanados) {
  try {
    const usuario = await obtenerUsuarioActual();
    if (!usuario) {
      alert("Debes iniciar sesión para guardar tu evaluación");
      return false;
    }

    // Obtener la evaluación para conseguir su ID
    const { data: evaluacion, error: errorEval } = await window.supabaseClient
      .from("evaluaciones")
      .select("id")
      .eq("slug", dificultad)
      .single();

    if (errorEval) {
      console.error("Error obteniendo ID de evaluación:", errorEval);
      return false;
    }

    // Guardar resultado en Supabase
    const { data, error } = await window.supabaseClient
      .from("resultados_evaluaciones")
      .upsert({
        user_id: usuario.id,
        evaluacion_id: evaluacion.id,
        score: score,
        puntos_ganados: puntosGanados
      });

    if (error) {
      console.error("Error guardando resultado:", error);
      return false;
    }

    // Actualizar puntos del usuario
    await actualizarPuntosUsuario(usuario.id, puntosGanados);
    
    return true;
  } catch (error) {
    console.error("Error en guardarResultadoEvaluacion:", error);
    return false;
  }
}

async function actualizarPuntosUsuario(userId, puntosGanados) {
  try {
    // Obtener puntos actuales
    const { data: usuarioData, error: errorGet } = await window.supabaseClient
      .from("usuarios")
      .select("puntos_totales, nivel, evaluaciones_completadas")
      .eq("id", userId)
      .single();

    if (errorGet) {
      console.error("Error obteniendo puntos:", errorGet);
      return;
    }

    const nuevosPuntos = usuarioData.puntos_totales + puntosGanados;
    const nuevoNivel = Math.floor(nuevosPuntos / 100) + 1;
    const puntosParaSiguientNivel = (nuevoNivel * 100) - nuevosPuntos;

    // Actualizar usuarios
    const { error: errorUpdate } = await window.supabaseClient
      .from("usuarios")
      .update({
        puntos_totales: nuevosPuntos,
        nivel: nuevoNivel,
        puntos_para_siguiente_nivel: Math.max(0, puntosParaSiguientNivel),
        evaluaciones_completadas: usuarioData.evaluaciones_completadas + 1
      })
      .eq("id", userId);

    if (errorUpdate) {
      console.error("Error actualizando puntos:", errorUpdate);
      return;
    }

    console.log(`✅ Puntos actualizados: +${puntosGanados} | Total: ${nuevosPuntos} | Nivel: ${nuevoNivel}`);
    
    // Notificar si subió de nivel
    if (nuevoNivel > usuarioData.nivel) {
      mostrarNotificacionSubidaNivel(nuevoNivel);
    }

  } catch (error) {
    console.error("Error en actualizarPuntosUsuario:", error);
  }
}

async function obtenerResultadosUsuario() {
  try {
    const usuario = await obtenerUsuarioActual();
    if (!usuario) return null;

    const { data, error } = await window.supabaseClient
      .from("resultados_evaluaciones")
      .select(`
        id,
        score,
        puntos_ganados,
        completado_at,
        evaluacion_id,
        evaluaciones (nombre, dificultad, puntos_maximos)
      `)
      .eq("user_id", usuario.id)
      .order("completado_at", { ascending: false });

    if (error) {
      console.error("Error obteniendo resultados:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error en obtenerResultadosUsuario:", error);
    return null;
  }
}

// ==========================================
// FUNCIONES DE UI/UX
// ==========================================

function calcularPuntuacion(respuestasUsuario, preguntasCorrectas) {
  let correctas = 0;
  respuestasUsuario.forEach((respuesta, index) => {
    if (respuesta === preguntasCorrectas[index]) {
      correctas++;
    }
  });
  
  return {
    correctas: correctas,
    total: preguntasCorrectas.length,
    porcentaje: Math.round((correctas / preguntasCorrectas.length) * 100)
  };
}

function calcularPuntosGanados(porcentaje, puntosMaximos) {
  // 100% = puntos máximos
  // 70% = 70% de puntos
  // <70% = 0 puntos (opcional, puedes cambiar esto)
  if (porcentaje < 70) {
    return 0; // No gana puntos si no alcanza 70%
  }
  return Math.round((porcentaje / 100) * puntosMaximos);
}

function mostrarNotificacionSubidaNivel(nuevoNivel) {
  const notif = document.createElement("div");
  notif.className = "notificacion-nivel-up";
  notif.innerHTML = `
    <h3>🎉 ¡NIVEL ${nuevoNivel}!</h3>
    <p>¡Felicitaciones! Subiste de nivel</p>
  `;
  document.body.appendChild(notif);
  
  setTimeout(() => notif.remove(), 3000);
}

function mostrarResultadoEvaluacion(puntuacion, puntosGanados, esAprobado) {
  const modal = document.createElement("div");
  modal.className = "modal-resultado";
  modal.innerHTML = `
    <div class="contenido-resultado">
      <h2>${esAprobado ? "✅ ¡APROBADO!" : "❌ No aprobado"}</h2>
      <p>Puntuación: ${puntuacion.correctas}/${puntuacion.total} (${puntuacion.porcentaje}%)</p>
      ${puntosGanados > 0 ? `<p class="puntos-ganados">+${puntosGanados} puntos 🏆</p>` : `<p>Intenta nuevamente para ganar puntos</p>`}
      <button onclick="this.parentElement.parentElement.remove(); window.location.reload();">
        Volver al menú
      </button>
    </div>
  `;
  document.body.appendChild(modal);
}
