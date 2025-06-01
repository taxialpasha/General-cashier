// نظام الكاشير المتكامل والشامل - app.js
// إعداد البيانات الأساسية
let products = JSON.parse(localStorage.getItem('products') || '[]');
let customers = JSON.parse(localStorage.getItem('customers') || '[]');
let sales = JSON.parse(localStorage.getItem('sales') || '[]');
let installmentSales = JSON.parse(localStorage.getItem('installmentSales') || '[]');
let movements = JSON.parse(localStorage.getItem('movements') || '[]');
let settings = JSON.parse(localStorage.getItem('settings') || '{}');
let cart = [];
let selectedCategory = 'all';
let currentStoreType = 'general';

// إعدادات افتراضية
const defaultSettings = {
    storeName: 'متجري',
    currency: 'IQD',
    taxRate: 0,
    audioAlerts: true,
    defaultInterestRate: 4,
    defaultInstallmentCount: 12,
    minInstallmentAmount: 100000,
    autoPrintPayment: true,
    lowStockThreshold: 10,
    lowStockAlert: true,
    autoInventoryManagement: false,
    autoPrintReceipt: false,
    paperSize: '80mm'
};

// دمج الإعدادات الافتراضية
settings = { ...defaultSettings, ...settings };

// تصنيفات حسب نوع المتجر
const storeCategories = {
    general: ['عام', 'أطعمة', 'مشروبات', 'تنظيف', 'شخصي', 'أدوات'],
    supermarket: ['خضروات', 'فواكه', 'لحوم', 'أسماك', 'ألبان', 'حبوب', 'معلبات', 'مجمدات', 'مخبوزات', 'تنظيف', 'شخصي'],
    electronics: ['هواتف', 'حاسوب', 'تلفزيون', 'صوتيات', 'إكسسوارات', 'ألعاب', 'أجهزة منزلية'],
    clothes: ['رجالي', 'نسائي', 'أطفال', 'رياضي', 'أحذية', 'حقائب', 'إكسسوارات'],
    vegetables: ['خضروات ورقية', 'جذريات', 'فواكه', 'أعشاب', 'بذور', 'مكسرات'],
    beverages: ['عصائر', 'مشروبات غازية', 'مياه', 'قهوة', 'شاي', 'مشروبات ساخنة', 'مشروبات طاقة'],
    restaurant: ['مقبلات', 'شوربات', 'أطباق رئيسية', 'حلويات', 'مشروبات', 'سلطات'],
    hotel: ['غرف', 'مطعم', 'خدمات إضافية', 'مؤتمرات', 'ترفيه']
};

// منتجات تجريبية حسب نوع المتجر
const sampleProducts = {
    general: [
        { name: 'كولا', barcode: '123456789', price: 2500, cost: 2000, category: 'مشروبات', unit: 'قطعة', fixedStock: 100, movableStock: 50, minStock: 10 },
        { name: 'شامبو', barcode: '123456790', price: 15000, cost: 12000, category: 'شخصي', unit: 'قطعة', fixedStock: 50, movableStock: 25, minStock: 5 },
        { name: 'أرز بسمتي', barcode: '123456791', price: 12000, cost: 10000, category: 'أطعمة', unit: 'كيلو', fixedStock: 200, movableStock: 100, minStock: 20 }
    ],
    supermarket: [
        { name: 'طماطم', barcode: '200000001', price: 3000, cost: 2500, category: 'خضروات', unit: 'كيلو', fixedStock: 100, movableStock: 80, minStock: 10 },
        { name: 'تفاح أحمر', barcode: '200000002', price: 4500, cost: 3500, category: 'فواكه', unit: 'كيلو', fixedStock: 150, movableStock: 100, minStock: 15 },
        { name: 'لحم غنم', barcode: '200000003', price: 25000, cost: 20000, category: 'لحوم', unit: 'كيلو', fixedStock: 50, movableStock: 30, minStock: 5 }
    ],
    electronics: [
        { name: 'آيفون 15', barcode: '300000001', price: 1500000, cost: 1200000, category: 'هواتف', unit: 'قطعة', fixedStock: 20, movableStock: 15, minStock: 2 },
        { name: 'لابتوب ديل', barcode: '300000002', price: 800000, cost: 650000, category: 'حاسوب', unit: 'قطعة', fixedStock: 10, movableStock: 8, minStock: 1 },
        { name: 'سماعات بلوتوث', barcode: '300000003', price: 50000, cost: 35000, category: 'إكسسوارات', unit: 'قطعة', fixedStock: 50, movableStock: 30, minStock: 5 }
    ]
};

// رموز المتاجر
const storeTypeIcons = {
    general: '🏪',
    supermarket: '🛒',
    electronics: '📱',
    clothes: '👕',
    vegetables: '🥬',
    beverages: '🥤',
    restaurant: '🍽️',
    hotel: '🏨'
};

// التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // تهيئة المنتجات التجريبية إذا كانت فارغة
    if (products.length === 0) {
        loadSampleProducts();
    }
    
    // تحديث الواجهة
    updateCategoriesList();
    updateProductsGrid();
    updateCartDisplay();
    updateCustomersTable();
    updateInstallmentsTable();
    updateInventoryReport();
    updateStats();
    loadSettings();
    
    // بدء الساعة الرقمية
    startClock();
    
    // تهيئة البحث
    setupSearch();
    
    // تحديث التنبيهات
    updateNotificationBadges();
    
    showNotification('تم تحميل النظام بنجاح!', 'success');
}

// ===========================================
// إدارة الساعة الرقمية
// ===========================================
function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    const timeDisplay = document.getElementById('timeDisplay');
    const amPmDisplay = document.getElementById('amPmDisplay');
    const dateDisplay = document.getElementById('dateDisplay');
    
    if (!timeDisplay) return;
    
    // تنسيق الوقت
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    // تحديد ص/م
    const ampm = hours >= 12 ? 'م' : 'ص';
    
    // تحويل إلى 12 ساعة
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
    
    timeDisplay.textContent = timeString;
    if (amPmDisplay) amPmDisplay.textContent = ampm;
    
    // تنسيق التاريخ
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                   'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    if (dateDisplay) {
        dateDisplay.textContent = `${dayName}، ${day} ${month} ${year}`;
    }
}

function showClockSettings() {
    document.getElementById('clockSettingsModal').style.display = 'block';
}

function updateClockSettings() {
    // تطبيق إعدادات الساعة
    const clockElement = document.querySelector('.digital-clock');
    const textColor = document.getElementById('clockTextColor').value;
    const bgColor = document.getElementById('clockBgColor').value;
    const borderColor = document.getElementById('clockBorderColor').value;
    const fontSize = document.getElementById('clockFontSize').value;
    const showGlow = document.getElementById('clockGlow').checked;
    const showBlink = document.getElementById('clockBlink').checked;
    
    if (clockElement) {
        clockElement.style.color = textColor;
        clockElement.style.background = bgColor;
        clockElement.style.borderColor = borderColor;
        clockElement.style.fontSize = fontSize + 'px';
        
        if (showGlow) {
            clockElement.style.textShadow = `0 0 10px ${textColor}`;
        } else {
            clockElement.style.textShadow = 'none';
        }
        
        if (showBlink) {
            clockElement.classList.add('blink');
        } else {
            clockElement.classList.remove('blink');
        }
    }
    
    // تحديث حجم الخط في العرض
    const fontSizeValue = document.getElementById('fontSizeValue');
    if (fontSizeValue) {
        fontSizeValue.textContent = fontSize + 'px';
    }
}

function resetClockSettings() {
    document.getElementById('clockTextColor').value = '#ffffff';
    document.getElementById('clockBgColor').value = '#667eea';
    document.getElementById('clockBorderColor').value = '#764ba2';
    document.getElementById('clockFontSize').value = '16';
    document.getElementById('clockGlow').checked = false;
    document.getElementById('clockBlink').checked = false;
    updateClockSettings();
}

function saveClockSettings() {
    updateClockSettings();
    showNotification('تم حفظ إعدادات الساعة', 'success');
    closeModal('clockSettingsModal');
}

// ===========================================
// إدارة أنواع المتاجر
// ===========================================
function selectStoreFromHeader(storeType) {
    currentStoreType = storeType;
    
    // تحديث النص في الزر
    const currentStoreText = document.getElementById('currentStoreText');
    const storeNames = {
        general: '🏪 متجر عام',
        supermarket: '🛒 سوبر ماركت',
        electronics: '📱 إلكترونيات',
        clothes: '👕 ملابس',
        vegetables: '🥬 خضروات',
        beverages: '🥤 مشروبات',
        restaurant: '🍽️ مطعم',
        hotel: '🏨 فندق'
    };
    
    if (currentStoreText) {
        currentStoreText.textContent = storeNames[storeType];
    }
    
    // تحديث الأزرار النشطة
    document.querySelectorAll('.store-type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === storeType) {
            btn.classList.add('active');
        }
    });
    
    // تحديث التصنيفات والمنتجات
    updateCategoriesList();
    updateProductsGrid();
    updateProductCategorySelect();
    
    // إخفاء القائمة المنسدلة
    document.getElementById('storeDropdown').classList.remove('show');
    
    showNotification(`تم تغيير نوع المتجر إلى: ${storeNames[storeType]}`, 'info');
}

function toggleStoreDropdown() {
    const dropdown = document.getElementById('storeDropdown');
    dropdown.classList.toggle('show');
}

// إغلاق القائمة المنسدلة عند النقر خارجها
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('storeDropdown');
    const button = document.querySelector('.current-store-btn');
    
    if (!dropdown.contains(event.target) && !button.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// ===========================================
// إدارة المنتجات
// ===========================================
function loadSampleProducts() {
    // تحميل منتجات تجريبية حسب نوع المتجر الحالي
    if (sampleProducts[currentStoreType]) {
        products = [...sampleProducts[currentStoreType]];
        saveData();
    }
}

function addProduct() {
    const name = document.getElementById('productName').value;
    const barcode = document.getElementById('productBarcode').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const cost = parseFloat(document.getElementById('productCost').value) || 0;
    const category = document.getElementById('productCategory').value;
    const unit = document.getElementById('productUnit').value;
    const fixedStock = parseInt(document.getElementById('productFixedStock').value) || 0;
    const movableStock = parseInt(document.getElementById('productMovableStock').value) || 0;
    const minStock = parseInt(document.getElementById('productMinStock').value) || 10;
    const description = document.getElementById('productDescription').value;

    if (!name || !price) {
        showNotification('يرجى ملء الحقول المطلوبة', 'error');
        return;
    }

    // التحقق من عدم تكرار الباركود
    if (barcode && products.some(p => p.barcode === barcode)) {
        showNotification('الباركود موجود مسبقاً', 'error');
        return;
    }

    const product = {
        id: Date.now(),
        name,
        barcode: barcode || generateBarcode(),
        price,
        cost,
        category,
        unit,
        fixedStock,
        movableStock,
        minStock,
        description,
        createdAt: new Date().toISOString()
    };

    products.push(product);
    saveData();
    updateProductsGrid();
    updateProductsTable();
    clearProductForm();
    
    showNotification('تم إضافة المنتج بنجاح', 'success');
    
    if (settings.audioAlerts) {
        playNotificationSound();
    }
}

function generateBarcode() {
    return Date.now().toString() + Math.floor(Math.random() * 1000);
}

function clearProductForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productBarcode').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCost').value = '';
    document.getElementById('productFixedStock').value = '';
    document.getElementById('productMovableStock').value = '';
    document.getElementById('productMinStock').value = '10';
    document.getElementById('productDescription').value = '';
}

function deleteProduct(id) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        products = products.filter(p => p.id !== id);
        saveData();
        updateProductsGrid();
        updateProductsTable();
        showNotification('تم حذف المنتج', 'warning');
    }
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    // ملء النموذج بيانات المنتج
    document.getElementById('productName').value = product.name;
    document.getElementById('productBarcode').value = product.barcode;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCost').value = product.cost;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productUnit').value = product.unit;
    document.getElementById('productFixedStock').value = product.fixedStock;
    document.getElementById('productMovableStock').value = product.movableStock;
    document.getElementById('productMinStock').value = product.minStock;
    document.getElementById('productDescription').value = product.description;

    // حذف المنتج القديم
    deleteProduct(id);
    
    // التمرير إلى النموذج
    document.querySelector('#products .card').scrollIntoView({ behavior: 'smooth' });
}

function updateProductsGrid() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    let filteredProducts = products.filter(product => {
        // فلترة حسب التصنيف
        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
            return false;
        }
        
        // فلترة حسب البحث
        const searchTerm = document.getElementById('productSearch')?.value.toLowerCase() || '';
        if (searchTerm && !product.name.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // فلترة حسب النطاق السعري
        const priceMin = parseFloat(document.getElementById('priceMin')?.value) || 0;
        const priceMax = parseFloat(document.getElementById('priceMax')?.value) || Infinity;
        if (product.price < priceMin || product.price > priceMax) {
            return false;
        }
        
        // فلترة المخزون المنخفض
        const lowStockOnly = document.getElementById('lowStockOnly')?.checked || false;
        if (lowStockOnly && (product.fixedStock + product.movableStock) > product.minStock) {
            return false;
        }
        
        return true;
    });

    // ترتيب المنتجات
    const sortBy = document.getElementById('sortBy')?.value || 'name';
    filteredProducts.sort((a, b) => {
        switch (sortBy) {
            case 'price':
                return a.price - b.price;
            case 'stock':
                return (a.fixedStock + a.movableStock) - (b.fixedStock + b.movableStock);
            default:
                return a.name.localeCompare(b.name, 'ar');
        }
    });

    grid.innerHTML = filteredProducts.map(product => {
        const totalStock = product.fixedStock + product.movableStock;
        const isLowStock = totalStock <= product.minStock;
        
        return `
            <div class="product-card" onclick="addToCart(${product.id})">
                <div class="product-image">${getProductIcon(product.category)}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">${formatCurrency(product.price)}</div>
                <div class="product-stock ${isLowStock ? 'low-stock' : ''}">
                    المخزون: ${totalStock} ${product.unit}
                </div>
            </div>
        `;
    }).join('');
}

function updateProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    tbody.innerHTML = products.map(product => {
        const totalStock = product.fixedStock + product.movableStock;
        const profit = product.price - product.cost;
        const profitPercent = product.cost > 0 ? ((profit / product.cost) * 100).toFixed(1) : 0;
        const isLowStock = totalStock <= product.minStock;
        
        return `
            <tr>
                <td>${product.name}</td>
                <td>${product.barcode}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${formatCurrency(product.cost)}</td>
                <td>${formatCurrency(profit)} (${profitPercent}%)</td>
                <td>${product.fixedStock}</td>
                <td>${product.movableStock}</td>
                <td>
                    <span class="product-stock ${isLowStock ? 'low-stock' : ''}">
                        ${isLowStock ? '⚠️ منخفض' : '✅ طبيعي'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-primary" onclick="editProduct(${product.id})" style="padding: 4px 8px; font-size: 11px;">تعديل</button>
                    <button class="btn btn-danger" onclick="deleteProduct(${product.id})" style="padding: 4px 8px; font-size: 11px;">حذف</button>
                </td>
            </tr>
        `;
    }).join('');
}

function getProductIcon(category) {
    const icons = {
        'عام': '📦',
        'أطعمة': '🍞',
        'مشروبات': '🥤',
        'تنظيف': '🧽',
        'شخصي': '🧴',
        'أدوات': '🔧',
        'خضروات': '🥬',
        'فواكه': '🍎',
        'لحوم': '🥩',
        'أسماك': '🐟',
        'ألبان': '🥛',
        'حبوب': '🌾',
        'معلبات': '🥫',
        'مجمدات': '❄️',
        'مخبوزات': '🍞',
        'هواتف': '📱',
        'حاسوب': '💻',
        'تلفزيون': '📺',
        'صوتيات': '🎵',
        'إكسسوارات': '🎧',
        'ألعاب': '🎮',
        'أجهزة منزلية': '🏠',
        'رجالي': '👔',
        'نسائي': '👗',
        'أطفال': '👶',
        'رياضي': '👟',
        'أحذية': '👞',
        'حقائب': '👜'
    };
    return icons[category] || '📦';
}

// ===========================================
// إدارة التصنيفات
// ===========================================
function updateCategoriesList() {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList) return;

    const categories = storeCategories[currentStoreType] || ['عام'];
    
    categoriesList.innerHTML = `
        <div class="category-btn ${selectedCategory === 'all' ? 'active' : ''}" onclick="selectCategory('all')">
            📂 جميع المنتجات
        </div>
        ${categories.map(category => `
            <div class="category-btn ${selectedCategory === category ? 'active' : ''}" onclick="selectCategory('${category}')">
                ${getProductIcon(category)} ${category}
            </div>
        `).join('')}
    `;
    
    // تحديث قائمة التصنيفات في نموذج إضافة المنتجات
    updateProductCategorySelect();
}

function updateProductCategorySelect() {
    const categorySelect = document.getElementById('productCategory');
    if (!categorySelect) return;

    const categories = storeCategories[currentStoreType] || ['عام'];
    
    categorySelect.innerHTML = categories.map(category => 
        `<option value="${category}">${category}</option>`
    ).join('');
}

function selectCategory(category) {
    selectedCategory = category;
    updateCategoriesList();
    updateProductsGrid();
}

// ===========================================
// إدارة عربة التسوق
// ===========================================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const totalStock = product.fixedStock + product.movableStock;
    if (totalStock <= 0) {
        showNotification('المنتج غير متوفر في المخزون', 'error');
        return;
    }

    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= totalStock) {
            showNotification('الكمية المطلوبة تتجاوز المخزون المتاح', 'error');
            return;
        }
        existingItem.quantity++;
    } else {
        cart.push({
            productId,
            quantity: 1,
            price: product.price
        });
    }

    updateCartDisplay();
    updateNotificationBadges();
    
    if (settings.audioAlerts) {
        playNotificationSound();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    updateCartDisplay();
    updateNotificationBadges();
}

function updateQuantity(productId, newQuantity) {
    const product = products.find(p => p.id === productId);
    const totalStock = product.fixedStock + product.movableStock;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    if (newQuantity > totalStock) {
        showNotification('الكمية المطلوبة تتجاوز المخزون المتاح', 'error');
        return;
    }

    const cartItem = cart.find(item => item.productId === productId);
    if (cartItem) {
        cartItem.quantity = newQuantity;
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const totalAmount = document.getElementById('totalAmount');
    const itemCount = document.getElementById('itemCount');
    
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <p>العربة فارغة</p>
                <small>اختر منتجات من القائمة</small>
            </div>
        `;
        if (totalAmount) totalAmount.textContent = formatCurrency(0);
        if (itemCount) itemCount.textContent = '0';
        return;
    }

    let total = 0;
    let count = 0;

    cartItems.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return '';

        const itemTotal = item.quantity * item.price;
        total += itemTotal;
        count += item.quantity;

        return `
            <div class="cart-item">
                <div class="cart-item-details">
                    <div class="cart-item-name">${product.name}</div>
                    <div class="cart-item-price">${formatCurrency(item.price)} × ${item.quantity} = ${formatCurrency(itemTotal)}</div>
                </div>
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.productId}, ${item.quantity - 1})">-</button>
                    <span style="margin: 0 8px; font-weight: bold;">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.productId}, ${item.quantity + 1})">+</button>
                    <button class="qty-btn" onclick="removeFromCart(${item.productId})" style="background: #e74c3c; margin-right: 8px;">×</button>
                </div>
            </div>
        `;
    }).join('');

    if (totalAmount) totalAmount.textContent = formatCurrency(total);
    if (itemCount) itemCount.textContent = count.toString();
}

function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('هل أنت متأكد من مسح العربة؟')) {
        cart = [];
        updateCartDisplay();
        updateNotificationBadges();
        showNotification('تم مسح العربة', 'info');
    }
}

// ===========================================
// إدارة المبيعات
// ===========================================
function processCashSale() {
    if (cart.length === 0) {
        showNotification('العربة فارغة', 'error');
        return;
    }

    const sale = {
        id: Date.now(),
        type: 'cash',
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.quantity * item.price), 0),
        tax: 0,
        date: new Date().toISOString(),
        customerId: null
    };

    // تحديث المخزون
    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            // خصم من المخزن المتحرك أولاً
            if (product.movableStock >= item.quantity) {
                product.movableStock -= item.quantity;
            } else {
                const remaining = item.quantity - product.movableStock;
                product.movableStock = 0;
                product.fixedStock -= remaining;
            }
        }
    });

    sales.push(sale);
    saveData();
    
    // طباعة الفاتورة
    printReceipt(sale);
    
    // مسح العربة
    cart = [];
    updateCartDisplay();
    updateProductsGrid();
    updateStats();
    updateNotificationBadges();
    
    showNotification(`تم إتمام البيع النقدي بقيمة ${formatCurrency(sale.total)}`, 'success');
    
    if (settings.audioAlerts) {
        playSuccessSound();
    }
}

function showInstallmentModal() {
    if (cart.length === 0) {
        showNotification('العربة فارغة', 'error');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    if (total < settings.minInstallmentAmount) {
        showNotification(`الحد الأدنى للبيع بالأقساط هو ${formatCurrency(settings.minInstallmentAmount)}`, 'error');
        return;
    }

    // تحديث قائمة العملاء
    updateCustomersList();
    
    // تعبئة المبلغ
    document.getElementById('originalAmount').value = total;
    document.getElementById('interestRate').value = settings.defaultInterestRate;
    document.getElementById('installmentCount').value = settings.defaultInstallmentCount;
    
    calculateInstallment();
    
    document.getElementById('installmentModal').style.display = 'block';
}

function updateCustomersList() {
    const customerSelect = document.getElementById('installmentCustomer');
    if (!customerSelect) return;

    customerSelect.innerHTML = '<option value="">اختر عميل موجود</option>' +
        customers.map(customer => 
            `<option value="${customer.id}">${customer.name} - ${customer.phone}</option>`
        ).join('');
}

function calculateInstallment() {
    const originalAmount = parseFloat(document.getElementById('originalAmount').value) || 0;
    const interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
    const installmentCount = parseInt(document.getElementById('installmentCount').value) || 1;

    const totalWithInterest = originalAmount * (1 + interestRate / 100);
    const monthlyPayment = totalWithInterest / installmentCount;

    document.getElementById('totalWithInterest').value = totalWithInterest;
    document.getElementById('monthlyPayment').value = monthlyPayment;

    // عرض جدول الأقساط
    showInstallmentSchedule(totalWithInterest, monthlyPayment, installmentCount);
}

function showInstallmentSchedule(total, monthly, count) {
    const scheduleDiv = document.getElementById('installmentSchedule');
    if (!scheduleDiv) return;

    let html = '<h4>جدول الأقساط المتوقع:</h4><div class="installment-schedule">';
    
    for (let i = 1; i <= count; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        
        html += `
            <div class="schedule-item">
                <span>القسط ${i}</span>
                <span>${formatCurrency(monthly)}</span>
                <span>${dueDate.toLocaleDateString('ar-EG')}</span>
            </div>
        `;
    }
    
    html += '</div>';
    scheduleDiv.innerHTML = html;
}

function createInstallmentSale() {
    const customerId = document.getElementById('installmentCustomer').value;
    const newCustomerName = document.getElementById('newCustomerName').value;
    const phone = document.getElementById('installmentPhone').value;
    
    let selectedCustomerId = customerId;
    
    // إنشاء عميل جديد إذا لزم الأمر
    if (!customerId && newCustomerName) {
        const newCustomer = {
            id: Date.now(),
            name: newCustomerName,
            phone: phone || '',
            email: '',
            address: '',
            creditLimit: 0,
            notes: '',
            createdAt: new Date().toISOString()
        };
        
        customers.push(newCustomer);
        selectedCustomerId = newCustomer.id;
    }
    
    if (!selectedCustomerId) {
        showNotification('يرجى اختيار عميل أو إدخال اسم عميل جديد', 'error');
        return;
    }

    const originalAmount = parseFloat(document.getElementById('originalAmount').value);
    const totalWithInterest = parseFloat(document.getElementById('totalWithInterest').value);
    const monthlyPayment = parseFloat(document.getElementById('monthlyPayment').value);
    const installmentCount = parseInt(document.getElementById('installmentCount').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);

    const installmentSale = {
        id: Date.now(),
        customerId: selectedCustomerId,
        items: [...cart],
        originalAmount,
        totalWithInterest,
        monthlyPayment,
        installmentCount,
        interestRate,
        paidAmount: 0,
        remainingAmount: totalWithInterest,
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        payments: []
    };

    // تحديث المخزون
    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            if (product.movableStock >= item.quantity) {
                product.movableStock -= item.quantity;
            } else {
                const remaining = item.quantity - product.movableStock;
                product.movableStock = 0;
                product.fixedStock -= remaining;
            }
        }
    });

    installmentSales.push(installmentSale);
    saveData();
    
    // مسح العربة
    cart = [];
    updateCartDisplay();
    updateProductsGrid();
    updateInstallmentsTable();
    updateStats();
    updateNotificationBadges();
    
    closeModal('installmentModal');
    
    showNotification(`تم إنشاء بيع بالأقساط بقيمة ${formatCurrency(totalWithInterest)}`, 'success');
    
    // طباعة فاتورة الأقساط
    printInstallmentReceipt(installmentSale);
}

// ===========================================
// إدارة العملاء
// ===========================================
function addCustomer() {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const email = document.getElementById('customerEmail').value;
    const address = document.getElementById('customerAddress').value;
    const creditLimit = parseFloat(document.getElementById('customerCreditLimit').value) || 0;
    const notes = document.getElementById('customerNotes').value;

    if (!name) {
        showNotification('يرجى إدخال اسم العميل', 'error');
        return;
    }

    // التحقق من عدم تكرار رقم الهاتف
    if (phone && customers.some(c => c.phone === phone)) {
        showNotification('رقم الهاتف موجود مسبقاً', 'error');
        return;
    }

    const customer = {
        id: Date.now(),
        name,
        phone: phone || '',
        email: email || '',
        address: address || '',
        creditLimit,
        notes: notes || '',
        createdAt: new Date().toISOString()
    };

    customers.push(customer);
    saveData();
    updateCustomersTable();
    clearCustomerForm();
    updateStats();
    
    showNotification('تم إضافة العميل بنجاح', 'success');
}

function clearCustomerForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('customerCreditLimit').value = '0';
    document.getElementById('customerNotes').value = '';
}

function deleteCustomer(id) {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
        customers = customers.filter(c => c.id !== id);
        saveData();
        updateCustomersTable();
        updateStats();
        showNotification('تم حذف العميل', 'warning');
    }
}

function updateCustomersTable() {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    tbody.innerHTML = customers.map(customer => {
        // حساب إجمالي المشتريات
        const customerSales = sales.filter(s => s.customerId === customer.id);
        const totalPurchases = customerSales.reduce((sum, sale) => sum + sale.total, 0);
        
        // حساب الرصيد المستحق
        const customerInstallments = installmentSales.filter(is => is.customerId === customer.id);
        const totalDebt = customerInstallments.reduce((sum, installment) => sum + installment.remainingAmount, 0);
        
        // آخر شراء
        const lastSale = customerSales.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        const lastPurchase = lastSale ? new Date(lastSale.date).toLocaleDateString('ar-EG') : 'لا يوجد';
        
        return `
            <tr>
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>${customer.email}</td>
                <td>${formatCurrency(totalPurchases)}</td>
                <td class="${totalDebt > 0 ? 'currency' : ''}">${formatCurrency(totalDebt)}</td>
                <td>${lastPurchase}</td>
                <td>
                    <button class="btn btn-primary" onclick="viewCustomerDetails(${customer.id})" style="padding: 4px 8px; font-size: 11px;">تفاصيل</button>
                    <button class="btn btn-danger" onclick="deleteCustomer(${customer.id})" style="padding: 4px 8px; font-size: 11px;">حذف</button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewCustomerDetails(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    // يمكن إضافة نافذة منبثقة لعرض تفاصيل العميل
    showNotification(`عرض تفاصيل العميل: ${customer.name}`, 'info');
}

