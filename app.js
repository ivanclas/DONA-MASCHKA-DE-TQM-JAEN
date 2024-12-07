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
const firestore = firebase.firestore();

let products = [];
let cart = [];
let userEmail = '';
let userName = '';
let userType = localStorage.getItem('userType') || '';

// Verificar el estado de autenticación al cargar la página
window.onload = function() {
    if (userType === 'google') {
        // Manejar autenticación con Google
        auth.onAuthStateChanged(user => {
            if (user) {
                userName = user.displayName;
                userEmail = user.email;
                localStorage.setItem('userName', userName);
                document.getElementById('user-name').textContent = userName;
                loadCartFromFirestore();
                loadCatalog();
            } else {
                // Usuario no ha iniciado sesión con Google
                clearSession();
            }
        });
    } else if (userType === 'username') {
        // Manejar autenticación con nombre de usuario
        userName = localStorage.getItem('userName') || 'Usuario';
        document.getElementById('user-name').textContent = userName;
        loadCartFromLocalStorage();
        loadCatalog();
    } else {
        // Usuario no ha iniciado sesión
        window.location.href = 'index.html';
    }

    // Configurar el buscador
    document.getElementById('searchInput').addEventListener('input', handleSearch);
};

// Función para iniciar sesión con Google
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            // Guardar tipo de usuario y nombre
            localStorage.setItem('userType', 'google');
            localStorage.setItem('userName', result.user.displayName);
            userType = 'google';
            userName = result.user.displayName;
            userEmail = result.user.email;
            document.getElementById('user-name').textContent = userName;
            loadCartFromFirestore();
            loadCatalog();
        })
        .catch((error) => {
            console.error("Error al iniciar sesión con Google: ", error);
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
    if (username === "") {
        alert("Por favor, ingresa un nombre de usuario.");
        return;
    }
    // Guardar tipo de usuario y nombre en localStorage
    localStorage.setItem('userType', 'username');
    localStorage.setItem('userName', username);
    userType = 'username';
    userName = username;
    document.getElementById('user-name').textContent = userName;
    // Cerrar modal
    document.getElementById('username-modal').style.display = 'none';
    // Cargar carrito desde localStorage
    loadCartFromLocalStorage();
    // Cargar catálogo
    loadCatalog();
}

// Función para cargar el carrito desde Firestore (Usuarios de Google)
async function loadCartFromFirestore() {
    try {
        const cartDoc = await firestore.collection('carts').doc(userEmail).get();
        if (cartDoc.exists) {
            cart = cartDoc.data().items;
        } else {
            cart = [];
        }
        updateCartUI();
    } catch (error) {
        console.error("Error al cargar el carrito desde Firestore:", error);
    }
}

// Función para guardar el carrito en Firestore (Usuarios de Google)
async function saveCartToFirestore() {
    try {
        await firestore.collection('carts').doc(userEmail).set({
            items: cart
        });
    } catch (error) {
        console.error("Error al guardar el carrito en Firestore:", error);
    }
}

// Función para cargar el carrito desde localStorage (Usuarios con Username)
function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    } else {
        cart = [];
    }
    updateCartUI();
}

// Función para guardar el carrito en localStorage (Usuarios con Username)
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Función para cargar el catálogo de productos
async function loadCatalog() {
    const catalogContainer = document.getElementById('catalogContainer');
    catalogContainer.innerHTML = ''; 

    try {
        const querySnapshot = await firestore.collection('productos').get();

        products = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderCatalog(products);
    } catch (error) {
        console.error("Error al cargar el catálogo:", error);
        alert("Error al cargar el catálogo. Inténtalo más tarde.");
    }
}

// Función para renderizar el catálogo en el DOM
function renderCatalog(filteredProducts) {
    const catalogContainer = document.getElementById('catalogContainer');
    catalogContainer.innerHTML = ''; 

    filteredProducts.forEach((product) => {
        const item = document.createElement('div');
        item.className = 'catalog-item';

        const productIdEscaped = encodeURIComponent(product.id);
        const productNameEscaped = encodeURIComponent(product.nombre);
        const productPriceEscaped = encodeURIComponent(product.precio);
        const productImageUrlEscaped = encodeURIComponent(product.imagenUrl);
        const productDescriptionEscaped = encodeURIComponent(product.descripcion);

        item.innerHTML = `
            <img src="${product.imagenUrl}" alt="${product.nombre}" class="catalog-image">
            <div class="catalog-details">
                <h3>${product.nombre}</h3>
                <p>Precio: S/ ${product.precio}</p>
                <button class="add-to-cart-btn" onclick="addToCart('${productIdEscaped}', '${productNameEscaped}', ${product.precio}, '${productImageUrlEscaped}', this)">Agregar al Carrito</button>
                <button class="view-details-btn" onclick="openProductModal('${productIdEscaped}', '${productNameEscaped}', ${product.precio}, '${productImageUrlEscaped}', '${productDescriptionEscaped}')">Ver Detalles</button>
                <button class="share-btn" onclick="shareProduct('${productIdEscaped}', '${productNameEscaped}', ${product.precio}, '${productImageUrlEscaped}')">Compartir <i class="fas fa-share-alt"></i></button>
            </div>
        `;

        catalogContainer.appendChild(item);
    });
}

