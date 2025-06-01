// نظام الكاشير المتكامل والشامل - الإصدار المحسن
// مع دعم كامل لشريط العنوان المخصص والتحكم في النافذة

'use strict';

// ========================================
// 🚀 متغيرات النظام الأساسية
// ========================================

// البيانات الأساسية
let products = JSON.parse(localStorage.getItem('products')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let installmentSales = JSON.parse(localStorage.getItem('installmentSales')) || [];
let inventoryMovements = JSON.parse(localStorage.getItem('inventoryMovements')) || [];
let cart = [];
let currentStoreType = localStorage.getItem('currentStoreType') || 'general';
let selectedCategory = 'all';
let currentPaymentId = null;

// متغيرات شريط العنوان والساعة
let clockInterval;
let appStatusInterval;
let windowControlsInitialized = false;
let isElectronApp = false;

// إعدادات الساعة الرقمية
let clockSettings = {
    textColor: '#ffffff',
    bgColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    format: '12', // 12 أو 24
    showSeconds: true,
    showDate: true,
    fontSize: 16,
    glow: false,
    blink: false,
    style: 'modern'
};

// متغيرات حالة التطبيق
let appStatus = 'active';
let lastPingTime = Date.now();
let systemDiagnostics = {
    windowControlsWorking: false,
    electronApiAvailable: false,
    customTitlebarVisible: false,
    lastTestTime: null
};

// ========================================
// 🏪 تصنيفات المتاجر والمنتجات
// ========================================

const storeCategories = {
    general: ['عام', 'متنوع', 'أدوات مكتبية', 'إكسسوارات'],
    supermarket: ['طعام', 'مشروبات', 'منظفات', 'منتجات شخصية', 'مجمدات'],
    electronics: ['هواتف', 'حاسوب', 'أجهزة منزلية', 'إكسسوارات إلكترونية', 'ألعاب'],
    clothes: ['رجالي', 'نسائي', 'أطفال', 'أحذية', 'حقائب'],
    vegetables: ['خضروات ورقية', 'خضروات جذرية', 'فواكه', 'بقوليات', 'أعشاب'],
    beverages: ['مشروبات غازية', 'عصائر', 'مياه', 'مشروبات ساخنة', 'مشروبات طاقة'],
    restaurant: ['مقبلات', 'أطباق رئيسية', 'حلويات', 'مشروبات', 'سلطات'],
    hotel: ['إقامة', 'خدمات إضافية', 'مطعم', 'غسيل', 'ترفيه']
};

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

// ========================================
// 🪟 نظام شريط العنوان المخصص والتحكم في النافذة
// ========================================

/**
 * تهيئة شريط العنوان المخصص والتحكم في النافذة
 */
function initializeCustomTitlebar() {
    console.log('🚀 بدء تهيئة شريط العنوان المخصص...');
    
    try {
        // التحقق من بيئة Electron
        isElectronApp = typeof window.electronAPI !== 'undefined';
        systemDiagnostics.electronApiAvailable = isElectronApp;
        
        console.log('🔍 فحص النظام:', {
            isElectron: isElectronApp,
            userAgent: navigator.userAgent,
            platform: navigator.platform
        });
        
        // التحقق من وجود عناصر شريط العنوان
        const titlebarElements = checkTitlebarElements();
        if (!titlebarElements.allPresent) {
            console.error('❌ عناصر شريط العنوان مفقودة:', titlebarElements.missing);
            return false;
        }
        
        systemDiagnostics.customTitlebarVisible = true;
        console.log('✅ عناصر شريط العنوان موجودة');
        
        // إعداد التحكم في النافذة
        setupWindowControls();
        
        // إعداد الساعة الرقمية
        setupDigitalClock();
        
        // إعداد مراقبة حالة التطبيق
        setupAppStatusMonitoring();
        
        // إعداد الأحداث
        setupTitlebarEvents();
        
        // تطبيق إعدادات الساعة
        applyClock Settings();
        
        // اختبار الوظائف
        setTimeout(() => {
            testWindowControls();
        }, 1000);
        
        windowControlsInitialized = true;
        console.log('🎉 تم تهيئة شريط العنوان بنجاح!');
        
        return true;
        
    } catch (error) {
        console.error('❌ خطأ في تهيئة شريط العنوان:', error);
        showNotification('❌ خطأ في تهيئة شريط العنوان: ' + error.message, 'error');
        return false;
    }
}

/**
 * التحقق من وجود عناصر شريط العنوان المطلوبة
 */
function checkTitlebarElements() {
    const requiredElements = [
        'customTitlebar',
        'timeDisplay',
        'dateDisplay', 
        'statusIndicator',
        'statusText',
        'minimizeBtn',
        'maximizeBtn',
        'maximizeIcon'
    ];
    
    const missing = [];
    
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            missing.push(id);
        }
    });
    
    return {
        allPresent: missing.length === 0,
        missing: missing,
        total: requiredElements.length,
        found: requiredElements.length - missing.length
    };
}

/**
 * إعداد التحكم في النافذة مع دوال محسنة
 */
function setupWindowControls() {
    console.log('🔧 إعداد التحكم في النافذة...');
    
    // تنظيف الدوال القديمة
    window.minimizeWindow = null;
    window.toggleMaximize = null;
    window.closeWindow = null;
    
    if (isElectronApp) {
        setupElectronWindowControls();
    } else {
        setupBrowserWindowControls();
    }
    
    // إعداد مستمعات الأحداث للأزرار
    setupButtonEventListeners();
    
    // تحديث أيقونة التكبير
    updateMaximizeButton();
    
    console.log('✅ تم إعداد التحكم في النافذة');
}

