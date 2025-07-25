// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const { selectRandomQuote } = require("./quotesService");

const app = express();
app.use(cors());
app.use(express.json());

// Supabase para rutas públicas (ANON key)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANONKEY
);

// ---- Rutas ----

// Seleccionar cita aleatoria (usando la lógica del servicio)
app.post("/quotes/select", async (req, res) => {
  try {
    const newQuote = await selectRandomQuote();
    if (!newQuote) return res.status(404).json({ message: "No quotes available" });
    res.json(newQuote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar cita actual
app.get("/quotes/current", async (req, res) => {
  const { data, error } = await supabase
    .from("quotes")
    .select("id, text, author, is_current, selected_at")
    .eq("is_current", true)
    .limit(1);

  if (error) return res.status(400).json({ error: error.message });
  if (!data || data.length === 0) return res.status(404).json({ message: "No current quote found" });

  res.json(data[0]);
});

// Historial de citas
app.get("/quotes/history", async (req, res) => {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .neq("is_current", true)
    .order("selected_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// --- (Opcional) aquí seguirían las rutas de login/register/CRUD como ya las tenías ---

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server listening on port ${PORT}`));
