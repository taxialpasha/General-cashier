/**
 * نظام الكاشير المتكامل المتطور
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
        
        this.init();
    }
    
    // ======================================================================
    // التهيئة الأساسية
    // ======================================================================
    
    async init() {
        try {
            await this.showLoadingScreen();
            await this.loadStoredData();
            await this.initializeCategories();
            await this.initializeWarehouses();
            await this.setupEventListeners();
            await this.initializeModules();
            await this.startRealTimeUpdates();
            await this.hideLoadingScreen();
            
            this.showNotification('تم تحميل النظام بنجاح', 'success');
            console.log(`POS System v${this.version} initialized successfully`);
        } catch (error) {
            console.error('Error initializing POS system:', error);
            this.showNotification('حدث خطأ في تحميل النظام', 'error');
        }
    }
    
    async showLoadingScreen() {
        const progressBar = document.getElementById('loadingProgress');
        const steps = [
            'تحميل البيانات المحفوظة...',
            'تهيئة الفئات والمخازن...',
            'إعداد واجهة المستخدم...',
            'تحميل الوحدات...',
            'الاتصال بالخادم...',
            'اكتمل التحميل...'
        ];
        
        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 300));
            progressBar.style.width = `${(i + 1) * 16.67}%`;
        }
    }
    
    async hideLoadingScreen() {
        await new Promise(resolve => setTimeout(resolve, 500));
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
    
    loadStoredData() {
        try {
            // تحميل البيانات من localStorage
            Object.keys(this.data).forEach(key => {
                const stored = localStorage.getItem(`pos_${key}`);
                if (stored) {
                    this.data[key] = JSON.parse(stored);
                }
            });
            
            // تحميل الإعدادات
            const storedConfig = localStorage.getItem('pos_config');
            if (storedConfig) {
                this.config = { ...this.config, ...JSON.parse(storedConfig) };
            }
            
            // تحميل حالة المستخدم
            const storedUser = localStorage.getItem('pos_current_user');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
            } else {
                // إنشاء مستخدم افتراضي
                this.currentUser = {
                    id: 1,
                    name: 'المدير العام',
                    role: 'admin',
                    permissions: ['all'],
                    avatar: null
                };
            }
            
            console.log('Data loaded successfully');
        } catch (error) {
            console.error('Error loading stored data:', error);
            this.initializeDefaultData();
        }
    }
    
    initializeDefaultData() {
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
            }
        ];
        
        this.saveAllData();
    }
    
    async initializeCategories() {
        const categorySelects = document.querySelectorAll('#categoryFilter, #productCategoryFilter, #productCategory');
        categorySelects.forEach(select => {
            select.innerHTML = '<option value="">جميع الفئات</option>';
            this.data.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        });
    }
    
    async initializeWarehouses() {
        const warehouseSelects = document.querySelectorAll('#productWarehouse');
        warehouseSelects.forEach(select => {
            select.innerHTML = '';
            this.data.warehouses.forEach(warehouse => {
                const option = document.createElement('option');
                option.value = warehouse.id;
                option.textContent = warehouse.name;
                if (warehouse.isDefault) option.selected = true;
                select.appendChild(option);
            });
        });
    }
    
    setupEventListeners() {
        // الأحداث العامة
        window.addEventListener('online', () => this.handleConnectionChange(true));
        window.addEventListener('offline', () => this.handleConnectionChange(false));
        window.addEventListener('beforeunload', () => this.handleBeforeUnload());
        
        // أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // أحداث البحث
        document.getElementById('productSearch')?.addEventListener('input', 
            this.debounce((e) => this.searchProducts(e.target.value), 300));
        
        // أحداث الفلترة
        document.getElementById('categoryFilter')?.addEventListener('change', 
            (e) => this.filterProducts());
        
        // أحداث النماذج
        document.getElementById('productForm')?.addEventListener('submit', 
            (e) => this.handleProductSubmit(e));
        
        // أحداث الأسعار
        document.getElementById('productCostPrice')?.addEventListener('input', 
            () => this.calculateProfitMargin());
        document.getElementById('productSalePrice')?.addEventListener('input', 
            () => this.calculateProfitMargin());
        
        console.log('Event listeners setup complete');
    }
    
    // ======================================================================
    // إدارة الوحدات
    // ======================================================================
    
    async initializeModules() {
        this.showModule('dashboard');
        await this.loadDashboardData();
        await this.loadProductsForPOS();
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
            
            console.log('Dashboard data loaded successfully');
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }
    
    async updateRecentTransactions() {
        const tbody = document.querySelector('#recentTransactions tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const recentSales = this.data.sales
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
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
    // إدارة المنتجات
    // ======================================================================
    
    async loadProductsTable() {
        const tbody = document.querySelector('#productsTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        this.data.products.forEach(product => {
            const row = tbody.insertRow();
            
            const stockStatus = product.stock <= 0 ? 'نفذ' : 
                              product.stock <= product.minStock ? 'منخفض' : 'متوفر';
            
            const stockClass = product.stock <= 0 ? 'badge-danger' : 
                             product.stock <= product.minStock ? 'badge-warning' : 'badge-success';
            
            row.innerHTML = `
                <td><input type="checkbox" class="product-checkbox" value="${product.id}"></td>
                <td>
                    <div class="product-image-small">
                        ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '📦'}
                    </div>
                </td>
                <td>${product.name}</td>
                <td>${product.barcode || 'غير محدد'}</td>
                <td>${this.getCategoryName(product.category)}</td>
                <td>${this.formatCurrency(product.costPrice)}</td>
                <td>${this.formatCurrency(product.salePrice)}</td>
                <td>${product.stock}</td>
                <td><span class="badge ${stockClass}">${stockStatus}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="pos.editProduct(${product.id})" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="pos.duplicateProduct(${product.id})" title="نسخ">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="pos.deleteProduct(${product.id})" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
        });
    }
    
    openProductModal(productId = null) {
        const modal = document.getElementById('productModal');
        const form = document.getElementById('productForm');
        const title = document.getElementById('productModalTitle');
        
        if (productId) {
            const product = this.data.products.find(p => p.id === productId);
            if (product) {
                title.textContent = 'تعديل المنتج';
                this.fillProductForm(product);
            }
        } else {
            title.textContent = 'إضافة منتج جديد';
            form.reset();
        }
        
        this.showModal('productModal');
        
        // التركيز على أول حقل
        setTimeout(() => {
            document.getElementById('productName').focus();
        }, 300);
    }
    
    fillProductForm(product) {
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productBarcode').value = product.barcode || '';
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productBrand').value = product.brand || '';
        document.getElementById('productModel').value = product.model || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productCostPrice').value = product.costPrice || '';
        document.getElementById('productSalePrice').value = product.salePrice || '';
        document.getElementById('productWholesalePrice').value = product.wholesalePrice || '';
        document.getElementById('productTax').value = product.tax || 0;
        document.getElementById('productInitialStock').value = product.stock || '';
        document.getElementById('productMinStock').value = product.minStock || '';
        document.getElementById('productMaxStock').value = product.maxStock || '';
        document.getElementById('productUnit').value = product.unit || 'piece';
        document.getElementById('productWarehouse').value = product.warehouse || 1;
        document.getElementById('productLocation').value = product.location || '';
        
        this.calculateProfitMargin();
    }
    
    async handleProductSubmit(event) {
        event.preventDefault();
        
        try {
            const formData = new FormData(event.target);
            const productData = {
                name: formData.get('productName') || document.getElementById('productName').value,
                barcode: formData.get('productBarcode') || document.getElementById('productBarcode').value || this.generateBarcode(),
                category: parseInt(document.getElementById('productCategory').value),
                brand: document.getElementById('productBrand').value,
                model: document.getElementById('productModel').value,
                description: document.getElementById('productDescription').value,
                costPrice: parseFloat(document.getElementById('productCostPrice').value) || 0,
                salePrice: parseFloat(document.getElementById('productSalePrice').value) || 0,
                wholesalePrice: parseFloat(document.getElementById('productWholesalePrice').value) || 0,
                tax: parseFloat(document.getElementById('productTax').value) || 0,
                stock: parseInt(document.getElementById('productInitialStock').value) || 0,
                minStock: parseInt(document.getElementById('productMinStock').value) || 5,
                maxStock: parseInt(document.getElementById('productMaxStock').value) || 1000,
                unit: document.getElementById('productUnit').value,
                warehouse: parseInt(document.getElementById('productWarehouse').value),
                location: document.getElementById('productLocation').value,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // التحقق من صحة البيانات
            if (!productData.name || !productData.salePrice || !productData.category) {
                this.showNotification('يرجى ملء الحقول المطلوبة', 'error');
                return;
            }
            
            // إضافة أو تحديث المنتج
            const existingIndex = this.data.products.findIndex(p => p.barcode === productData.barcode);
            
            if (existingIndex !== -1) {
                // تحديث منتج موجود
                productData.id = this.data.products[existingIndex].id;
                productData.createdAt = this.data.products[existingIndex].createdAt;
                this.data.products[existingIndex] = productData;
                this.showNotification('تم تحديث المنتج بنجاح', 'success');
            } else {
                // إضافة منتج جديد
                productData.id = this.generateId();
                this.data.products.push(productData);
                this.showNotification('تم إضافة المنتج بنجاح', 'success');
            }
            
            // حفظ البيانات
            this.saveData('products');
            
            // تحديث الواجهة
            await this.loadProductsTable();
            await this.loadProductsForPOS();
            
            // إغلاق النافذة
            this.closeModal('productModal');
            
        } catch (error) {
            console.error('Error saving product:', error);
            this.showNotification('حدث خطأ في حفظ المنتج', 'error');
        }
    }
    
    calculateProfitMargin() {
        const costPrice = parseFloat(document.getElementById('productCostPrice').value) || 0;
        const salePrice = parseFloat(document.getElementById('productSalePrice').value) || 0;
        
        if (costPrice > 0) {
            const margin = ((salePrice - costPrice) / costPrice) * 100;
            const marginField = document.getElementById('productProfitMargin');
            if (marginField) {
                marginField.value = margin.toFixed(2);
            }
        }
    }
    
    deleteProduct(productId) {
        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            this.data.products = this.data.products.filter(p => p.id !== productId);
            this.saveData('products');
            this.loadProductsTable();
            this.loadProductsForPOS();
            this.showNotification('تم حذف المنتج بنجاح', 'success');
        }
    }
    
    duplicateProduct(productId) {
        const product = this.data.products.find(p => p.id === productId);
        if (product) {
            const newProduct = {
                ...product,
                id: this.generateId(),
                name: product.name + ' (نسخة)',
                barcode: this.generateBarcode(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            this.data.products.push(newProduct);
            this.saveData('products');
            this.loadProductsTable();
            this.showNotification('تم نسخ المنتج بنجاح', 'success');
        }
    }
    
    // ======================================================================
    // إدارة العملاء
    // ======================================================================
    
    async loadCustomersTable() {
        const tbody = document.querySelector('#customersTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        this.data.customers.forEach(customer => {
            const row = tbody.insertRow();
            
            const customerType = customer.type === 'vip' ? 'مميز' : 
                               customer.type === 'wholesale' ? 'تاجر جملة' : 'عادي';
            
            const lastVisit = customer.lastVisit ? 
                this.formatDate(customer.lastVisit) : 'لم يزر بعد';
            
            row.innerHTML = `
                <td>
                    <div class="customer-info">
                        <img src="${customer.avatar || this.getDefaultAvatar(customer.name)}" alt="Avatar" class="customer-avatar">
                        <div>
                            <div class="customer-name">${customer.name}</div>
                            <div class="customer-phone">${customer.phone}</div>
                        </div>
                    </div>
                </td>
                <td>${customer.email || 'غير محدد'}</td>
                <td><span class="badge badge-${customer.type === 'vip' ? 'warning' : customer.type === 'wholesale' ? 'info' : 'primary'}">${customerType}</span></td>
                <td>${customer.loyaltyPoints || 0}</td>
                <td>${this.formatCurrency(customer.totalPurchases || 0)}</td>
                <td>${lastVisit}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="pos.editCustomer(${customer.id})" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="pos.viewCustomerHistory(${customer.id})" title="السجل">
                            <i class="fas fa-history"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="pos.deleteCustomer(${customer.id})" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
        });
    }
    
    openCustomerModal() {
        this.showModal('customerSelectModal');
        this.loadCustomersList();
    }
    
    loadCustomersList() {
        const customersList = document.getElementById('customersList');
        if (!customersList) return;
        
        customersList.innerHTML = '';
        
        this.data.customers.forEach(customer => {
            const customerCard = document.createElement('div');
            customerCard.className = 'customer-card';
            customerCard.onclick = () => this.selectCustomer(customer);
            
            customerCard.innerHTML = `
                <div class="customer-info">
                    <img src="${customer.avatar || this.getDefaultAvatar(customer.name)}" alt="Avatar">
                    <div>
                        <h4>${customer.name}</h4>
                        <p>📞 ${customer.phone}</p>
                        <p>🏷️ نقاط الولاء: ${customer.loyaltyPoints || 0}</p>
                        <p>💰 إجمالي المشتريات: ${this.formatCurrency(customer.totalPurchases || 0)}</p>
                    </div>
                </div>
            `;
            
            customersList.appendChild(customerCard);
        });
    }
    
    selectCustomer(customer) {
        this.cart.customer = customer;
        
        const selectedCustomer = document.getElementById('selectedCustomer');
        const customerName = document.getElementById('customerName');
        const customerPhone = document.getElementById('customerPhone');
        const customerAvatar = document.getElementById('customerAvatar');
        const selectCustomerBtn = document.getElementById('selectCustomerBtn');
        
        if (selectedCustomer && customerName && selectCustomerBtn) {
            selectedCustomer.style.display = 'block';
            selectCustomerBtn.style.display = 'none';
            customerName.textContent = customer.name;
            
            if (customerPhone) customerPhone.textContent = customer.phone;
            if (customerAvatar) customerAvatar.src = customer.avatar || this.getDefaultAvatar(customer.name);
        }
        
        this.closeModal('customerSelectModal');
        this.showNotification(`تم اختيار العميل: ${customer.name}`, 'success');
    }
    
    clearCustomer() {
        this.cart.customer = null;
        
        const selectedCustomer = document.getElementById('selectedCustomer');
        const selectCustomerBtn = document.getElementById('selectCustomerBtn');
        
        if (selectedCustomer && selectCustomerBtn) {
            selectedCustomer.style.display = 'none';
            selectCustomerBtn.style.display = 'block';
        }
    }
    
    // ======================================================================
    // معالجة المدفوعات
    // ======================================================================
    
    processCashPayment() {
        if (this.cart.items.length === 0) {
            this.showNotification('العربة فارغة', 'error');
            return;
        }
        
        this.openPaymentModal('cash');
    }
    
    processCardPayment() {
        if (this.cart.items.length === 0) {
            this.showNotification('العربة فارغة', 'error');
            return;
        }
        
        this.openPaymentModal('card');
    }
    
    processInstallment() {
        if (this.cart.items.length === 0) {
            this.showNotification('العربة فارغة', 'error');
            return;
        }
        
        if (!this.cart.customer) {
            this.showNotification('يرجى اختيار عميل أولاً للبيع بالأقساط', 'warning');
            return;
        }
        
        this.openPaymentModal('installment');
    }
    
    openPaymentModal(paymentType) {
        const modal = document.getElementById('paymentModal');
        const paymentTotal = document.getElementById('paymentTotal');
        
        if (paymentTotal) {
            paymentTotal.textContent = this.formatCurrency(this.cart.total);
        }
        
        // تحديد طريقة الدفع النشطة
        document.querySelectorAll('.payment-method').forEach(method => {
            method.classList.remove('active');
        });
        
        const activeMethod = document.querySelector(`[data-method="${paymentType}"]`);
        if (activeMethod) {
            activeMethod.classList.add('active');
        }
        
        // إظهار نموذج الدفع المناسب
        this.showPaymentForm(paymentType);
        
        this.showModal('paymentModal');
    }
    
    showPaymentForm(paymentType) {
        // إخفاء جميع النماذج
        document.querySelectorAll('.payment-form').forEach(form => {
            form.classList.remove('active');
        });
        
        // إظهار النموذج المحدد
        const targetForm = document.getElementById(`${paymentType}Payment`);
        if (targetForm) {
            targetForm.classList.add('active');
        }
        
        // إعداد خاص لكل نوع دفع
        if (paymentType === 'cash') {
            const amountPaid = document.getElementById('amountPaid');
            if (amountPaid) {
                amountPaid.value = this.cart.total;
                amountPaid.focus();
                this.calculateChange();
            }
        }
    }
    
    calculateChange() {
        const amountPaid = parseFloat(document.getElementById('amountPaid').value) || 0;
        const changeAmount = amountPaid - this.cart.total;
        
        const changeField = document.getElementById('changeAmount');
        if (changeField) {
            changeField.value = changeAmount.toFixed(2);
        }
    }
    
    async completePayment() {
        try {
            const activeMethod = document.querySelector('.payment-method.active');
            const paymentType = activeMethod ? activeMethod.dataset.method : 'cash';
            
            // التحقق من صحة البيانات
            if (paymentType === 'cash') {
                const amountPaid = parseFloat(document.getElementById('amountPaid').value) || 0;
                if (amountPaid < this.cart.total) {
                    this.showNotification('المبلغ المدفوع أقل من المطلوب', 'error');
                    return;
                }
            }
            
            // إنشاء فاتورة البيع
            const sale = {
                id: this.generateId(),
                date: new Date().toISOString(),
                customerId: this.cart.customer?.id || null,
                customerName: this.cart.customer?.name || 'عميل مجهول',
                items: [...this.cart.items],
                subtotal: this.cart.items.reduce((sum, item) => sum + item.total, 0),
                discount: this.cart.discount,
                tax: this.cart.tax,
                total: this.cart.total,
                paymentType: paymentType,
                status: 'completed',
                cashier: this.currentUser.name
            };
            
            // معالجة خاصة للأقساط
            if (paymentType === 'installment') {
                await this.createInstallmentSale(sale);
            } else {
                // تحديث مخزون المنتجات
                this.updateProductStock();
                
                // تحديث بيانات العميل
                if (this.cart.customer) {
                    this.updateCustomerData();
                }
                
                // حفظ البيع
                this.data.sales.push(sale);
                this.saveData('sales');
            }
            
            // مسح العربة
            this.clearCart();
            
            // إغلاق نافذة الدفع
            this.closeModal('paymentModal');
            
            // إظهار نافذة الطباعة
            this.showPrintModal(sale);
            
            // إشعار نجاح
            this.showNotification('تم إتمام البيع بنجاح', 'success');
            
            // تحديث لوحة التحكم
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('Error completing payment:', error);
            this.showNotification('حدث خطأ في معالجة الدفع', 'error');
        }
    }
    
    updateProductStock() {
        this.cart.items.forEach(cartItem => {
            const product = this.data.products.find(p => p.id === cartItem.productId);
            if (product) {
                product.stock -= cartItem.quantity;
                product.updatedAt = new Date().toISOString();
            }
        });
        
        this.saveData('products');
    }
    
    updateCustomerData() {
        if (!this.cart.customer) return;
        
        const customer = this.data.customers.find(c => c.id === this.cart.customer.id);
        if (customer) {
            customer.totalPurchases = (customer.totalPurchases || 0) + this.cart.total;
            customer.loyaltyPoints = (customer.loyaltyPoints || 0) + Math.floor(this.cart.total / 1000);
            customer.lastVisit = new Date().toISOString();
            
            this.saveData('customers');
        }
    }
    
    // ======================================================================
    // الطباعة
    // ======================================================================
    
    showPrintModal(sale) {
        const modal = document.getElementById('printConfirmModal');
        this.currentSale = sale;
        this.showModal('printConfirmModal');
    }
    
    executePrint() {
        const printReceipt = document.getElementById('printReceipt').checked;
        const sendEmail = document.getElementById('sendEmail').checked;
        const sendSMS = document.getElementById('sendSMS').checked;
        
        if (printReceipt) {
            this.printReceipt(this.currentSale);
        }
        
        if (sendEmail && this.cart.customer?.email) {
            this.sendEmailReceipt(this.currentSale);
        }
        
        if (sendSMS && this.cart.customer?.phone) {
            this.sendSMSReceipt(this.currentSale);
        }
        
        this.closeModal('printConfirmModal');
    }
    
    printReceipt(sale) {
        const receiptWindow = window.open('', '_blank');
        const receiptHTML = this.generateReceiptHTML(sale);
        
        receiptWindow.document.write(receiptHTML);
        receiptWindow.document.close();
        receiptWindow.print();
    }
    
    generateReceiptHTML(sale) {
        return `
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>فاتورة البيع</title>
                <style>
                    body { 
                        font-family: 'Cairo', Arial, sans-serif; 
                        font-size: 12px;
                        line-height: 1.4;
                        margin: 0;
                        padding: 20px;
                        max-width: 300px;
                        margin: 0 auto;
                    }
                    .header { 
                        text-align: center; 
                        border-bottom: 2px solid #000; 
                        padding-bottom: 15px;
                        margin-bottom: 15px;
                    }
                    .header h1 { margin: 0; font-size: 18px; }
                    .header p { margin: 5px 0; }
                    .info-section { margin: 10px 0; }
                    .items-table { 
                        width: 100%; 
                        border-collapse: collapse;
                        margin: 15px 0;
                    }
                    .items-table th, .items-table td { 
                        padding: 5px; 
                        text-align: right;
                        border-bottom: 1px solid #ddd;
                    }
                    .items-table th { background: #f5f5f5; }
                    .totals { 
                        border-top: 2px solid #000; 
                        padding-top: 10px;
                        margin-top: 15px;
                    }
                    .total-row { 
                        display: flex; 
                        justify-content: space-between;
                        margin: 3px 0;
                    }
                    .total-row.final { 
                        font-weight: bold; 
                        font-size: 14px;
                        border-top: 1px solid #000;
                        padding-top: 5px;
                    }
                    .footer { 
                        text-align: center; 
                        margin-top: 20px;
                        border-top: 1px solid #ddd;
                        padding-top: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${this.config.storeName || 'متجري'}</h1>
                    <p>${this.config.storeAddress || ''}</p>
                    <p>هاتف: ${this.config.storePhone || ''}</p>
                </div>
                
                <div class="info-section">
                    <p><strong>رقم الفاتورة:</strong> #${sale.id}</p>
                    <p><strong>التاريخ:</strong> ${this.formatDateTime(sale.date)}</p>
                    <p><strong>العميل:</strong> ${sale.customerName}</p>
                    <p><strong>الكاشير:</strong> ${sale.cashier}</p>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>المنتج</th>
                            <th>الكمية</th>
                            <th>السعر</th>
                            <th>المجموع</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sale.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>${this.formatCurrency(item.price)}</td>
                                <td>${this.formatCurrency(item.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="totals">
                    <div class="total-row">
                        <span>المجموع الفرعي:</span>
                        <span>${this.formatCurrency(sale.subtotal)}</span>
                    </div>
                    ${sale.discount > 0 ? `
                        <div class="total-row">
                            <span>الخصم:</span>
                            <span>${this.formatCurrency(sale.subtotal * sale.discount / 100)}</span>
                        </div>
                    ` : ''}
                    ${sale.tax > 0 ? `
                        <div class="total-row">
                            <span>الضريبة:</span>
                            <span>${this.formatCurrency(sale.subtotal * sale.tax / 100)}</span>
                        </div>
                    ` : ''}
                    <div class="total-row final">
                        <span>المجموع النهائي:</span>
                        <span>${this.formatCurrency(sale.total)}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <p>شكراً لتسوقكم معنا</p>
                    <p>نتطلع لخدمتكم مرة أخرى</p>
                </div>
            </body>
            </html>
        `;
    }
    
    skipPrint() {
        this.closeModal('printConfirmModal');
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
    
    getDefaultAvatar(name) {
        const firstLetter = name.charAt(0).toUpperCase();
        const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];
        const color = colors[name.length % colors.length];
        
        return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='${color}'/><text x='20' y='25' text-anchor='middle' fill='white' font-size='16'>${firstLetter}</text></svg>`;
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
            
            // تركيز على أول عنصر قابل للتحرير
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
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
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
            console.error(`Error saving ${dataType}:`, error);
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
    
   /**
 * إكمال نظام الكاشير المتكامل المتطور - JavaScript
 * الجزء الثاني من الكود
 */

    // إكمال دالة playSound من حيث توقفت
    playSound(soundType) {
        if (!this.config.soundEnabled) return;
        
        try {
            const audio = new Audio();
            const sounds = {
                'add-to-cart': 'data:audio/mpeg;base64,//uQRAAAAWMSLwUIYAAsYkXgQgAOF', // ملف صوتي مختصر
                'remove-item': 'data:audio/mpeg;base64,//uQRAAAAWMSLwUIYAAsYkXgQgAOF',
                'sale-complete': 'data:audio/mpeg;base64,//uQRAAAAWMSLwUIYAAsYkXgQgAOF',
                'error': 'data:audio/mpeg;base64,//uQRAAAAWMSLwUIYAAsYkXgQgAOF'
            };
            
            if (sounds[soundType]) {
                audio.src = sounds[soundType];
                audio.volume = 0.3;
                audio.play().catch(error => {
                    console.log('Could not play sound:', error);
                });
            }
        } catch (error) {
            console.log('Sound not supported:', error);
        }
    }
    
    // ======================================================================
    // البحث والفلترة
    // ======================================================================
    
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
        
        // عرض رسالة عدم وجود نتائج
        const visibleCards = Array.from(productCards).filter(card => 
            card.style.display !== 'none'
        );
        
        if (visibleCards.length === 0 && term !== '') {
            this.showNoResultsMessage(productsGrid);
        } else {
            this.hideNoResultsMessage(productsGrid);
        }
    }
    
    showNoResultsMessage(container) {
        let noResultsDiv = container.querySelector('.no-results');
        if (!noResultsDiv) {
            noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results';
            noResultsDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--gray-500);">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px;"></i>
                    <h3>لا توجد منتجات مطابقة</h3>
                    <p>جرب البحث بكلمات مختلفة</p>
                </div>
            `;
            container.appendChild(noResultsDiv);
        }
    }
    
    hideNoResultsMessage(container) {
        const noResultsDiv = container.querySelector('.no-results');
        if (noResultsDiv) {
            noResultsDiv.remove();
        }
    }
    
    filterProducts() {
        const categoryFilter = document.getElementById('categoryFilter')?.value;
        const priceRangeFilter = document.getElementById('priceRangeFilter')?.value;
        
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;
        
        const productCards = productsGrid.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            let showCard = true;
            
            // فلترة حسب الفئة
            if (categoryFilter) {
                const productData = this.data.products.find(p => 
                    p.name === card.querySelector('h4').textContent
                );
                if (productData && productData.category.toString() !== categoryFilter) {
                    showCard = false;
                }
            }
            
            // فلترة حسب السعر
            if (priceRangeFilter && showCard) {
                const priceText = card.querySelector('.price').textContent;
                const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
                
                const [min, max] = priceRangeFilter.includes('-') ? 
                    priceRangeFilter.split('-').map(Number) : [0, Infinity];
                
                if (priceRangeFilter.includes('+')) {
                    const minPrice = parseInt(priceRangeFilter.replace('+', ''));
                    showCard = price >= minPrice;
                } else if (min !== undefined && max !== undefined) {
                    showCard = price >= min && price <= max;
                }
            }
            
            card.style.display = showCard ? 'block' : 'none';
        });
    }
    
    clearSearch() {
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.value = '';
            this.searchProducts('');
        }
    }
    
    // ======================================================================
    // إدارة الشريط الجانبي
    // ======================================================================
    
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        
        if (sidebar && mainContent) {
            sidebar.classList.toggle('collapsed');
            this.sidebarCollapsed = sidebar.classList.contains('collapsed');
            
            // حفظ حالة الشريط الجانبي
            localStorage.setItem('pos_sidebar_collapsed', this.sidebarCollapsed);
        }
    }
    
    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }
    
    // ======================================================================
    // إدارة الأقساط
    // ======================================================================
    
    async createInstallmentSale(sale) {
        const installmentPeriod = parseInt(document.getElementById('installmentPeriod')?.value) || 12;
        const interestRate = parseFloat(document.getElementById('interestRate')?.value) || 0;
        
        const totalWithInterest = sale.total + (sale.total * interestRate / 100);
        const monthlyPayment = totalWithInterest / installmentPeriod;
        
        // إنشاء جدولة الأقساط
        const installments = [];
        const startDate = new Date();
        
        for (let i = 1; i <= installmentPeriod; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            
            installments.push({
                number: i,
                amount: monthlyPayment,
                dueDate: dueDate.toISOString(),
                paid: false,
                paidDate: null,
                paidAmount: 0,
                status: 'pending'
            });
        }
        
        const installmentSale = {
            ...sale,
            type: 'installment',
            originalAmount: sale.total,
            interestRate: interestRate,
            totalWithInterest: totalWithInterest,
            monthlyPayment: monthlyPayment,
            installmentPeriod: installmentPeriod,
            installments: installments,
            totalPaid: 0,
            remainingAmount: totalWithInterest,
            status: 'active'
        };
        
        // تحديث مخزون المنتجات
        this.updateProductStock();
        
        // تحديث بيانات العميل
        if (this.cart.customer) {
            this.updateCustomerData();
        }
        
        // حفظ بيع الأقساط
        this.data.installmentSales.push(installmentSale);
        this.saveData('installmentSales');
        
        this.showNotification('تم إنشاء بيع الأقساط بنجاح', 'success');
        return installmentSale;
    }
    
    payInstallment(saleId, installmentNumber, amountPaid) {
        const sale = this.data.installmentSales.find(s => s.id === saleId);
        if (!sale) return false;
        
        const installment = sale.installments.find(inst => inst.number === installmentNumber);
        if (!installment) return false;
        
        installment.paid = true;
        installment.paidDate = new Date().toISOString();
        installment.paidAmount = amountPaid;
        installment.status = 'paid';
        
        sale.totalPaid += amountPaid;
        sale.remainingAmount -= amountPaid;
        
        // التحقق من اكتمال الدفع
        if (sale.remainingAmount <= 0) {
            sale.status = 'completed';
        }
        
        this.saveData('installmentSales');
        return true;
    }
    
    // ======================================================================
    // إدارة المستخدمين والصلاحيات
    // ======================================================================
    
    checkPermission(permission) {
        if (!this.currentUser) return false;
        
        if (this.currentUser.role === 'admin') return true;
        
        return this.currentUser.permissions && 
               this.currentUser.permissions.includes(permission);
    }
    
    logout() {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            // حفظ البيانات قبل الخروج
            this.saveAllData();
            
            // مسح بيانات المستخدم الحالي
            localStorage.removeItem('pos_current_user');
            
            // إعادة تحميل الصفحة أو التوجه لصفحة تسجيل الدخول
            window.location.reload();
        }
    }
    
    // ======================================================================
    // النسخ الاحتياطي والاستيراد/التصدير
    // ======================================================================
    
    exportData(dataType = 'all') {
        try {
            let exportData;
            let filename;
            
            if (dataType === 'all') {
                exportData = {
                    version: this.version,
                    exportDate: new Date().toISOString(),
                    data: this.data,
                    config: this.config
                };
                filename = `pos_backup_${new Date().toISOString().split('T')[0]}.json`;
            } else {
                exportData = {
                    version: this.version,
                    exportDate: new Date().toISOString(),
                    type: dataType,
                    data: this.data[dataType]
                };
                filename = `pos_${dataType}_${new Date().toISOString().split('T')[0]}.json`;
            }
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            
            URL.revokeObjectURL(url);
            this.showNotification('تم تصدير البيانات بنجاح', 'success');
            
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showNotification('حدث خطأ في تصدير البيانات', 'error');
        }
    }
    
    importData(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('لم يتم اختيار ملف'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    // التحقق من صحة البيانات
                    if (!importedData.version || !importedData.data) {
                        throw new Error('ملف غير صالح');
                    }
                    
                    // نسخ احتياطية من البيانات الحالية
                    const backupData = { ...this.data };
                    
                    try {
                        // استيراد البيانات
                        if (importedData.type) {
                            // استيراد نوع واحد من البيانات
                            this.data[importedData.type] = importedData.data;
                        } else {
                            // استيراد جميع البيانات
                            this.data = { ...this.data, ...importedData.data };
                            if (importedData.config) {
                                this.config = { ...this.config, ...importedData.config };
                            }
                        }
                        
                        // حفظ البيانات الجديدة
                        this.saveAllData();
                        
                        // تحديث الواجهة
                        this.initializeModules();
                        
                        this.showNotification('تم استيراد البيانات بنجاح', 'success');
                        resolve(true);
                        
                    } catch (error) {
                        // استرجاع البيانات الأصلية في حال الفشل
                        this.data = backupData;
                        throw error;
                    }
                    
                } catch (error) {
                    console.error('Error importing data:', error);
                    this.showNotification('حدث خطأ في استيراد البيانات', 'error');
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('خطأ في قراءة الملف'));
            };
            
            reader.readAsText(file);
        });
    }
    
    createAutomaticBackup() {
        // إنشاء نسخة احتياطية تلقائية يومياً
        const lastBackup = localStorage.getItem('pos_last_backup');
        const today = new Date().toDateString();
        
        if (lastBackup !== today) {
            this.exportData('all');
            localStorage.setItem('pos_last_backup', today);
        }
    }
    
    // ======================================================================
    // التقارير والإحصائيات
    // ======================================================================
    
    async loadReportsData() {
        const reportsContainer = document.getElementById('reports');
        if (!reportsContainer) return;
        
        // تنظيف المحتوى السابق
        reportsContainer.innerHTML = this.generateReportsHTML();
        
        // تحميل البيانات
        await this.generateSalesReport();
        await this.generateProductsReport();
        await this.generateCustomersReport();
        await this.generateFinancialReport();
    }
    
    generateReportsHTML() {
        return `
            <div class="module-header">
                <h2><i class="fas fa-chart-pie"></i> التقارير والإحصائيات</h2>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="pos.exportAllReports()">
                        <i class="fas fa-download"></i> تصدير التقارير
                    </button>
                    <button class="btn btn-secondary" onclick="pos.printReports()">
                        <i class="fas fa-print"></i> طباعة
                    </button>
                </div>
            </div>

            <div class="reports-filters">
                <div class="filter-row">
                    <div class="form-group">
                        <label>من تاريخ</label>
                        <input type="date" id="reportStartDate" value="${this.getDateString(-30)}">
                    </div>
                    <div class="form-group">
                        <label>إلى تاريخ</label>
                        <input type="date" id="reportEndDate" value="${this.getDateString(0)}">
                    </div>
                    <div class="form-group">
                        <label>نوع التقرير</label>
                        <select id="reportType">
                            <option value="sales">المبيعات</option>
                            <option value="products">المنتجات</option>
                            <option value="customers">العملاء</option>
                            <option value="financial">مالي</option>
                            <option value="inventory">المخزون</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <button class="btn btn-primary" onclick="pos.generateCustomReport()">
                            <i class="fas fa-search"></i> إنشاء التقرير
                        </button>
                    </div>
                </div>
            </div>

            <div class="reports-grid">
                <div class="report-card" id="salesReportCard">
                    <div class="report-header">
                        <h3><i class="fas fa-chart-line"></i> تقرير المبيعات</h3>
                        <button class="btn btn-sm btn-secondary" onclick="pos.exportReport('sales')">تصدير</button>
                    </div>
                    <div class="report-content" id="salesReportContent">
                        <div class="loading">جاري تحميل التقرير...</div>
                    </div>
                </div>

                <div class="report-card" id="productsReportCard">
                    <div class="report-header">
                        <h3><i class="fas fa-box"></i> تقرير المنتجات</h3>
                        <button class="btn btn-sm btn-secondary" onclick="pos.exportReport('products')">تصدير</button>
                    </div>
                    <div class="report-content" id="productsReportContent">
                        <div class="loading">جاري تحميل التقرير...</div>
                    </div>
                </div>

                <div class="report-card" id="customersReportCard">
                    <div class="report-header">
                        <h3><i class="fas fa-users"></i> تقرير العملاء</h3>
                        <button class="btn btn-sm btn-secondary" onclick="pos.exportReport('customers')">تصدير</button>
                    </div>
                    <div class="report-content" id="customersReportContent">
                        <div class="loading">جاري تحميل التقرير...</div>
                    </div>
                </div>

                <div class="report-card" id="financialReportCard">
                    <div class="report-header">
                        <h3><i class="fas fa-dollar-sign"></i> التقرير المالي</h3>
                        <button class="btn btn-sm btn-secondary" onclick="pos.exportReport('financial')">تصدير</button>
                    </div>
                    <div class="report-content" id="financialReportContent">
                        <div class="loading">جاري تحميل التقرير...</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async generateSalesReport() {
        const container = document.getElementById('salesReportContent');
        if (!container) return;
        
        const today = new Date();
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();
        
        // حساب الإحصائيات
        const todaySales = this.data.sales.filter(sale => 
            new Date(sale.date).toDateString() === today.toDateString()
        );
        
        const monthSales = this.data.sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear;
        });
        
        const totalRevenue = this.data.sales.reduce((sum, sale) => sum + sale.total, 0);
        const averageOrderValue = totalRevenue / this.data.sales.length || 0;
        
        // أفضل المنتجات مبيعاً
        const productSales = {};
        this.data.sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[item.productId].quantity += item.quantity;
                productSales[item.productId].revenue += item.total;
            });
        });
        
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
        
        container.innerHTML = `
            <div class="report-stats">
                <div class="stat-item">
                    <div class="stat-value">${this.formatCurrency(todaySales.reduce((sum, s) => sum + s.total, 0))}</div>
                    <div class="stat-label">مبيعات اليوم</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.formatCurrency(monthSales.reduce((sum, s) => sum + s.total, 0))}</div>
                    <div class="stat-label">مبيعات الشهر</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${todaySales.length}</div>
                    <div class="stat-label">معاملات اليوم</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.formatCurrency(averageOrderValue)}</div>
                    <div class="stat-label">متوسط قيمة الطلب</div>
                </div>
            </div>
            
            <div class="report-section">
                <h4>أفضل المنتجات مبيعاً</h4>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>المنتج</th>
                            <th>الكمية المباعة</th>
                            <th>الإيرادات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topProducts.map(product => `
                            <tr>
                                <td>${product.name}</td>
                                <td>${product.quantity}</td>
                                <td>${this.formatCurrency(product.revenue)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    async generateProductsReport() {
        const container = document.getElementById('productsReportContent');
        if (!container) return;
        
        const totalProducts = this.data.products.length;
        const activeProducts = this.data.products.filter(p => p.status === 'active').length;
        const lowStockProducts = this.data.products.filter(p => p.stock <= p.minStock).length;
        const outOfStockProducts = this.data.products.filter(p => p.stock <= 0).length;
        
        const totalInventoryValue = this.data.products.reduce((sum, product) => 
            sum + (product.stock * product.costPrice), 0
        );
        
        // المنتجات حسب الفئة
        const categoriesStats = {};
        this.data.products.forEach(product => {
            const categoryName = this.getCategoryName(product.category);
            if (!categoriesStats[categoryName]) {
                categoriesStats[categoryName] = {
                    count: 0,
                    value: 0
                };
            }
            categoriesStats[categoryName].count++;
            categoriesStats[categoryName].value += product.stock * product.costPrice;
        });
        
        container.innerHTML = `
            <div class="report-stats">
                <div class="stat-item">
                    <div class="stat-value">${totalProducts}</div>
                    <div class="stat-label">إجمالي المنتجات</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${activeProducts}</div>
                    <div class="stat-label">منتجات نشطة</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${lowStockProducts}</div>
                    <div class="stat-label">مخزون منخفض</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.formatCurrency(totalInventoryValue)}</div>
                    <div class="stat-label">قيمة المخزون</div>
                </div>
            </div>
            
            <div class="report-section">
                <h4>المنتجات حسب الفئة</h4>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>الفئة</th>
                            <th>عدد المنتجات</th>
                            <th>قيمة المخزون</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(categoriesStats).map(([category, stats]) => `
                            <tr>
                                <td>${category}</td>
                                <td>${stats.count}</td>
                                <td>${this.formatCurrency(stats.value)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            ${lowStockProducts > 0 ? `
                <div class="report-section">
                    <h4>تنبيهات المخزون (${lowStockProducts} منتج)</h4>
                    <div class="alert-list">
                        ${this.data.products
                            .filter(p => p.stock <= p.minStock)
                            .slice(0, 10)
                            .map(product => `
                                <div class="alert-item">
                                    <span class="product-name">${product.name}</span>
                                    <span class="stock-info">متوفر: ${product.stock} / الحد الأدنى: ${product.minStock}</span>
                                </div>
                            `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    }
    
    async generateCustomersReport() {
        const container = document.getElementById('customersReportContent');
        if (!container) return;
        
        const totalCustomers = this.data.customers.length;
        const vipCustomers = this.data.customers.filter(c => c.type === 'vip').length;
        const wholesaleCustomers = this.data.customers.filter(c => c.type === 'wholesale').length;
        
        // أفضل العملاء
        const topCustomers = this.data.customers
            .sort((a, b) => (b.totalPurchases || 0) - (a.totalPurchases || 0))
            .slice(0, 10);
        
        // العملاء الجدد هذا الشهر
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const newCustomers = this.data.customers.filter(customer => {
            const createdDate = new Date(customer.createdAt || customer.registrationDate || 0);
            return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
        }).length;
        
        container.innerHTML = `
            <div class="report-stats">
                <div class="stat-item">
                    <div class="stat-value">${totalCustomers}</div>
                    <div class="stat-label">إجمالي العملاء</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${newCustomers}</div>
                    <div class="stat-label">عملاء جدد هذا الشهر</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${vipCustomers}</div>
                    <div class="stat-label">عملاء مميزون</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${wholesaleCustomers}</div>
                    <div class="stat-label">تجار جملة</div>
                </div>
            </div>
            
            <div class="report-section">
                <h4>أفضل العملاء</h4>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>إجمالي المشتريات</th>
                            <th>نقاط الولاء</th>
                            <th>النوع</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topCustomers.map(customer => `
                            <tr>
                                <td>${customer.name}</td>
                                <td>${this.formatCurrency(customer.totalPurchases || 0)}</td>
                                <td>${customer.loyaltyPoints || 0}</td>
                                <td>
                                    <span class="badge badge-${customer.type === 'vip' ? 'warning' : customer.type === 'wholesale' ? 'info' : 'primary'}">
                                        ${customer.type === 'vip' ? 'مميز' : customer.type === 'wholesale' ? 'تاجر جملة' : 'عادي'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    async generateFinancialReport() {
        const container = document.getElementById('financialReportContent');
        if (!container) return;
        
        const totalRevenue = this.data.sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalCost = this.data.sales.reduce((sum, sale) => {
            return sum + sale.items.reduce((itemSum, item) => {
                const product = this.data.products.find(p => p.id === item.productId);
                return itemSum + (product ? product.costPrice * item.quantity : 0);
            }, 0);
        }, 0);
        
        const grossProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
        
        // المصروفات
        const totalExpenses = this.data.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
        const netProfit = grossProfit - totalExpenses;
        
        // الأقساط
        const totalInstallments = this.data.installmentSales?.reduce((sum, sale) => sum + sale.totalWithInterest, 0) || 0;
        const paidInstallments = this.data.installmentSales?.reduce((sum, sale) => sum + sale.totalPaid, 0) || 0;
        const pendingInstallments = totalInstallments - paidInstallments;
        
        container.innerHTML = `
            <div class="report-stats">
                <div class="stat-item">
                    <div class="stat-value">${this.formatCurrency(totalRevenue)}</div>
                    <div class="stat-label">إجمالي الإيرادات</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.formatCurrency(grossProfit)}</div>
                    <div class="stat-label">إجمالي الربح</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${profitMargin.toFixed(2)}%</div>
                    <div class="stat-label">هامش الربح</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.formatCurrency(netProfit)}</div>
                    <div class="stat-label">صافي الربح</div>
                </div>
            </div>
            
            <div class="financial-breakdown">
                <div class="breakdown-section">
                    <h4>تفصيل مالي</h4>
                    <div class="breakdown-item">
                        <span>إجمالي المبيعات:</span>
                        <span class="positive">${this.formatCurrency(totalRevenue)}</span>
                    </div>
                    <div class="breakdown-item">
                        <span>تكلفة البضاعة المباعة:</span>
                        <span class="negative">${this.formatCurrency(totalCost)}</span>
                    </div>
                    <div class="breakdown-item">
                        <span>إجمالي الربح:</span>
                        <span class="positive">${this.formatCurrency(grossProfit)}</span>
                    </div>
                    <div class="breakdown-item">
                        <span>المصروفات:</span>
                        <span class="negative">${this.formatCurrency(totalExpenses)}</span>
                    </div>
                    <div class="breakdown-item total">
                        <span>صافي الربح:</span>
                        <span class="${netProfit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(netProfit)}</span>
                    </div>
                </div>
                
                ${this.data.installmentSales && this.data.installmentSales.length > 0 ? `
                    <div class="breakdown-section">
                        <h4>الأقساط</h4>
                        <div class="breakdown-item">
                            <span>إجمالي الأقساط:</span>
                            <span>${this.formatCurrency(totalInstallments)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span>المبلغ المحصل:</span>
                            <span class="positive">${this.formatCurrency(paidInstallments)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span>المبلغ المعلق:</span>
                            <span class="warning">${this.formatCurrency(pendingInstallments)}</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    // ======================================================================
    // الوظائف المساعدة للتقارير
    // ======================================================================
    
    getDateString(daysOffset) {
        const date = new Date();
        date.setDate(date.getDate() + daysOffset);
        return date.toISOString().split('T')[0];
    }
    
    exportReport(reportType) {
        const reportContent = document.getElementById(`${reportType}ReportContent`);
        if (!reportContent) return;
        
        const reportData = {
            type: reportType,
            generatedAt: new Date().toISOString(),
            content: reportContent.innerHTML,
            data: this.getReportData(reportType)
        };
        
        const blob = new Blob([JSON.stringify(reportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification(`تم تصدير تقرير ${reportType} بنجاح`, 'success');
    }
    
    getReportData(reportType) {
        switch (reportType) {
            case 'sales':
                return this.data.sales;
            case 'products':
                return this.data.products;
            case 'customers':
                return this.data.customers;
            case 'financial':
                return {
                    sales: this.data.sales,
                    expenses: this.data.expenses,
                    installments: this.data.installmentSales
                };
            default:
                return {};
        }
    }
    
    // ======================================================================
    // اختصارات لوحة المفاتيح
    // ======================================================================
    
    handleKeyboardShortcuts(event) {
        // التحقق من المفاتيح المضغوطة
        const { ctrlKey, altKey, shiftKey, key } = event;
        
        if (ctrlKey) {
            switch (key.toLowerCase()) {
                case 'n': // Ctrl+N - منتج جديد
                    event.preventDefault();
                    if (this.currentModule === 'products') {
                        this.openProductModal();
                    } else if (this.currentModule === 'pos') {
                        this.showModule('products');
                        setTimeout(() => this.openProductModal(), 500);
                    }
                    break;
                    
                case 's': // Ctrl+S - حفظ سريع
                    event.preventDefault();
                    this.saveAllData();
                    this.showNotification('تم حفظ البيانات', 'success');
                    break;
                    
                case 'f': // Ctrl+F - البحث
                    event.preventDefault();
                    const searchInput = document.getElementById('productSearch');
                    if (searchInput) {
                        searchInput.focus();
                        searchInput.select();
                    }
                    break;
                    
                case 'p': // Ctrl+P - طباعة
                    event.preventDefault();
                    if (this.currentModule === 'reports') {
                        this.printReports();
                    }
                    break;
                    
                case 'e': // Ctrl+E - تصدير
                    event.preventDefault();
                    this.exportData('all');
                    break;
                    
                case 'd': // Ctrl+D - لوحة التحكم
                    event.preventDefault();
                    this.showModule('dashboard');
                    break;
                    
                case 'q': // Ctrl+Q - نقطة البيع
                    event.preventDefault();
                    this.showModule('pos');
                    break;
            }
        }
        
        // اختصارات خاصة بنقطة البيع
        if (this.currentModule === 'pos') {
            if (key === 'Enter' && !ctrlKey && !altKey) {
                // إذا كان هناك منتجات في العربة، فتح نافذة الدفع
                if (this.cart.items.length > 0) {
                    this.processCashPayment();
                }
            } else if (key === 'Delete' || key === 'Backspace') {
                // مسح آخر منتج من العربة
                if (this.cart.items.length > 0 && !event.target.matches('input')) {
                    event.preventDefault();
                    this.removeFromCart(this.cart.items.length - 1);
                }
            } else if (key === 'Escape') {
                // مسح العربة
                this.clearCart();
            }
        }
        
        // إغلاق النوافذ المنبثقة بـ Escape
        if (key === 'Escape') {
            const activeModals = document.querySelectorAll('.modal.active');
            activeModals.forEach(modal => {
                this.closeModal(modal.id);
            });
        }
    }
    
    // ======================================================================
    // إدارة الاتصال والتحديثات المباشرة
    // ======================================================================
    
    handleConnectionChange(isOnline) {
        this.state.isOnline = isOnline;
        const statusElement = document.getElementById('connectionStatus');
        
        if (statusElement) {
            statusElement.textContent = isOnline ? 'متصل' : 'غير متصل';
            statusElement.className = isOnline ? 'status-online' : 'status-offline';
        }
        
        if (isOnline) {
            this.showNotification('تم استعادة الاتصال', 'success');
            // محاولة مزامنة البيانات
            this.syncData();
        } else {
            this.showNotification('انقطع الاتصال بالإنترنت', 'warning');
        }
    }
    
    async syncData() {
        // في التطبيق الحقيقي، هنا سيتم إرسال البيانات للخادم
        if (this.state.hasChanges) {
            try {
                // محاكاة إرسال البيانات
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                this.state.hasChanges = false;
                this.state.lastSync = new Date().toISOString();
                
                this.showNotification('تم مزامنة البيانات بنجاح', 'success');
            } catch (error) {
                console.error('Sync failed:', error);
                this.showNotification('فشل في مزامنة البيانات', 'error');
            }
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
        
        // نسخ احتياطية تلقائية كل ساعة
        setInterval(() => {
            this.createAutomaticBackup();
        }, 60 * 60 * 1000);
        
        // مزامنة البيانات كل 5 دقائق
        setInterval(() => {
            if (this.state.isOnline) {
                this.syncData();
            }
        }, 5 * 60 * 1000);
    }
    
    handleBeforeUnload() {
        // حفظ البيانات قبل إغلاق التطبيق
        this.saveAllData();
    }
    
    // ======================================================================
    // وظائف إضافية للأزرار العائمة
    // ======================================================================
    
    toggleFabMenu() {
        const fabMenu = document.getElementById('fabMenu');
        if (fabMenu) {
            fabMenu.classList.toggle('active');
        }
    }
    
    quickAddProduct() {
        this.openProductModal();
        this.toggleFabMenu();
    }
    
    quickSale() {
        this.showModule('pos');
        this.toggleFabMenu();
    }
    
    openBarcodeScanner() {
        // في التطبيق الحقيقي، هنا ستفتح كاميرا لمسح الباركود
        this.showNotification('ميزة مسح الباركود قيد التطوير', 'info');
        this.toggleFabMenu();
    }
    
    openCalculator() {
        // فتح آلة حاسبة بسيطة
        const calculatorHTML = `
            <div id="calculatorModal" class="modal active" style="display: flex;">
                <div class="modal-content" style="max-width: 300px;">
                    <div class="modal-header">
                        <h3>آلة حاسبة</h3>
                        <button class="close-btn" onclick="pos.closeModal('calculatorModal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="calculator">
                        <input type="text" id="calculatorDisplay" readonly style="font-size: 24px; text-align: left; margin-bottom: 10px;">
                        <div class="calculator-buttons" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                            <button onclick="pos.calcInput('C')" class="btn btn-danger">C</button>
                            <button onclick="pos.calcInput('/')" class="btn btn-secondary">÷</button>
                            <button onclick="pos.calcInput('*')" class="btn btn-secondary">×</button>
                            <button onclick="pos.calcInput('backspace')" class="btn btn-warning">⌫</button>
                            <button onclick="pos.calcInput('7')" class="btn btn-outline">7</button>
                            <button onclick="pos.calcInput('8')" class="btn btn-outline">8</button>
                            <button onclick="pos.calcInput('9')" class="btn btn-outline">9</button>
                            <button onclick="pos.calcInput('-')" class="btn btn-secondary">-</button>
                            <button onclick="pos.calcInput('4')" class="btn btn-outline">4</button>
                            <button onclick="pos.calcInput('5')" class="btn btn-outline">5</button>
                            <button onclick="pos.calcInput('6')" class="btn btn-outline">6</button>
                            <button onclick="pos.calcInput('+')" class="btn btn-secondary">+</button>
                            <button onclick="pos.calcInput('1')" class="btn btn-outline">1</button>
                            <button onclick="pos.calcInput('2')" class="btn btn-outline">2</button>
                            <button onclick="pos.calcInput('3')" class="btn btn-outline">3</button>
                            <button onclick="pos.calcInput('=')" class="btn btn-success" style="grid-row: span 2;">=</button>
                            <button onclick="pos.calcInput('0')" class="btn btn-outline" style="grid-column: span 2;">0</button>
                            <button onclick="pos.calcInput('.')" class="btn btn-outline">.</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', calculatorHTML);
        this.calculatorValue = '0';
        this.calculatorOperation = null;
        this.calculatorPrevious = null;
        this.updateCalculatorDisplay();
        this.toggleFabMenu();
    }
    
    calcInput(input) {
        const display = document.getElementById('calculatorDisplay');
        
        if (input === 'C') {
            this.calculatorValue = '0';
            this.calculatorOperation = null;
            this.calculatorPrevious = null;
        } else if (input === 'backspace') {
            this.calculatorValue = this.calculatorValue.slice(0, -1) || '0';
        } else if (['+', '-', '*', '/'].includes(input)) {
            if (this.calculatorOperation && this.calculatorPrevious !== null) {
                this.calculateResult();
            }
            this.calculatorOperation = input;
            this.calculatorPrevious = parseFloat(this.calculatorValue);
            this.calculatorValue = '0';
        } else if (input === '=') {
            this.calculateResult();
        } else if (input === '.') {
            if (!this.calculatorValue.includes('.')) {
                this.calculatorValue += '.';
            }
        } else {
            if (this.calculatorValue === '0') {
                this.calculatorValue = input;
            } else {
                this.calculatorValue += input;
            }
        }
        
        this.updateCalculatorDisplay();
    }
    
    calculateResult() {
        if (this.calculatorOperation && this.calculatorPrevious !== null) {
            const current = parseFloat(this.calculatorValue);
            let result;
            
            switch (this.calculatorOperation) {
                case '+':
                    result = this.calculatorPrevious + current;
                    break;
                case '-':
                    result = this.calculatorPrevious - current;
                    break;
                case '*':
                    result = this.calculatorPrevious * current;
                    break;
                case '/':
                    result = current !== 0 ? this.calculatorPrevious / current : 0;
                    break;
                default:
                    return;
            }
            
            this.calculatorValue = result.toString();
            this.calculatorOperation = null;
            this.calculatorPrevious = null;
        }
    }
    
    updateCalculatorDisplay() {
        const display = document.getElementById('calculatorDisplay');
        if (display) {
            display.value = this.calculatorValue;
        }
    }
}

// ======================================================================
// الوظائف العامة
// ======================================================================

// إنشاء نسخة من النظام
let pos;

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    pos = new POSSystem();
    
    // ربط الوظائف العامة بالنظام
    window.showModule = (module) => pos.showModule(module);
    window.pos = pos; // جعل النظام متاحاً عالمياً للاختبار والتطوير
});