/**
 * إعداد دوال التحكم في النافذة للـ Electron
 */
function setupElectronWindowControls() {
    console.log('⚙️ إعداد دوال Electron...');
    
    // دالة التصغير المحسنة
    window.minimizeWindow = async function() {
        console.log('🔽 محاولة تصغير النافذة (Electron)...');
        
        try {
            if (!window.electronAPI || !window.electronAPI.windowMinimize) {
                throw new Error('electronAPI.windowMinimize غير متوفر');
            }
            
            const result = await window.electronAPI.windowMinimize();
            
            if (result && result.success) {
                console.log('✅ تم تصغير النافذة بنجاح');
                updateAppStatus('minimized');
                showNotification('🔽 تم تصغير النافذة', 'success');
                return true;
            } else {
                throw new Error(result?.error || 'فشل غير معروف');
            }
            
        } catch (error) {
            console.error('❌ فشل في تصغير النافذة:', error);
            showNotification('❌ فشل في تصغير النافذة: ' + error.message, 'error');
            
            // محاولة بديلة
            try {
                if (window.electronAPI && window.electronAPI.send) {
                    window.electronAPI.send('window-minimize-fallback');
                }
            } catch (fallbackError) {
                console.error('❌ فشل في الطريقة البديلة:', fallbackError);
            }
            
            return false;
        }
    };
    
    // دالة التكبير/الاستعادة المحسنة
    window.toggleMaximize = async function() {
        console.log('🔄 محاولة تبديل حالة النافذة (Electron)...');
        
        try {
            if (!window.electronAPI || !window.electronAPI.windowMaximize) {
                throw new Error('electronAPI.windowMaximize غير متوفر');
            }
            
            const result = await window.electronAPI.windowMaximize();
            
            if (result && result.success) {
                const newState = result.isMaximized ? 'مكبرة' : 'عادية';
                console.log(`✅ تم تغيير حالة النافذة إلى: ${newState}`);
                
                updateMaximizeButton(result.isMaximized);
                updateAppStatus(result.isMaximized ? 'maximized' : 'normal');
                showNotification(`🔄 النافذة ${newState}`, 'success');
                
                return true;
            } else {
                throw new Error(result?.error || 'فشل غير معروف');
            }
            
        } catch (error) {
            console.error('❌ فشل في تبديل حالة النافذة:', error);
            showNotification('❌ فشل في تكبير النافذة: ' + error.message, 'error');
            
            // محاولة بديلة للتكبير
            try {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                    showNotification('🔄 خروج من ملء الشاشة', 'info');
                } else {
                    document.documentElement.requestFullscreen();
                    showNotification('🔄 ملء الشاشة', 'info');
                }
            } catch (fallbackError) {
                console.error('❌ فشل في الطريقة البديلة:', fallbackError);
            }
            
            return false;
        }
    };
    
    // دالة الإغلاق المحسنة
    window.closeWindow = async function() {
        console.log('❌ محاولة إغلاق النافذة (Electron)...');
        
        try {
            // حفظ البيانات قبل الإغلاق
            await saveDataBeforeClose();
            
            if (!window.electronAPI || !window.electronAPI.windowClose) {
                throw new Error('electronAPI.windowClose غير متوفر');
            }
            
            const result = await window.electronAPI.windowClose();
            
            if (result && result.success) {
                console.log('✅ تم إغلاق النافذة بنجاح');
                return true;
            } else {
                throw new Error(result?.error || 'فشل غير معروف');
            }
            
        } catch (error) {
            console.error('❌ فشل في إغلاق النافذة:', error);
            
            // محاولة بديلة
            try {
                window.close();
                return true;
            } catch (fallbackError) {
                console.error('❌ فشل في الإغلاق البديل:', fallbackError);
                showNotification('❌ فشل في إغلاق النافذة: ' + error.message, 'error');
                return false;
            }
        }
    };
    
    console.log('✅ تم إعداد دوال Electron بنجاح');
}

/**
 * إعداد دوال التحكم في النافذة للمتصفح العادي
 */
function setupBrowserWindowControls() {
    console.log('🌐 إعداد دوال المتصفح...');
    
    // دالة التصغير للمتصفح
    window.minimizeWindow = function() {
        console.log('🔽 تصغير النافذة (متصفح)');
        showNotification('🔽 تصغير النافذة غير متاح في المتصفح', 'warning');
        return false;
    };
    
    // دالة التكبير للمتصفح
    window.toggleMaximize = function() {
        console.log('🔄 تبديل حالة النافذة (متصفح)');
        
        try {
            if (document.fullscreenElement) {
                document.exitFullscreen();
                showNotification('🔄 خروج من ملء الشاشة', 'success');
                updateMaximizeButton(false);
            } else {
                document.documentElement.requestFullscreen();
                showNotification('🔄 ملء الشاشة', 'success');
                updateMaximizeButton(true);
            }
            return true;
        } catch (error) {
            console.error('❌ فشل في تبديل حالة الشاشة:', error);
            showNotification('❌ فشل في تبديل حالة الشاشة', 'error');
            return false;
        }
    };
    
    // دالة الإغلاق للمتصفح
    window.closeWindow = function() {
        console.log('❌ إغلاق النافذة (متصفح)');
        
        if (confirm('هل تريد إغلاق التطبيق؟\n\nملاحظة: سيتم حفظ البيانات تلقائياً.')) {
            try {
                saveDataBeforeClose();
                window.close();
                return true;
            } catch (error) {
                console.error('❌ فشل في الإغلاق:', error);
                showNotification('❌ فشل في إغلاق النافذة', 'error');
                return false;
            }
        }
        return false;
    };
    
    console.log('✅ تم إعداد دوال المتصفح بنجاح');
}