// ===========================================
// إدارة الأقساط
// ===========================================
function updateInstallmentsTable() {
    const tbody = document.getElementById('installmentsTableBody');
    if (!tbody) return;

    tbody.innerHTML = installmentSales.map(installment => {
        const customer = customers.find(c => c.id === installment.customerId);
        const customerName = customer ? customer.name : 'غير محدد';
        
        let statusClass = '';
        let statusText = '';
        
        if (installment.remainingAmount <= 0) {
            statusClass = 'status-paid';
            statusText = 'مكتمل';
        } else if (new Date(installment.nextPaymentDate) < new Date()) {
            statusClass = 'status-overdue';
            statusText = 'متأخر';
        } else {
            statusClass = 'status-pending';
            statusText = 'نشط';
        }
        
        return `
            <tr>
                <td>${customerName}</td>
                <td>${formatCurrency(installment.originalAmount)}</td>
                <td>${formatCurrency(installment.totalWithInterest)}</td>
                <td>${formatCurrency(installment.paidAmount)}</td>
                <td>${formatCurrency(installment.remainingAmount)}</td>
                <td>${formatCurrency(installment.monthlyPayment)}</td>
                <td><span class="payment-status ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-success" onclick="showPaymentModal(${installment.id})" style="padding: 4px 8px; font-size: 11px;">دفع</button>
                    <button class="btn btn-info" onclick="viewInstallmentDetails(${installment.id})" style="padding: 4px 8px; font-size: 11px;">تفاصيل</button>
                </td>
            </tr>
        `;
    }).join('');
}

function showPaymentModal(installmentId) {
    const installment = installmentSales.find(is => is.id === installmentId);
    const customer = customers.find(c => c.id === installment.customerId);
    
    if (!installment || !customer) return;
    
    document.getElementById('paymentAmount').value = installment.monthlyPayment;
    document.getElementById('paymentDetails').innerHTML = `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4>تفاصيل القسط</h4>
            <p><strong>العميل:</strong> ${customer.name}</p>
            <p><strong>المبلغ المتبقي:</strong> ${formatCurrency(installment.remainingAmount)}</p>
            <p><strong>القسط الشهري:</strong> ${formatCurrency(installment.monthlyPayment)}</p>
            <p><strong>تاريخ الاستحقاق:</strong> ${new Date(installment.nextPaymentDate).toLocaleDateString('ar-EG')}</p>
        </div>
    `;
    
    document.getElementById('paymentModal').style.display = 'block';
    document.getElementById('paymentModal').dataset.installmentId = installmentId;
}

function processPayment() {
    const installmentId = parseInt(document.getElementById('paymentModal').dataset.installmentId);
    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
    const notes = document.getElementById('paymentNotes').value;
    
    if (!paymentAmount || paymentAmount <= 0) {
        showNotification('يرجى إدخال مبلغ صحيح', 'error');
        return;
    }
    
    const installment = installmentSales.find(is => is.id === installmentId);
    if (!installment) return;
    
    if (paymentAmount > installment.remainingAmount) {
        showNotification('المبلغ المدفوع أكبر من المبلغ المتبقي', 'error');
        return;
    }
    
    // إضافة الدفعة
    const payment = {
        id: Date.now(),
        amount: paymentAmount,
        date: new Date().toISOString(),
        notes: notes || ''
    };
    
    installment.payments.push(payment);
    installment.paidAmount += paymentAmount;
    installment.remainingAmount -= paymentAmount;
    
    // تحديث تاريخ القسط التالي
    if (installment.remainingAmount > 0) {
        const nextDate = new Date(installment.nextPaymentDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        installment.nextPaymentDate = nextDate.toISOString();
    } else {
        installment.status = 'completed';
    }
    
    saveData();
    updateInstallmentsTable();
    updateStats();
    updateNotificationBadges();
    closeModal('paymentModal');
    
    showNotification(`تم تسجيل دفعة بقيمة ${formatCurrency(paymentAmount)}`, 'success');
    
    // طباعة إيصال الدفع
    if (settings.autoPrintPayment) {
        printPaymentReceipt(installment, payment);
    }
}

function viewInstallmentDetails(installmentId) {
    const installment = installmentSales.find(is => is.id === installmentId);
    if (!installment) return;
    
    // يمكن إضافة نافذة منبثقة لعرض تفاصيل القسط
    showNotification('عرض تفاصيل القسط', 'info');
}

// ===========================================
// إدارة المخزون
// ===========================================
function showInventoryTab(tabName) {
    // إخفاء جميع المحتويات
    document.querySelectorAll('.inventory-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // إظهار المحتوى المحدد
    document.getElementById(tabName).classList.add('active');
    
    // تحديث الأزرار
    document.querySelectorAll('.inventory-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // تحديث المحتوى حسب التبويب
    switch(tabName) {
        case 'overview':
            updateInventoryReport();
            break;
        case 'movements':
            updateMovementSelects();
            updateMovementsTable();
            break;
        case 'adjustments':
            updateAdjustmentSelect();
            break;
        case 'analysis':
            break;
    }
}

function updateInventoryReport() {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    let totalValue = 0;
    let totalExpectedProfit = 0;
    let lowStockCount = 0;

    tbody.innerHTML = products.map(product => {
        const totalStock = product.fixedStock + product.movableStock;
        const isLowStock = totalStock <= product.minStock;
        const inventoryValue = totalStock * product.cost;
        const expectedProfit = totalStock * (product.price - product.cost);
        
        if (isLowStock) lowStockCount++;
        totalValue += inventoryValue;
        totalExpectedProfit += expectedProfit;
        
        return `
            <tr>
                <td>${product.name}</td>
                <td>${product.fixedStock} ${product.unit}</td>
                <td>${product.movableStock} ${product.unit}</td>
                <td><strong>${totalStock} ${product.unit}</strong></td>
                <td>${product.minStock} ${product.unit}</td>
                <td>
                    <span class="product-stock ${isLowStock ? 'low-stock' : ''}">
                        ${isLowStock ? '⚠️ منخفض' : '✅ طبيعي'}
                    </span>
                </td>
                <td>${formatCurrency(inventoryValue)}</td>
                <td>${formatCurrency(expectedProfit)}</td>
                <td>
                    <button class="btn btn-primary" onclick="quickStockAdjustment(${product.id})" style="padding: 4px 8px; font-size: 11px;">تسوية سريعة</button>
                </td>
            </tr>
        `;
    }).join('');
    
    // تحديث الإحصائيات
    document.getElementById('totalProductsCount').textContent = products.length;
    document.getElementById('lowStockCount').textContent = lowStockCount;
    document.getElementById('totalInventoryValue').textContent = formatCurrency(totalValue);
    document.getElementById('expectedProfit').textContent = formatCurrency(totalExpectedProfit);
}

function updateMovementSelects() {
    const productSelect = document.getElementById('movementProduct');
    const adjustmentSelect = document.getElementById('adjustmentProduct');
    
    const options = products.map(product => 
        `<option value="${product.id}">${product.name}</option>`
    ).join('');
    
    if (productSelect) {
        productSelect.innerHTML = '<option value="">اختر منتج</option>' + options;
    }
    
    if (adjustmentSelect) {
        adjustmentSelect.innerHTML = '<option value="">اختر منتج</option>' + options;
    }
}

function updateAdjustmentSelect() {
    updateMovementSelects();
}

function recordMovement() {
    const productId = parseInt(document.getElementById('movementProduct').value);
    const movementType = document.getElementById('movementType').value;
    const stockType = document.getElementById('stockType').value;
    const quantity = parseInt(document.getElementById('movementQuantity').value);
    const reason = document.getElementById('movementReason').value;
    
    if (!productId || !quantity || !reason) {
        showNotification('يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // تسجيل الحركة
    const movement = {
        id: Date.now(),
        productId,
        productName: product.name,
        type: movementType,
        stockType,
        quantity,
        reason,
        date: new Date().toISOString()
    };
    
    movements.push(movement);
    
    // تحديث المخزون
    if (movementType === 'in') {
        if (stockType === 'movable') {
            product.movableStock += quantity;
        } else {
            product.fixedStock += quantity;
        }
    } else if (movementType === 'out') {
        if (stockType === 'movable') {
            if (product.movableStock >= quantity) {
                product.movableStock -= quantity;
            } else {
                showNotification('الكمية المطلوبة تتجاوز المخزون المتاح', 'error');
                return;
            }
        } else {
            if (product.fixedStock >= quantity) {
                product.fixedStock -= quantity;
            } else {
                showNotification('الكمية المطلوبة تتجاوز المخزون المتاح', 'error');
                return;
            }
        }
    }
    
    saveData();
    updateInventoryReport();
    updateMovementsTable();
    updateProductsGrid();
    clearMovementForm();
    
    showNotification('تم تسجيل حركة المخزن', 'success');
}

function clearMovementForm() {
    document.getElementById('movementProduct').value = '';
    document.getElementById('movementQuantity').value = '';
    document.getElementById('movementReason').value = '';
}

function updateMovementsTable() {
    const tbody = document.getElementById('movementsTableBody');
    if (!tbody) return;

    tbody.innerHTML = movements.slice(-50).reverse().map(movement => {
        const typeText = {
            'in': 'إدخال',
            'out': 'إخراج',
            'transfer': 'نقل',
            'adjustment': 'تسوية'
        };
        
        const stockTypeText = {
            'movable': 'متحرك',
            'fixed': 'ثابت'
        };
        
        return `
            <tr>
                <td>${new Date(movement.date).toLocaleString('ar-EG')}</td>
                <td>${movement.productName}</td>
                <td>${typeText[movement.type]}</td>
                <td>${stockTypeText[movement.stockType]}</td>
                <td>${movement.quantity}</td>
                <td>${movement.reason}</td>
            </tr>
        `;
    }).join('');
}

function adjustInventory() {
    const productId = parseInt(document.getElementById('adjustmentProduct').value);
    const actualMovableStock = parseInt(document.getElementById('actualMovableStock').value);
    const actualFixedStock = parseInt(document.getElementById('actualFixedStock').value);
    const notes = document.getElementById('adjustmentNotes').value;
    
    if (!productId) {
        showNotification('يرجى اختيار منتج', 'error');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const movableDiff = actualMovableStock - product.movableStock;
    const fixedDiff = actualFixedStock - product.fixedStock;
    
    if (movableDiff !== 0) {
        const movement = {
            id: Date.now(),
            productId,
            productName: product.name,
            type: 'adjustment',
            stockType: 'movable',
            quantity: Math.abs(movableDiff),
            reason: `تسوية المخزن المتحرك: ${movableDiff > 0 ? 'زيادة' : 'نقص'} ${Math.abs(movableDiff)} ${product.unit}. ${notes}`,
            date: new Date().toISOString()
        };
        movements.push(movement);
        product.movableStock = actualMovableStock;
    }
    
    if (fixedDiff !== 0) {
        const movement = {
            id: Date.now() + 1,
            productId,
            productName: product.name,
            type: 'adjustment',
            stockType: 'fixed',
            quantity: Math.abs(fixedDiff),
            reason: `تسوية المخزن الثابت: ${fixedDiff > 0 ? 'زيادة' : 'نقص'} ${Math.abs(fixedDiff)} ${product.unit}. ${notes}`,
            date: new Date().toISOString()
        };
        movements.push(movement);
        product.fixedStock = actualFixedStock;
    }
    
    saveData();
    updateInventoryReport();
    updateMovementsTable();
    updateProductsGrid();
    clearAdjustmentForm();
    
    showNotification('تم تطبيق التسوية', 'success');
}

function clearAdjustmentForm() {
    document.getElementById('adjustmentProduct').value = '';
    document.getElementById('actualMovableStock').value = '';
    document.getElementById('actualFixedStock').value = '';
    document.getElementById('adjustmentNotes').value = '';
}

function quickStockAdjustment(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    showInventoryTab('adjustments');
    
    // تعبئة النموذج
    document.getElementById('adjustmentProduct').value = productId;
    document.getElementById('actualMovableStock').value = product.movableStock;
    document.getElementById('actualFixedStock').value = product.fixedStock;
    
    // التمرير إلى النموذج
    document.querySelector('#adjustments').scrollIntoView({ behavior: 'smooth' });
}

// ===========================================
// التقارير والإحصائيات
// ===========================================
function updateStats() {
    // إحصائيات المبيعات
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const todaySales = sales.filter(sale => new Date(sale.date) >= todayStart)
        .reduce((sum, sale) => sum + sale.total, 0);
    
    const monthSales = sales.filter(sale => new Date(sale.date) >= monthStart)
        .reduce((sum, sale) => sum + sale.total, 0);
    
    const totalProfit = sales.reduce((sum, sale) => {
        return sum + sale.items.reduce((itemSum, item) => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                return itemSum + ((item.price - product.cost) * item.quantity);
            }
            return itemSum;
        }, 0);
    }, 0);
    
    const avgDailySales = sales.length > 0 ? 
        sales.reduce((sum, sale) => sum + sale.total, 0) / 
        Math.max(1, Math.ceil((Date.now() - new Date(sales[0]?.date || Date.now())) / (1000 * 60 * 60 * 24))) : 0;
    
    // تحديث عناصر الإحصائيات
    updateStatElement('todaySales', formatCurrency(todaySales));
    updateStatElement('monthSales', formatCurrency(monthSales));
    updateStatElement('totalProfit', formatCurrency(totalProfit));
    updateStatElement('avgDailySales', formatCurrency(avgDailySales));
    
    // إحصائيات العملاء
    const activeCustomers = customers.filter(customer => {
        const customerSales = sales.filter(s => s.customerId === customer.id);
        const lastSale = customerSales.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        if (!lastSale) return false;
        const lastSaleDate = new Date(lastSale.date);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return lastSaleDate >= thirtyDaysAgo;
    }).length;
    
    const totalCustomerDebt = installmentSales.reduce((sum, installment) => sum + installment.remainingAmount, 0);
    const avgOrderValue = sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length : 0;
    
    updateStatElement('totalCustomersCount', customers.length);
    updateStatElement('activeCustomers', activeCustomers);
    updateStatElement('totalCustomerDebt', formatCurrency(totalCustomerDebt));
    updateStatElement('avgOrderValue', formatCurrency(avgOrderValue));
    
    // إحصائيات الأقساط
    const totalInstallmentSales = installmentSales.length;
    const totalInstallmentAmount = installmentSales.reduce((sum, installment) => sum + installment.totalWithInterest, 0);
    const paidInstallments = installmentSales.reduce((sum, installment) => sum + installment.paidAmount, 0);
    const pendingInstallments = installmentSales.reduce((sum, installment) => sum + installment.remainingAmount, 0);
    
    updateStatElement('totalInstallmentSales', totalInstallmentSales);
    updateStatElement('totalInstallmentAmount', formatCurrency(totalInstallmentAmount));
    updateStatElement('paidInstallments', formatCurrency(paidInstallments));
    updateStatElement('pendingInstallments', formatCurrency(pendingInstallments));
}

function updateStatElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function generateSalesReport() {
    const fromDate = document.getElementById('salesReportFrom').value;
    const toDate = document.getElementById('salesReportTo').value;
    
    if (!fromDate || !toDate) {
        showNotification('يرجى تحديد نطاق التاريخ', 'error');
        return;
    }
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999); // نهاية اليوم
    
    const reportSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= from && saleDate <= to;
    });
    
    // إنشاء التقرير
    generateTopProductsReport(reportSales);
    showNotification(`تم إنشاء تقرير للفترة من ${fromDate} إلى ${toDate}`, 'success');
}

function generateTopProductsReport(reportSales = sales) {
    const tbody = document.getElementById('topProductsTableBody');
    if (!tbody) return;
    
    // تجميع المنتجات حسب المبيعات
    const productStats = {};
    
    reportSales.forEach(sale => {
        sale.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return;
            
            if (!productStats[product.id]) {
                productStats[product.id] = {
                    name: product.name,
                    salesCount: 0,
                    totalQuantity: 0,
                    totalValue: 0
                };
            }
            
            productStats[product.id].salesCount++;
            productStats[product.id].totalQuantity += item.quantity;
            productStats[product.id].totalValue += item.quantity * item.price;
        });
    });
    
    // ترتيب المنتجات حسب المبيعات
    const sortedProducts = Object.values(productStats)
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 10);
    
    tbody.innerHTML = sortedProducts.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${product.salesCount}</td>
            <td>${product.totalQuantity}</td>
            <td>${formatCurrency(product.totalValue)}</td>
        </tr>
    `).join('');
}

// ===========================================
// البحث والفلترة
// ===========================================
function setupSearch() {
    // البحث في المنتجات
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        productSearch.addEventListener('input', function() {
            updateProductsGrid();
        });
    }
    
    // فلترة المنتجات في جدول الإدارة
    const productFilter = document.getElementById('productFilter');
    if (productFilter) {
        productFilter.addEventListener('input', function() {
            filterTable('productsTableBody', this.value, [0, 1]); // البحث في الاسم والباركود
        });
    }
    
    // فلترة العملاء
    const customerFilter = document.getElementById('customerFilter');
    if (customerFilter) {
        customerFilter.addEventListener('input', function() {
            filterTable('customersTableBody', this.value, [0, 1, 2]); // البحث في الاسم والهاتف والإيميل
        });
    }
    
    // فلترة الأقساط
    const installmentFilter = document.getElementById('installmentFilter');
    if (installmentFilter) {
        installmentFilter.addEventListener('input', function() {
            filterTable('installmentsTableBody', this.value, [0]); // البحث في اسم العميل
        });
    }
    
    // فلاتر البحث المتقدم
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const lowStockOnly = document.getElementById('lowStockOnly');
    
    if (priceMin) priceMin.addEventListener('input', updateProductsGrid);
    if (priceMax) priceMax.addEventListener('input', updateProductsGrid);
    if (lowStockOnly) lowStockOnly.addEventListener('change', updateProductsGrid);
}

function filterTable(tableBodyId, searchTerm, columns) {
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    const term = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const match = columns.some(colIndex => {
            return cells[colIndex] && cells[colIndex].textContent.toLowerCase().includes(term);
        });
        
        row.style.display = match ? '' : 'none';
    });
}

function sortProducts() {
    updateProductsGrid();
}

function filterProducts() {
    updateProductsGrid();
}

// ===========================================
// البحث الصوتي
// ===========================================
let recognition = null;
let isListening = false;

function startVoiceSearch(inputId = 'productSearch') {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showNotification('البحث الصوتي غير مدعوم في هذا المتصفح', 'error');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    const input = document.getElementById(inputId);
    const button = document.querySelector(`#${inputId} + .voice-btn`) || 
                  document.querySelector('.voice-btn');
    
    recognition.onstart = function() {
        isListening = true;
        if (button) button.classList.add('recording');
        showNotification('جاري الاستماع...', 'info');
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        if (input) {
            input.value = transcript;
            input.dispatchEvent(new Event('input'));
        }
        showNotification(`تم التعرف على: ${transcript}`, 'success');
    };
    
    recognition.onerror = function(event) {
        showNotification('خطأ في التعرف الصوتي', 'error');
    };
    
    recognition.onend = function() {
        isListening = false;
        if (button) button.classList.remove('recording');
    };
    
    recognition.start();
}

