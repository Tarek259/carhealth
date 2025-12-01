/**
 * Profile Module - Redesigned
 * إدارة الملف الشخصي
 */

const Profile = {
    currentTab: 'info',
    selectedReportCar: null,

    /**
     * Load profile screen
     */
    load() {
        const user = Auth.getCurrentUser();
        if (!user) {
            Screens.showLogin();
            return;
        }

        this.updateHeader(user);
        this.selectedReportCar = Auth.getActiveCar()?.id || (user.cars[0]?.id || null);
        this.switchTab('info');
    },

    /**
     * Update profile header
     */
    updateHeader(user) {
        const avatarEl = document.getElementById('profile-avatar');
        const nameEl = document.getElementById('profile-name');
        const usernameEl = document.getElementById('profile-username');
        const carsEl = document.getElementById('profile-cars-count');
        
        if (avatarEl) avatarEl.textContent = user.avatar || '👤';
        if (nameEl) nameEl.textContent = user.fullName;
        if (usernameEl) usernameEl.textContent = '@' + user.username;
        if (carsEl) carsEl.textContent = user.cars.length + ' سيارة';
    },

    /**
     * Switch profile tab
     */
    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.profile-tab').forEach(btn => {
            btn.classList.remove('bg-blue-600');
            btn.classList.add('bg-gray-700');
        });
        const activeTab = document.getElementById('profile-tab-' + tab);
        if (activeTab) {
            activeTab.classList.remove('bg-gray-700');
            activeTab.classList.add('bg-blue-600');
        }

        // Show content
        const contentEl = document.getElementById('profile-content');
        if (contentEl) {
            contentEl.innerHTML = this.getTabContent(tab);
        }
    },

    /**
     * Get tab content HTML
     */
    getTabContent(tab) {
        const user = Auth.getCurrentUser();
        if (!user) return '';
        
        switch(tab) {
            case 'info':
                return this.getInfoContent(user);
            case 'cars':
                return this.getCarsContent(user);
            case 'reports':
                return this.getReportsContent(user);
            case 'settings':
                return this.getSettingsContent(user);
            case 'security':
                return this.getSecurityContent(user);
            default:
                return '';
        }
    },

    /**
     * Personal info content
     */
    getInfoContent(user) {
        const avatars = ['👤', '👨', '👩', '🧔', '👱', '🚗', '🏎️', '🚙'];
        const avatarButtons = avatars.map(emoji => 
            `<button type="button" onclick="Profile.setAvatar('${emoji}')" class="text-3xl p-2 rounded-lg ${user.avatar === emoji ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}">${emoji}</button>`
        ).join('');

        return `
            <div class="space-y-4">
                <h3 class="text-lg font-bold text-blue-400 mb-4">📋 المعلومات الشخصية</h3>
                
                <div>
                    <label class="block text-gray-400 mb-1">الاسم الكامل</label>
                    <input type="text" id="edit-fullname" value="${user.fullName || ''}" class="w-full bg-gray-700 rounded-lg p-3 text-white">
                </div>
                
                <div>
                    <label class="block text-gray-400 mb-1">البريد الإلكتروني</label>
                    <input type="email" id="edit-email" value="${user.email || ''}" class="w-full bg-gray-700 rounded-lg p-3 text-white">
                </div>
                
                <div>
                    <label class="block text-gray-400 mb-1">رقم الجوال</label>
                    <input type="tel" id="edit-phone" value="${user.phone || ''}" class="w-full bg-gray-700 rounded-lg p-3 text-white" placeholder="05xxxxxxxx">
                </div>
                
                <div>
                    <label class="block text-gray-400 mb-1">الصورة الرمزية</label>
                    <div class="flex gap-2 flex-wrap">
                        ${avatarButtons}
                    </div>
                </div>
                
                <button type="button" onclick="Profile.saveInfo()" class="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold mt-4">
                    💾 حفظ التغييرات
                </button>
            </div>
        `;
    },

    /**
     * Cars management content
     */
    getCarsContent(user) {
        const activeCar = Auth.getActiveCar();
        
        let carsHTML = '';
        if (user.cars.length === 0) {
            carsHTML = '<p class="text-gray-500 text-center py-8">لم تضف أي سيارة بعد</p>';
        } else {
            carsHTML = user.cars.map(car => {
                const isActive = activeCar && activeCar.id === car.id;
                return `
                    <div class="bg-gray-700 rounded-xl p-4 ${isActive ? 'border-2 border-blue-500' : ''}">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h4 class="font-bold text-lg">${car.brand} ${car.model}</h4>
                                <p class="text-gray-400">${car.year} • ${(car.odometer || 0).toLocaleString()} كم</p>
                            </div>
                            <div class="flex gap-2">
                                ${isActive ? 
                                    '<span class="bg-blue-600 text-xs px-2 py-1 rounded">النشطة</span>' : 
                                    `<button type="button" onclick="Profile.setActiveCar('${car.id}')" class="bg-gray-600 hover:bg-blue-600 text-xs px-2 py-1 rounded">تفعيل</button>`
                                }
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button type="button" onclick="Profile.editCar('${car.id}')" class="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded-lg text-sm">✏️ تعديل</button>
                            <button type="button" onclick="Profile.deleteCar('${car.id}')" class="bg-red-600/50 hover:bg-red-600 py-2 px-4 rounded-lg text-sm">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        return `
            <div class="space-y-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-blue-400">🚗 سياراتي</h3>
                    <button type="button" onclick="Profile.addNewCar()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm">
                        + إضافة سيارة
                    </button>
                </div>
                
                <div class="space-y-3">
                    ${carsHTML}
                </div>
            </div>
        `;
    },

    /**
     * Settings content
     */
    getSettingsContent(user) {
        const settings = user.settings || {};
        
        return `
            <div class="space-y-4">
                <h3 class="text-lg font-bold text-blue-400 mb-4">⚙️ الإعدادات</h3>
                
                <div class="bg-gray-700 rounded-xl p-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-semibold">🔔 الإشعارات</p>
                            <p class="text-sm text-gray-400">تلقي تنبيهات الصيانة</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="setting-notifications" ${settings.notifications ? 'checked' : ''} class="sr-only peer" onchange="Profile.saveSetting('notifications', this.checked)">
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
                
                <div class="bg-gray-700 rounded-xl p-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-semibold">🌙 الوضع الداكن</p>
                            <p class="text-sm text-gray-400">تفعيل المظهر الداكن</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="setting-darkmode" ${settings.darkMode !== false ? 'checked' : ''} class="sr-only peer" onchange="Profile.saveSetting('darkMode', this.checked)">
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
                
                <div class="bg-gray-700 rounded-xl p-4">
                    <label class="block mb-2">
                        <p class="font-semibold">💰 العملة</p>
                    </label>
                    <select id="setting-currency" class="w-full bg-gray-600 rounded-lg p-3" onchange="Profile.saveSetting('currency', this.value)">
                        <option value="SAR" ${settings.currency === 'SAR' ? 'selected' : ''}>ريال سعودي (SAR)</option>
                        <option value="AED" ${settings.currency === 'AED' ? 'selected' : ''}>درهم إماراتي (AED)</option>
                        <option value="KWD" ${settings.currency === 'KWD' ? 'selected' : ''}>دينار كويتي (KWD)</option>
                        <option value="EGP" ${settings.currency === 'EGP' ? 'selected' : ''}>جنيه مصري (EGP)</option>
                        <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>دولار أمريكي (USD)</option>
                    </select>
                </div>
                
                <div class="bg-gray-700 rounded-xl p-4">
                    <label class="block mb-2">
                        <p class="font-semibold">📏 وحدة المسافة</p>
                    </label>
                    <select id="setting-distance" class="w-full bg-gray-600 rounded-lg p-3" onchange="Profile.saveSetting('distanceUnit', this.value)">
                        <option value="km" ${settings.distanceUnit === 'km' ? 'selected' : ''}>كيلومتر (كم)</option>
                        <option value="mi" ${settings.distanceUnit === 'mi' ? 'selected' : ''}>ميل (mi)</option>
                    </select>
                </div>
            </div>
        `;
    },

    /**
     * Security content
     */
    getSecurityContent(user) {
        const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : '-';
        
        return `
            <div class="space-y-4">
                <h3 class="text-lg font-bold text-blue-400 mb-4">🔒 الأمان</h3>
                
                <div class="bg-gray-700 rounded-xl p-4">
                    <h4 class="font-semibold mb-4">تغيير كلمة المرور</h4>
                    <div class="space-y-3">
                        <input type="password" id="current-password" placeholder="كلمة المرور الحالية" class="w-full bg-gray-600 rounded-lg p-3">
                        <input type="password" id="new-password" placeholder="كلمة المرور الجديدة" class="w-full bg-gray-600 rounded-lg p-3">
                        <input type="password" id="confirm-new-password" placeholder="تأكيد كلمة المرور الجديدة" class="w-full bg-gray-600 rounded-lg p-3">
                        <button type="button" onclick="Profile.changePassword()" class="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold">
                            تغيير كلمة المرور
                        </button>
                    </div>
                </div>
                
                <div class="bg-gray-700 rounded-xl p-4">
                    <h4 class="font-semibold mb-2">معلومات الحساب</h4>
                    <p class="text-sm text-gray-400">تاريخ الإنشاء: ${createdDate}</p>
                    <p class="text-sm text-gray-400">اسم المستخدم: ${user.username}</p>
                </div>
                
                <div class="bg-red-900/30 border border-red-700 rounded-xl p-4">
                    <h4 class="font-semibold text-red-400 mb-2">⚠️ منطقة الخطر</h4>
                    <p class="text-sm text-gray-400 mb-3">حذف الحساب سيؤدي لفقدان جميع البيانات نهائياً</p>
                    <button type="button" onclick="Profile.deleteAccount()" class="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-bold">
                        🗑️ حذف الحساب نهائياً
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Reports content
     */
    getReportsContent(user) {
        const stats = typeof Reports !== 'undefined' ? Reports.getUserStats() : null;
        const settings = user.settings || {};
        const currency = this.getCurrencySymbol(settings.currency || 'SAR');
        
        // Car selector for detailed report
        const carOptions = user.cars.map(car => 
            `<option value="${car.id}" ${this.selectedReportCar === car.id ? 'selected' : ''}>${car.brand} ${car.model} ${car.year}</option>`
        ).join('');

        // Monthly chart data
        const monthlyData = typeof Reports !== 'undefined' ? Reports.getMonthlyChartData(6) : null;
        const maxAmount = monthlyData ? Math.max(...monthlyData.map(d => d.amount), 1) : 1;
        
        // Type chart data
        const typeData = typeof Reports !== 'undefined' ? Reports.getTypeChartData() : null;

        let monthlyChartHTML = '<p class="text-gray-500 text-center w-full">لا توجد بيانات</p>';
        if (monthlyData && monthlyData.length > 0) {
            monthlyChartHTML = monthlyData.map(m => `
                <div class="flex-1 flex flex-col items-center">
                    <div class="w-full bg-blue-600 rounded-t transition-all" style="height: ${maxAmount > 0 ? (m.amount / maxAmount) * 100 : 0}%"></div>
                    <p class="text-xs text-gray-400 mt-2 text-center">${m.label.split(' ')[0]}</p>
                    <p class="text-xs text-blue-400">${m.amount > 0 ? m.amount.toLocaleString() : '-'}</p>
                </div>
            `).join('');
        }

        let typeChartHTML = '<p class="text-gray-500 text-center">لا توجد بيانات</p>';
        if (typeData && typeData.length > 0 && stats && stats.totalSpending > 0) {
            typeChartHTML = `<div class="space-y-2">
                ${typeData.map(t => {
                    const percent = (t.amount / stats.totalSpending) * 100;
                    return `
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span>${t.type}</span>
                                <span>${t.amount.toLocaleString()} ${currency}</span>
                            </div>
                            <div class="w-full bg-gray-600 rounded-full h-2">
                                <div class="h-2 rounded-full" style="width: ${percent}%; background-color: ${t.color}"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>`;
        }

        return `
            <div class="space-y-4">
                <h3 class="text-lg font-bold text-blue-400 mb-4">📊 التقارير والتحليلات</h3>
                
                <!-- Overall Stats -->
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-center">
                        <p class="text-3xl font-bold">${stats?.totalCars || 0}</p>
                        <p class="text-blue-200 text-sm">سيارة</p>
                    </div>
                    <div class="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 text-center">
                        <p class="text-3xl font-bold">${stats?.averageHealthScore || 0}%</p>
                        <p class="text-green-200 text-sm">متوسط الصحة</p>
                    </div>
                    <div class="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-4 text-center">
                        <p class="text-3xl font-bold">${stats?.totalMaintenanceRecords || 0}</p>
                        <p class="text-purple-200 text-sm">صيانة مسجلة</p>
                    </div>
                    <div class="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-4 text-center">
                        <p class="text-2xl font-bold">${(stats?.totalSpending || 0).toLocaleString()}</p>
                        <p class="text-orange-200 text-sm">${currency} إجمالي</p>
                    </div>
                </div>

                <!-- Monthly Spending Chart -->
                <div class="bg-gray-700 rounded-xl p-4">
                    <h4 class="font-semibold mb-4">📈 المصاريف الشهرية (آخر 6 أشهر)</h4>
                    <div class="flex items-end justify-between h-32 gap-2">
                        ${monthlyChartHTML}
                    </div>
                </div>

                <!-- Spending by Type -->
                <div class="bg-gray-700 rounded-xl p-4">
                    <h4 class="font-semibold mb-4">🔧 المصاريف حسب النوع</h4>
                    ${typeChartHTML}
                </div>

                <!-- Car Detailed Report -->
                <div class="bg-gray-700 rounded-xl p-4">
                    <h4 class="font-semibold mb-4">🚗 تقرير تفصيلي للسيارة</h4>
                    <select id="report-car-select" onchange="Profile.selectReportCar(this.value)" class="w-full bg-gray-600 rounded-lg p-3 mb-4">
                        ${carOptions || '<option>لا توجد سيارات</option>'}
                    </select>
                    <div id="car-report-details">
                        ${this.getCarReportDetails()}
                    </div>
                </div>

                <!-- Upcoming Predictions -->
                <div class="bg-gray-700 rounded-xl p-4">
                    <h4 class="font-semibold mb-4">🔮 التوقعات القادمة</h4>
                    <div id="predictions-container">
                        ${this.getPredictionsHTML()}
                    </div>
                </div>

                <!-- Export Options -->
                <div class="bg-gray-700 rounded-xl p-4">
                    <h4 class="font-semibold mb-4">📤 تصدير البيانات</h4>
                    <div class="grid grid-cols-2 gap-3">
                        <button type="button" onclick="Profile.exportData()" class="bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-sm">
                            📄 تصدير JSON
                        </button>
                        <button type="button" onclick="Profile.printReport()" class="bg-green-600 hover:bg-green-700 py-3 rounded-lg text-sm">
                            🖨️ طباعة التقرير
                        </button>
                    </div>
                </div>

                <!-- Recent Activity Timeline -->
                <div class="bg-gray-700 rounded-xl p-4">
                    <h4 class="font-semibold mb-4">📜 آخر النشاطات</h4>
                    ${this.getTimelineHTML(stats)}
                </div>
            </div>
        `;
    },

    /**
     * Get car report details
     */
    getCarReportDetails() {
        if (!this.selectedReportCar) {
            return '<p class="text-gray-500 text-center">اختر سيارة لعرض التقرير</p>';
        }
        
        if (typeof Reports === 'undefined') {
            return '<p class="text-gray-500 text-center">جاري التحميل...</p>';
        }

        const report = Reports.getCarHistoryReport(this.selectedReportCar);
        if (!report) {
            return '<p class="text-gray-500 text-center">لا توجد بيانات</p>';
        }

        const user = Auth.getCurrentUser();
        const settings = user?.settings || {};
        const currency = this.getCurrencySymbol(settings.currency || 'SAR');

        let maintenanceDetails = '';
        if (Object.keys(report.maintenanceByType).length > 0) {
            maintenanceDetails = `
                <div class="border-t border-gray-600 pt-3">
                    <p class="text-gray-400 mb-2">تفاصيل الصيانات:</p>
                    ${Object.entries(report.maintenanceByType).map(([type, data]) => `
                        <div class="flex justify-between text-sm py-1">
                            <span>${type}</span>
                            <span class="text-gray-400">${data.count}x = ${data.totalCost.toLocaleString()} ${currency}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        const createdDate = report.car.createdAt ? new Date(report.car.createdAt).toLocaleDateString('ar-SA') : '-';

        return `
            <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="bg-gray-600 rounded-lg p-3 text-center">
                        <p class="text-2xl font-bold text-blue-400">${report.totalRecords}</p>
                        <p class="text-gray-400">صيانة</p>
                    </div>
                    <div class="bg-gray-600 rounded-lg p-3 text-center">
                        <p class="text-2xl font-bold text-green-400">${report.totalSpending.toLocaleString()}</p>
                        <p class="text-gray-400">${currency}</p>
                    </div>
                </div>
                
                <div class="text-sm space-y-2">
                    <p class="text-gray-400">العداد: <span class="text-white">${(report.car.odometer || 0).toLocaleString()} كم</span></p>
                    <p class="text-gray-400">تاريخ الإضافة: <span class="text-white">${createdDate}</span></p>
                </div>

                ${maintenanceDetails}
            </div>
        `;
    },

    /**
     * Get predictions HTML
     */
    getPredictionsHTML() {
        if (!this.selectedReportCar) {
            return '<p class="text-gray-500 text-center">اختر سيارة لعرض التوقعات</p>';
        }
        
        if (typeof Reports === 'undefined') {
            return '<p class="text-gray-500 text-center">جاري التحميل...</p>';
        }

        const predictions = Reports.getMaintenancePredictions(this.selectedReportCar);
        if (!predictions || predictions.length === 0) {
            return '<p class="text-gray-500 text-center">لا توجد توقعات</p>';
        }

        const user = Auth.getCurrentUser();
        const settings = user?.settings || {};
        const currency = this.getCurrencySymbol(settings.currency || 'SAR');

        return `
            <div class="space-y-2">
                ${predictions.slice(0, 5).map(p => {
                    const urgencyColor = p.urgency === 'danger' ? 'red' : p.urgency === 'warning' ? 'yellow' : 'green';
                    const urgencyText = p.urgency === 'danger' ? 'عاجل' : p.urgency === 'warning' ? 'قريباً' : 'مستقبلي';
                    const remainingText = p.remainingKm !== undefined ? `متبقي: ${p.remainingKm.toLocaleString()} كم` : 
                                         (p.remainingYears !== undefined ? `متبقي: ${p.remainingYears}` : '');
                    return `
                        <div class="bg-gray-600 rounded-lg p-3 border-r-4 border-${urgencyColor}-500">
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="font-semibold">${p.icon} ${p.name}</p>
                                    <p class="text-xs text-gray-400">${remainingText}</p>
                                </div>
                                <div class="text-left">
                                    <span class="text-xs bg-${urgencyColor}-600 px-2 py-1 rounded ${urgencyColor === 'yellow' ? 'text-black' : ''}">${urgencyText}</span>
                                    <p class="text-xs text-gray-400 mt-1">~${p.estimatedCost} ${currency}</p>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    /**
     * Get timeline HTML
     */
    getTimelineHTML(stats) {
        if (!stats || !stats.maintenanceTimeline || stats.maintenanceTimeline.length === 0) {
            return '<p class="text-gray-500 text-center">لا توجد نشاطات مسجلة</p>';
        }

        const user = Auth.getCurrentUser();
        const settings = user?.settings || {};
        const currency = this.getCurrencySymbol(settings.currency || 'SAR');

        return `
            <div class="space-y-3 max-h-64 overflow-y-auto">
                ${stats.maintenanceTimeline.slice(0, 10).map(item => `
                    <div class="flex gap-3 items-start border-r-2 border-blue-500 pr-3">
                        <div class="flex-1">
                            <p class="font-semibold text-sm">${item.type}</p>
                            <p class="text-xs text-gray-400">${item.car}</p>
                            <p class="text-xs text-gray-500">${item.date} • ${(item.odometer || 0).toLocaleString()} كم</p>
                        </div>
                        <div class="text-left">
                            <p class="text-sm text-green-400">${item.cost > 0 ? item.cost.toLocaleString() + ' ' + currency : '-'}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Set avatar
     */
    setAvatar(emoji) {
        Auth.updateProfile({ avatar: emoji });
        this.load();
        UI.showToast('✓ تم تغيير الصورة الرمزية');
    },

    /**
     * Save personal info
     */
    saveInfo() {
        const fullNameEl = document.getElementById('edit-fullname');
        const emailEl = document.getElementById('edit-email');
        const phoneEl = document.getElementById('edit-phone');

        if (!fullNameEl || !emailEl) {
            UI.showToast('⚠️ خطأ في تحميل النموذج', 'warning');
            return;
        }

        const fullName = fullNameEl.value.trim();
        const email = emailEl.value.trim();
        const phone = phoneEl ? phoneEl.value.trim() : '';

        if (!fullName || !email) {
            UI.showToast('⚠️ الاسم والبريد مطلوبان', 'warning');
            return;
        }

        const result = Auth.updateProfile({ fullName, email, phone });
        if (result.success) {
            this.load();
            UI.showToast('✓ تم حفظ المعلومات');
        } else {
            UI.showToast('⚠️ ' + result.error, 'warning');
        }
    },

    /**
     * Save individual setting
     */
    saveSetting(key, value) {
        const settings = {};
        settings[key] = value;
        const result = Auth.updateSettings(settings);
        
        if (result.success) {
            // Apply dark mode immediately if changed
            if (key === 'darkMode') {
                // Use App.applyDarkMode if available, otherwise apply directly
                if (typeof App !== 'undefined' && App.applyDarkMode) {
                    App.applyDarkMode(value);
                } else {
                    this.applyDarkMode(value);
                }
            }
            UI.showToast('✓ تم حفظ الإعداد');
        } else {
            UI.showToast('⚠️ خطأ في الحفظ', 'warning');
        }
    },

    /**
     * Apply dark mode setting
     */
    applyDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add('dark');
            document.documentElement.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
            document.documentElement.classList.remove('dark');
        }
    },

    /**
     * Change password
     */
    changePassword() {
        const currentEl = document.getElementById('current-password');
        const newPassEl = document.getElementById('new-password');
        const confirmEl = document.getElementById('confirm-new-password');

        if (!currentEl || !newPassEl || !confirmEl) {
            UI.showToast('⚠️ خطأ في تحميل النموذج', 'warning');
            return;
        }

        const current = currentEl.value;
        const newPass = newPassEl.value;
        const confirm = confirmEl.value;

        if (!current || !newPass || !confirm) {
            UI.showToast('⚠️ يرجى ملء جميع الحقول', 'warning');
            return;
        }

        if (newPass !== confirm) {
            UI.showToast('⚠️ كلمتا المرور غير متطابقتين', 'warning');
            return;
        }

        if (newPass.length < 6) {
            UI.showToast('⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'warning');
            return;
        }

        const result = Auth.changePassword(current, newPass);
        if (result.success) {
            UI.showToast('✓ تم تغيير كلمة المرور');
            this.switchTab('security');
        } else {
            UI.showToast('⚠️ ' + result.error, 'warning');
        }
    },

    /**
     * Delete account
     */
    deleteAccount() {
        const password = prompt('أدخل كلمة المرور لتأكيد حذف الحساب:');
        if (!password) return;

        const result = Auth.deleteAccount(password);
        if (result.success) {
            UI.showToast('تم حذف الحساب');
            Screens.showLogin();
        } else {
            UI.showToast('⚠️ ' + result.error, 'warning');
        }
    },

    /**
     * Set active car
     */
    setActiveCar(carId) {
        const result = Auth.setActiveCar(carId);
        if (result.success) {
            Data.carData = result.car;
            this.switchTab('cars');
            UI.showToast('✓ تم تفعيل السيارة');
        }
    },

    /**
     * Add new car
     */
    addNewCar() {
        Screens.showSetup();
    },

    /**
     * Edit car
     */
    editCar(carId) {
        const user = Auth.getCurrentUser();
        const car = user.cars.find(c => c.id === carId);
        if (!car) return;

        // Store car ID for editing
        window.editingCarId = carId;
        
        // Go to setup and prefill
        Screens.showSetup();
        
        // Prefill form after a short delay
        setTimeout(() => {
            const fields = {
                'setup-brand': car.brand || '',
                'setup-model': car.model || '',
                'setup-year': car.year || '',
                'setup-odometer': car.odometer || '',
                'setup-last-oil': car.lastOil || '',
                'setup-oil-interval': car.oilInterval || 10000,
                'setup-battery-date': car.batteryDate || '',
                'setup-last-brakes': car.lastBrakes || '',
                'setup-tires-km': car.tiresKm || '',
                'setup-timing-belt': car.timingBelt || ''
            };

            for (const [id, value] of Object.entries(fields)) {
                const el = document.getElementById(id);
                if (el) el.value = value;
            }
        }, 100);
    },

    /**
     * Delete car
     */
    deleteCar(carId) {
        if (!confirm('هل تريد حذف هذه السيارة؟')) return;

        const result = Auth.deleteCar(carId);
        if (result.success) {
            this.switchTab('cars');
            UI.showToast('✓ تم حذف السيارة');
        }
    },

    /**
     * Go back to main app
     */
    goBack() {
        const activeCar = Auth.getActiveCar();
        if (activeCar) {
            Data.carData = activeCar;
            Screens.showMainApp();
        } else {
            Screens.showSetup();
        }
    },

    /**
     * Select report car
     */
    selectReportCar(carId) {
        this.selectedReportCar = carId;
        
        const detailsEl = document.getElementById('car-report-details');
        if (detailsEl) {
            detailsEl.innerHTML = this.getCarReportDetails();
        }
        
        const predictionsEl = document.getElementById('predictions-container');
        if (predictionsEl) {
            predictionsEl.innerHTML = this.getPredictionsHTML();
        }
    },

    /**
     * Export data
     */
    exportData() {
        if (typeof Reports === 'undefined') {
            UI.showToast('⚠️ خطأ في تحميل التقارير', 'warning');
            return;
        }

        const data = Reports.exportUserData();
        if (!data) {
            UI.showToast('⚠️ لا توجد بيانات للتصدير', 'warning');
            return;
        }

        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportName = 'car-health-backup-' + new Date().toISOString().split('T')[0] + '.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportName);
        linkElement.click();

        UI.showToast('✓ تم تصدير البيانات بنجاح!');
    },

    /**
     * Print report
     */
    printReport() {
        if (!this.selectedReportCar) {
            UI.showToast('⚠️ اختر سيارة أولاً', 'warning');
            return;
        }

        if (typeof Reports === 'undefined') {
            UI.showToast('⚠️ خطأ في تحميل التقارير', 'warning');
            return;
        }

        const report = Reports.generatePrintableReport(this.selectedReportCar);
        if (!report) {
            UI.showToast('⚠️ لا توجد بيانات للطباعة', 'warning');
            return;
        }

        const user = Auth.getCurrentUser();
        const settings = user?.settings || {};
        const currency = this.getCurrencySymbol(settings.currency || 'SAR');

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            UI.showToast('⚠️ يرجى السماح بالنوافذ المنبثقة', 'warning');
            return;
        }

        const healthColor = report.healthScore >= 70 ? '#22c55e' : report.healthScore >= 40 ? '#eab308' : '#ef4444';

        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>تقرير السيارة - ${report.car.brand} ${report.car.model}</title>
                <style>
                    body { font-family: 'Cairo', Arial, sans-serif; padding: 20px; direction: rtl; }
                    h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
                    h2 { color: #374151; margin-top: 20px; }
                    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0; }
                    .info-box { background: #f3f4f6; padding: 15px; border-radius: 8px; }
                    .info-box h3 { margin: 0 0 5px 0; color: #6b7280; font-size: 14px; }
                    .info-box p { margin: 0; font-size: 20px; font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th, td { padding: 10px; border: 1px solid #e5e7eb; text-align: right; }
                    th { background: #f3f4f6; }
                    .health { font-size: 48px; color: ${healthColor}; }
                    .footer { margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <h1>🚗 تقرير الملف الطبي للسيارة</h1>
                <p>تاريخ التقرير: ${report.generatedAt}</p>
                <p>المالك: ${report.owner}</p>
                
                <h2>معلومات السيارة</h2>
                <div class="info-grid">
                    <div class="info-box">
                        <h3>السيارة</h3>
                        <p>${report.car.brand} ${report.car.model} ${report.car.year}</p>
                    </div>
                    <div class="info-box">
                        <h3>العداد</h3>
                        <p>${(report.car.odometer || 0).toLocaleString()} كم</p>
                    </div>
                    <div class="info-box">
                        <h3>صحة السيارة</h3>
                        <p class="health">${report.healthScore}%</p>
                    </div>
                    <div class="info-box">
                        <h3>إجمالي المصاريف</h3>
                        <p>${report.totalSpending.toLocaleString()} ${currency}</p>
                    </div>
                </div>

                <h2>سجل الصيانات (${report.totalRecords} صيانة)</h2>
                <table>
                    <tr>
                        <th>النوع</th>
                        <th>العدد</th>
                        <th>التكلفة</th>
                    </tr>
                    ${Object.entries(report.maintenanceHistory || {}).map(([type, data]) => `
                        <tr>
                            <td>${type}</td>
                            <td>${data.count}</td>
                            <td>${data.totalCost.toLocaleString()} ${currency}</td>
                        </tr>
                    `).join('')}
                </table>

                <h2>الصيانات القادمة</h2>
                <table>
                    <tr>
                        <th>القطعة</th>
                        <th>الحالة</th>
                        <th>التوقع</th>
                        <th>التكلفة المتوقعة</th>
                    </tr>
                    ${(report.upcomingMaintenance || []).map(p => `
                        <tr>
                            <td>${p.icon} ${p.name}</td>
                            <td style="color: ${p.urgency === 'danger' ? '#ef4444' : p.urgency === 'warning' ? '#eab308' : '#22c55e'}">
                                ${p.urgency === 'danger' ? 'عاجل' : p.urgency === 'warning' ? 'قريباً' : 'مستقبلي'}
                            </td>
                            <td>${p.estimatedDate}</td>
                            <td>~${p.estimatedCost} ${currency}</td>
                        </tr>
                    `).join('')}
                </table>

                <div class="footer">
                    <p>تم إنشاء هذا التقرير بواسطة تطبيق الملف الطبي للسيارة</p>
                    <p>Car Health Monitor v2.1.0</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    /**
     * Get currency symbol
     */
    getCurrencySymbol(code) {
        const symbols = {
            'SAR': 'ر.س',
            'AED': 'د.إ',
            'KWD': 'د.ك',
            'EGP': 'ج.م',
            'USD': '$'
        };
        return symbols[code] || code;
    }
};
