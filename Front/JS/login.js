import { iniciarSesion, esCorreoInstitucional } from "./auth.js";

console.log("Login cargado correctamente");

async function login() {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const mensaje = document.getElementById("mensaje");

    mensaje.textContent = "";

    if (!email || !password) {

        mensaje.style.color = "red";
        mensaje.textContent = "Completa todos los campos.";
        return;

    }

    if (!esCorreoInstitucional(email)) {

        mensaje.style.color = "red";
        mensaje.textContent = "Acceso denegado: solo se permiten correos institucionales @escuelasproa.edu.ar";
        return;

    }


    const { error } = await iniciarSesion(email, password);

    if (error) {

        mensaje.style.color = "red";
        mensaje.textContent = error.message;
        return;

    }

    mensaje.style.color = "green";
    mensaje.textContent = "¡Inicio de sesión correcto!";

    // Redireccionar al tablón
    setTimeout(() => {

        window.location.href = "tablon.html";

    }, 800);

}
document
    .getElementById("btnLogin")
    .addEventListener("click", login);