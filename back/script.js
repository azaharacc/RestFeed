require("dotenv").config();
const { selectRandomQuote } = require("./quotesService");

async function updateCurrentQuote() {
  try {
    const newQuote = await selectRandomQuote();
    if (!newQuote) {
      console.log("⚠️ No hay citas disponibles");
      return;
    }
    console.log(`✅ Nueva cita actual: "${newQuote.text}" — ${newQuote.author || "Anónimo"}`);
  } catch (err) {
    console.error("❌ Error al actualizar la cita actual:", err.message);
  }
}

updateCurrentQuote();
