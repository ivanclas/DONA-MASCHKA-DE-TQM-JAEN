// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBP3bJR_DA6EuV66Sze0vHLfo8QKNJ5_IQ",
    authDomain: "machka-8432e.firebaseapp.com",
    projectId: "machka-8432e",
    storageBucket: "machka-8432e.appspot.com",
    messagingSenderId: "421528005263",
    appId: "1:421528005263:web:df708ddf04377600c55efa",
    measurementId: "G-89B7M13GTS"
};

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// Función para iniciar sesión con Google
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();

    auth.signInWithPopup(provider)
        .then((result) => {
            const userName = result.user.displayName; // Nombre del usuario autenticado
            console.log("Inicio de sesión exitoso con Google. Usuario:", userName);

            // Guardar la sesión en localStorage
            localStorage.setItem('userType', 'google');
            localStorage.setItem('userName', userName);

            // Mostrar el contenido principal
            showMainContent(userName);

            // Cerrar el modal de inicio de sesión
            closeAllModals();
        })
        .catch((error) => {
            console.error("Error al iniciar sesión con Google:", error);
            alert("Error al iniciar sesión con Google. Revisa tu conexión e inténtalo nuevamente.");
        });
}

// Función para cerrar todos los modales
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Función para mostrar el contenido principal
function showMainContent(userName) {
    // Actualizar mensaje de bienvenida
    document.getElementById('welcome-message').innerText = `Bienvenido, ${userName}`;

    // Actualizar opciones de inicio y cierre de sesión
    document.getElementById('iniciar-sesion').style.display = 'none';
    document.getElementById('cerrar-sesion').style.display = 'block';
}

// Función para cerrar sesión
function signOut() {
    auth.signOut()
        .then(() => {
            console.log("Cierre de sesión exitoso.");
            clearSession();
        })
        .catch((error) => {
            console.error("Error al cerrar sesión:", error);
            alert("Error al cerrar sesión. Inténtalo de nuevo.");
        });
}

// Función para limpiar la sesión
function clearSession() {
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');

    // Restaurar mensaje de bienvenida
    document.getElementById('welcome-message').innerText = "Bienvenido";

    // Restaurar opciones de inicio y cierre de sesión
    document.getElementById('iniciar-sesion').style.display = 'block';
    document.getElementById('cerrar-sesion').style.display = 'none';
}

// Asignar funciones globalmente para que sean accesibles desde el HTML
window.signInWithGoogle = signInWithGoogle;
window.signOut = signOut;
