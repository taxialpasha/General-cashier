/**
 * نظام الكاشير المتكامل المتطور - إصدار محدث
 * إصدار 2.0 - JavaScript
 */

// ======================================================================
// المتغيرات العامة والإعدادات
// ======================================================================

class POSSystem {
    constructor() {
        this.version = '2.0.0';
        this.isLoading = true;
        this.currentUser = null;
        this.currentModule = 'dashboard';
        this.sidebarCollapsed = false;
        
        // البيانات المحلية
        this.data = {
            products: [],
            customers: [],
            suppliers: [],
            sales: [],
            installmentSales: [],
            returns: [],
            expenses: [],
            inventory: [],
            users: [],
            settings: {},
            categories: [],
            warehouses: []
        };
        
        // عربة التسوق
        this.cart = {
            items: [],
            customer: null,
            discount: 0,
            tax: 0,
            total: 0
        };
        
        // إعدادات النظام
        this.config = {
            currency: 'IQD',
            currencySymbol: 'د.ع',
            locale: 'ar-IQ',
            timezone: 'Asia/Baghdad',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h',
            taxRate: 0,
            defaultDiscount: 0,
            autoSave: true,
            printAfterSale: true,
            soundEnabled: true,
            theme: 'light'
        };
        
        // حالة التطبيق
        this.state = {
            isOnline: navigator.onLine,
            lastSync: null,
            hasChanges: false
        };
        
        // بدء التهيئة
        this.init();
    }
    
    // ======================================================================
    // التهيئة الأساسية
    // ======================================================================
    
    async init() {
        console.log('بدء تهيئة النظام...');
        
        try {
            // عرض شاشة التحميل مع التقدم
            await this.showLoadingScreen();
            
            // تحميل البيانات المحفوظة
            await this.loadStoredData();
            console.log('تم تحميل البيانات المحفوظة');
            
            // تهيئة الفئات والمخازن
            await this.initializeCategories();
            await this.initializeWarehouses();
            console.log('تم تهيئة الفئات والمخازن');
            
            // إعداد مستمعي الأحداث
            await this.setupEventListeners();
            console.log('تم إعداد مستمعي الأحداث');
            
            // تهيئة الوحدات
            await this.initializeModules();
            console.log('تم تهيئة الوحدات');
            
            // بدء التحديثات المباشرة
            await this.startRealTimeUpdates();
            console.log('تم بدء التحديثات المباشرة');
            
            // إخفاء شاشة التحميل
            await this.hideLoadingScreen();
            console.log('تم إخفاء شاشة التحميل');
            
            // إشعار النجاح
            this.showNotification('تم تحميل النظام بنجاح', 'success');
            console.log(`تم تهيئة النظام بنجاح - الإصدار ${this.version}`);
            
            this.isLoading = false;
            
        } catch (error) {
            console.error('خطأ في تهيئة النظام:', error);
            this.handleInitializationError(error);
        }
    }
    
