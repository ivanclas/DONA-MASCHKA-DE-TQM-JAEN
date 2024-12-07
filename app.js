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

// Verificar el estado de autenticación
auth.onAuthStateChanged(user => {
    if (user) {
        const userNameElement = document.getElementById('user-name');
        userNameElement.textContent = user.displayName;
        userEmail = user.email;
        userName = user.displayName;

        // Cargar el carrito del usuario
        loadCartFromFirestore();

        // Cargar el catálogo
        loadCatalog();
    } else {
        // Usuario no ha iniciado sesión
        window.location.href = 'index.html'; 
    }
});

async function loadCartFromFirestore() {
    try {
        const cartDoc = await firestore.collection('carts').doc(userEmail).get();
        if (cartDoc.exists) {
            cart = cartDoc.data().items;
            updateCart();
        } else {
            cart = [];
        }
    } catch (error) {
        console.error("Error al cargar el carrito desde Firestore:", error);
    }
}

async function saveCartToFirestore() {
    try {
        await firestore.collection('carts').doc(userEmail).set({
            items: cart
        });
    } catch (error) {
        console.error("Error al guardar el carrito en Firestore:", error);
    }
}

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
                <button class="add-to-cart-btn" onclick="window.addToCart('${productIdEscaped}', '${productNameEscaped}', ${product.precio}, '${productImageUrlEscaped}', this)">Agregar al Carrito</button>
                <button class="view-details-btn" onclick="window.openProductModal('${productIdEscaped}', '${productNameEscaped}', ${product.precio}, '${productImageUrlEscaped}', '${productDescriptionEscaped}')">Ver Detalles</button>
                <button class="share-btn" onclick="window.shareProduct('${productIdEscaped}', '${productNameEscaped}', ${product.precio}, '${productImageUrlEscaped}')">Compartir <i class="fas fa-share-alt"></i></button>
            </div>
        `;

        catalogContainer.appendChild(item);
    });
}

function handleSearch() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.nombre.toLowerCase().includes(searchInput) || 
        product.precio.toString().includes(searchInput)
    );
    renderCatalog(filteredProducts);
}

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

    updateCart();
    saveCartToFirestore();
}

function updateCart() {
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
                    <button class="quantity-btn" onclick="window.changeQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="window.changeQuantity(${index}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="window.removeFromCart(${index})">Eliminar</button>
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

    localStorage.setItem('cart', JSON.stringify(cart));
}

function changeQuantity(index, amount) {
    const product = cart[index];
    product.quantity += amount;
    if (product.quantity <= 0) {
        removeFromCart(index);
    } else {
        updateCart();
        saveCartToFirestore();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
    saveCartToFirestore();
}

function toggleCartModal() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.toggle('show');
}

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

function toggleProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('show');
}

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

function shareProduct(productId, name, price, imageUrl) {
    const productUrl = `https://tusitio.com/catalogo.html?productId=${productId}`;
    const message = `¡Mira este producto de Doña Maschka! 🛍️\n\nProducto: ${decodeURIComponent(name)}\nPrecio: S/ ${price}\n\nPuedes verlo aquí: ${productUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

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

window.addEventListener('load', () => {
    document.getElementById('searchInput').addEventListener('input', handleSearch);
});

// Exponer funciones globalmente
window.addToCart = addToCart;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.toggleCartModal = toggleCartModal;
window.openProductModal = openProductModal;
window.toggleProductModal = toggleProductModal;
window.sendOrderViaWhatsApp = sendOrderViaWhatsApp;
window.shareProduct = shareProduct;
window.handleSearch = handleSearch;
