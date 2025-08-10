const supabase = require("../supabaseClient");

const DAY_LIMIT = 60; // días

async function selectRandomQuote() {
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - DAY_LIMIT);

  // 1. Obtener solo las citas con selected_at NULL o selected_at < limitDate
  const { data: quotes, error } = await supabase
    .from("quotes")
    .select("*")
    .or(`selected_at.is.null,selected_at.lt.${limitDate.toISOString()}`);

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

  // 4. Marcar la nueva cita como actual y actualizar selected_at a ahora
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