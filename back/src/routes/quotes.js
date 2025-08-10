const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const { selectRandomQuote } = require("../services/quotesService");

router.post("/select", async (req, res, next) => {
  try {
    const newQuote = await selectRandomQuote();
    if (!newQuote) return res.status(404).json({ message: "No quotes available" });
    res.json(newQuote);
  } catch (err) {
    next(err);
  }
});

router.get("/current", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("quotes")
      .select("id, text, author, is_current, selected_at")
      .eq("is_current", true)
      .limit(1);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return res.status(404).json({ message: "No current quote found" });

    res.json(data[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/history", async (req, res, next) => {
  try {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - 60);

    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .neq("is_current", true)
      .gt("selected_at", limitDate.toISOString())
      .order("selected_at", { ascending: false });

    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