function startVoiceInput(inputId) {
    startVoiceSearch(inputId);
}

// ===========================================
// الطباعة
// ===========================================
function printReceipt(sale) {
    const receiptWindow = window.open('', '_blank');
    const customer = customers.find(c => c.id === sale.customerId);
    
    receiptWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>فاتورة بيع</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; margin: 20px; }
                .receipt { max-width: 300px; margin: 0 auto; }
                .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
                .item { display: flex; justify-content: space-between; margin: 5px 0; }
                .total { border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <h2>${settings.storeName}</h2>
                    <p>فاتورة بيع نقدي</p>
                    <p>التاريخ: ${new Date(sale.date).toLocaleString('ar-EG')}</p>
                    <p>رقم الفاتورة: ${sale.id}</p>
                    ${customer ? `<p>العميل: ${customer.name}</p>` : ''}
                </div>
                
                <div class="items">
                    ${sale.items.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        const itemTotal = item.quantity * item.price;
                        return `
                            <div class="item">
                                <span>${product ? product.name : 'منتج محذوف'}</span>
                                <span>${item.quantity} × ${formatCurrency(item.price)} = ${formatCurrency(itemTotal)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="total">
                    <div class="item">
                        <span>المجموع:</span>
                        <span>${formatCurrency(sale.total)}</span>
                    </div>
                    ${sale.tax > 0 ? `
                        <div class="item">
                            <span>الضريبة:</span>
                            <span>${formatCurrency(sale.tax)}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div style="margin-top: 20px; font-size: 12px;">
                    <p>شكراً لتسوقكم معنا</p>
                    <p>${new Date().toLocaleString('ar-EG')}</p>
                </div>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 1000);
                }
            </script>
        </body>
        </html>
    `);
}

function printInstallmentReceipt(installmentSale) {
    const receiptWindow = window.open('', '_blank');
    const customer = customers.find(c => c.id === installmentSale.customerId);
    
    receiptWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>فاتورة بيع بالأقساط</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; margin: 20px; }
                .receipt { max-width: 400px; margin: 0 auto; }
                .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
                .item { display: flex; justify-content: space-between; margin: 5px 0; }
                .total { border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
                .installment-info { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <h2>${settings.storeName}</h2>
                    <p>فاتورة بيع بالأقساط</p>
                    <p>التاريخ: ${new Date(installmentSale.createdAt).toLocaleString('ar-EG')}</p>
                    <p>رقم الفاتورة: ${installmentSale.id}</p>
                    <p>العميل: ${customer ? customer.name : 'غير محدد'}</p>
                    ${customer && customer.phone ? `<p>الهاتف: ${customer.phone}</p>` : ''}
                </div>
                
                <div class="items">
                    ${installmentSale.items.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        const itemTotal = item.quantity * item.price;
                        return `
                            <div class="item">
                                <span>${product ? product.name : 'منتج محذوف'}</span>
                                <span>${item.quantity} × ${formatCurrency(item.price)} = ${formatCurrency(itemTotal)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="installment-info">
                    <h3>تفاصيل الأقساط</h3>
                    <div class="item">
                        <span>المبلغ الأصلي:</span>
                        <span>${formatCurrency(installmentSale.originalAmount)}</span>
                    </div>
                    <div class="item">
                        <span>نسبة الفائدة:</span>
                        <span>${installmentSale.interestRate}%</span>
                    </div>
                    <div class="item">
                        <span>عدد الأقساط:</span>
                        <span>${installmentSale.installmentCount} شهر</span>
                    </div>
                    <div class="item">
                        <span>المبلغ مع الفائدة:</span>
                        <span>${formatCurrency(installmentSale.totalWithInterest)}</span>
                    </div>
                    <div class="item">
                        <span>القسط الشهري:</span>
                        <span>${formatCurrency(installmentSale.monthlyPayment)}</span>
                    </div>
                    <div class="item">
                        <span>تاريخ أول قسط:</span>
                        <span>${new Date(installmentSale.nextPaymentDate).toLocaleDateString('ar-EG')}</span>
                    </div>
                </div>
                
                <div style="margin-top: 20px; font-size: 12px;">
                    <p>يرجى الاحتفاظ بهذه الفاتورة</p>
                    <p>شكراً لثقتكم بنا</p>
                    <p>${new Date().toLocaleString('ar-EG')}</p>
                </div>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 1000);
                }
            </script>
        </body>
        </html>
    `);
}

function printPaymentReceipt(installment, payment) {
    const receiptWindow = window.open('', '_blank');
    const customer = customers.find(c => c.id === installment.customerId);
    
    receiptWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>إيصال دفع قسط</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; margin: 20px; }
                .receipt { max-width: 300px; margin: 0 auto; }
                .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
                .item { display: flex; justify-content: space-between; margin: 5px 0; }
                .total { border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <h2>${settings.storeName}</h2>
                    <p>إيصال دفع قسط</p>
                    <p>التاريخ: ${new Date(payment.date).toLocaleString('ar-EG')}</p>
                    <p>رقم الدفعة: ${payment.id}</p>
                    <p>العميل: ${customer ? customer.name : 'غير محدد'}</p>
                </div>
                
                <div class="total">
                    <div class="item">
                        <span>المبلغ المدفوع:</span>
                        <span>${formatCurrency(payment.amount)}</span>
                    </div>
                    <div class="item">
                        <span>المبلغ المتبقي:</span>
                        <span>${formatCurrency(installment.remainingAmount)}</span>
                    </div>
                    ${payment.notes ? `
                        <div style="margin-top: 10px; font-size: 12px;">
                            <p>ملاحظات: ${payment.notes}</p>
                        </div>
                    ` : ''}
                </div>
                
                <div style="margin-top: 20px; font-size: 12px;">
                    <p>شكراً لالتزامكم بالدفع</p>
                    <p>${new Date().toLocaleString('ar-EG')}</p>
                </div>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 1000);
                }
            </script>
        </body>
        </html>
    `);
}

// ===========================================
// إدارة النوافذ المنبثقة والواجهة
// ===========================================
function showTab(tabName) {
    // إخفاء جميع المحتويات
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // إظهار المحتوى المحدد
    document.getElementById(tabName).classList.add('active');
    
    // تحديث الأزرار
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // تحديث المحتوى حسب التبويب
    switch(tabName) {
        case 'products':
            updateProductsTable();
            break;
        case 'customers':
            updateCustomersTable();
            break;
        case 'installments':
            updateInstallmentsTable();
            break;
        case 'inventory':
            updateInventoryReport();
            break;
        case 'reports':
            generateTopProductsReport();
            break;
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function updateNotificationBadges() {
    // تحديث شارة عربة التسوق
    const cartBadge = document.getElementById('cartBadge');
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartBadge) {
        if (cartCount > 0) {
            cartBadge.textContent = cartCount;
            cartBadge.style.display = 'flex';
        } else {
            cartBadge.style.display = 'none';
        }
    }
    
    // تحديث شارة المخزون المنخفض
    const lowStockBadge = document.getElementById('lowStockBadge');
    const lowStockCount = products.filter(product => 
        (product.fixedStock + product.movableStock) <= product.minStock
    ).length;
    
    if (lowStockBadge) {
        if (lowStockCount > 0) {
            lowStockBadge.textContent = lowStockCount;
            lowStockBadge.style.display = 'flex';
        } else {
            lowStockBadge.style.display = 'none';
        }
    }
    
    // تحديث شارة الأقساط المتأخرة
    const overdueBadge = document.getElementById('overdueBadge');
    const overdueCount = installmentSales.filter(installment => 
        installment.remainingAmount > 0 && 
        new Date(installment.nextPaymentDate) < new Date()
    ).length;
    
    if (overdueBadge) {
        if (overdueCount > 0) {
            overdueBadge.textContent = overdueCount;
            overdueBadge.style.display = 'flex';
        } else {
            overdueBadge.style.display = 'none';
        }
    }
}

// ===========================================
// إدارة الإعدادات
// ===========================================
function loadSettings() {
    Object.keys(settings).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = settings[key];
            } else {
                element.value = settings[key];
            }
        }
    });
}