    async showLoadingScreen() {
        console.log('عرض شاشة التحميل...');
        
        const progressBar = document.getElementById('loadingProgress');
        const loadingScreen = document.getElementById('loadingScreen');
        
        // التأكد من وجود العناصر
        if (!progressBar || !loadingScreen) {
            console.error('عناصر شاشة التحميل غير موجودة');
            return;
        }
        
        // التأكد من ظهور شاشة التحميل
        loadingScreen.style.display = 'flex';
        loadingScreen.classList.remove('hidden');
        
        const steps = [
            'تحميل البيانات المحفوظة...',
            'تهيئة الفئات والمخازن...',
            'إعداد واجهة المستخدم...',
            'تحميل الوحدات...',
            'بدء التحديثات المباشرة...',
            'اكتمل التحميل...'
        ];
        
        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            const progress = ((i + 1) / steps.length) * 100;
            progressBar.style.width = `${progress}%`;
            console.log(`التقدم: ${progress}% - ${steps[i]}`);
        }
    }
    
    async hideLoadingScreen() {
        console.log('إخفاء شاشة التحميل...');
        
        return new Promise((resolve) => {
            const loadingScreen = document.getElementById('loadingScreen');
            
            if (!loadingScreen) {
                console.error('شاشة التحميل غير موجودة');
                resolve();
                return;
            }
            
            // إضافة كلاس الإخفاء
            loadingScreen.classList.add('hidden');
            
            // إخفاء العنصر بعد انتهاء الحركة
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                console.log('تم إخفاء شاشة التحميل نهائياً');
                resolve();
            }, 500);
        });
    }
    
    handleInitializationError(error) {
        console.error('خطأ في التهيئة:', error);
        
        // إخفاء شاشة التحميل حتى لو حدث خطأ
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        // عرض رسالة خطأ
        this.showErrorPage(error);
    }
    
    showErrorPage(error) {
        const body = document.body;
        body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                text-align: center;
                padding: 20px;
                font-family: 'Cairo', sans-serif;
            ">
                <div style="
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    max-width: 500px;
                ">
                    <i class="fas fa-exclamation-triangle" style="
                        font-size: 64px;
                        color: #dc2626;
                        margin-bottom: 20px;
                    "></i>
                    <h2 style="color: #dc2626; margin-bottom: 15px;">خطأ في تحميل النظام</h2>
                    <p style="color: #6b7280; margin-bottom: 20px;">
                        عذراً، حدث خطأ أثناء تحميل نظام الكاشير. يرجى المحاولة مرة أخرى.
                    </p>
                    <div style="
                        background: #f3f4f6;
                        padding: 15px;
                        border-radius: 5px;
                        margin-bottom: 20px;
                        text-align: right;
                        direction: rtl;
                    ">
                        <strong>تفاصيل الخطأ:</strong><br>
                        <code style="color: #dc2626;">${error.message}</code>
                    </div>
                    <button onclick="location.reload()" style="
                        background: #4f46e5;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">
                        إعادة تحميل الصفحة
                    </button>
                </div>
            </div>
        `;
    }
    
    loadStoredData() {
        try {
            console.log('تحميل البيانات المحفوظة...');
            
            // تحميل البيانات من localStorage
            Object.keys(this.data).forEach(key => {
                const stored = localStorage.getItem(`pos_${key}`);
                if (stored) {
                    try {
                        this.data[key] = JSON.parse(stored);
                    } catch (e) {
                        console.warn(`خطأ في تحليل البيانات: ${key}`, e);
                        this.data[key] = [];
                    }
                }
            });
            
            // تحميل الإعدادات
            const storedConfig = localStorage.getItem('pos_config');
            if (storedConfig) {
                try {
                    this.config = { ...this.config, ...JSON.parse(storedConfig) };
                } catch (e) {
                    console.warn('خطأ في تحليل الإعدادات', e);
                }
            }
            
            // تحميل حالة المستخدم
            const storedUser = localStorage.getItem('pos_current_user');
            if (storedUser) {
                try {
                    this.currentUser = JSON.parse(storedUser);
                } catch (e) {
                    console.warn('خطأ في تحليل بيانات المستخدم', e);
                    this.currentUser = this.createDefaultUser();
                }
            } else {
                this.currentUser = this.createDefaultUser();
            }
            
            // إذا لم تكن هناك بيانات، إنشاء بيانات افتراضية
            if (this.data.categories.length === 0 || this.data.warehouses.length === 0) {
                this.initializeDefaultData();
            }
            
            console.log('تم تحميل البيانات بنجاح');
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            this.initializeDefaultData();
        }
    }
    
    createDefaultUser() {
        return {
            id: 1,
            name: 'المدير العام',
            role: 'admin',
            permissions: ['all'],
            avatar: null
        };
    }
    
    initializeDefaultData() {
        console.log('إنشاء البيانات الافتراضية...');
        
        // بيانات افتراضية للتطبيق
        this.data.categories = [
            { id: 1, name: 'إلكترونيات', icon: 'fas fa-laptop', color: '#3b82f6' },
            { id: 2, name: 'ملابس', icon: 'fas fa-tshirt', color: '#ef4444' },
            { id: 3, name: 'طعام ومشروبات', icon: 'fas fa-utensils', color: '#22c55e' },
            { id: 4, name: 'كتب ومجلات', icon: 'fas fa-book', color: '#f59e0b' },
            { id: 5, name: 'منزل وحديقة', icon: 'fas fa-home', color: '#8b5cf6' }
        ];
        
        this.data.warehouses = [
            { id: 1, name: 'المخزن الرئيسي', location: 'الطابق الأرضي', isDefault: true },
            { id: 2, name: 'مخزن المعرض', location: 'الطابق الأول', isDefault: false }
        ];
        
        // بعض المنتجات التجريبية
        this.data.products = [
            {
                id: 1,
                name: 'لابتوب ديل',
                barcode: '1234567890123',
                category: 1,
                brand: 'Dell',
                costPrice: 800000,
                salePrice: 1000000,
                stock: 10,
                minStock: 2,
                warehouse: 1,
                image: null,
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'قميص قطني',
                barcode: '2345678901234',
                category: 2,
                brand: 'Local Brand',
                costPrice: 15000,
                salePrice: 25000,
                stock: 50,
                minStock: 10,
                warehouse: 1,
                image: null,
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: 'عصير برتقال',
                barcode: '3456789012345',
                category: 3,
                brand: 'Fresh',
                costPrice: 2000,
                salePrice: 3000,
                stock: 100,
                minStock: 20,
                warehouse: 1,
                image: null,
                status: 'active',
                createdAt: new Date().toISOString()
            }
        ];
        
        // عملاء تجريبيون
        this.data.customers = [
            {
                id: 1,
                name: 'أحمد محمد',
                phone: '07901234567',
                email: 'ahmed@example.com',
                type: 'regular',
                loyaltyPoints: 150,
                totalPurchases: 500000,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'فاطمة علي',
                phone: '07912345678',
                email: 'fatima@example.com',
                type: 'vip',
                loyaltyPoints: 500,
                totalPurchases: 1500000,
                createdAt: new Date().toISOString()
            }
        ];
        
        this.saveAllData();
        console.log('تم إنشاء البيانات الافتراضية');
    }
    
    async initializeCategories() {
        const categorySelects = document.querySelectorAll('#categoryFilter, #productCategoryFilter, #productCategory');
        categorySelects.forEach(select => {
            if (select) {
                select.innerHTML = '<option value="">جميع الفئات</option>';
                this.data.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    select.appendChild(option);
                });
            }
        });
    }
    
    async initializeWarehouses() {
        const warehouseSelects = document.querySelectorAll('#productWarehouse');
        warehouseSelects.forEach(select => {
            if (select) {
                select.innerHTML = '';
                this.data.warehouses.forEach(warehouse => {
                    const option = document.createElement('option');
                    option.value = warehouse.id;
                    option.textContent = warehouse.name;
                    if (warehouse.isDefault) option.selected = true;
                    select.appendChild(option);
                });
            }
        });
    }
    
    setupEventListeners() {
        console.log('إعداد مستمعي الأحداث...');
        
        // الأحداث العامة
        window.addEventListener('online', () => this.handleConnectionChange(true));
        window.addEventListener('offline', () => this.handleConnectionChange(false));
        window.addEventListener('beforeunload', () => this.handleBeforeUnload());
        
        // أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // أحداث البحث
        const productSearch = document.getElementById('productSearch');
        if (productSearch) {
            productSearch.addEventListener('input', 
                this.debounce((e) => this.searchProducts(e.target.value), 300));
        }
        
        // أحداث الفلترة
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterProducts());
        }
        
        // أحداث النماذج
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
        }
        
        // أحداث الأسعار
        const costPriceInput = document.getElementById('productCostPrice');
        const salePriceInput = document.getElementById('productSalePrice');
        
        if (costPriceInput) {
            costPriceInput.addEventListener('input', () => this.calculateProfitMargin());
        }
        if (salePriceInput) {
            salePriceInput.addEventListener('input', () => this.calculateProfitMargin());
        }
        
        console.log('تم إعداد مستمعي الأحداث');
    }
    
    // ======================================================================
    // إدارة الوحدات
    // ======================================================================
    
    async initializeModules() {
        console.log('تهيئة الوحدات...');
        
        this.showModule('dashboard');
        await this.loadDashboardData();
        await this.loadProductsForPOS();
        
        console.log('تم تهيئة الوحدات');
    }
    
    showModule(moduleName) {
        // إخفاء جميع الوحدات
        document.querySelectorAll('.module').forEach(module => {
            module.classList.remove('active');
        });
        
        // إزالة التحديد من جميع الروابط
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // عرض الوحدة المحددة
        const targetModule = document.getElementById(moduleName);
        if (targetModule) {
            targetModule.classList.add('active');
            this.currentModule = moduleName;
        }
        
        // تحديد الرابط النشط
        const activeLink = document.querySelector(`[onclick="showModule('${moduleName}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // تحميل بيانات الوحدة
        this.loadModuleData(moduleName);
    }
    
    async loadModuleData(moduleName) {
        switch (moduleName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'pos':
                await this.loadProductsForPOS();
                break;
            case 'products':
                await this.loadProductsTable();
                break;
            case 'customers':
                await this.loadCustomersTable();
                break;
            case 'suppliers':
                await this.loadSuppliersTable();
                break;
            case 'sales':
                await this.loadSalesData();
                break;
            case 'reports':
                await this.loadReportsData();
                break;
        }
    }
    
    // ======================================================================
    // لوحة التحكم
    // ======================================================================
    
    async loadDashboardData() {
        try {
            const today = new Date().toDateString();
            const thisMonth = new Date().getMonth();
            const thisYear = new Date().getFullYear();
            
            // حساب مبيعات اليوم
            const todaySales = this.data.sales
                .filter(sale => new Date(sale.date).toDateString() === today)
                .reduce((sum, sale) => sum + sale.total, 0);
            
            // حساب مبيعات الشهر
            const monthSales = this.data.sales
                .filter(sale => {
                    const saleDate = new Date(sale.date);
                    return saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear;
                })
                .reduce((sum, sale) => sum + sale.total, 0);
            
            // حساب عدد الطلبات اليوم
            const todayOrders = this.data.sales
                .filter(sale => new Date(sale.date).toDateString() === today).length;
            
            // حساب المنتجات منخفضة المخزون
            const lowStockProducts = this.data.products
                .filter(product => product.stock <= product.minStock);
            
            // حساب الأقساط المعلقة
            const pendingInstallments = this.data.installmentSales
                .filter(sale => sale.status === 'active')
                .reduce((sum, sale) => sum + sale.installments.filter(inst => !inst.paid).length, 0);
            
            // تحديث العناصر في الواجهة
            this.updateElement('todayRevenue', this.formatCurrency(todaySales));
            this.updateElement('todayOrders', todayOrders);
            this.updateElement('totalProducts', this.data.products.length);
            this.updateElement('lowStockCount', lowStockProducts.length);
            this.updateElement('totalCustomers', this.data.customers.length);
            this.updateElement('pendingInstallments', pendingInstallments);
            
            // تحديث جدول آخر المعاملات
            await this.updateRecentTransactions();
            
            // تحديث جدول المنتجات منخفضة المخزون
            await this.updateLowStockTable(lowStockProducts);
            
            console.log('تم تحميل بيانات لوحة التحكم');
        } catch (error) {
            console.error('خطأ في تحميل بيانات لوحة التحكم:', error);
        }
    }
    
    async updateRecentTransactions() {
        const tbody = document.querySelector('#recentTransactions tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const recentSales = this.data.sales
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        if (recentSales.length === 0) {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td colspan="5" style="text-align: center; color: #6b7280; padding: 20px;">
                    لا توجد معاملات حديثة
                </td>
            `;
            return;
        }
        
        recentSales.forEach(sale => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>#${sale.id}</td>
                <td>${sale.customerName || 'عميل مجهول'}</td>
                <td>${this.formatCurrency(sale.total)}</td>
                <td>${this.formatDateTime(sale.date)}</td>
                <td><span class="badge badge-success">مكتملة</span></td>
            `;
        });
    }
    
    async updateLowStockTable(lowStockProducts) {
        const tbody = document.querySelector('#lowStockProducts tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (lowStockProducts.length === 0) {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td colspan="4" style="text-align: center; color: #22c55e; padding: 20px;">
                    جميع المنتجات متوفرة بكمية كافية
                </td>
            `;
            return;
        }
        
        lowStockProducts.slice(0, 5).forEach(product => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.stock}</td>
                <td>${product.minStock}</td>
                <td><span class="badge badge-warning">منخفض</span></td>
            `;
        });
    }
    
    // ======================================================================
    // نقطة البيع
    // ======================================================================
    
    async loadProductsForPOS() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;
        
        productsGrid.innerHTML = '';
        
        if (this.data.products.length === 0) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
                    <i class="fas fa-box" style="font-size: 48px; margin-bottom: 16px;"></i>
                    <h3>لا توجد منتجات</h3>
                    <p>يرجى إضافة منتجات أولاً من صفحة المنتجات</p>
                    <button class="btn btn-primary" onclick="pos.showModule('products')" style="margin-top: 15px;">
                        <i class="fas fa-plus"></i> إضافة منتجات
                    </button>
                </div>
            `;
            return;
        }
        
        this.data.products.forEach(product => {
            if (product.status === 'active') {
                const productCard = this.createProductCard(product);
                productsGrid.appendChild(productCard);
            }
        });
    }
    
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => this.addToCart(product);
        
        const stockStatus = product.stock <= 0 ? 'نفذ المخزون' : 
                          product.stock <= product.minStock ? 'مخزون منخفض' : 'متوفر';
        
        const stockClass = product.stock <= 0 ? 'out-of-stock' : 
                         product.stock <= product.minStock ? 'low-stock' : 'in-stock';
        
        card.innerHTML = `
            <div class="product-image">
                ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '📦'}
            </div>
            <h4>${product.name}</h4>
            <div class="price">${this.formatCurrency(product.salePrice)}</div>
            <div class="stock ${stockClass}">${product.stock} متوفر</div>
            <div class="status">${stockStatus}</div>
            ${product.brand ? `<div class="brand">${product.brand}</div>` : ''}
        `;
        
        if (product.stock <= 0) {
            card.classList.add('disabled');
            card.onclick = null;
        }
        
        return card;
    }
    
    addToCart(product) {
        if (product.stock <= 0) {
            this.showNotification('المنتج غير متوفر في المخزون', 'error');
            return;
        }
        
        const existingItem = this.cart.items.find(item => item.productId === product.id);
        
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity++;
                existingItem.total = existingItem.quantity * existingItem.price;
            } else {
                this.showNotification('الكمية المطلوبة غير متوفرة', 'warning');
                return;
            }
        } else {
            this.cart.items.push({
                productId: product.id,
                name: product.name,
                price: product.salePrice,
                quantity: 1,
                total: product.salePrice,
                maxStock: product.stock
            });
        }
        
        this.updateCartDisplay();
        this.showNotification(`تم إضافة ${product.name} إلى العربة`, 'success');
        
        if (this.config.soundEnabled) {
            this.playSound('add-to-cart');
        }
    }
    
    updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        if (!cartItems) return;
        
        if (this.cart.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>العربة فارغة</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = '';
            this.cart.items.forEach((item, index) => {
                const cartItemElement = this.createCartItem(item, index);
                cartItems.appendChild(cartItemElement);
            });
        }
        
        this.calculateCartTotals();
    }
    
    createCartItem(item, index) {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${this.formatCurrency(item.price)}</div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-control">
                    <button onclick="pos.changeQuantity(${index}, -1)">-</button>
                    <input type="number" value="${item.quantity}" onchange="pos.updateQuantity(${index}, this.value)" min="1" max="${item.maxStock}">
                    <button onclick="pos.changeQuantity(${index}, 1)">+</button>
                </div>
                <button class="btn btn-danger btn-sm" onclick="pos.removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return itemElement;
    }
    
    changeQuantity(index, change) {
        const item = this.cart.items[index];
        const newQuantity = item.quantity + change;
        
        if (newQuantity <= 0) {
            this.removeFromCart(index);
            return;
        }
        
        if (newQuantity > item.maxStock) {
            this.showNotification('الكمية المطلوبة غير متوفرة', 'warning');
            return;
        }
        
        item.quantity = newQuantity;
        item.total = item.quantity * item.price;
        
        this.updateCartDisplay();
    }
    
    updateQuantity(index, newQuantity) {
        const item = this.cart.items[index];
        const quantity = parseInt(newQuantity);
        
        if (quantity <= 0) {
            this.removeFromCart(index);
            return;
        }
        
        if (quantity > item.maxStock) {
            this.showNotification('الكمية المطلوبة غير متوفرة', 'warning');
            return;
        }
        
        item.quantity = quantity;
        item.total = item.quantity * item.price;
        
        this.updateCartDisplay();
    }
    
    removeFromCart(index) {
        this.cart.items.splice(index, 1);
        this.updateCartDisplay();
        this.showNotification('تم حذف المنتج من العربة', 'info');
    }
    
    clearCart() {
        this.cart.items = [];
        this.cart.customer = null;
        this.cart.discount = 0;
        this.updateCartDisplay();
        this.clearCustomer();
        this.showNotification('تم مسح العربة', 'info');
    }
    
    calculateCartTotals() {
        const subtotal = this.cart.items.reduce((sum, item) => sum + item.total, 0);
        const discountAmount = subtotal * (this.cart.discount / 100);
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = afterDiscount * (this.cart.tax / 100);
        const total = afterDiscount + taxAmount;
        
        this.cart.total = total;
        
        this.updateElement('subtotal', this.formatCurrency(subtotal));
        this.updateElement('discount', this.formatCurrency(discountAmount));
        this.updateElement('tax', this.formatCurrency(taxAmount));
        this.updateElement('total', this.formatCurrency(total));
    }
    
    // ======================================================================
    // الوظائف المساعدة
    // ======================================================================
    
    formatCurrency(amount) {
        if (typeof amount !== 'number') amount = 0;
        return `${amount.toLocaleString(this.config.locale)} ${this.config.currencySymbol}`;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(this.config.locale);
    }
    
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString(this.config.locale);
    }
    
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }
    
    generateBarcode() {
        return Date.now().toString() + Math.random().toString().substr(2, 6);
    }
    
    getCategoryName(categoryId) {
        const category = this.data.categories.find(c => c.id === categoryId);
        return category ? category.name : 'غير محدد';
    }
    
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
            
            setTimeout(() => {
                const firstInput = modal.querySelector('input, select, textarea');
                if (firstInput) firstInput.focus();
            }, 300);
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    showNotification(message, type = 'info', duration = 4000) {
        // إنشاء حاوي الإشعارات إذا لم يكن موجوداً
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="${icons[type] || icons.info}"></i>
                </div>
                <div class="notification-text">
                    <div class="notification-message">${message}</div>
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // إزالة تلقائية
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }
    
    saveData(dataType) {
        try {
            localStorage.setItem(`pos_${dataType}`, JSON.stringify(this.data[dataType]));
            this.state.hasChanges = true;
            this.state.lastSync = new Date().toISOString();
        } catch (error) {
            console.error(`خطأ في حفظ ${dataType}:`, error);
            this.showNotification('حدث خطأ في حفظ البيانات', 'error');
        }
    }
    
    saveAllData() {
        Object.keys(this.data).forEach(key => {
            this.saveData(key);
        });
        
        localStorage.setItem('pos_config', JSON.stringify(this.config));
        localStorage.setItem('pos_current_user', JSON.stringify(this.currentUser));
    }
    
    playSound(soundType) {
        if (!this.config.soundEnabled) return;
        
        try {
            // يمكن إضافة ملفات صوتية حقيقية هنا
            console.log(`تشغيل صوت: ${soundType}`);
        } catch (error) {
            console.log('لا يمكن تشغيل الصوت:', error);
        }
    }
    
    searchProducts(searchTerm) {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;
        
        const productCards = productsGrid.querySelectorAll('.product-card');
        const term = searchTerm.toLowerCase().trim();
        
        productCards.forEach(card => {
            const productName = card.querySelector('h4').textContent.toLowerCase();
            const productBrand = card.querySelector('.brand')?.textContent.toLowerCase() || '';
            
            const isVisible = term === '' || 
                            productName.includes(term) || 
                            productBrand.includes(term);
            
            card.style.display = isVisible ? 'block' : 'none';
        });
    }
    
    filterProducts() {
        // سيتم تنفيذ فلترة المنتجات هنا
        console.log('فلترة المنتجات...');
    }
    
    handleConnectionChange(isOnline) {
        this.state.isOnline = isOnline;
        const statusElement = document.getElementById('connectionStatus');
        
        if (statusElement) {
            statusElement.textContent = isOnline ? 'متصل' : 'غير متصل';
            statusElement.className = isOnline ? 'status-online' : 'status-offline';
        }
        
        if (isOnline) {
            this.showNotification('تم استعادة الاتصال', 'success');
        } else {
            this.showNotification('انقطع الاتصال بالإنترنت', 'warning');
        }
    }
    
    startRealTimeUpdates() {
        // تحديث الوقت كل ثانية
        setInterval(() => {
            const timeElement = document.getElementById('currentTime');
            if (timeElement) {
                timeElement.textContent = new Date().toLocaleString(this.config.locale);
            }
        }, 1000);
        
        console.log('تم بدء التحديثات المباشرة');
    }
    
    handleBeforeUnload() {
        this.saveAllData();
    }
    
    handleKeyboardShortcuts(event) {
        // سيتم إضافة اختصارات لوحة المفاتيح هنا
    }
    
    // وظائف إضافية سيتم إضافتها لاحقاً
    loadProductsTable() { console.log('تحميل جدول المنتجات...'); }
    loadCustomersTable() { console.log('تحميل جدول العملاء...'); }
    loadSuppliersTable() { console.log('تحميل جدول الموردين...'); }
    loadSalesData() { console.log('تحميل بيانات المبيعات...'); }
    loadReportsData() { console.log('تحميل بيانات التقارير...'); }
    clearCustomer() { console.log('مسح العميل المحدد...'); }
    handleProductSubmit() { console.log('حفظ المنتج...'); }
    calculateProfitMargin() { console.log('حساب هامش الربح...'); }
}

// ======================================================================
// الوظائف العامة
// ======================================================================

// إنشاء نسخة من النظام
let pos;

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('بدء تحميل النظام...');
    
    try {
        pos = new POSSystem();
        
        // ربط الوظائف العامة بالنظام
        window.showModule = (module) => pos.showModule(module);
        window.pos = pos; // جعل النظام متاحاً عالمياً
        
        console.log('تم إنشاء النظام بنجاح');
    } catch (error) {
        console.error('خطأ في إنشاء النظام:', error);
        
        // إخفاء شاشة التحميل حتى لو فشل التحميل
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        // عرض رسالة خطأ
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; font-family: 'Cairo', sans-serif;">
                <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #dc2626; margin-bottom: 20px;"></i>
                    <h2 style="color: #dc2626;">خطأ في تحميل النظام</h2>
                    <p style="color: #6b7280; margin: 15px 0;">حدث خطأ أثناء تحميل نظام الكاشير</p>
                    <button onclick="location.reload()" style="background: #4f46e5; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer;">
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        `;
    }
});

// وظائف عامة مساعدة
function refreshDashboard() {
    if (pos) {
        pos.loadDashboardData();
        pos.showNotification('تم تحديث لوحة التحكم', 'success');
    }
}

function newSale() {
    if (pos) {
        pos.clearCart();
        pos.showModule('pos');
        pos.showNotification('بيعة جديدة', 'info');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        localStorage.clear();
        location.reload();
    }
}

console.log('تم تحميل ملف JavaScript للنظام');
