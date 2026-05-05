document.addEventListener("DOMContentLoaded", () => {
  const cardsContainer = document.getElementById("cardsContainer");

  // Simulación de datos de signos
  const signs = [
    {
      word: "Hola",
      image_url: "https://www.handspeak.com/word/h/hola.jpg",
      description: "Signo para 'Hola'."
    },
    {
      word: "Gracias",
      image_url: "https://www.handspeak.com/word/g/gracias.jpg",
      description: "Signo para 'Gracias'."
    },
    {
      word: "Por favor",
      image_url: "https://www.handspeak.com/word/p/porfavor.jpg",
      description: "Signo para 'Por favor'."
    },
    {
      word: "Amigo",
      image_url: "https://www.handspeak.com/word/a/amigo.jpg",
      description: "Signo para 'Amigo'."
    },
    {
      word: "Familia",
      image_url: "https://www.handspeak.com/word/f/familia.jpg",
      description: "Signo para 'Familia'."
    }
  ];

  if (cardsContainer) {
    signs.forEach(sign => {
      const card = document.createElement("div");
      card.classList.add("card");

      const img = document.createElement("img");
      img.src = sign.image_url;
      img.alt = `Signo de ${sign.word}`;

      const title = document.createElement("h3");
      title.textContent = sign.word;

      const desc = document.createElement("p");
      desc.textContent = sign.description;

      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(desc);
      cardsContainer.appendChild(card);
    });
  }

ocument.addEventListener("DOMContentLoaded", function () {
    const iframes = document.querySelectorAll("iframe[data-src]");

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const iframe = entry.target;
          iframe.src = iframe.getAttribute('data-src');
          iframe.removeAttribute('data-src');
          obs.unobserve(iframe); // deja de observar una vez cargado
        }
      });
    }, {
      rootMargin: "200px 0px", // empieza a cargar un poco antes
      threshold: 0.1
    });

    iframes.forEach(iframe => observer.observe(iframe));
  });

});
