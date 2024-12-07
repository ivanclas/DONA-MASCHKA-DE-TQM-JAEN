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

let currentUser = null; // Guardará el nombre del usuario (si no es Google)
let signedInWithGoogle = false;

// Función para iniciar sesión con Google
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            signedInWithGoogle = true;
            hideSignInScreen(result.user.displayName);
        })
        .catch((error) => {
            console.error("Error al iniciar sesión con Google:", error);
        });
}

// Monitorear el estado de autenticación
auth.onAuthStateChanged((user) => {
    if (user && signedInWithGoogle) {
        hideSignInScreen(user.displayName);
    }
});

// Muestra la pantalla de inicio de sesión
function showSignInScreen() {
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('sign-in-screen').style.display = 'flex';
    document.getElementById('welcome-message').textContent = "Bienvenido";
    updateUserDropdown();
}

// Oculta la pantalla de inicio de sesión y muestra el contenido principal
function hideSignInScreen(name) {
    document.getElementById('sign-in-screen').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('welcome-message').textContent = "Bienvenido, " + name;
    updateUserDropdown();
}

// Muestra el modal para ingresar el nombre de usuario
function showUsernameModal() {
    document.getElementById('username-modal').style.display = 'flex';
}

// Establece el nombre de usuario cuando se presiona "Aceptar"
function setUsername() {
    const usernameInput = document.getElementById('username-input');
    const name = usernameInput.value.trim();
    if (name) {
        currentUser = name;
        signedInWithGoogle = false;
        document.getElementById('username-modal').style.display = 'none';
        hideSignInScreen(name);
    } else {
        alert("Por favor, ingresa un nombre de usuario.");
    }
}

// Función para togglear el menú principal en dispositivos móviles
function toggleDropdown(event) {
    event.stopPropagation();
    const menu = document.querySelector('.dropdown-menu');
    if (menu) menu.classList.toggle('active');
}

// Función para togglear el menú de usuario
function toggleUserDropdown(event) {
    event.stopPropagation();
    const userMenu = document.querySelector('.user-dropdown');
    if (userMenu) userMenu.classList.toggle('active');
}

// Actualiza el menú del usuario según el estado de inicio de sesión
function updateUserDropdown() {
    const userMenu = document.querySelector('.user-dropdown');
    userMenu.innerHTML = '';

    if (!signedInWithGoogle && !currentUser) {
        // Usuario no ha iniciado sesión
        userMenu.innerHTML = `
            <li><a href="#" onclick="signInWithGoogleOption()">Iniciar Sesión con Google</a></li>
            <li><a href="#" onclick="continueWithoutAccountOption()">Continuar sin cuenta</a></li>
        `;
    } else if (signedInWithGoogle) {
        // Usuario con Google
        const userName = auth.currentUser ? auth.currentUser.displayName : "Usuario";
        userMenu.innerHTML = `
            <li><a href="#">Sesión Google: ${userName}</a></li>
            <li><a href="#" onclick="signOut()">Cerrar Sesión</a></li>
        `;
    } else if (currentUser) {
        // Usuario sin cuenta
        userMenu.innerHTML = `
            <li><a href="#">Usuario: ${currentUser}</a></li>
            <li><a href="#" onclick="signOut()">Cerrar Sesión</a></li>
        `;
    }
}

// Opciones del menú de usuario
function signInWithGoogleOption() {
    signInWithGoogle();
}

function continueWithoutAccountOption() {
    showUsernameModal();
}

// Función para cerrar sesión
function signOut() {
    if (signedInWithGoogle) {
        auth.signOut().then(() => {
            signedInWithGoogle = false;
            currentUser = null;
            showSignInScreen();
        });
    } else {
        currentUser = null;
        showSignInScreen();
    }
}

// Cerrar menús al hacer clic fuera
document.addEventListener('click', function(event) {
    const menu = document.querySelector('.dropdown-menu');
    const userMenu = document.querySelector('.user-dropdown');
    const hamburger = document.querySelector('.hamburger-menu');
    const userIcon = document.querySelector('.user-icon');

    if (menu && menu.classList.contains('active') && !menu.contains(event.target) && !hamburger.contains(event.target)) {
        menu.classList.remove('active');
    }

    if (userMenu && userMenu.classList.contains('active') && !userMenu.contains(event.target) && !userIcon.contains(event.target)) {
        userMenu.classList.remove('active');
    }
});

// Exponer funciones globalmente
window.signInWithGoogle = signInWithGoogle;
window.toggleDropdown = toggleDropdown;
window.toggleUserDropdown = toggleUserDropdown;
window.signInWithGoogleOption = signInWithGoogleOption;
window.continueWithoutAccountOption = continueWithoutAccountOption;
window.signOut = signOut;
window.showUsernameModal = showUsernameModal;
window.setUsername = setUsername;

// Inicializar estado del menú al cargar
document.addEventListener('DOMContentLoaded', function() {
    updateUserDropdown();
});
