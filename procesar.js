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

// Inicializar Firebase (asegurarse de que no se inicialice más de una vez)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// Función para iniciar sesión con Google
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            const userName = result.user.displayName;
            // Guardar información del usuario en localStorage
            localStorage.setItem('userType', 'google');
            localStorage.setItem('userName', userName);
            showMainContent(userName);
            closeAllModals();
        })
        .catch((error) => {
            console.error("Error al iniciar sesión con Google:", error);
            alert("Error al iniciar sesión con Google. Por favor, inténtalo de nuevo.");
        });
}

// Función para mostrar el modal de ingreso de nombre de usuario
function showUsernameModal() {
    const signInModal = document.getElementById('sign-in-modal');
    const usernameModal = document.getElementById('username-modal');
    if (signInModal) signInModal.style.display = 'none';
    if (usernameModal) usernameModal.style.display = 'block';
}

// Función para iniciar sesión con nombre de usuario
function signInWithUsername() {
    const usernameInput = document.getElementById('username-input');
    if (!usernameInput) return;
    const username = usernameInput.value.trim();
    if (!username) {
        alert("Por favor, ingresa un nombre de usuario válido.");
        return;
    }
    // Guardar en localStorage
    localStorage.setItem('userType', 'username');
    localStorage.setItem('userName', username);
    // Cerrar modal y mostrar contenido principal
    const usernameModal = document.getElementById('username-modal');
    if (usernameModal) usernameModal.style.display = 'none';
    showMainContent(username);
}

// Función para mostrar el contenido principal
function showMainContent(userName) {
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        welcomeMessage.innerText = `Bienvenido, ${userName}`;
    }

    const iniciarSesionBtn = document.getElementById('iniciar-sesion');
    const cerrarSesionBtn = document.getElementById('cerrar-sesion');
    if (iniciarSesionBtn) iniciarSesionBtn.style.display = 'none';
    if (cerrarSesionBtn) cerrarSesionBtn.style.display = 'block';
}

// Función para cerrar sesión
function signOutUser() {
    const userType = localStorage.getItem('userType');
    if (userType === 'google') {
        auth.signOut()
            .then(() => {
                clearSession();
            })
            .catch((error) => {
                console.error("Error al cerrar sesión:", error);
                alert("Error al cerrar sesión. Por favor, inténtalo de nuevo.");
            });
    } else {
        clearSession();
    }
}

// Función para limpiar la sesión
function clearSession() {
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');

    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) welcomeMessage.innerText = 'Bienvenido';

    const iniciarSesionBtn = document.getElementById('iniciar-sesion');
    const cerrarSesionBtn = document.getElementById('cerrar-sesion');
    if (iniciarSesionBtn) iniciarSesionBtn.style.display = 'block';
    if (cerrarSesionBtn) cerrarSesionBtn.style.display = 'none';

    const userDropdown = document.getElementById('user-dropdown');
    if (userDropdown) userDropdown.classList.remove('show');
}

// Función para alternar el menú desplegable del usuario
function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

// Función para alternar el menú desplegable en móviles
function toggleDropdown(event) {
    event.stopPropagation();
    const menu = document.querySelector('.dropdown-menu');
    if (menu) menu.classList.toggle('active');
}

// Función para mostrar el modal de inicio de sesión
function showSignInModal() {
    const signInModal = document.getElementById('sign-in-modal');
    const usernameModal = document.getElementById('username-modal');
    if (signInModal) signInModal.style.display = 'block';
    if (usernameModal) usernameModal.style.display = 'none';
}

// Función para cerrar todos los modales
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Cerrar dropdown y modales si se hace clic fuera
window.onclick = function(event) {
    const dropdown = document.getElementById('user-dropdown');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const signInModal = document.getElementById('sign-in-modal');
    const usernameModal = document.getElementById('username-modal');

    // Cerrar dropdown de usuario
    if (!event.target.closest('.user-icon') && dropdown) {
        dropdown.classList.remove('show');
    }

    // Cerrar dropdown de menú móvil
    if (!event.target.closest('.hamburger-menu') && dropdownMenu && dropdownMenu.classList.contains('active')) {
        dropdownMenu.classList.remove('active');
    }

    // Cerrar modales si se hace clic fuera del contenido
    if (signInModal && event.target == signInModal) {
        signInModal.style.display = "none";
    }
    if (usernameModal && event.target == usernameModal) {
        usernameModal.style.display = "none";
    }
};

// Cerrar modales al presionar la tecla Esc
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeAllModals();
    }
});

// Monitorear el estado de autenticación de Firebase
auth.onAuthStateChanged(user => {
    if (user) {
        const userName = user.displayName || "Usuario";
        localStorage.setItem('userType', 'google');
        localStorage.setItem('userName', userName);
        showMainContent(userName);
    } else {
        const userType = localStorage.getItem('userType');
        const userName = localStorage.getItem('userName');
        if (userType && userName) {
            showMainContent(userName);
        } else {
            clearSession();
        }
    }
});

// Verificar si el usuario ya ha iniciado sesión al cargar la página
window.onload = function () {
    const userType = localStorage.getItem('userType');
    const userName = localStorage.getItem('userName');
    if (userType && userName) {
        showMainContent(userName);
    } else {
        clearSession();
    }
};

// Función para cerrar sesión desde el dropdown de usuario
function signOut() {
    signOutUser();
}

// Asignar funciones globalmente para que sean accesibles desde el HTML
window.signInWithGoogle = signInWithGoogle;
window.showUsernameModal = showUsernameModal;
window.signInWithUsername = signInWithUsername;
window.toggleDropdown = toggleDropdown;
window.toggleUserDropdown = toggleUserDropdown;
window.signOut = signOut;
window.showSignInModal = showSignInModal;