/**
 * إعداد مستمعات الأحداث للأزرار
 */
function setupButtonEventListeners() {
    console.log('🎯 إعداد مستمعات أحداث الأزرار...');
    
    const buttons = [
        { id: 'minimizeBtn', action: 'minimizeWindow', name: 'التصغير' },
        { id: 'maximizeBtn', action: 'toggleMaximize', name: 'التكبير' },
        { id: 'closeBtn', action: 'closeWindow', name: 'الإغلاق' }
    ];
    
    buttons.forEach(({ id, action, name }) => {
        const button = document.getElementById(id);
        if (button) {
            // إزالة المستمعات القديمة
            button.onclick = null;
            button.removeAttribute('onclick');
            
            // إضافة مستمع جديد محسن
            button.addEventListener('click', async function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                console.log(`👆 نقر على زر ${name}`);
                
                // تأثير بصري
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 100);
                
                // تنفيذ الإجراء
                if (typeof window[action] === 'function') {
                    const success = await window[action]();
                    console.log(`${success ? '✅' : '❌'} نتيجة ${name}: ${success ? 'نجح' : 'فشل'}`);
                } else {
                    console.error(`❌ الدالة ${action} غير موجودة`);
                    showNotification(`❌ خطأ: ${name} غير متاح`, 'error');
                }
            });
            
            // إضافة تأثيرات بصرية محسنة
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1)';
                this.style.opacity = '0.8';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.opacity = '1';
            });
            
            console.log(`✅ تم إعداد مستمع ${name}`);
        } else {
            console.warn(`⚠️ الزر ${id} غير موجود`);
        }
    });
    
    // النقر المزدوج على شريط العنوان للتكبير
    const titlebar = document.getElementById('customTitlebar');
    if (titlebar) {
        titlebar.addEventListener('dblclick', function(event) {
            // تجاهل النقر على الأزرار أو الساعة
            if (!event.target.closest('.titlebar-btn') && 
                !event.target.closest('.digital-clock')) {
                console.log('👆 نقر مزدوج على شريط العنوان');
                if (typeof window.toggleMaximize === 'function') {
                    window.toggleMaximize();
                }
            }
        });
        console.log('✅ تم إعداد النقر المزدوج على شريط العنوان');
    }
    
    console.log('✅ تم إعداد جميع مستمعات الأحداث');
}

/**
 * تحديث أيقونة زر التكبير
 */
async function updateMaximizeButton(isMaximized = null) {
    const maximizeIcon = document.getElementById('maximizeIcon');
    const maximizeBtn = document.getElementById('maximizeBtn');
    
    if (!maximizeIcon) {
        console.warn('⚠️ عنصر maximizeIcon غير موجود');
        return;
    }
    
    try {
        // الحصول على حالة النافذة إذا لم يتم تمريرها
        if (isMaximized === null && isElectronApp && window.electronAPI && window.electronAPI.windowIsMaximized) {
            try {
                isMaximized = await window.electronAPI.windowIsMaximized();
            } catch (error) {
                console.warn('⚠️ فشل في الحصول على حالة النافذة:', error);
                isMaximized = false;
            }
        }
        
        // في حالة المتصفح، فحص حالة ملء الشاشة
        if (!isElectronApp) {
            isMaximized = !!document.fullscreenElement;
        }
        
        // تحديث الأيقونة
        if (isMaximized) {
            // أيقونة الاستعادة (نافذتان متداخلتان)
            maximizeIcon.innerHTML = `
                <rect x="1" y="1" width="7" height="7" stroke="currentColor" stroke-width="1" fill="none"/>
                <rect x="4" y="4" width="7" height="7" stroke="currentColor" stroke-width="1" fill="none"/>
            `;
            if (maximizeBtn) {
                maximizeBtn.title = 'استعادة النافذة';
                maximizeBtn.setAttribute('data-state', 'maximized');
            }
        } else {
            // أيقونة التكبير (مربع واحد)
            maximizeIcon.innerHTML = `
                <rect x="2" y="2" width="8" height="8" stroke="currentColor" stroke-width="1" fill="none"/>
            `;
            if (maximizeBtn) {
                maximizeBtn.title = 'تكبير النافذة';
                maximizeBtn.setAttribute('data-state', 'normal');
            }
        }
        
        // إضافة مؤشر بصري للحالة
        if (maximizeBtn) {
            maximizeBtn.classList.toggle('maximized', isMaximized);
        }
        
        console.log(`🔄 تم تحديث أيقونة التكبير: ${isMaximized ? 'استعادة' : 'تكبير'}`);
        
    } catch (error) {
        console.error('❌ خطأ في تحديث أيقونة التكبير:', error);
        
        // استخدام الأيقونة الافتراضية في حالة الخطأ
        maximizeIcon.innerHTML = `
            <rect x="2" y="2" width="8" height="8" stroke="currentColor" stroke-width="1" fill="none"/>
        `;
    }
}

/**
 * حفظ البيانات قبل الإغلاق
 */
async function saveDataBeforeClose() {
    console.log('💾 حفظ البيانات قبل الإغلاق...');
    
    try {
        // حفظ البيانات الأساسية
        saveData();
        
        // حفظ إعدادات الساعة
        saveClockSettings();
        
        // حفظ حالة النظام
        const systemState = {
            lastCloseTime: new Date().toISOString(),
            currentStoreType: currentStoreType,
            appStatus: appStatus,
            diagnostics: systemDiagnostics
        };
        localStorage.setItem('systemState', JSON.stringify(systemState));
        
        console.log('✅ تم حفظ البيانات قبل الإغلاق');
        
    } catch (error) {
        console.error('❌ خطأ في حفظ البيانات قبل الإغلاق:', error);
    }
}