function saveAllSettings() {
    const settingsElements = [
        'storeName', 'currency', 'taxRate', 'audioAlerts',
        'defaultInterestRate', 'defaultInstallmentCount', 'minInstallmentAmount',
        'autoPrintPayment', 'lowStockThreshold', 'lowStockAlert',
        'autoInventoryManagement', 'autoPrintReceipt', 'paperSize'
    ];
    
    settingsElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (element.type === 'checkbox') {
                settings[id] = element.checked;
            } else if (element.type === 'number') {
                settings[id] = parseFloat(element.value) || 0;
            } else {
                settings[id] = element.value;
            }
        }
    });
    
    saveData();
    showNotification('تم حفظ الإعدادات بنجاح', 'success');
}

// ===========================================
// النسخ الاحتياطي والاستيراد/التصدير
// ===========================================
function createBackup() {
    const backup = {
        products,
        customers,
        sales,
        installmentSales,
        movements,
        settings,
        backupDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('تم إنشاء النسخة الاحتياطية', 'success');
}

function restoreBackup() {
    const fileInput = document.getElementById('backupFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('يرجى اختيار ملف النسخة الاحتياطية', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            if (confirm('هذا سيحل محل جميع البيانات الحالية. هل أنت متأكد؟')) {
                products = backup.products || [];
                customers = backup.customers || [];
                sales = backup.sales || [];
                installmentSales = backup.installmentSales || [];
                movements = backup.movements || [];
                settings = { ...defaultSettings, ...backup.settings };
                
                saveData();
                initializeApp();
                
                showNotification('تم استعادة البيانات بنجاح', 'success');
            }
        } catch (error) {
            showNotification('خطأ في قراءة ملف النسخة الاحتياطية', 'error');
        }
    };
    
    reader.readAsText(file);
}

function exportProducts() {
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `products_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('تم تصدير المنتجات', 'success');
}

function exportAllSales() {
    const dataStr = JSON.stringify(sales, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `sales_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('تم تصدير المبيعات', 'success');
}

