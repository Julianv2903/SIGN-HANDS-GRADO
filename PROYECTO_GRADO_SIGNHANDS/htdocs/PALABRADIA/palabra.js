const palabras = [
  {
    titulo: "Letra M",
    descripcion: `* Cierra la mano como si fueras a hacer un puño.<br>
* Luego, coloca los tres dedos del medio (índice, medio y anular) sobre el pulgar, uno encima del otro.<br>
* El meñique queda hacia arriba y extendido o doblado ligeramente, dependiendo del estilo.`,
    imagen: `<img src="../ALFABETO/imagenes/M.png" width="300" alt="Letra M">`
  },

  {
    titulo: "Palabra ABUELA",
    descripcion: `* Mano abierta cerca de la barbilla, haciendo un movimiento circular hacia afuera.`,
    imagen: `<div class="video-container">
      <iframe src="https://www.youtube.com/embed/2QRB596Wh9w?autoplay=1&loop=1&mute=1&playlist=2QRB596Wh9w"
        allow="autoplay; encrypted-media" allowfullscreen></iframe>
    </div>`
  },

  {
    titulo: "Letra A",
    descripcion: `* Cierra todos los dedos formando un puño.
* Mantén el pulgar extendido hacia un lado, tocando el costado del índice.`,
    imagen: `<img src="../ALFABETO/imagenes/a.jpg" width="300" alt="Letra A">`
  },

  {
    titulo: "Palabra SABADO",
    descripcion: `* Forma la letra S con la mano y haz un pequeño movimiento lateral.`,
    imagen: `<div class="video-container">
      <iframe src="https://www.youtube.com/embed/zCt1qXUF5Bs?autoplay=1&loop=1&mute=1&playlist=zCt1qXUF5Bs"
        allow="autoplay; encrypted-media" allowfullscreen></iframe>
    </div>`
  },

  {
    titulo: "Letra O",
    descripcion: `* Junta todos los dedos y el pulgar formando un círculo, como si hicieras una "O" con la mano.
* Asegúrate de que los dedos estén bien curvados hacia adentro y unidos.`,
    imagen: `<img src="../ALFABETO/imagenes/O.png" width="300" alt="Letra O">`
  },

  {
    titulo: "Palabra SANDIA",
    descripcion: `* Gesto de comer con los dedos una tajada, como si fuera sandía.`,
    imagen: `<div class="video-container">
      <iframe src="https://www.youtube.com/embed/z9pM9Rosvw0?autoplay=1&loop=1&mute=1&playlist=z9pM9Rosvw0"
        allow="autoplay; encrypted-media" allowfullscreen></iframe>
    </div>`
  },

  {
    titulo: "Letra J",
    descripcion: `* Levanta el meñique (como en la letra "I") mientras los demás dedos están doblados.
* Luego, dibuja un pequeño arco en el aire hacia afuera y abajo.`,
    imagen: `<img src="../ALFABETO/imagenes/J.png" width="300" alt="Letra J">`
  },

  {
    titulo: "Palabra PARQUE",
    descripcion: `* Manos mostrando espacio abierto, seguido del signo de un árbol.`,
    imagen: `<div class="video-container">
      <iframe src="https://www.youtube.com/embed/5Q1qABFZcV8?autoplay=1&loop=1&mute=1&playlist=5Q1qABFZcV8"
        allow="autoplay; encrypted-media" allowfullscreen></iframe>
    </div>`
  }
];


let indiceActual = 0;

function mostrarPalabra() {
  const palabra = palabras[indiceActual];
  document.getElementById("titulo-palabra").textContent = palabra.titulo;
  document.getElementById("descripcion-palabra").innerHTML = palabra.descripcion;
  document.getElementById("imagen-palabra").innerHTML = palabra.imagen;

  // Avanza al siguiente índice (vuelve a 0 si llega al final)
  indiceActual = (indiceActual + 1) % palabras.length;
}

document.addEventListener("DOMContentLoaded", () => {
  mostrarPalabra(); // Mostrar la primera
  setInterval(mostrarPalabra, 10000); // Cambia cada 5 segundos

  // Botón para cambiar manualmente (opcional)
  const boton = document.getElementById("btn-nueva-palabra");
  if (boton) {
    boton.addEventListener("click", mostrarPalabra);
  }
});
