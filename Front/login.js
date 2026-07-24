console.log("JS cargado correctamente");

const supabaseUrl = "https://agzlhfrlonbetudirnib.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnemxoZnJsb25iZXR1ZGlybmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NzE3MjcsImV4cCI6MjEwMDQ0NzcyN30.MAWSGG2GV-bgMPNvTp9jEsAWvfsjXbEYwidramCQ6w4";

// Cambiamos 'supabase' por 'supabaseClient' para evitar el SyntaxError
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

async function login() {
    console.log("Iniciando proceso de autenticación...");

    const emailInput = document.getElementById("email").value.trim();
    const passwordInput = document.getElementById("password").value;
    const mensaje = document.getElementById("mensaje");

    if (!emailInput || !passwordInput) {
        mensaje.style.color = "red";
        mensaje.textContent = "Por favor completa todos los campos.";
        return;
    }

    // Usamos la nueva variable supabaseClient
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: emailInput,
        password: passwordInput,
    });

    if (error) {
        console.error("Error de Supabase:", error);
        mensaje.style.color = "red";
        mensaje.textContent = error.message;
        return;
    }

    console.log("Usuario autenticado:", data.user);
    mensaje.style.color = "green";
    mensaje.textContent = "¡Inicio de sesión correcto!";
}

window.login = login;