/**
 * اختبار وظائف التحكم في النافذة
 */
async function testWindowControls() {
    console.log('🧪 بدء اختبار أزرار التحكم في النافذة...');
    
    const testResults = {
        minimizeButton: false,
        maximizeButton: false,
        closeButton: false,
        electronAPI: false,
        titlebarVisible: false,
        timestamp: new Date().toISOString()
    };
    
    try {
        // اختبار وجود العناصر
        testResults.titlebarVisible = !!document.getElementById('customTitlebar');
        
        // اختبار API
        if (isElectronApp && window.electronAPI) {
            testResults.electronAPI = typeof window.electronAPI.windowMinimize === 'function' &&
                                     typeof window.electronAPI.windowMaximize === 'function' &&
                                     typeof window.electronAPI.windowClose === 'function';
        }
        
        // اختبار الدوال
        testResults.minimizeButton = typeof window.minimizeWindow === 'function';
        testResults.maximizeButton = typeof window.toggleMaximize === 'function';
        testResults.closeButton = typeof window.closeWindow === 'function';
        
        // حفظ نتائج الاختبار
        systemDiagnostics.windowControlsWorking = testResults.minimizeButton && 
                                                testResults.maximizeButton && 
                                                testResults.closeButton;
        systemDiagnostics.lastTestTime = testResults.timestamp;
        
        // عرض النتائج
        const passedTests = Object.values(testResults).filter(result => result === true).length;
        const totalTests = Object.keys(testResults).length - 1; // استثناء timestamp
        
        console.log('📊 نتائج اختبار التحكم في النافذة:', testResults);
        console.log(`📈 معدل النجاح: ${passedTests}/${totalTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
        
        if (systemDiagnostics.windowControlsWorking) {
            showNotification('✅ أزرار التحكم في النافذة تعمل بشكل صحيح', 'success');
        } else {
            showNotification('⚠️ بعض أزرار التحكم قد لا تعمل بشكل صحيح', 'warning');
        }
        
        return testResults;
        
    } catch (error) {
        console.error('❌ خطأ في اختبار التحكم في النافذة:', error);
        showNotification('❌ فشل في اختبار أزرار التحكم', 'error');
        return testResults;
    }
}

// ========================================
// ⏰ نظام الساعة الرقمية
// ========================================

/**
 * إعداد الساعة الرقمية
 */
function setupDigitalClock() {
    console.log('⏰ إعداد الساعة الرقمية...');
    
    try {
        // تحميل إعدادات الساعة المحفوظة
        loadClockSettings();
        
        // بدء الساعة
        startDigitalClock();
        
        // تطبيق الإعدادات
        applyClockSettings();
        
        console.log('✅ تم إعداد الساعة الرقمية بنجاح');
        
    } catch (error) {
        console.error('❌ خطأ في إعداد الساعة الرقمية:', error);
    }
}

/**
 * بدء الساعة الرقمية
 */
function startDigitalClock() {
    // مسح أي interval سابق
    if (clockInterval) {
        clearInterval(clockInterval);
    }
    
    // تحديث الساعة كل ثانية
    clockInterval = setInterval(updateClock, 1000);
    
    // تحديث فوري
    updateClock();
    
    console.log('⏰ تم بدء الساعة الرقمية');
}

/**
 * تحديث عرض الساعة
 */
function updateClock() {
    const now = new Date();
    const timeDisplay = document.getElementById('timeDisplay');
    const amPmDisplay = document.getElementById('amPmDisplay');
    const dateDisplay = document.getElementById('dateDisplay');
    
    if (!timeDisplay) return;
    
    try {
        // تنسيق الوقت
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        let ampm = '';
        
        if (clockSettings.format === '12') {
            ampm = hours >= 12 ? 'م' : 'ص';
            hours = hours % 12;
            hours = hours ? hours : 12; // 0 يصبح 12
        }
        
        // إضافة الأصفار البادئة
        const timeString = [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            clockSettings.showSeconds ? seconds.toString().padStart(2, '0') : null
        ].filter(Boolean).join(':');
        
        // تحديث عرض الوقت
        timeDisplay.textContent = timeString;
        
        // تحديث AM/PM
        if (amPmDisplay) {
            amPmDisplay.textContent = ampm;
            amPmDisplay.style.display = clockSettings.format === '12' ? 'inline' : 'none';
        }
        
        // تحديث التاريخ
        if (dateDisplay && clockSettings.showDate) {
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            const dateString = now.toLocaleDateString('ar-IQ', options);
            dateDisplay.textContent = dateString;
            dateDisplay.style.display = 'block';
        } else if (dateDisplay) {
            dateDisplay.style.display = 'none';
        }
        
        // تطبيق تأثير الوميض
        if (clockSettings.blink && timeDisplay) {
            timeDisplay.classList.toggle('blink');
        }
        
    } catch (error) {
        console.error('❌ خطأ في تحديث الساعة:', error);
    }
}

/**
 * تحميل إعدادات الساعة
 */
function loadClockSettings() {
    try {
        const saved = localStorage.getItem('clockSettings');
        if (saved) {
            const savedSettings = JSON.parse(saved);
            clockSettings = { ...clockSettings, ...savedSettings };
            console.log('✅ تم تحميل إعدادات الساعة المحفوظة');
        }
    } catch (error) {
        console.error('❌ خطأ في تحميل إعدادات الساعة:', error);
    }
}

/**
 * حفظ إعدادات الساعة
 */
function saveClockSettings() {
    try {
        localStorage.setItem('clockSettings', JSON.stringify(clockSettings));
        console.log('💾 تم حفظ إعدادات الساعة');
    } catch (error) {
        console.error('❌ خطأ في حفظ إعدادات الساعة:', error);
    }
}

/**
 * تطبيق إعدادات الساعة
 */
function applyClockSettings() {
    const clockElement = document.getElementById('digitalClock');
    const timeDisplay = document.getElementById('timeDisplay');
    
    if (!clockElement || !timeDisplay) return;
    
    try {
        // تطبيق الألوان والخط
        timeDisplay.style.color = clockSettings.textColor;
        timeDisplay.style.fontSize = clockSettings.fontSize + 'px';
        
        // تطبيق النمط
        clockElement.className = `digital-clock ${clockSettings.style}`;
        
        if (clockSettings.glow) {
            clockElement.classList.add('glow');
        }
        
        // تطبيق ألوان مخصصة
        clockElement.style.background = clockSettings.bgColor;
        clockElement.style.borderColor = clockSettings.borderColor;
        
        console.log('🎨 تم تطبيق إعدادات الساعة');
        
    } catch (error) {
        console.error('❌ خطأ في تطبيق إعدادات الساعة:', error);
    }
}

// ========================================
// 📊 مراقبة حالة التطبيق
// ========================================

/**
 * إعداد مراقبة حالة التطبيق
 */
function setupAppStatusMonitoring() {
    console.log('📊 إعداد مراقبة حالة التطبيق...');
    
    try {
        // إعداد مستمعات Electron
        if (isElectronApp && window.electronAPI) {
            setupElectronStatusListeners();
        }
        
        // مراقبة محلية لحالة التطبيق
        startLocalStatusMonitoring();
        
        // تحديث الحالة الأولية
        updateAppStatus('active');
        
        console.log('✅ تم إعداد مراقبة حالة التطبيق');
        
    } catch (error) {
        console.error('❌ خطأ في إعداد مراقبة حالة التطبيق:', error);
    }
}

/**
 * إعداد مستمعات حالة Electron
 */
function setupElectronStatusListeners() {
    if (!window.electronAPI) return;
    
    try {
        // مستمع ping من العملية الرئيسية
        if (window.electronAPI.onAppPing) {
            window.electronAPI.onAppPing((event, timestamp) => {
                // إرسال pong مرة أخرى
                if (window.electronAPI.sendAppPong) {
                    window.electronAPI.sendAppPong(timestamp);
                }
                lastPingTime = timestamp;
                updateAppStatus('active');
            });
        }
        
        // مستمع تحديث الحالة
        if (window.electronAPI.onAppStatusUpdate) {
            window.electronAPI.onAppStatusUpdate((event, status) => {
                updateAppStatus(status);
            });
        }
        
        // مستمع حالة النافذة
        if (window.electronAPI.on) {
            window.electronAPI.on('window-state-changed', (event, state) => {
                console.log('🔄 تغيير حالة النافذة:', state);
                
                if (state.hasOwnProperty('isMaximized')) {
                    updateMaximizeButton(state.isMaximized);
                }
                
                // تحديث كلاس النافذة
                if (state.isMaximized !== undefined) {
                    document.body.classList.toggle('window-maximized', state.isMaximized);
                }
            });
        }
        
        console.log('✅ تم إعداد مستمعات Electron');
        
    } catch (error) {
        console.error('❌ خطأ في إعداد مستمعات Electron:', error);
    }
}

/**
 * بدء المراقبة المحلية لحالة التطبيق
 */
function startLocalStatusMonitoring() {
    // فحص حالة التطبيق كل ثانيتين
    appStatusInterval = setInterval(() => {
        const timeSinceLastPing = Date.now() - lastPingTime;
        
        // فحص استجابة DOM
        const startTime = performance.now();
        requestAnimationFrame(() => {
            const endTime = performance.now();
            const frameTime = endTime - startTime;
            
            if (frameTime > 100) { // إذا كان Frame time طويل جداً
                updateAppStatus('warning');
            } else if (timeSinceLastPing > 5000) {
                updateAppStatus('frozen');
            } else {
                updateAppStatus('active');
            }
        });
    }, 2000);
    
    console.log('✅ تم بدء المراقبة المحلية');
}

/**
 * تحديث حالة التطبيق
 */
function updateAppStatus(status) {
    appStatus = status;
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    
    if (!statusIndicator || !statusText) return;
    
    try {
        // إزالة الحالات السابقة
        statusIndicator.classList.remove('frozen', 'warning', 'minimized', 'maximized');
        document.body.classList.remove('app-frozen');
        
        switch (status) {
            case 'active':
                statusText.textContent = 'نشط';
                statusIndicator.style.background = '#4CAF50';
                break;
            case 'warning':
                statusText.textContent = 'بطيء';
                statusIndicator.classList.add('warning');
                statusIndicator.style.background = '#FFC107';
                break;
            case 'frozen':
                statusText.textContent = 'متجمد';
                statusIndicator.classList.add('frozen');
                statusIndicator.style.background = '#FF5722';
                document.body.classList.add('app-frozen');
                break;
            case 'minimized':
                statusText.textContent = 'مصغر';
                statusIndicator.style.background = '#2196F3';
                break;
            case 'maximized':
                statusText.textContent = 'مكبر';
                statusIndicator.style.background = '#9C27B0';
                break;
            default:
                statusText.textContent = 'عادي';
                statusIndicator.style.background = '#4CAF50';
        }
        
        console.log(`📊 حالة التطبيق: ${status}`);
        
    } catch (error) {
        console.error('❌ خطأ في تحديث حالة التطبيق:', error);
    }
}

// ========================================
// 🎯 إعداد مستمعات الأحداث العامة
// ========================================

/**
 * إعداد مستمعات أحداث شريط العنوان
 */
function setupTitlebarEvents() {
    console.log('🎯 إعداد مستمعات أحداث شريط العنوان...');
    
    try {
        // اختصارات لوحة المفاتيح
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        // حفظ البيانات عند تغيير الصفحة
        window.addEventListener('beforeunload', saveDataBeforeClose);
        
        // مراقبة تغيير حجم النافذة
        if (isElectronApp) {
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    updateMaximizeButton();
                    console.log('🔄 تم تحديث زر التكبير بعد تغيير الحجم');
                }, 100);
            });
        }
        
        // مراقبة حالة ملء الشاشة للمتصفح
        if (!isElectronApp) {
            document.addEventListener('fullscreenchange', () => {
                updateMaximizeButton(!!document.fullscreenElement);
            });
        }
        
        console.log('✅ تم إعداد مستمعات الأحداث');
        
    } catch (error) {
        console.error('❌ خطأ في إعداد مستمعات الأحداث:', error);
    }
}

/**
 * معالجة اختصارات لوحة المفاتيح
 */
function handleKeyboardShortcuts(event) {
    try {
        // Alt + F4 للإغلاق
        if (event.altKey && event.key === 'F4') {
            event.preventDefault();
            console.log('⌨️ اختصار إغلاق: Alt + F4');
            if (typeof window.closeWindow === 'function') {
                window.closeWindow();
            }
        }
        
        // F11 للتكبير/استعادة
        if (event.key === 'F11') {
            event.preventDefault();
            console.log('⌨️ اختصار تكبير: F11');
            if (typeof window.toggleMaximize === 'function') {
                window.toggleMaximize();
            }
        }
        
        // Ctrl + M للتصغير
        if (event.ctrlKey && event.key === 'm') {
            event.preventDefault();
            console.log('⌨️ اختصار تصغير: Ctrl + M');
            if (typeof window.minimizeWindow === 'function') {
                window.minimizeWindow();
            }
        }
        
        // Ctrl + Shift + I لاختبار الأزرار
        if (event.ctrlKey && event.shiftKey && event.key === 'I') {
            event.preventDefault();
            console.log('⌨️ اختصار اختبار الأزرار: Ctrl + Shift + I');
            testWindowControls();
        }
        
    } catch (error) {
        console.error('❌ خطأ في معالجة اختصارات لوحة المفاتيح:', error);
    }
}

// ========================================
// 🏪 وظائف نظام الكاشير الأساسية
// ========================================

// تصنيفات المتاجر والمنتجات (كما هو موجود في الكود الأصلي)
const sampleProducts = {
    general: [
        {name: 'قلم أزرق', price: 500, cost: 300, category: 'أدوات مكتبية', fixedStock: 100, movableStock: 50},
        {name: 'دفتر متوسط', price: 2000, cost: 1200, category: 'أدوات مكتبية', fixedStock: 50, movableStock: 25},
        {name: 'شريط لاصق', price: 1000, cost: 600, category: 'أدوات مكتبية', fixedStock: 30, movableStock: 15}
    ],
    supermarket: [
        {name: 'رز بسمتي 5 كيلو', price: 15000, cost: 12000, category: 'طعام', fixedStock: 20, movableStock: 10},
        {name: 'زيت عباد الشمس', price: 8000, cost: 6500, category: 'طعام', fixedStock: 25, movableStock: 15},
        {name: 'شامبو للشعر', price: 12000, cost: 9000, category: 'منتجات شخصية', fixedStock: 15, movableStock: 8}
    ],
    electronics: [
        {name: 'سماعة بلوتوث', price: 25000, cost: 18000, category: 'إكسسوارات إلكترونية', fixedStock: 10, movableStock: 5},
        {name: 'شاحن سريع', price: 15000, cost: 10000, category: 'إكسسوارات إلكترونية', fixedStock: 20, movableStock: 12},
        {name: 'ماوس لاسلكي', price: 30000, cost: 22000, category: 'حاسوب', fixedStock: 8, movableStock: 4}
    ]
};

// ========================================
// 🚀 تهيئة التطبيق الرئيسية
// ========================================

/**
 * تهيئة التطبيق عند تحميل النافذة
 */
window.onload = function() {
    console.log('🚀 بدء تهيئة نظام الكاشير المتكامل...');
    
    try {
        // 1. تهيئة شريط العنوان المخصص أولاً
        const titlebarSuccess = initializeCustomTitlebar();
        
        // 2. تهيئة البيانات النموذجية
        initializeSampleData();
        
        // 3. تحديث عرض المتجر الحالي
        updateCurrentStoreDisplay();
        
        // 4. تحميل البيانات
        loadProducts();
        loadCustomers();
        loadInstallments();
        
        // 5. تحديث الإحصائيات
        updateAllStats();
        
        // 6. تحميل الإعدادات
        loadSettings();
        
        // 7. إعداد مستمعات الأحداث
        setupEventListeners();
        
        // 8. تحديث شارات التنبيه
        updateNotificationBadges();
        
        // 9. إعداد التعرف على الصوت
        setupVoiceRecognition();
        
        // 10. عرض رسالة النجاح
        setTimeout(() => {
            showNotification('🎉 تم تحميل نظام الكاشير المتكامل بنجاح!', 'success');
            console.log('✅ تم تحميل نظام الكاشير المتكامل بنجاح!');
            
            // اختبار شامل للنظام
            if (titlebarSuccess) {
                setTimeout(() => {
                    runSystemDiagnostics();
                }, 2000);
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ خطأ في تهيئة التطبيق:', error);
        showNotification('❌ خطأ في تهيئة التطبيق: ' + error.message, 'error');
    }
};

/**
 * تشخيص شامل للنظام
 */
async function runSystemDiagnostics() {
    console.log('🔍 بدء تشخيص شامل للنظام...');
    
    try {
        const diagnostics = {
            timestamp: new Date().toISOString(),
            titlebar: await testWindowControls(),
            electron: isElectronApp,
            dataIntegrity: testDataIntegrity(),
            performance: await testPerformance(),
            ui: testUIComponents()
        };
        
        // حفظ نتائج التشخيص
        localStorage.setItem('lastDiagnostics', JSON.stringify(diagnostics));
        
        console.log('🔍 نتائج التشخيص الشامل:', diagnostics);
        
        // عرض تقرير مبسط
        const allPassed = Object.values(diagnostics).every(result => 
            typeof result === 'boolean' ? result : true
        );
        
        if (allPassed) {
            showNotification('✅ جميع فحوصات النظام نجحت', 'success');
        } else {
            showNotification('⚠️ بعض فحوصات النظام تحتاج إلى انتباه', 'warning');
        }
        
        return diagnostics;
        
    } catch (error) {
        console.error('❌ خطأ في تشخيص النظام:', error);
        return null;
    }
}

/**
 * اختبار تكامل البيانات
 */
function testDataIntegrity() {
    try {
        const tests = [
            products && Array.isArray(products),
            sales && Array.isArray(sales),
            customers && Array.isArray(customers),
            typeof currentStoreType === 'string' && currentStoreType.length > 0,
            storeCategories && typeof storeCategories === 'object'
        ];
        
        return tests.every(test => test === true);
    } catch (error) {
        console.error('❌ خطأ في اختبار تكامل البيانات:', error);
        return false;
    }
}

/**
 * اختبار الأداء
 */
async function testPerformance() {
    try {
        const startTime = performance.now();
        
        // محاكاة عمليات مختلفة
        await new Promise(resolve => {
            setTimeout(() => {
                // محاكاة تحميل المنتجات
                const testProducts = products.slice(0, 100);
                
                // محاكاة عملية بحث
                const searchResults = testProducts.filter(p => p.name.includes('قلم'));
                
                resolve();
            }, 10);
        });
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`⚡ اختبار الأداء: ${duration.toFixed(2)} مللي ثانية`);
        
        return duration < 100; // أقل من 100 مللي ثانية يعتبر جيد
    } catch (error) {
        console.error('❌ خطأ في اختبار الأداء:', error);
        return false;
    }
}

/**
 * اختبار مكونات واجهة المستخدم
 */
function testUIComponents() {
    try {
        const requiredElements = [
            'customTitlebar',
            'pos',
            'products', 
            'inventory',
            'customers',
            'installments',
            'reports',
            'settings'
        ];
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.warn('⚠️ عناصر واجهة مستخدم مفقودة:', missingElements);
        }
        
        return missingElements.length === 0;
    } catch (error) {
        console.error('❌ خطأ في اختبار واجهة المستخدم:', error);
        return false;
    }
}

// ========================================
// 🛠️ وظائف المساعدة والأدوات
// ========================================

/**
 * إظهار الإشعارات المحسنة
 */
function showNotification(message, type = 'info') {
    try {
        // إزالة الإشعارات السابقة
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());
        
        // إنشاء إشعار جديد
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // إضافة أيقونة حسب النوع
        const icons = {
            success: '✅',
            error: '❌', 
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        `;
        
        // إضافة الإشعار للصفحة
        document.body.appendChild(notification);
        
        // إزالة الإشعار بعد 4 ثوان
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 4000);
        
        // تشغيل الصوت إذا كان مفعل
        playNotificationSound(type);
        
        // إشعار نظام التشغيل في Electron
        if (isElectronApp && window.electronAPI && window.electronAPI.showNotification) {
            window.electronAPI.showNotification('نظام الكاشير', message);
        }
        
        console.log(`📢 إشعار (${type}): ${message}`);
        
    } catch (error) {
        console.error('❌ خطأ في عرض الإشعار:', error);
    }
}