function exportAllCustomers() {
    const dataStr = JSON.stringify(customers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `customers_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('تم تصدير العملاء', 'success');
}

function exportFullBackup() {
    createBackup();
}

function resetAllData() {
    if (confirm('هذا سيحذف جميع البيانات نهائياً. هل أنت متأكد؟')) {
        if (confirm('تأكيد أخير: سيتم حذف جميع البيانات!')) {
            localStorage.clear();
            location.reload();
        }
    }
}

// ===========================================
// استيراد المنتجات بالكمية
// ===========================================
function showBulkImportModal() {
    document.getElementById('bulkImportModal').style.display = 'block';
}

function previewImportData() {
    const fileInput = document.getElementById('bulkImportFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('يرجى اختيار ملف JSON', 'error');
        return;
    }
    
    const reader = new FileReader();
 // تكملة ملف app.js للنظام من حيث توقف

    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            if (!Array.isArray(importData)) {
                showNotification('ملف غير صحيح: يجب أن يحتوي على مصفوفة من المنتجات', 'error');
                return;
            }
            
            // عرض معاينة البيانات
            displayImportPreview(importData);
            
            // تمكين زر الاستيراد
            document.getElementById('importBtn').disabled = false;
            
        } catch (error) {
            showNotification('خطأ في قراءة الملف: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
}

function displayImportPreview(importData) {
    const previewDiv = document.getElementById('importPreview');
    if (!previewDiv) return;
    
    const validProducts = [];
    const invalidProducts = [];
    
    // التحقق من صحة البيانات
    importData.forEach((item, index) => {
        const errors = [];
        
        if (!item.name || typeof item.name !== 'string') {
            errors.push('اسم المنتج مطلوب');
        }
        
        if (!item.price || typeof item.price !== 'number' || item.price <= 0) {
            errors.push('سعر صحيح مطلوب');
        }
        
        if (errors.length === 0) {
            validProducts.push(item);
        } else {
            invalidProducts.push({ ...item, index: index + 1, errors });
        }
    });
    
    let html = `
        <div class="import-stats">
            <div class="import-stat">
                <div class="import-stat-number">${importData.length}</div>
                <div class="import-stat-label">إجمالي العناصر</div>
            </div>
            <div class="import-stat">
                <div class="import-stat-number">${validProducts.length}</div>
                <div class="import-stat-label">صحيح</div>
            </div>
            <div class="import-stat">
                <div class="import-stat-number">${invalidProducts.length}</div>
                <div class="import-stat-label">خطأ</div>
            </div>
        </div>
    `;
    
    if (invalidProducts.length > 0) {
        html += '<div class="import-error"><strong>عناصر بها أخطاء:</strong><br>';
        invalidProducts.slice(0, 5).forEach(item => {
            html += `العنصر ${item.index}: ${item.errors.join(', ')}<br>`;
        });
        if (invalidProducts.length > 5) {
            html += `... و ${invalidProducts.length - 5} أخرى`;
        }
        html += '</div>';
    }
    
    if (validProducts.length > 0) {
        html += '<div class="import-success"><strong>معاينة المنتجات الصحيحة:</strong></div>';
        html += '<div style="max-height: 150px; overflow-y: auto;">';
        validProducts.slice(0, 10).forEach(product => {
            html += `
                <div class="preview-item">
                    <span class="preview-name">${product.name}</span>
                    <span class="preview-price">${formatCurrency(product.price)}</span>
                    <span class="preview-category">${product.category || 'عام'}</span>
                </div>
            `;
        });
        if (validProducts.length > 10) {
            html += `<p style="text-align: center; color: #666;">... و ${validProducts.length - 10} منتج آخر</p>`;
        }
        html += '</div>';
    }
    
    previewDiv.innerHTML = html;
}

function processBulkImport() {
    const fileInput = document.getElementById('bulkImportFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('يرجى اختيار ملف', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            const targetStoreType = document.getElementById('targetStoreType').value;
            const replaceExisting = document.getElementById('replaceExisting').checked;
            const autoGenerateBarcode = document.getElementById('autoGenerateBarcode').checked;
            const validateCategories = document.getElementById('validateCategories').checked;
            
            let importedCount = 0;
            let skippedCount = 0;
            let errorCount = 0;
            
            importData.forEach(item => {
                try {
                    // التحقق من البيانات الأساسية
                    if (!item.name || !item.price || item.price <= 0) {
                        errorCount++;
                        return;
                    }
                    
                    // إنشاء كائن المنتج
                    const product = {
                        id: Date.now() + Math.random(),
                        name: item.name,
                        barcode: item.barcode || (autoGenerateBarcode ? generateBarcode() : ''),
                        price: parseFloat(item.price),
                        cost: parseFloat(item.cost) || 0,
                        category: validateCategories ? validateCategory(item.category, targetStoreType) : (item.category || 'عام'),
                        unit: item.unit || 'قطعة',
                        fixedStock: parseInt(item.fixedStock) || 0,
                        movableStock: parseInt(item.movableStock) || 0,
                        minStock: parseInt(item.minStock) || 10,
                        description: item.description || '',
                        createdAt: new Date().toISOString()
                    };
                    
                    // التحقق من التكرار
                    const existingIndex = products.findIndex(p => 
                        p.name === product.name || (p.barcode && product.barcode && p.barcode === product.barcode)
                    );
                    
                    if (existingIndex !== -1) {
                        if (replaceExisting) {
                            products[existingIndex] = product;
                            importedCount++;
                        } else {
                            skippedCount++;
                        }
                    } else {
                        products.push(product);
                        importedCount++;
                    }
                    
                } catch (error) {
                    errorCount++;
                }
            });
            
            saveData();
            updateProductsGrid();
            updateProductsTable();
            updateCategoriesList();
            closeModal('bulkImportModal');
            
            showNotification(
                `تم استيراد ${importedCount} منتج، تم تخطي ${skippedCount}، أخطاء ${errorCount}`, 
                'success'
            );
            
        } catch (error) {
            showNotification('خطأ في معالجة الملف: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
}

function validateCategory(category, storeType) {
    const validCategories = storeCategories[storeType] || ['عام'];
    if (validCategories.includes(category)) {
        return category;
    }
    return validCategories[0]; // الفئة الأولى كافتراضية
}

function downloadSampleFile() {
    const sampleData = [
        {
            name: "منتج تجريبي 1",
            barcode: "123456789",
            price: 10000,
            cost: 8000,
            category: "عام",
            unit: "قطعة",
            fixedStock: 100,
            movableStock: 50,
            minStock: 10,
            description: "وصف المنتج التجريبي الأول"
        },
        {
            name: "منتج تجريبي 2",
            barcode: "123456790",
            price: 15000,
            cost: 12000,
            category: "عام",
            unit: "كيلو",
            fixedStock: 200,
            movableStock: 100,
            minStock: 20,
            description: "وصف المنتج التجريبي الثاني"
        }
    ];
    
    const dataStr = JSON.stringify(sampleData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'sample_products.json';
    link.click();
    
    showNotification('تم تحميل الملف التجريبي', 'success');
}

// ===========================================
// إدارة الباركود
// ===========================================
function showBarcodeGenerator() {
    const modal = document.getElementById('barcodeModal');
    const productSelect = document.getElementById('barcodeProducts');
    
    // تحديث قائمة المنتجات
    productSelect.innerHTML = products.map(product => 
        `<option value="${product.id}">${product.name} - ${product.barcode}</option>`
    ).join('');
    
    modal.style.display = 'block';
}

function generateBarcodePreview() {
    const selectedProducts = Array.from(document.getElementById('barcodeProducts').selectedOptions)
        .map(option => parseInt(option.value));
    
    const previewDiv = document.getElementById('barcodePreview');
    
    let html = '<h4>معاينة الباركود:</h4>';
    
    selectedProducts.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (product) {
            html += `
                <div class="barcode-print">
                    <div style="font-size: 14px; font-weight: bold;">${product.name}</div>
                    <div style="font-size: 12px; margin: 5px 0;">||||| |||| ||| ||||| ||||</div>
                    <div style="font-size: 12px;">${product.barcode}</div>
                    <div style="font-size: 12px;">${formatCurrency(product.price)}</div>
                </div>
            `;
        }
    });
    
    previewDiv.innerHTML = html;
}

function printBarcodes() {
    const selectedProducts = Array.from(document.getElementById('barcodeProducts').selectedOptions)
        .map(option => parseInt(option.value));
    
    if (selectedProducts.length === 0) {
        showNotification('يرجى اختيار منتجات للطباعة', 'error');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    let html = `
        <html dir="rtl">
        <head>
            <title>طباعة باركود</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; }
                .barcode-container { display: flex; flex-wrap: wrap; }
                .barcode-item { 
                    width: 150px; 
                    height: 100px; 
                    border: 1px solid #ddd; 
                    margin: 5px; 
                    padding: 10px; 
                    text-align: center; 
                    font-size: 10px; 
                    display: flex; 
                    flex-direction: column; 
                    justify-content: center;
                }
                .product-name { font-weight: bold; margin-bottom: 5px; }
                .barcode-lines { font-family: monospace; font-size: 8px; margin: 5px 0; }
                .barcode-number { font-size: 8px; margin: 3px 0; }
                .price { font-weight: bold; color: #2c5aa0; }
                @media print { 
                    body { margin: 0; } 
                    .barcode-item { break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="barcode-container">
    `;
    
    selectedProducts.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (product) {
            html += `
                <div class="barcode-item">
                    <div class="product-name">${product.name}</div>
                    <div class="barcode-lines">||||| |||| ||| ||||| ||||</div>
                    <div class="barcode-number">${product.barcode}</div>
                    <div class="price">${formatCurrency(product.price)}</div>
                </div>
            `;
        }
    });
    
    html += `
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 1000);
                }
            </script>
        </body>
        </html>
    `;
    
    printWindow.document.write(html);
    closeModal('barcodeModal');
    showNotification('تم إرسال الباركود للطباعة', 'success');
}

// ===========================================
// الإجراءات السريعة المتعددة
// ===========================================
function toggleQuickActions() {
    // يمكن إضافة قائمة إجراءات سريعة هنا
    showNotification('الإجراءات السريعة', 'info');
}

function holdSale() {
    if (cart.length === 0) {
        showNotification('العربة فارغة', 'error');
        return;
    }
    
    // حفظ البيع المعلق في التخزين المحلي
    const heldSales = JSON.parse(localStorage.getItem('heldSales') || '[]');
    const heldSale = {
        id: Date.now(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.quantity * item.price), 0),
        date: new Date().toISOString()
    };
    
    heldSales.push(heldSale);
    localStorage.setItem('heldSales', JSON.stringify(heldSales));
    
    cart = [];
    updateCartDisplay();
    updateNotificationBadges();
    
    showNotification(`تم تعليق البيع رقم ${heldSale.id}`, 'info');
}

function showOverdueInstallments() {
    const overdueInstallments = installmentSales.filter(installment => 
        installment.remainingAmount > 0 && 
        new Date(installment.nextPaymentDate) < new Date()
    );
    
    if (overdueInstallments.length === 0) {
        showNotification('لا توجد أقساط متأخرة', 'info');
        return;
    }
    
    // يمكن إضافة نافذة منبثقة لعرض الأقساط المتأخرة
    showNotification(`يوجد ${overdueInstallments.length} قسط متأخر`, 'warning');
}

function generateInstallmentReport() {
    // تقرير شامل للأقساط
    const totalInstallments = installmentSales.length;
    const totalAmount = installmentSales.reduce((sum, installment) => sum + installment.totalWithInterest, 0);
    const paidAmount = installmentSales.reduce((sum, installment) => sum + installment.paidAmount, 0);
    const remainingAmount = installmentSales.reduce((sum, installment) => sum + installment.remainingAmount, 0);
    
    const report = {
        totalInstallments,
        totalAmount,
        paidAmount,
        remainingAmount,
        collectionRate: totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(2) : 0
    };
    
    showNotification(`تقرير الأقساط: ${report.totalInstallments} قسط، نسبة التحصيل ${report.collectionRate}%`, 'info');
}

function generateInventoryAnalysis() {
    const analysisDiv = document.getElementById('analysisResults');
    if (!analysisDiv) return;
    
    // تحليل المخزون
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => (p.fixedStock + p.movableStock) <= p.minStock);
    const zeroStockProducts = products.filter(p => (p.fixedStock + p.movableStock) === 0);
    const highValueProducts = products.filter(p => p.price > 100000);
    
    const totalInventoryValue = products.reduce((sum, p) => sum + ((p.fixedStock + p.movableStock) * p.cost), 0);
    const totalExpectedProfit = products.reduce((sum, p) => sum + ((p.fixedStock + p.movableStock) * (p.price - p.cost)), 0);
    
    // تحليل المبيعات
    const topSellingProducts = getTopSellingProducts(5);
    
    analysisDiv.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${totalProducts}</div>
                <div class="stat-label">إجمالي المنتجات</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${lowStockProducts.length}</div>
                <div class="stat-label">منتجات قليلة المخزون</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${zeroStockProducts.length}</div>
                <div class="stat-label">منتجات نفد مخزونها</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${highValueProducts.length}</div>
                <div class="stat-label">منتجات عالية القيمة</div>
            </div>
        </div>
        
        <div class="form-grid">
            <div class="card">
                <h3>📊 تحليل مالي</h3>
                <p><strong>قيمة المخزون:</strong> ${formatCurrency(totalInventoryValue)}</p>
                <p><strong>الربح المتوقع:</strong> ${formatCurrency(totalExpectedProfit)}</p>
                <p><strong>نسبة الربح:</strong> ${totalInventoryValue > 0 ? ((totalExpectedProfit / totalInventoryValue) * 100).toFixed(2) : 0}%</p>
            </div>
            
            <div class="card">
                <h3>🏆 أفضل المنتجات مبيعاً</h3>
                ${topSellingProducts.map((product, index) => `
                    <p>${index + 1}. ${product.name} - ${product.totalSales} مبيعة</p>
                `).join('')}
            </div>
        </div>
        
        ${lowStockProducts.length > 0 ? `
            <div class="card">
                <h3>⚠️ منتجات تحتاج إعادة تزويد</h3>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr><th>المنتج</th><th>المخزون الحالي</th><th>الحد الأدنى</th><th>الكمية المطلوبة</th></tr>
                        </thead>
                        <tbody>
                            ${lowStockProducts.map(product => {
                                const currentStock = product.fixedStock + product.movableStock;
                                const neededStock = Math.max(0, product.minStock - currentStock + 50);
                                return `
                                    <tr>
                                        <td>${product.name}</td>
                                        <td class="low-stock">${currentStock} ${product.unit}</td>
                                        <td>${product.minStock} ${product.unit}</td>
                                        <td><strong>${neededStock} ${product.unit}</strong></td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        ` : ''}
    `;
}

function getTopSellingProducts(limit = 5) {
    const productSalesMap = {};
    
    sales.forEach(sale => {
        sale.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                if (!productSalesMap[product.id]) {
                    productSalesMap[product.id] = {
                        id: product.id,
                        name: product.name,
                        totalSales: 0,
                        totalQuantity: 0
                    };
                }
                productSalesMap[product.id].totalSales++;
                productSalesMap[product.id].totalQuantity += item.quantity;
            }
        });
    });
    
    return Object.values(productSalesMap)
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, limit);
}

// ===========================================
// الوظائف المساعدة
// ===========================================
function formatCurrency(amount) {
    const currencySymbols = {
        'IQD': 'د.ع',
        'USD': '$',
        'EUR': '€'
    };
    
    const symbol = currencySymbols[settings.currency] || 'د.ع';
    return `${amount.toLocaleString('ar-EG')} ${symbol}`;
}

function saveData() {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('installmentSales', JSON.stringify(installmentSales));
    localStorage.setItem('movements', JSON.stringify(movements));
    localStorage.setItem('settings', JSON.stringify(settings));
}

function playNotificationSound() {
    if (!settings.audioAlerts) return;
    
    // إنشاء صوت تنبيه بسيط
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playSuccessSound() {
    if (!settings.audioAlerts) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// ===========================================
// إدارة النوافذ (للتطبيق المكتبي)
// ===========================================
function minimizeWindow() {
    // يعمل فقط في بيئة Electron
    if (window.electronAPI) {
        window.electronAPI.minimize();
    } else {
        showNotification('وظيفة التصغير متاحة فقط في التطبيق المكتبي', 'info');
    }
}

function toggleMaximize() {
    // يعمل فقط في بيئة Electron
    if (window.electronAPI) {
        window.electronAPI.toggleMaximize();
    } else {
        showNotification('وظيفة التكبير متاحة فقط في التطبيق المكتبي', 'info');
    }
}

function closeWindow() {
    // يعمل فقط في بيئة Electron
    if (window.electronAPI) {
        if (confirm('هل تريد إغلاق التطبيق؟')) {
            window.electronAPI.close();
        }
    } else {
        if (confirm('هل تريد إغلاق التطبيق؟')) {
            window.close();
        }
    }
}

// ===========================================
// معالج الأخطاء العام
// ===========================================
window.addEventListener('error', function(e) {
    console.error('خطأ في التطبيق:', e.error);
    showNotification('حدث خطأ غير متوقع. يرجى تحديث الصفحة.', 'error');
});

// ===========================================
// تنظيف البيانات عند إغلاق التطبيق
// ===========================================
window.addEventListener('beforeunload', function(e) {
    // حفظ البيانات قبل الإغلاق
    saveData();
});

// ===========================================
// دوال إضافية للتحسين
// ===========================================
function scheduleBackup() {
    showNotification('جدولة النسخ الاحتياطي (قيد التطوير)', 'info');
}

function importFromFile() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('يرجى اختيار ملف', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // يمكن إضافة المزيد من أنواع الاستيراد هنا
            if (data.products) {
                if (confirm('استيراد المنتجات؟')) {
                    products = [...products, ...data.products];
                    saveData();
                    updateProductsGrid();
                    updateProductsTable();
                }
            }
            
            if (data.customers) {
                if (confirm('استيراد العملاء؟')) {
                    customers = [...customers, ...data.customers];
                    saveData();
                    updateCustomersTable();
                }
            }
            
            showNotification('تم الاستيراد بنجاح', 'success');
            
        } catch (error) {
            showNotification('خطأ في قراءة الملف', 'error');
        }
    };
    
    reader.readAsText(file);
}

function exportSalesReport() {
    const fromDate = document.getElementById('salesReportFrom').value;
    const toDate = document.getElementById('salesReportTo').value;
    
    if (!fromDate || !toDate) {
        showNotification('يرجى تحديد نطاق التاريخ', 'error');
        return;
    }
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    
    const reportSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= from && saleDate <= to;
    });
    
    const reportData = {
        period: { from: fromDate, to: toDate },
        sales: reportSales,
        summary: {
            totalSales: reportSales.length,
            totalAmount: reportSales.reduce((sum, sale) => sum + sale.total, 0),
            averageOrder: reportSales.length > 0 ? reportSales.reduce((sum, sale) => sum + sale.total, 0) / reportSales.length : 0
        }
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `sales_report_${fromDate}_to_${toDate}.json`;
    link.click();
    
    showNotification('تم تصدير تقرير المبيعات', 'success');
}

// إضافة مستمع للتخزين المحلي لمراقبة التغييرات
window.addEventListener('storage', function(e) {
    if (e.key && e.key.startsWith('products') || e.key.startsWith('customers')) {
        // تحديث البيانات إذا تم تغييرها من نافذة أخرى
        location.reload();
    }
});

// دالة لتنظيف البيانات القديمة
function cleanupOldData() {
    // تنظيف المبيعات القديمة (أكثر من سنة)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const oldSalesCount = sales.filter(sale => new Date(sale.date) < oneYearAgo).length;
    
    if (oldSalesCount > 0) {
        if (confirm(`يوجد ${oldSalesCount} مبيعة قديمة (أكثر من سنة). هل تريد أرشفتها؟`)) {
            const oldSales = sales.filter(sale => new Date(sale.date) < oneYearAgo);
            sales = sales.filter(sale => new Date(sale.date) >= oneYearAgo);
            
            // حفظ المبيعات القديمة في ملف منفصل
            const dataStr = JSON.stringify(oldSales, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `archived_sales_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            saveData();
            showNotification(`تم أرشفة ${oldSalesCount} مبيعة قديمة`, 'success');
        }
    }
}

// تشغيل تنظيف البيانات عند البدء (مرة واحدة كل شهر)
const lastCleanup = localStorage.getItem('lastCleanup');
const now = new Date();
const monthAgo = new Date();
monthAgo.setMonth(monthAgo.getMonth() - 1);

if (!lastCleanup || new Date(lastCleanup) < monthAgo) {
    setTimeout(() => {
        cleanupOldData();
        localStorage.setItem('lastCleanup', now.toISOString());
    }, 5000); // تأخير 5 ثوان للسماح بتحميل التطبيق
}

console.log('نظام الكاشير المتكامل جاهز للاستخدام! 🏪');
console.log('تم تحميل جميع الوظائف بنجاح ✅');


// ملف import-export.js - وظائف الاستيراد والتصدير المتقدمة

// ===========================================
// تصدير البيانات بصيغ متعددة
// ===========================================

function exportToCSV(data, filename, headers) {
    if (!data || data.length === 0) {
        showNotification('لا توجد بيانات للتصدير', 'error');
        return;
    }
    
    let csvContent = '';
    
    // إضافة العناوين
    if (headers) {
        csvContent += headers.join(',') + '\n';
    }
    
    // إضافة البيانات
    data.forEach(row => {
        const values = Object.values(row).map(value => {
            // تنظيف البيانات وإضافة علامات التنصيص إذا احتوت على فواصل
            if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvContent += values.join(',') + '\n';
    });
    
    // تحويل إلى UTF-8 مع BOM للدعم العربي
    const BOM = '\uFEFF';
    const csvBlob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(csvBlob);
    link.download = filename;
    link.click();
    
    showNotification(`تم تصدير ${data.length} عنصر إلى ملف CSV`, 'success');
}

function exportToExcel(data, filename, sheetName = 'البيانات') {
    // تصدير بسيط لـ Excel باستخدام HTML table
    if (!data || data.length === 0) {
        showNotification('لا توجد بيانات للتصدير', 'error');
        return;
    }
    
    const headers = Object.keys(data[0]);
    
    let excelContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
              xmlns:x="urn:schemas-microsoft-com:office:excel" 
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="UTF-8">
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>${sheetName}</x:Name>
                            <x:WorksheetOptions>
                                <x:DisplayGridlines/>
                            </x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                th { background-color: #f2f2f2; font-weight: bold; }
            </style>
        </head>
        <body>
            <table>
                <thead>
                    <tr>
    `;
    
    headers.forEach(header => {
        excelContent += `<th>${header}</th>`;
    });
    
    excelContent += `
                    </tr>
                </thead>
                <tbody>
    `;
    
    data.forEach(row => {
        excelContent += '<tr>';
        headers.forEach(header => {
            excelContent += `<td>${row[header] || ''}</td>`;
        });
        excelContent += '</tr>';
    });
    
    excelContent += `
                </tbody>
            </table>
        </body>
        </html>
    `;
    
    const excelBlob = new Blob(['\ufeff', excelContent], {
        type: 'application/vnd.ms-excel;charset=utf-8;'
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(excelBlob);
    link.download = filename;
    link.click();
    
    showNotification(`تم تصدير ${data.length} عنصر إلى ملف Excel`, 'success');
}

// ===========================================
// تصدير المنتجات المحسن
// ===========================================
function exportProductsAdvanced() {
    const exportFormat = prompt('اختر صيغة التصدير:\n1 - JSON\n2 - CSV\n3 - Excel', '1');
    
    if (!exportFormat || !['1', '2', '3'].includes(exportFormat)) {
        return;
    }
    
    // إعداد البيانات للتصدير
    const exportData = products.map(product => ({
        'الاسم': product.name,
        'الباركود': product.barcode,
        'السعر': product.price,
        'التكلفة': product.cost,
        'الربح': product.price - product.cost,
        'التصنيف': product.category,
        'الوحدة': product.unit,
        'مخزن ثابت': product.fixedStock,
        'مخزن متحرك': product.movableStock,
        'إجمالي المخزون': product.fixedStock + product.movableStock,
        'الحد الأدنى': product.minStock,
        'الوصف': product.description,
        'تاريخ الإضافة': new Date(product.createdAt).toLocaleDateString('ar-EG')
    }));
    
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (exportFormat) {
        case '1': // JSON
            const jsonStr = JSON.stringify(exportData, null, 2);
            const jsonBlob = new Blob([jsonStr], { type: 'application/json' });
            
            const jsonLink = document.createElement('a');
            jsonLink.href = URL.createObjectURL(jsonBlob);
            jsonLink.download = `products_${timestamp}.json`;
            jsonLink.click();
            break;
            
        case '2': // CSV
            exportToCSV(exportData, `products_${timestamp}.csv`);
            break;
            
        case '3': // Excel
            exportToExcel(exportData, `products_${timestamp}.xls`, 'المنتجات');
            break;
    }
}

// ===========================================
// تصدير العملاء المحسن
// ===========================================
function exportCustomersAdvanced() {
    const exportFormat = prompt('اختر صيغة التصدير:\n1 - JSON\n2 - CSV\n3 - Excel', '1');
    
    if (!exportFormat || !['1', '2', '3'].includes(exportFormat)) {
        return;
    }
    
    // حساب إحصائيات العملاء
    const exportData = customers.map(customer => {
        const customerSales = sales.filter(s => s.customerId === customer.id);
        const totalPurchases = customerSales.reduce((sum, sale) => sum + sale.total, 0);
        const customerInstallments = installmentSales.filter(is => is.customerId === customer.id);
        const totalDebt = customerInstallments.reduce((sum, installment) => sum + installment.remainingAmount, 0);
        const lastSale = customerSales.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        return {
            'الاسم': customer.name,
            'الهاتف': customer.phone,
            'البريد الإلكتروني': customer.email,
            'العنوان': customer.address,
            'حد الائتمان': customer.creditLimit,
            'إجمالي المشتريات': totalPurchases,
            'الرصيد المستحق': totalDebt,
            'عدد الطلبات': customerSales.length,
            'آخر شراء': lastSale ? new Date(lastSale.date).toLocaleDateString('ar-EG') : 'لا يوجد',
            'الملاحظات': customer.notes,
            'تاريخ التسجيل': new Date(customer.createdAt).toLocaleDateString('ar-EG')
        };
    });
    
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (exportFormat) {
        case '1': // JSON
            const jsonStr = JSON.stringify(exportData, null, 2);
            const jsonBlob = new Blob([jsonStr], { type: 'application/json' });
            
            const jsonLink = document.createElement('a');
            jsonLink.href = URL.createObjectURL(jsonBlob);
            jsonLink.download = `customers_${timestamp}.json`;
            jsonLink.click();
            break;
            
        case '2': // CSV
            exportToCSV(exportData, `customers_${timestamp}.csv`);
            break;
            
        case '3': // Excel
            exportToExcel(exportData, `customers_${timestamp}.xls`, 'العملاء');
            break;
    }
}

// ===========================================
// تصدير المبيعات المحسن
// ===========================================
function exportSalesAdvanced() {
    const fromDate = prompt('من تاريخ (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    const toDate = prompt('إلى تاريخ (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    
    if (!fromDate || !toDate) {
        return;
    }
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    
    const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= from && saleDate <= to;
    });
    
    if (filteredSales.length === 0) {
        showNotification('لا توجد مبيعات في الفترة المحددة', 'error');
        return;
    }
    
    const exportFormat = prompt('اختر صيغة التصدير:\n1 - JSON\n2 - CSV\n3 - Excel', '1');
    
    if (!exportFormat || !['1', '2', '3'].includes(exportFormat)) {
        return;
    }
    
    // إعداد البيانات للتصدير
    const exportData = [];
    
    filteredSales.forEach(sale => {
        const customer = customers.find(c => c.id === sale.customerId);
        const customerName = customer ? customer.name : 'عميل نقدي';
        
        sale.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            const productName = product ? product.name : 'منتج محذوف';
            const profit = product ? (item.price - product.cost) * item.quantity : 0;
            
            exportData.push({
                'رقم الفاتورة': sale.id,
                'التاريخ': new Date(sale.date).toLocaleDateString('ar-EG'),
                'الوقت': new Date(sale.date).toLocaleTimeString('ar-EG'),
                'العميل': customerName,
                'المنتج': productName,
                'الكمية': item.quantity,
                'سعر الوحدة': item.price,
                'إجمالي السطر': item.quantity * item.price,
                'الربح': profit,
                'نوع البيع': sale.type === 'cash' ? 'نقدي' : 'أقساط'
            });
        });
    });
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `sales_${fromDate}_to_${toDate}`;
    
    switch (exportFormat) {
        case '1': // JSON
            const jsonStr = JSON.stringify(exportData, null, 2);
            const jsonBlob = new Blob([jsonStr], { type: 'application/json' });
            
            const jsonLink = document.createElement('a');
            jsonLink.href = URL.createObjectURL(jsonBlob);
            jsonLink.download = `${filename}.json`;
            jsonLink.click();
            break;
            
        case '2': // CSV
            exportToCSV(exportData, `${filename}.csv`);
            break;
            
        case '3': // Excel
            exportToExcel(exportData, `${filename}.xls`, 'المبيعات');
            break;
    }
}

// ===========================================
// استيراد منتجات من CSV
// ===========================================
function importProductsFromCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const csv = e.target.result;
            const lines = csv.split('\n');
            
            if (lines.length < 2) {
                showNotification('ملف CSV فارغ أو غير صحيح', 'error');
                return;
            }
            
            // قراءة العناوين
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            // التحقق من وجود الحقول المطلوبة
            const requiredFields = ['الاسم', 'السعر'];
            const missingFields = requiredFields.filter(field => !headers.includes(field));
            
            if (missingFields.length > 0) {
                showNotification(`حقول مطلوبة مفقودة: ${missingFields.join(', ')}`, 'error');
                return;
            }
            
            let importedCount = 0;
            let errorCount = 0;
            
            // معالجة كل صف
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                try {
                    const values = parseCSVLine(line);
                    const productData = {};
                    
                    headers.forEach((header, index) => {
                        productData[header] = values[index] || '';
                    });
                    
                    // تحويل البيانات إلى تنسيق المنتج
                    const product = {
                        id: Date.now() + Math.random(),
                        name: productData['الاسم'] || '',
                        barcode: productData['الباركود'] || generateBarcode(),
                        price: parseFloat(productData['السعر']) || 0,
                        cost: parseFloat(productData['التكلفة']) || 0,
                        category: productData['التصنيف'] || 'عام',
                        unit: productData['الوحدة'] || 'قطعة',
                        fixedStock: parseInt(productData['مخزن ثابت']) || 0,
                        movableStock: parseInt(productData['مخزن متحرك']) || 0,
                        minStock: parseInt(productData['الحد الأدنى']) || 10,
                        description: productData['الوصف'] || '',
                        createdAt: new Date().toISOString()
                    };
                    
                    // التحقق من صحة البيانات
                    if (product.name && product.price > 0) {
                        // التحقق من عدم التكرار
                        const existingProduct = products.find(p => 
                            p.name === product.name || 
                            (p.barcode && product.barcode && p.barcode === product.barcode)
                        );
                        
                        if (!existingProduct) {
                            products.push(product);
                            importedCount++;
                        }
                    } else {
                        errorCount++;
                    }
                    
                } catch (error) {
                    errorCount++;
                }
            }
            
            saveData();
            updateProductsGrid();
            updateProductsTable();
            
            showNotification(
                `تم استيراد ${importedCount} منتج بنجاح، ${errorCount} منتج بها أخطاء`, 
                importedCount > 0 ? 'success' : 'warning'
            );
        };
        
        reader.readAsText(file, 'UTF-8');
    };
    
    input.click();
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// ===========================================
// استيراد عملاء من CSV
// ===========================================
function importCustomersFromCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const csv = e.target.result;
            const lines = csv.split('\n');
            
            if (lines.length < 2) {
                showNotification('ملف CSV فارغ أو غير صحيح', 'error');
                return;
            }
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            // التحقق من وجود الحقول المطلوبة
            if (!headers.includes('الاسم')) {
                showNotification('حقل "الاسم" مطلوب', 'error');
                return;
            }
            
            let importedCount = 0;
            let errorCount = 0;
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                try {
                    const values = parseCSVLine(line);
                    const customerData = {};
                    
                    headers.forEach((header, index) => {
                        customerData[header] = values[index] || '';
                    });
                    
                    const customer = {
                        id: Date.now() + Math.random(),
                        name: customerData['الاسم'] || '',
                        phone: customerData['الهاتف'] || '',
                        email: customerData['البريد الإلكتروني'] || '',
                        address: customerData['العنوان'] || '',
                        creditLimit: parseFloat(customerData['حد الائتمان']) || 0,
                        notes: customerData['الملاحظات'] || '',
                        createdAt: new Date().toISOString()
                    };
                    
                    if (customer.name) {
                        // التحقق من عدم التكرار
                        const existingCustomer = customers.find(c => 
                            c.name === customer.name || 
                            (c.phone && customer.phone && c.phone === customer.phone)
                        );
                        
                        if (!existingCustomer) {
                            customers.push(customer);
                            importedCount++;
                        }
                    } else {
                        errorCount++;
                    }
                    
                } catch (error) {
                    errorCount++;
                }
            }
            
            saveData();
            updateCustomersTable();
            
            showNotification(
                `تم استيراد ${importedCount} عميل بنجاح، ${errorCount} عميل بها أخطاء`, 
                importedCount > 0 ? 'success' : 'warning'
            );
        };
        
        reader.readAsText(file, 'UTF-8');
    };
    
    input.click();
}

// ===========================================
// تصدير تقارير شاملة
// ===========================================
function exportComprehensiveReport() {
    const reportData = {
        تاريخ_التقرير: new Date().toLocaleDateString('ar-EG'),
        معلومات_عامة: {
            اسم_المتجر: settings.storeName,
            عدد_المنتجات: products.length,
            عدد_العملاء: customers.length,
            عدد_المبيعات: sales.length,
            عدد_الأقساط: installmentSales.length
        },
        إحصائيات_المبيعات: calculateSalesStatistics(),
        إحصائيات_المخزون: calculateInventoryStatistics(),
        إحصائيات_العملاء: calculateCustomerStatistics(),
        إحصائيات_الأقساط: calculateInstallmentStatistics(),
        أفضل_المنتجات: getTopSellingProducts(10),
        أفضل_العملاء: getTopCustomers(10),
        تحليل_الأرباح: calculateProfitAnalysis()
    };
    
    const jsonStr = JSON.stringify(reportData, null, 2);
    const jsonBlob = new Blob([jsonStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(jsonBlob);
    link.download = `comprehensive_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('تم تصدير التقرير الشامل', 'success');
}

function calculateSalesStatistics() {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisYear = new Date(today.getFullYear(), 0, 1);
    
    const todaySales = sales.filter(s => new Date(s.date) >= new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    const monthSales = sales.filter(s => new Date(s.date) >= thisMonth);
    const yearSales = sales.filter(s => new Date(s.date) >= thisYear);
    
    return {
        مبيعات_اليوم: {
            عدد_الفواتير: todaySales.length,
            إجمالي_المبلغ: todaySales.reduce((sum, sale) => sum + sale.total, 0)
        },
        مبيعات_الشهر: {
            عدد_الفواتير: monthSales.length,
            إجمالي_المبلغ: monthSales.reduce((sum, sale) => sum + sale.total, 0)
        },
        مبيعات_السنة: {
            عدد_الفواتير: yearSales.length,
            إجمالي_المبلغ: yearSales.reduce((sum, sale) => sum + sale.total, 0)
        },
        متوسط_قيمة_الفاتورة: sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length : 0
    };
}

function calculateInventoryStatistics() {
    const totalValue = products.reduce((sum, p) => sum + ((p.fixedStock + p.movableStock) * p.cost), 0);
    const expectedProfit = products.reduce((sum, p) => sum + ((p.fixedStock + p.movableStock) * (p.price - p.cost)), 0);
    const lowStockProducts = products.filter(p => (p.fixedStock + p.movableStock) <= p.minStock);
    const zeroStockProducts = products.filter(p => (p.fixedStock + p.movableStock) === 0);
    
    return {
        قيمة_المخزون_الإجمالية: totalValue,
        الربح_المتوقع: expectedProfit,
        نسبة_الربح: totalValue > 0 ? ((expectedProfit / totalValue) * 100) : 0,
        منتجات_قليلة_المخزون: lowStockProducts.length,
        منتجات_نفد_مخزونها: zeroStockProducts.length,
        متوسط_قيمة_المنتج: products.length > 0 ? totalValue / products.length : 0
    };
}

function calculateCustomerStatistics() {
    const totalDebt = installmentSales.reduce((sum, installment) => sum + installment.remainingAmount, 0);
    const activeCustomers = customers.filter(customer => {
        const customerSales = sales.filter(s => s.customerId === customer.id);
        const lastSale = customerSales.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        if (!lastSale) return false;
        const lastSaleDate = new Date(lastSale.date);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return lastSaleDate >= thirtyDaysAgo;
    });
    
    return {
        إجمالي_العملاء: customers.length,
        عملاء_نشطون: activeCustomers.length,
        إجمالي_الديون: totalDebt,
        متوسط_الدين_لكل_عميل: customers.length > 0 ? totalDebt / customers.length : 0
    };
}

function calculateInstallmentStatistics() {
    const totalAmount = installmentSales.reduce((sum, installment) => sum + installment.totalWithInterest, 0);
    const paidAmount = installmentSales.reduce((sum, installment) => sum + installment.paidAmount, 0);
    const overdueInstallments = installmentSales.filter(installment => 
        installment.remainingAmount > 0 && new Date(installment.nextPaymentDate) < new Date()
    );
    
    return {
        إجمالي_الأقساط: installmentSales.length,
        إجمالي_المبلغ: totalAmount,
        المبلغ_المدفوع: paidAmount,
        المبلغ_المتبقي: totalAmount - paidAmount,
        نسبة_التحصيل: totalAmount > 0 ? ((paidAmount / totalAmount) * 100) : 0,
        أقساط_متأخرة: overdueInstallments.length
    };
}

function getTopCustomers(limit = 10) {
    const customerStats = customers.map(customer => {
        const customerSales = sales.filter(s => s.customerId === customer.id);
        const totalPurchases = customerSales.reduce((sum, sale) => sum + sale.total, 0);
        
        return {
            الاسم: customer.name,
            إجمالي_المشتريات: totalPurchases,
            عدد_الطلبات: customerSales.length
        };
    });
    
    return customerStats
        .sort((a, b) => b.إجمالي_المشتريات - a.إجمالي_المشتريات)
        .slice(0, limit);
}

function calculateProfitAnalysis() {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalCost = sales.reduce((sum, sale) => {
        return sum + sale.items.reduce((itemSum, item) => {
            const product = products.find(p => p.id === item.productId);
            return itemSum + (product ? product.cost * item.quantity : 0);
        }, 0);
    }, 0);
    
    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;
    
    return {
        إجمالي_الإيرادات: totalRevenue,
        إجمالي_التكلفة: totalCost,
        إجمالي_الربح: totalProfit,
        هامش_الربح: profitMargin
    };
}

// ===========================================
// مساعدات إضافية
// ===========================================

// ربط الوظائف الجديدة بالأزرار الموجودة
document.addEventListener('DOMContentLoaded', function() {
    // استبدال وظائف التصدير القديمة بالجديدة
    if (window.exportProducts) {
        window.exportProducts = exportProductsAdvanced;
    }
    if (window.exportCustomers) {
        window.exportCustomers = exportCustomersAdvanced;
    }
    if (window.exportSalesReport) {
        window.exportSalesReport = exportSalesAdvanced;
    }
});

// إضافة أزرار استيراد CSV في الواجهة
function addImportButtons() {
    // يمكن إضافة أزرار في الواجهة لاستيراد CSV
    console.log('وظائف الاستيراد والتصدير المتقدمة جاهزة');
}

// تصدير الوظائف للاستخدام العام
window.exportProductsAdvanced = exportProductsAdvanced;
window.exportCustomersAdvanced = exportCustomersAdvanced;
window.exportSalesAdvanced = exportSalesAdvanced;
window.importProductsFromCSV = importProductsFromCSV;
window.importCustomersFromCSV = importCustomersFromCSV;
window.exportComprehensiveReport = exportComprehensiveReport;

console.log('تم تحميل وظائف الاستيراد والتصدير المتقدمة ✅');


// ===============================================
// وحدة التحكم في الشريط العلوي المخصص
// Custom Titlebar Controller
// ===============================================

class CustomTitlebar {
    constructor() {
        this.isMaximized = false;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.startLeft = 0;
        this.startTop = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateWindowState();
        this.startStatusMonitoring();
        
        // إضافة كلاس التحميل
        document.querySelector('.custom-titlebar')?.classList.add('loading');
        
        setTimeout(() => {
            document.querySelector('.custom-titlebar')?.classList.remove('loading');
        }, 500);
    }
    
    setupEventListeners() {
        // أزرار النافذة
        const minimizeBtn = document.getElementById('minimizeBtn');
        const maximizeBtn = document.getElementById('maximizeBtn');
        const closeBtn = document.querySelector('.close-btn');
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.minimizeWindow());
        }
        
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => this.toggleMaximize());
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeWindow());
        }
        
        // منطقة السحب
        const dragRegion = document.querySelector('.titlebar-drag-region');
        if (dragRegion) {
            dragRegion.addEventListener('mousedown', (e) => this.startDrag(e));
            dragRegion.addEventListener('dblclick', () => this.toggleMaximize());
        }
        
        // تتبع تركيز النافذة
        window.addEventListener('focus', () => this.updateFocusState(true));
        window.addEventListener('blur', () => this.updateFocusState(false));
        
        // مراقبة تغيير حجم النافذة
        window.addEventListener('resize', () => this.updateWindowState());
        
        // منع القائمة السياقية على الشريط
        document.querySelector('.custom-titlebar')?.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    startDrag(e) {
        if (this.isMaximized || !this.canDrag()) return;
        
        this.isDragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startLeft = window.screenX;
        this.startTop = window.screenY;
        
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.stopDrag.bind(this));
        
        // منع التحديد أثناء السحب
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'move';
    }
    
    drag(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;
        
        if (window.electronAPI) {
            // في بيئة Electron
            window.electronAPI.moveWindow(
                this.startLeft + deltaX,
                this.startTop + deltaY
            );
        } else {
            // في المتصفح (محدود)
            if (window.moveTo) {
                window.moveTo(
                    this.startLeft + deltaX,
                    this.startTop + deltaY
                );
            }
        }
    }
    
    stopDrag() {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.drag);
        document.removeEventListener('mouseup', this.stopDrag);
        
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
    }
    
    canDrag() {
        // التحقق من إمكانية السحب
        return !document.fullscreenElement;
    }
    
    minimizeWindow() {
        if (window.electronAPI) {
            window.electronAPI.minimize();
        } else {
            // في المتصفح
            if (confirm('تصغير النافذة؟')) {
                window.blur();
            }
        }
        
        this.showAction('minimize');
    }
    
    toggleMaximize() {
        if (window.electronAPI) {
            window.electronAPI.toggleMaximize();
        } else {
            // في المتصفح
            if (!this.isMaximized) {
                this.maximizeWindow();
            } else {
                this.restoreWindow();
            }
        }
        
        this.showAction('maximize');
    }
    
    maximizeWindow() {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
            this.isMaximized = true;
        }
        this.updateMaximizeIcon();
    }
    
    restoreWindow() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            this.isMaximized = false;
        }
        this.updateMaximizeIcon();
    }
    
    closeWindow() {
        if (window.electronAPI) {
            window.electronAPI.close();
        } else {
            if (confirm('إغلاق التطبيق؟')) {
                window.close();
            }
        }
        
        this.showAction('close');
    }
    
    updateMaximizeIcon() {
        const maximizeIcon = document.getElementById('maximizeIcon');
        if (!maximizeIcon) return;
        
        if (this.isMaximized) {
            // أيقونة الاستعادة
            maximizeIcon.innerHTML = `
                <rect x="2" y="4" width="6" height="6" stroke="currentColor" stroke-width="1" fill="none"/>
                <rect x="4" y="2" width="6" height="6" stroke="currentColor" stroke-width="1" fill="none"/>
            `;
        } else {
            // أيقونة التكبير
            maximizeIcon.innerHTML = `
                <rect x="2" y="2" width="8" height="8" stroke="currentColor" stroke-width="1" fill="none"/>
            `;
        }
        
        document.querySelector('.custom-titlebar')?.classList.toggle('maximized', this.isMaximized);
    }
    
    updateWindowState() {
        // تحديث حالة النافذة
        const titlebar = document.querySelector('.custom-titlebar');
        if (!titlebar) return;
        
        if (window.electronAPI) {
            // الحصول على حالة النافذة من Electron
            window.electronAPI.getWindowState().then(state => {
                this.isMaximized = state.isMaximized;
                this.updateMaximizeIcon();
            });
        } else {
            // في المتصفح
            this.isMaximized = !!document.fullscreenElement;
            this.updateMaximizeIcon();
        }
    }
    
    updateFocusState(focused) {
        const titlebar = document.querySelector('.custom-titlebar');
        if (!titlebar) return;
        
        document.body.classList.toggle('window-focused', focused);
        document.body.classList.toggle('window-unfocused', !focused);
        titlebar.classList.toggle('focused', focused);
        titlebar.classList.toggle('unfocused', !focused);
    }
    
    startStatusMonitoring() {
        // مراقبة حالة التطبيق
        setInterval(() => {
            this.updateAppStatus();
        }, 5000);
    }
    
    updateAppStatus() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        if (!statusIndicator || !statusText) return;
        
        // فحص حالة الاتصال
        const isOnline = navigator.onLine;
        const hasData = localStorage.getItem('products') !== null;
        
        if (isOnline && hasData) {
            statusIndicator.style.background = '#2ecc71';
            statusText.textContent = 'نشط';
        } else if (!isOnline) {
            statusIndicator.style.background = '#f39c12';
            statusText.textContent = 'غير متصل';
        } else {
            statusIndicator.style.background = '#e74c3c';
            statusText.textContent = 'خطأ';
        }
    }
    
    showAction(action) {
        // إظهار تأثير مرئي للإجراء
        const titlebar = document.querySelector('.custom-titlebar');
        if (!titlebar) return;
        
        titlebar.classList.add(`action-${action}`);
        
        setTimeout(() => {
            titlebar.classList.remove(`action-${action}`);
        }, 300);
    }
    
    // تخصيص مظهر الشريط
    setTheme(theme = 'default') {
        const titlebar = document.querySelector('.custom-titlebar');
        if (!titlebar) return;
        
        // إزالة جميع فئات الثيمات
        titlebar.classList.remove('theme-dark', 'theme-light', 'theme-colored');
        
        switch (theme) {
            case 'dark':
                titlebar.classList.add('theme-dark');
                titlebar.style.background = 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)';
                break;
                
            case 'light':
                titlebar.classList.add('theme-light');
                titlebar.style.background = 'linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%)';
                titlebar.style.color = '#2c3e50';
                break;
                
            case 'colored':
                titlebar.classList.add('theme-colored');
                titlebar.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                break;
                
            default:
                titlebar.style.background = '';
                titlebar.style.color = '';
        }
    }
    
    // إضافة تنبيه في الشريط
    showTitlebarNotification(message, type = 'info', duration = 3000) {
        const titlebar = document.querySelector('.titlebar-left');
        if (!titlebar) return;
        
        const notification = document.createElement('div');
        notification.className = `titlebar-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: absolute;
            top: 45px;
            left: 15px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 10001;
            animation: slideDown 0.3s ease;
        `;
        
        if (type === 'error') {
            notification.style.background = 'rgba(231, 76, 60, 0.9)';
        } else if (type === 'success') {
            notification.style.background = 'rgba(46, 204, 113, 0.9)';
        } else if (type === 'warning') {
            notification.style.background = 'rgba(243, 156, 18, 0.9)';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }
    
    // تحديث معلومات التطبيق
    updateAppInfo(info) {
        const appTitle = document.querySelector('.app-title');
        const appIcon = document.querySelector('.app-icon');
        
        if (info.title && appTitle) {
            appTitle.textContent = info.title;
        }
        
        if (info.icon && appIcon) {
            appIcon.textContent = info.icon;
        }
    }
}

