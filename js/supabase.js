if (window.supabase) {
  // La clave anon de Supabase es pública para el cliente.
  // No es una clave secreta del servidor, sino la clave que permite
  // usar la API de lectura/escritura permitida en el proyecto Supabase.
  const SUPABASE_URL = "https://kwomutovyfccewqlzgpr.supabase.co";
  const SUPABASE_ANON_KEY = [
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.",
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3b211dG92eWZjY2V3cWx6Z3ByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MzMwNDEsImV4cCI6MjA5MTAwOTA0MX0.",
    "MauEdUdYvfL1Whpqtbt7sQ9p4ZasX2AyEeVIM0nEziU"
  ].join("");
  const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
  
  window.supabaseClient = supabase;
  window.supabaseReady = true;
  console.log("Supabase inicializado correctamente");
} else {
  console.error("Error: Biblioteca de Supabase no cargada");
  window.supabaseReady = false;
}