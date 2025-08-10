#!/usr/bin/env node

require('dotenv').config({ path: '.env' });

const { execSync } = require('child_process');
const { selectRandomQuote } = require('./quotesService');

(async () => {
  try {
    console.log('Actualizando cita actual...');
    const newQuote = await selectRandomQuote();
    if (!newQuote) {
      console.log("No hay citas disponibles");
      return;
    }
    console.log(`Nueva cita actual: "${newQuote.text}" — ${newQuote.author || "Anónimo"}`);

    console.log('Solicitando apagado ordenado...');
    execSync(`osascript -e 'tell app "System Events" to shut down'`);
  } catch (err) {
    console.error('❌ Error durante la ejecución:', err.message);
    process.exit(1);
  }
})();
