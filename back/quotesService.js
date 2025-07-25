// quotesService.js
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// ⚠️ Usamos la SERVICE_KEY porque necesitamos ignorar RLS desde backend/script
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function selectRandomQuote() {
  // 1. Obtener todas las citas
  const { data: quotes, error } = await supabase.from("quotes").select("*");
  if (error) throw new Error("Error al obtener citas: " + error.message);
  if (!quotes || quotes.length === 0) return null;

  // 2. Desmarcar las actuales
  const { error: deselectError } = await supabase
    .from("quotes")
    .update({ is_current: false })
    .eq("is_current", true);

  if (deselectError) throw new Error("Error al desmarcar citas: " + deselectError.message);

  // 3. Elegir aleatoriamente
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  // 4. Marcar la nueva cita como actual
  const { data: updatedQuote, error: updateError } = await supabase
    .from("quotes")
    .update({ is_current: true, selected_at: new Date().toISOString() })
    .eq("id", randomQuote.id)
    .select()
    .single();

  if (updateError) throw new Error("Error al marcar nueva cita: " + updateError.message);

  return updatedQuote;
}

module.exports = { selectRandomQuote };