// وظائف مساعدة عامة
function previewImage(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
                
                const placeholder = input.parentElement.querySelector('.upload-placeholder');
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
            }
        };
        reader.readAsDataURL(file);
    }
}

function previewMultipleImages(input) {
    const files = input.files;
    const previewContainer = document.getElementById('additionalImagesPreview');
    
    if (previewContainer) {
        previewContainer.innerHTML = '';
        
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'image-preview-item';
                imgDiv.innerHTML = `
                    <img src="${e.target.result}" alt="صورة إضافية">
                    <button type="button" onclick="this.parentElement.remove()">×</button>
                `;
                previewContainer.appendChild(imgDiv);
            };
            reader.readAsDataURL(file);
        });
    }
}

function switchTab(button, tabId) {
    // إزالة التحديد من جميع الأزرار
    const tabButtons = button.parentElement.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // إزالة التحديد من جميع التبويبات
    const tabContents = button.closest('.modal-form').querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // تحديد الزر والتبويب الحالي
    button.classList.add('active');
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

// وظائف للأحداث المنبثقة
document.addEventListener('click', function(event) {
    // إغلاق القوائم المنسدلة عند النقر خارجها
    if (!event.target.closest('.user-menu')) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }
    
    // إغلاق قائمة الأزرار العائمة عند النقر خارجها
    if (!event.target.closest('.floating-actions')) {
        const fabMenu = document.getElementById('fabMenu');
        if (fabMenu) {
            fabMenu.classList.remove('active');
        }
    }
    
    // إغلاق النوافذ المنبثقة عند النقر على الخلفية
    if (event.target.classList.contains('modal')) {
        pos.closeModal(event.target.id);
    }
});

// معالجة الأحداث الخاصة بطرق الدفع
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('payment-method')) {
        document.querySelectorAll('.payment-method').forEach(method => {
            method.classList.remove('active');
        });
        event.target.classList.add('active');
        
        const method = event.target.dataset.method;
        if (pos) {
            pos.showPaymentForm(method);
        }
    }
});

// تصدير النظام للاستخدام العام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = POSSystem;
}

console.log('POS System JavaScript loaded successfully');