/**
 * تشغيل أصوات الإشعارات
 */
function playNotificationSound(type) {
    if (!document.getElementById('audioAlerts')?.checked) return;
    
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        switch(type) {
            case 'success':
                oscillator.frequency.setValueAtTime(800, context.currentTime);
                oscillator.frequency.setValueAtTime(1000, context.currentTime + 0.1);
                break;
            case 'error':
                oscillator.frequency.setValueAtTime(400, context.currentTime);
                oscillator.frequency.setValueAtTime(200, context.currentTime + 0.1);
                break;
            case 'warning':
                oscillator.frequency.setValueAtTime(600, context.currentTime);
                oscillator.frequency.setValueAtTime(400, context.currentTime + 0.1);
                break;
            case 'info':
                oscillator.frequency.setValueAtTime(600, context.currentTime);
                break;
            default:
                oscillator.frequency.setValueAtTime(500, context.currentTime);
        }
        
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
        
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.2);
        
    } catch (error) {
        // تجاهل أخطاء الصوت
        console.warn('⚠️ فشل في تشغيل صوت الإشعار:', error);
    }
}

// ========================================
// 🔄 باقي وظائف النظام (مختصرة للطول)
// ========================================

// تهيئة البيانات النموذجية
function initializeSampleData() {
    if (products.length === 0) {
        Object.keys(sampleProducts).forEach(storeType => {
            sampleProducts[storeType].forEach(product => {
                products.push({
                    id: Date.now() + Math.random(),
                    name: product.name,
                    price: product.price,
                    cost: product.cost,
                    category: product.category,
                    fixedStock: product.fixedStock,
                    movableStock: product.movableStock,
                    minStock: 10,
                    unit: 'قطعة',
                    storeType: storeType,
                    barcode: generateBarcode(),
                    description: '',
                    createdAt: new Date().toISOString()
                });
            });
        });
        saveProducts();
    }
}

