// ===============================
// CONEXIÓN RESILIENTE A SUPABASE
// ===============================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://agzlhfrlonbetudirnib.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnemxoZnJsb25iZXR1ZGlybmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NzE3MjcsImV4cCI6MjEwMDQ0NzcyN30.MAWSGG2GV-bgMPNvTp9jEsAWvfsjXbEYwidramCQ6w4";

// Utiliza el cliente cargado por CDN o el importado como módulo ESM como fallback seguro
const clientFactory = (typeof window !== "undefined" && window.supabase && typeof window.supabase.createClient === "function")
    ? window.supabase.createClient
    : createClient;

const supabase = clientFactory(supabaseUrl, supabaseKey);

if (typeof window !== "undefined" && !window.supabase) {
    window.supabase = { createClient };
}

export default supabase;