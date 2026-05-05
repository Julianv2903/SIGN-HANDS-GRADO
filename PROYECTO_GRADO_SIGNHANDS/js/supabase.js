if (window.supabase) {
  const supabase = window.supabase.createClient(
    "https://kwomutovyfccewqlzgpr.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3b211dG92eWZjY2V3cWx6Z3ByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MzMwNDEsImV4cCI6MjA5MTAwOTA0MX0.MauEdUdYvfL1Whpqtbt7sQ9p4ZasX2AyEeVIM0nEziU"
  );
  
  window.supabaseClient = supabase;
  window.supabaseReady = true;
  console.log("Supabase inicializado correctamente");
} else {
  console.error("Error: Biblioteca de Supabase no cargada");
  window.supabaseReady = false;
}