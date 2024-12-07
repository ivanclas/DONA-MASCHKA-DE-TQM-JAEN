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
        })
        .catch((error) => {
            console.error("Error al iniciar sesión con Google:", error);
            alert("Error al iniciar sesión con Google. Por favor, inténtalo de nuevo.");
        });
}

// Función para mostrar el modal de ingreso de nombre de usuario
function showUsernameModal() {
    document.getElementById('username-modal').style.display = 'block';
}

// Función para iniciar sesión con nombre de usuario
function signInWithUsername() {
    const username = document.getElementById('username-input').value.trim();
    if (!username) {
        alert("Por favor, ingresa un nombre de usuario.");
        return;
    }
    // Guardar en localStorage
    localStorage.setItem('userType', 'username');
    localStorage.setItem('userName', username);
    // Cerrar modal y mostrar contenido principal
    document.getElementById('username-modal').style.display = 'none';
    showMainContent(username);
}

// Función para mostrar el contenido principal
function showMainContent(userName) {
    document.getElementById('sign-in-screen').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    // Actualizar mensaje de bienvenida
    document.getElementById('welcome-message').innerText = `Bienvenido, ${userName}`;
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
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('sign-in-screen').style.display = 'flex';
    document.getElementById('welcome-message').innerText = 'Bienvenido';
}

// Función para alternar el menú desplegable del usuario
function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Función para alternar el menú desplegable en móviles
function toggleDropdown(event) {
    event.stopPropagation();
    const menu = document.querySelector('.dropdown-menu');
    menu.classList.toggle('active');
}

// Cerrar los dropdowns si se hace clic fuera
window.onclick = function (event) {
    // Cerrar dropdown de usuario
    if (!event.target.matches('.user-icon') && !event.target.matches('.user-icon *')) {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }
    // Cerrar dropdown de menú móvil
    if (!event.target.matches('.hamburger-menu') && !event.target.matches('.hamburger-menu *')) {
        const dropdownMenu = document.querySelector('.dropdown-menu');
        if (dropdownMenu.classList.contains('active')) {
            dropdownMenu.classList.remove('active');
        }
    }
    // Cerrar modal si se hace clic fuera de él
    const modal = document.getElementById('username-modal');
    if (modal && modal.style.display === 'block' && !event.target.closest('.modal-content')) {
        modal.style.display = 'none';
    }
};

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
            document.getElementById('sign-in-screen').style.display = 'flex';
            document.getElementById('main-content').style.display = 'none';
        }
    }
});

// Verificar si el usuario ya ha iniciado sesión al cargar la página
window.onload = function () {
    const userType = localStorage.getItem('userType');
    const userName = localStorage.getItem('userName');
    if (userType && userName) {
        showMainContent(userName);
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