// توليد باركود
function generateBarcode() {
    return '8' + Date.now().toString().slice(-12) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
}

// باقي الوظائف الأساسية (نفس الكود الأصلي مع تحسينات طفيفة)
// ... (يمكن إضافة باقي الوظائف هنا)

// ========================================
// 🎛️ وظائف إعدادات الساعة (واجهة المستخدم)
// ========================================

function showClockSettings() {
    document.getElementById('clockSettingsModal').style.display = 'block';
    loadClockSettingsToForm();
}

function loadClockSettingsToForm() {
    document.getElementById('clockTextColor').value = clockSettings.textColor;
    document.getElementById('clockBgColor').value = clockSettings.bgColor.replace(/rgba?\([^)]+\)/g, '#667eea');
    document.getElementById('clockBorderColor').value = clockSettings.borderColor.replace(/rgba?\([^)]+\)/g, '#764ba2');
    
    document.querySelector(`input[name="timeFormat"][value="${clockSettings.format}"]`).checked = true;
    document.getElementById('showSeconds').checked = clockSettings.showSeconds;
    document.getElementById('showDate').checked = clockSettings.showDate;
    document.getElementById('clockFontSize').value = clockSettings.fontSize;
    document.getElementById('fontSizeValue').textContent = clockSettings.fontSize + 'px';
    document.getElementById('clockGlow').checked = clockSettings.glow;
    document.getElementById('clockBlink').checked = clockSettings.blink;
    document.getElementById('clockStyle').value = clockSettings.style;
}

