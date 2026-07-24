console.log("JS cargado");
const supabaseUrl = "https://agzlhfrlonbetudirnib.supabase.co";
const supabaseKey = "sb_publishable_8FopUJH1v3v5_8xjoROl4Q_jyCCavnw";

const supabase = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);

async function login(){

    console.log("Entró al login");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    const mensaje = document.getElementById("mensaje");

    if(error){
        mensaje.style.color = "red";
        mensaje.textContent = error.message;
        return;
    }

    mensaje.style.color = "green";
    mensaje.textContent = "Inicio de sesión correcto";

    // Después pueden redirigir al tablón
    // window.location.href = "tablon.html";

}

window.login = login;