// ===============================================
// مدير إعدادات الساعة الرقمية
// ===============================================

class ClockSettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }
    
    init() {
        this.applySettings();
        this.setupEventListeners();
    }
    
    loadSettings() {
        const defaultSettings = {
            textColor: '#ffffff',
            bgColor: '#667eea',
            borderColor: '#764ba2',
            fontSize: 16,
            timeFormat: '12',
            showSeconds: true,
            showDate: true,
            showGlow: false,
            showBlink: false,
            style: 'modern'
        };
        
        const saved = localStorage.getItem('clockSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }
    
    saveSettings() {
        localStorage.setItem('clockSettings', JSON.stringify(this.settings));
    }
    
    applySettings() {
        const clock = document.querySelector('.digital-clock');
        if (!clock) return;
        
        // تطبيق الألوان والأنماط
        clock.style.color = this.settings.textColor;
        clock.style.background = this.settings.bgColor;
        clock.style.borderColor = this.settings.borderColor;
        clock.style.fontSize = this.settings.fontSize + 'px';
        
        // تطبيق الكلاسات
        clock.className = 'digital-clock';
        clock.classList.add(this.settings.style);
        
        if (this.settings.showGlow) clock.classList.add('glow');
        if (this.settings.showBlink) clock.classList.add('blink');
        
        // تحديث عرض الوقت
        this.updateTimeDisplay();
    }
    
    updateTimeDisplay() {
        const timeDisplay = document.getElementById('timeDisplay');
        const amPmDisplay = document.getElementById('amPmDisplay');
        const dateDisplay = document.getElementById('dateDisplay');
        
        if (!timeDisplay) return;
        
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        let timeString = '';
        let ampm = '';
        
        if (this.settings.timeFormat === '12') {
            ampm = hours >= 12 ? 'م' : 'ص';
            if (hours > 12) hours -= 12;
            if (hours === 0) hours = 12;
        }
        
        timeString = `${hours.toString().padStart(2, '0')}:${minutes}`;
        if (this.settings.showSeconds) {
            timeString += `:${seconds}`;
        }
        
        timeDisplay.textContent = timeString;
        
        if (amPmDisplay) {
            amPmDisplay.textContent = ampm;
            amPmDisplay.style.display = this.settings.timeFormat === '12' ? 'block' : 'none';
        }
        
        if (dateDisplay) {
            dateDisplay.style.display = this.settings.showDate ? 'block' : 'none';
        }
    }
    
    setupEventListeners() {
        // تحديث الساعة كل ثانية
        setInterval(() => {
            this.updateTimeDisplay();
        }, 1000);
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySettings();
    }
}

// ===============================================
// تأثيرات إضافية للشريط العلوي
// ===============================================

class TitlebarEffects {
    static addRippleEffect(element, event) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    static showWindowAnimation(type) {
        const titlebar = document.querySelector('.custom-titlebar');
        if (!titlebar) return;
        
        titlebar.style.animation = `window-${type} 0.3s ease`;
        
        setTimeout(() => {
            titlebar.style.animation = '';
        }, 300);
    }
}

// ===============================================
// تهيئة النظام
// ===============================================

// إنشاء مثيلات عند تحميل الصفحة
let customTitlebar;
let clockSettingsManager;

document.addEventListener('DOMContentLoaded', function() {
    customTitlebar = new CustomTitlebar();
    clockSettingsManager = new ClockSettingsManager();
    
    // إضافة أنماط CSS إضافية
    const additionalStyles = document.createElement('style');
    additionalStyles.textContent = `
        @keyframes ripple-animation {
            to { transform: scale(4); opacity: 0; }
        }
        
        @keyframes window-minimize {
            to { transform: scale(0.8); opacity: 0; }
        }
        
        @keyframes window-maximize {
            from { transform: scale(0.9); }
            to { transform: scale(1); }
        }
        
        @keyframes slideDown {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideUp {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(-20px); opacity: 0; }
        }
        
        .custom-titlebar.action-minimize {
            animation: window-minimize 0.3s ease;
        }
        
        .custom-titlebar.action-maximize {
            animation: window-maximize 0.3s ease;
        }
        
        .custom-titlebar.action-close {
            animation: window-minimize 0.3s ease;
        }
    `;
    
    document.head.appendChild(additionalStyles);
    
    // إضافة تأثير الضغط للأزرار
    document.querySelectorAll('.titlebar-btn').forEach(btn => {
        btn.addEventListener('mousedown', function(e) {
            TitlebarEffects.addRippleEffect(this, e);
        });
    });
    
    console.log('Custom Titlebar initialized successfully! 🎯');
});

// تصدير الكلاسات للاستخدام العام
window.CustomTitlebar = CustomTitlebar;
window.ClockSettingsManager = ClockSettingsManager;
window.TitlebarEffects = TitlebarEffects;