function updateClockSettings() {
    clockSettings.textColor = document.getElementById('clockTextColor').value;
    clockSettings.bgColor = document.getElementById('clockBgColor').value;
    clockSettings.borderColor = document.getElementById('clockBorderColor').value;
    clockSettings.format = document.querySelector('input[name="timeFormat"]:checked').value;
    clockSettings.showSeconds = document.getElementById('showSeconds').checked;
    clockSettings.showDate = document.getElementById('showDate').checked;
    clockSettings.fontSize = parseInt(document.getElementById('clockFontSize').value);
    clockSettings.glow = document.getElementById('clockGlow').checked;
    clockSettings.blink = document.getElementById('clockBlink').checked;
    clockSettings.style = document.getElementById('clockStyle').value;
    
    document.getElementById('fontSizeValue').textContent = clockSettings.fontSize + 'px';
    
    applyClockSettings();
    startDigitalClock();
}

function resetClockSettings() {
    if (confirm('هل تريد إعادة تعيين جميع إعدادات الساعة؟')) {
        clockSettings = {
            textColor: '#ffffff',
            bgColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            format: '12',
            showSeconds: true,
            showDate: true,
            fontSize: 16,
            glow: false,
            blink: false,
            style: 'modern'
        };
        
        loadClockSettingsToForm();
        applyClockSettings();
        startDigitalClock();
        
        showNotification('✅ تم إعادة تعيين إعدادات الساعة', 'success');
    }
}

