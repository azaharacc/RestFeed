import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANONKEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Login() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [quote, setQuote] = useState("");
  const [quotes, setQuotes] = useState([]);
  const [newAuthor, setNewAuthor] = useState("");

  // Este estado local guarda las ediciones antes de guardar en DB
  const [editedQuotes, setEditedQuotes] = useState({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) fetchUserQuotes();
  }, [session]);

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("¡Usuario creado! Por favor, confirma tu email.");
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
  }

  async function fetchUserQuotes() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return;

    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("user_id", user.id);

    if (error) alert("Error cargando citas: " + error.message);
    else {
      setQuotes(data);
      // Inicializar editedQuotes con las citas actuales
      const initialEdits = {};
      data.forEach(q => {
        initialEdits[q.id] = {
          text: q.text || "",
          author: q.author || "",
          selected_at: q.selected_at ? q.selected_at.slice(0,16) : "" // Ajusta formato si es ISO string
        };
      });
      setEditedQuotes(initialEdits);
    }
  }

  async function updateQuote(id) {
    const fields = editedQuotes[id];
    if (!fields) return;
    // Para selected_at aseguramos formato correcto para DB si está vacío lo pasamos a null
    const updatedFields = {
      text: fields.text,
      author: fields.author,
      selected_at: fields.selected_at ? new Date(fields.selected_at).toISOString() : null,
    };

    const { error } = await supabase
      .from("quotes")
      .update(updatedFields)
      .eq("id", id);

    if (error) alert("Error actualizando cita: " + error.message);
    else {
      alert("Cita actualizada!");
      fetchUserQuotes();
    }
  }

  async function deleteQuote(id) {
    const { error } = await supabase.from("quotes").delete().eq("id", id);

    if (error) alert("Error eliminando cita: " + error.message);
    else {
      alert("Cita eliminada!");
      fetchUserQuotes();
    }
  }

async function addQuote() {
  if (!quote.trim()) return alert("Introduce una cita.");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return alert("No estás autenticado.");

  const { error } = await supabase
    .from("quotes")
    .insert([
      {
        text: quote.trim(),
        author: newAuthor.trim() || null,
        selected_at: new Date().toISOString(),
        user_id: user.id,
      },
    ]);

  if (error) alert("Error añadiendo cita: " + error.message);
  else {
    alert("¡Cita añadida correctamente!");
    setQuote("");
    setNewAuthor("");
    fetchUserQuotes();
  }
}

  if (!session) {
    return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 w-screen">
    <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-sm text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Login o Registro</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex justify-between">
        <button
          onClick={signUp}
          className="w-[48%] bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Registrarse
        </button>
        <button
          onClick={signIn}
          className="w-[48%] bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  </div>
);
}

  return (
      <div className="min-h-screen bg-gray-100 p-4 w-screen">
      <button onClick={signOut}>Cerrar sesión</button>
    <div className="max-w-5xl mx-auto">
      <h3>Tus citas</h3>
      {quotes.length === 0 && <p>No tienes citas aún.</p>}
      {quotes.map((q) => (
        <div
          key={q.id}
          style={{
            marginBottom: "1em",
            border: "1px solid #ddd",
            padding: "1em",
            borderRadius: "8px",
          }}
        >
          <textarea
            rows={3}
            style={{ width: "100%" }}
            value={editedQuotes[q.id]?.text || ""}
            onChange={(e) =>
              setEditedQuotes((prev) => ({
                ...prev,
                [q.id]: { ...prev[q.id], text: e.target.value },
              }))
            }
            placeholder="Texto"
          />
          <input
            type="text"
            style={{ width: "100%", marginTop: "0.5em" }}
            value={editedQuotes[q.id]?.author || ""}
            onChange={(e) =>
              setEditedQuotes((prev) => ({
                ...prev,
                [q.id]: { ...prev[q.id], author: e.target.value },
              }))
            }
            placeholder="Autor"
          />
          <input
            type="datetime-local"
            style={{ width: "100%", marginTop: "0.5em" }}
            value={editedQuotes[q.id]?.selected_at || ""}
            onChange={(e) =>
              setEditedQuotes((prev) => ({
                ...prev,
                [q.id]: { ...prev[q.id], selected_at: e.target.value },
              }))
            }
          />
          <button
            onClick={() => updateQuote(q.id)}
            style={{ marginTop: "0.5em", marginRight: "0.5em" }}
          >
            Guardar
          </button>
          <button
            onClick={() => deleteQuote(q.id)}
            style={{ marginTop: "0.5em", background: "red", color: "white" }}
          >
            Eliminar
          </button>
        </div>
      ))}
    </div>
      <div className="max-w-5xl mx-auto">
      <h3>Añadir cita</h3>
    <textarea
      value={quote}
      onChange={(e) => setQuote(e.target.value)}
      rows={3}
      style={{ width: "100%" }}
      placeholder="Nueva cita"
    />
    <input
      type="text"
      value={newAuthor}
      onChange={(e) => setNewAuthor(e.target.value)}
      placeholder="Autor"
      style={{ width: "100%", marginTop: "0.5em" }}
    />
    <button onClick={addQuote} style={{ marginTop: "0.5em" }}>
      Añadir cita
    </button>
    </div>
    </div>
  );
}
