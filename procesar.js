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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

function toggleDropdown(event) {
    event.stopPropagation();
    const menu = document.querySelector('.dropdown-menu');
    if (menu) menu.classList.toggle('active');
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

function showSignInModal() {
    const signInModal = document.getElementById('sign-in-modal');
    const usernameModal = document.getElementById('username-modal');
    if (signInModal) signInModal.style.display = 'block';
    if (usernameModal) usernameModal.style.display = 'none';
}

function showUsernameModal() {
    const signInModal = document.getElementById('sign-in-modal');
    const usernameModal = document.getElementById('username-modal');
    if (signInModal) signInModal.style.display = 'none';
    if (usernameModal) usernameModal.style.display = 'block';
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            const userName = result.user.displayName;
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

function signInWithUsername() {
    const usernameInput = document.getElementById('username-input');
    if (!usernameInput) return;
    const username = usernameInput.value.trim();
    if (!username) {
        alert("Por favor, ingresa un nombre de usuario válido.");
        return;
    }
    localStorage.setItem('userType', 'username');
    localStorage.setItem('userName', username);
    const usernameModal = document.getElementById('username-modal');
    if (usernameModal) usernameModal.style.display = 'none';
    showMainContent(username);
}

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

function signOut() {
    signOutUser();
}

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

// Al cargar la página, verificar si ya hay sesión
window.onload = function () {
    const userType = localStorage.getItem('userType');
    const userName = localStorage.getItem('userName');
    if (userType && userName) {
        showMainContent(userName);
    } else {
        clearSession();
    }
};

// Cerrar el menú desplegable al hacer clic en un enlace del menú
document.querySelectorAll('.dropdown-menu li a').forEach(link => {
    link.addEventListener('click', () => {
        const menu = document.querySelector('.dropdown-menu');
        if (menu.classList.contains('active')) {
            menu.classList.remove('active');
        }
    });
});

// Cerrar el menú desplegable al hacer clic fuera de él
window.addEventListener('click', function(event) {
    const menu = document.querySelector('.dropdown-menu');
    const hamburger = document.querySelector('.hamburger-menu');
    if (menu.classList.contains('active') && !hamburger.contains(event.target) && !menu.contains(event.target)) {
        menu.classList.remove('active');
    }
});
