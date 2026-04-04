document.addEventListener('DOMContentLoaded', function() {
    // Asegura que solo la primera pregunta esté activa al cargar
    const preguntas = document.querySelectorAll('.pregunta');
    preguntas.forEach((p, index) => {
        p.classList.remove('activa');
        if (index === 0) p.classList.add('activa');
    });
});

function siguiente(preguntaIdActual, preguntaIdSiguiente) {
    const preguntaActual = document.getElementById('pregunta' + preguntaIdActual);
    const opcionesSeleccionadas = preguntaActual.querySelectorAll('input[type="radio"]:checked');

    if (opcionesSeleccionadas.length === 0) {
        alert("Por favor selecciona una respuesta antes de continuar.");
        return;
    }

    // Ocultar pregunta actual y mostrar la siguiente
    preguntaActual.classList.remove('activa');
    const siguientePregunta = document.getElementById('pregunta' + preguntaIdSiguiente);
    if (siguientePregunta) {
        siguientePregunta.classList.add('activa');
    }
}

function anterior(preguntaIdAnterior) {
    // Ocultar todas
    const preguntas = document.querySelectorAll('.pregunta');
    preguntas.forEach(p => p.classList.remove('activa'));

    // Mostrar la anterior
    const anteriorPregunta = document.getElementById('pregunta' + preguntaIdAnterior);
    if (anteriorPregunta) {
        anteriorPregunta.classList.add('activa');
    }
}

function finalizarEvaluacion() {
    const pregunta5 = document.getElementById('pregunta5');
    const seleccion = pregunta5.querySelector('input[type="radio"]:checked');

    if (!seleccion) {
        alert("Por favor selecciona una respuesta antes de enviar.");
        return;
    }

    alert("¡Evaluación finalizada!");
    window.location.href = "../EVALUACION/Evaluaciones.php";
}

