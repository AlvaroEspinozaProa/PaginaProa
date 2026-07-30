// ===============================
// CONEXIÓN ÚNICA A SUPABASE
// ===============================

const supabaseUrl = "https://agzlhfrlonbetudirnib.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnemxoZnJsb25iZXR1ZGlybmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NzE3MjcsImV4cCI6MjEwMDQ0NzcyN30.MAWSGG2GV-bgMPNvTp9jEsAWvfsjXbEYwidramCQ6w4";
const supabase = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);

export default supabase;