// Función para manejar la búsqueda en el catálogo
function handleSearch() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.nombre.toLowerCase().includes(searchInput) || 
        product.precio.toString().includes(searchInput)
    );
    renderCatalog(filteredProducts);
}

// Función para agregar un producto al carrito
function addToCart(productId, name, price, imageUrl, button) {
    const decodedName = decodeURIComponent(name);
    const decodedImageUrl = decodeURIComponent(imageUrl);

    const existingProduct = cart.find(item => item.id === productId);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ id: productId, name: decodedName, price, imageUrl: decodedImageUrl, quantity: 1 });
    }

    if (button) {
        button.style.backgroundColor = 'red';
        button.textContent = 'Agregado';
        button.disabled = true;

        setTimeout(() => {
            button.style.backgroundColor = '#a0522d'; /* Marrón oscuro */
            button.textContent = 'Agregar al Carrito';
            button.disabled = false;
        }, 2000);
    }

    updateCartUI();
    saveCart();
}

// Función para actualizar la interfaz del carrito
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cartItems');
    const totalPriceElement = document.getElementById('totalPrice');
    const cartButtonNotification = document.getElementById('cartButtonNotification');
    const discountInfo = document.getElementById('discountInfo');

    cartItemsContainer.innerHTML = '';
    let total = 0;
    let totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}" class="cart-image">
            <div class="cart-details">
                <h4>${item.name}</h4>
                <p>Precio: S/ ${item.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="changeQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="changeQuantity(${index}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})">Eliminar</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    // Aplicar descuento si hay más de 2 productos
    let discount = 0;
    if (totalQuantity > 2) {
        discount = total * 0.10;
        discountInfo.textContent = `¡Descuento del 10% aplicado!`;
    } else {
        discountInfo.textContent = '';
    }

    const totalWithDiscount = total - discount;
    totalPriceElement.textContent = `Total: S/ ${totalWithDiscount.toFixed(2)}`;
    cartButtonNotification.textContent = totalQuantity;
    cartButtonNotification.style.display = totalQuantity > 0 ? 'flex' : 'none';
}

// Función para cambiar la cantidad de un producto en el carrito
function changeQuantity(index, amount) {
    const product = cart[index];
    product.quantity += amount;
    if (product.quantity <= 0) {
        removeFromCart(index);
    } else {
        updateCartUI();
        saveCart();
    }
}

// Función para eliminar un producto del carrito
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
    saveCart();
}

// Función para guardar el carrito según el tipo de usuario
function saveCart() {
    if (userType === 'google') {
        saveCartToFirestore();
    } else if (userType === 'username') {
        saveCartToLocalStorage();
    }
}

// Función para alternar el modal del carrito
function toggleCartModal() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.toggle('show');
}

// Función para abrir el modal de detalles del producto
function openProductModal(productId, name, price, imageUrl, description) {
    const modal = document.getElementById('productModal');
    const modalName = document.getElementById('modalProductName');
    const modalPrice = document.getElementById('modalProductPrice');
    const modalImage = document.getElementById('modalProductImage');
    const modalDescriptionTitle = document.getElementById('modalDescriptionTitle');
    const modalDescription = document.getElementById('modalProductDescription');

    const decodedId = decodeURIComponent(productId);
    const decodedName = decodeURIComponent(name);
    const decodedImageUrl = decodeURIComponent(imageUrl);
    const decodedDescription = decodeURIComponent(description);

    modalName.textContent = decodedName;
    modalPrice.textContent = `Precio: S/ ${price}`;
    modalImage.src = decodedImageUrl;

    modalDescriptionTitle.style.display = 'block';
    modalDescription.innerHTML = '';
    if (decodedDescription) {
        const descriptionItems = decodedDescription.split('.');
        descriptionItems.forEach(desc => {
            if (desc.trim().length > 0) {
                const li = document.createElement('li');
                li.textContent = desc.trim();
                modalDescription.appendChild(li);
            }
        });
    } else {
        modalDescriptionTitle.style.display = 'none';
    }

    const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');
    modalAddToCartBtn.onclick = function() {
        addToCart(decodedId, name, price, imageUrl);
        modalAddToCartBtn.textContent = 'Agregado';
        modalAddToCartBtn.disabled = true;

        setTimeout(() => {
            modalAddToCartBtn.textContent = 'Agregar al Carrito';
            modalAddToCartBtn.disabled = false;
        }, 2000);
    };

    const modalShareBtn = document.getElementById('modalShareBtn');
    modalShareBtn.onclick = function() {
        shareProduct(productId, name, price, imageUrl);
    };

    modal.classList.add('show');
}