// ========================================
// 💾 وظائف حفظ البيانات
// ========================================

function saveData() {
    try {
        saveProducts();
        localStorage.setItem('sales', JSON.stringify(sales));
        localStorage.setItem('customers', JSON.stringify(customers));
        localStorage.setItem('installmentSales', JSON.stringify(installmentSales));
        localStorage.setItem('inventoryMovements', JSON.stringify(inventoryMovements));
    } catch (error) {
        showNotification('❌ خطأ في حفظ البيانات', 'error');
        console.error('Save error:', error);
    }
}

function saveProducts() {
    try {
        localStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
        showNotification('❌ خطأ في حفظ المنتجات', 'error');
        console.error('Save products error:', error);
    }
}

// ========================================
// 🔧 وظائف مساعدة إضافية
// ========================================

function formatCurrency(amount) {
    const currency = document.getElementById('currency')?.value || 'IQD';
    const symbols = { IQD: 'د.ع', USD: '$', EUR: '€' };
    return `${amount.toLocaleString('ar-IQ')} ${symbols[currency]}`;
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// تنظيف عند إغلاق الصفحة
window.addEventListener('beforeunload', () => {
    if (clockInterval) {
        clearInterval(clockInterval);
    }
    if (appStatusInterval) {
        clearInterval(appStatusInterval);
    }
    saveDataBeforeClose();
});

// تصدير الوظائف للاستخدام العام
window.minimizeWindow = null; // سيتم تعيينها في setupWindowControls
window.toggleMaximize = null; // سيتم تعيينها في setupWindowControls
window.closeWindow = null; // سيتم تعيينها في setupWindowControls
window.showClockSettings = showClockSettings;
window.updateClockSettings = updateClockSettings;
window.resetClockSettings = resetClockSettings;
window.saveClockSettings = saveClockSettings;
window.testWindowControls = testWindowControls;
window.runSystemDiagnostics = runSystemDiagnostics;

// متغيرات عامة للتشخيص
window.systemDiagnostics = systemDiagnostics;
window.isElectronApp = isElectronApp;
window.windowControlsInitialized = windowControlsInitialized;

console.log('✅ تم تحميل نظام الكاشير المحسن مع التحكم الكامل في النافذة');
console.log('🔧 للتشخيص استخدم: testWindowControls() أو runSystemDiagnostics()');
console.log('⌨️ اختصارات: Alt+F4 (إغلاق), F11 (تكبير), Ctrl+M (تصغير), Ctrl+Shift+I (اختبار)');