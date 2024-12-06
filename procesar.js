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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Función para iniciar sesión con Google
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            // Ocultar la pantalla de inicio de sesión y mostrar el contenido principal
            document.getElementById('sign-in-screen').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            // Actualizar el encabezado con el nombre del usuario
            const welcomeMessage = document.getElementById('welcome-message');
            welcomeMessage.textContent = "Bienvenido, " + result.user.displayName;
        })
        .catch((error) => {
            console.error("Error al iniciar sesión con Google: ", error);
        });
}

// Monitorear el estado de autenticación
auth.onAuthStateChanged(user => {
    if (user) {
        // Usuario ha iniciado sesión
        document.getElementById('sign-in-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        const welcomeMessage = document.getElementById('welcome-message');
        welcomeMessage.textContent = "Bienvenido, " + user.displayName;
    } else {
        // Usuario no ha iniciado sesión
        document.getElementById('sign-in-screen').style.display = 'flex';
        document.getElementById('main-content').style.display = 'none';
    }
});

// Función para togglear el menú en dispositivos móviles
function toggleDropdown(event) {
    event.stopPropagation();
    const menu = document.querySelector('.dropdown-menu');
    menu.classList.toggle('active');
}

// Cerrar el menú al seleccionar una opción en móviles
const menuItems = document.querySelectorAll('.dropdown-menu li a');
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const menu = document.querySelector('.dropdown-menu');
        menu.classList.remove('active');
    });
});

// Cerrar el menú al hacer clic fuera de él en móviles
document.addEventListener('click', function(event) {
    const menu = document.querySelector('.dropdown-menu');
    const hamburger = document.querySelector('.hamburger-menu');
    if (menu.classList.contains('active') && !menu.contains(event.target) && !hamburger.contains(event.target)) {
        menu.classList.remove('active');
    }
});

// Exponer funciones globalmente si es necesario
window.signInWithGoogle = signInWithGoogle;
window.toggleDropdown = toggleDropdown;