// Función para cerrar el modal de producto
function toggleProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('show');
}

// Función para enviar el pedido vía WhatsApp
function sendOrderViaWhatsApp() {
    if (cart.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    let message = `Hola, soy ${userName}, me gustaría hacer el siguiente pedido:\n`;
    cart.forEach((item) => {
        message += `\n- ${item.name} (Cantidad: ${item.quantity})`;
    });

    let total = 0;
    let totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
    cart.forEach((item) => {
        total += item.price * item.quantity;
    });

    let discount = 0;
    if (totalQuantity > 2) {
        discount = total * 0.10;
    }

    const totalWithDiscount = total - discount;
    message += `\n\nTotal: S/ ${totalWithDiscount.toFixed(2)}`;
    if (discount > 0) {
        message += ` (Incluye un descuento del 10%)`;
    }

    const whatsappUrl = `https://api.whatsapp.com/send?phone=51947424087&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Función para compartir un producto vía WhatsApp
function shareProduct(productId, name, price, imageUrl) {
    const productUrl = `https://tusitio.com/catalogo.html?productId=${productId}`;
    const message = `¡Mira este producto de Doña Maschka! 🛍️\n\nProducto: ${decodeURIComponent(name)}\nPrecio: S/ ${price}\n\nPuedes verlo aquí: ${productUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Función para cerrar modales al hacer clic fuera de ellos
window.addEventListener('click', function(event) {
    const cartModal = document.getElementById('cartModal');
    const productModal = document.getElementById('productModal');
    if (event.target === cartModal) {
        cartModal.classList.remove('show');
    }
    if (event.target === productModal) {
        productModal.classList.remove('show');
    }
});

// Función para cerrar dropdowns y modales al hacer clic fuera
window.onclick = function(event) {
    // Cerrar dropdown de usuario
    if (!event.target.matches('.user-icon') && !event.target.closest('.user-icon')) {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }
    // Cerrar dropdown de menú móvil
    if (!event.target.matches('.hamburger-menu') && !event.target.closest('.hamburger-menu')) {
        const dropdownMenu = document.querySelector('.dropdown-menu');
        if (dropdownMenu.classList.contains('active')) {
            dropdownMenu.classList.remove('active');
        }
    }
    // Cerrar modal de nombre de usuario si se hace clic fuera
    const usernameModal = document.getElementById('username-modal');
    if (usernameModal && usernameModal.style.display === 'block' && !event.target.closest('.modal-content')) {
        usernameModal.style.display = 'none';
    }
};

// Función para cerrar sesión
function signOut() {
    if (userType === 'google') {
        auth.signOut().then(() => {
            clearSession();
        }).catch((error) => {
            console.error("Error al cerrar sesión:", error);
            alert("Error al cerrar sesión. Por favor, inténtalo de nuevo.");
        });
    } else if (userType === 'username') {
        clearSession();
    }
}

// Función para limpiar la sesión
function clearSession() {
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('cart');
    userType = '';
    userName = '';
    userEmail = '';
    // Redirigir a la página de inicio
    window.location.href = 'index.html';
}

// Asignar funciones globalmente para que sean accesibles desde el HTML
window.signInWithGoogle = signInWithGoogle;
window.showUsernameModal = showUsernameModal;
window.signInWithUsername = signInWithUsername;
window.addToCart = addToCart;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.toggleCartModal = toggleCartModal;
window.openProductModal = openProductModal;
window.toggleProductModal = toggleProductModal;
window.sendOrderViaWhatsApp = sendOrderViaWhatsApp;
window.shareProduct = shareProduct;
window.signOut = signOut;
