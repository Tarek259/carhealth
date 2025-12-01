/**
 * UI Module
 * واجهة المستخدم
 */

const UI = {
    /**
     * Update all UI elements
     */
    updateAll() {
        this.updateHeader();
        this.updateCarSelector();
        this.updateHealthScore();
        this.updateCarDiagram();
        this.updateAlerts();
        this.updateHistory();
        this.updateAIPrediction();
        this.updateDiagnoseTab();
        this.updateUserAvatar();
    },

    /**
     * Update user avatar in header
     */
    updateUserAvatar() {
        const user = Auth.getCurrentUser();
        if (user) {
            document.getElementById('user-avatar-btn').textContent = user.avatar || '👤';
        }
    },

    /**
     * Update car selector
     */
    updateCarSelector() {
        const cars = Auth.getUserCars();
        const selector = document.getElementById('car-selector');
        const select = document.getElementById('active-car-select');
        
        if (cars.length > 1) {
            selector.classList.remove('hidden');
            const activeCar = Auth.getActiveCar();
            select.innerHTML = cars.map(car => `
                <option value="${car.id}" ${activeCar && activeCar.id === car.id ? 'selected' : ''}>
                    ${car.brand} ${car.model} ${car.year} - ${car.odometer?.toLocaleString() || 0} كم
                </option>
            `).join('');
        } else {
            selector.classList.add('hidden');
        }
    },

    /**
     * Switch active car
     */
    switchCar(carId) {
        const result = Auth.setActiveCar(carId);
        if (result.success) {
            Data.carData = result.car;
            this.updateAll();
            this.showToast('✓ تم تغيير السيارة');
        }
    },

    /**
     * Update header info
     */
    updateHeader() {
        document.getElementById('car-info').textContent = Data.getCarInfo();
        document.getElementById('odometer').textContent = Data.carData.odometer.toLocaleString();
    },

    /**
     * Update health score display
     */
    updateHealthScore() {
        const { score, statuses } = Health.calculate();
        const scoreEl = document.getElementById('health-score');
        const ringEl = document.getElementById('health-ring');

        scoreEl.textContent = score;
        ringEl.style.setProperty('--health', score);

        if (score >= 80) {
            scoreEl.className = 'text-5xl font-bold text-green-400';
        } else if (score >= 50) {
            scoreEl.className = 'text-5xl font-bold text-yellow-400';
        } else {
            scoreEl.className = 'text-5xl font-bold text-red-400';
        }

        return statuses;
    },

    /**
     * Update car diagram colors
     */
    updateCarDiagram() {
        const { statuses } = Health.calculate();
        const carData = Data.carData;

        // Update each part color
        this.setPartColor('part-oil', statuses.oil);
        this.setPartColor('part-battery', statuses.battery);
        this.setPartColor('part-brakes-front', statuses.brakes);
        this.setPartColor('part-brakes-rear', statuses.brakes);
        this.setPartColor('part-timing-belt', statuses['timing-belt']);
        this.setPartColor('part-engine', 'good');
        this.setPartColor('part-coolant', 'good');
        this.setPartColor('part-ac', 'good');
        this.setPartColor('part-transmission', 'good');
        this.setPartColor('part-exhaust', 'good');

        // Tires use stroke
        const tiresColor = CONFIG.COLORS[statuses.tires];
        const tiresF = document.getElementById('part-tires-front');
        const tiresR = document.getElementById('part-tires-rear');
        if (tiresF) tiresF.setAttribute('stroke', tiresColor);
        if (tiresR) tiresR.setAttribute('stroke', tiresColor);

        // Suspension
        const suspF = document.getElementById('part-suspension-front');
        const suspR = document.getElementById('part-suspension-rear');
        if (suspF) suspF.setAttribute('stroke', CONFIG.COLORS.good);
        if (suspR) suspR.setAttribute('stroke', CONFIG.COLORS.good);

        // Update battery level indicator
        const batteryLevel = document.getElementById('battery-level');
        if (batteryLevel && carData.batteryDate) {
            const batteryAge = (new Date() - new Date(carData.batteryDate)) / (1000 * 60 * 60 * 24 * 365);
            const batteryPercent = Math.max(0, Math.min(100, (1 - batteryAge / 3) * 100));
            const width = Math.round(29 * batteryPercent / 100);
            batteryLevel.setAttribute('width', width);
            batteryLevel.setAttribute('fill', CONFIG.COLORS[statuses.battery]);
        }

        // Update oil status text
        const oilStatusText = document.getElementById('oil-status-text');
        if (oilStatusText) {
            const oilKm = carData.odometer - carData.lastOil;
            const oilRemaining = carData.oilInterval - oilKm;
            const oilPercent = Math.max(0, Math.round((oilRemaining / carData.oilInterval) * 100));
            oilStatusText.textContent = oilRemaining > 0 ? `متبقي ${oilPercent}%` : 'يحتاج تغيير!';
        }

        // Update engine status text
        const engineStatusText = document.getElementById('engine-status-text');
        if (engineStatusText) {
            const carAge = new Date().getFullYear() - carData.year;
            if (carData.odometer > 200000) {
                engineStatusText.textContent = 'افحص دورياً';
            } else if (carAge > 10) {
                engineStatusText.textContent = 'صيانة منتظمة';
            } else {
                engineStatusText.textContent = 'حالة جيدة';
            }
        }

        // Add pulse animations
        this.addPulseAnimation('part-oil', statuses.oil);
        this.addPulseAnimation('part-battery', statuses.battery);
        this.addPulseAnimation('part-brakes-front', statuses.brakes);
        this.addPulseAnimation('part-brakes-rear', statuses.brakes);
        this.addPulseAnimation('part-timing-belt', statuses['timing-belt']);

        // Update quick status cards
        this.updateQuickStatusCards(statuses);
    },

    /**
     * Update quick status cards below car diagram
     */
    updateQuickStatusCards(statuses) {
        const carData = Data.carData;

        // Oil
        const oilKm = carData.odometer - carData.lastOil;
        const oilRemaining = carData.oilInterval - oilKm;
        this.updateQuickCard('oil', statuses.oil, 
            oilRemaining > 0 ? `${Math.round(oilRemaining/1000)}k كم` : 'تغيير!');

        // Brakes
        const brakesKm = carData.odometer - carData.lastBrakes;
        const brakesRemaining = 50000 - brakesKm;
        this.updateQuickCard('brakes', statuses.brakes,
            brakesRemaining > 0 ? `${Math.round(brakesRemaining/1000)}k كم` : 'فحص!');

        // Battery
        if (carData.batteryDate) {
            const batteryAge = (new Date() - new Date(carData.batteryDate)) / (1000 * 60 * 60 * 24 * 365);
            this.updateQuickCard('battery', statuses.battery,
                `${batteryAge.toFixed(1)} سنة`);
        } else {
            this.updateQuickCard('battery', 'good', 'جيد');
        }

        // Tires
        const tiresRemaining = 60000 - carData.tiresKm;
        this.updateQuickCard('tires', statuses.tires,
            tiresRemaining > 0 ? `${Math.round(tiresRemaining/1000)}k كم` : 'فحص!');

        // Timing belt
        const timingKm = carData.odometer - carData.timingBelt;
        const timingRemaining = 100000 - timingKm;
        this.updateQuickCard('timing', statuses['timing-belt'],
            timingRemaining > 0 ? `${Math.round(timingRemaining/1000)}k كم` : 'تغيير!');

        // Engine
        this.updateQuickCard('engine', 'good', 
            `${Math.round(carData.odometer/1000)}k كم`);
    },

    /**
     * Update a single quick card
     */
    updateQuickCard(partId, status, text) {
        const statusEl = document.getElementById(`${partId}-quick-status`);
        if (statusEl) {
            statusEl.textContent = text;
            statusEl.className = 'text-xs font-bold ' + 
                (status === 'good' ? 'text-green-400' : 
                 status === 'warning' ? 'text-yellow-400' : 'text-red-400');
        }
    },

    /**
     * Set part color
     */
    setPartColor(id, status) {
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute('fill', CONFIG.COLORS[status] || CONFIG.COLORS.good);
        }
    },

    /**
     * Add pulse animation
     */
    addPulseAnimation(id, status) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('pulse-red', 'pulse-yellow');
            if (status === 'danger') {
                el.classList.add('pulse-red');
            } else if (status === 'warning') {
                el.classList.add('pulse-yellow');
            }
        }
    },

    /**
     * Update alerts section
     */
    updateAlerts() {
        const container = document.getElementById('alerts-container');
        const carData = Data.carData;
        let alertsHTML = '';
        let warningsHTML = '';

        // Oil
        const oilKm = carData.odometer - carData.lastOil;
        const oilRemaining = carData.oilInterval - oilKm;
        if (oilRemaining <= 0) {
            alertsHTML += this.createDangerAlert('🛢️', 'زيت المحرك', `تجاوز موعد التغيير بـ ${Math.abs(oilRemaining).toLocaleString()} كم!`);
        } else if (oilRemaining <= carData.oilInterval * 0.2) {
            warningsHTML += this.createWarningCard('🛢️', 'زيت المحرك', `متبقي ${oilRemaining.toLocaleString()} كم`, (oilRemaining / carData.oilInterval) * 100);
        }

        // Brakes
        const brakesKm = carData.odometer - carData.lastBrakes;
        if (brakesKm > 50000) {
            alertsHTML += this.createDangerAlert('🛑', 'تيل الفرامل', `تجاوز ${(brakesKm - 40000).toLocaleString()} كم - غيّر فوراً!`);
        } else if (brakesKm > 35000) {
            warningsHTML += this.createWarningCard('🛑', 'تيل الفرامل', `متبقي ~${(50000 - brakesKm).toLocaleString()} كم`, ((50000 - brakesKm) / 50000) * 100);
        }

        // Battery
        if (carData.batteryDate) {
            const batteryAge = (new Date() - new Date(carData.batteryDate)) / (1000 * 60 * 60 * 24 * 365);
            if (batteryAge > 3) {
                alertsHTML += this.createDangerAlert('🔋', 'البطارية', `عمرها ${batteryAge.toFixed(1)} سنة - يجب استبدالها!`);
            } else if (batteryAge > 2) {
                warningsHTML += this.createWarningCard('🔋', 'البطارية', `عمرها ${batteryAge.toFixed(1)} سنة`, Math.max(0, (3 - batteryAge) / 3 * 100));
            }
        }

        // Tires
        if (carData.tiresKm > 50000) {
            alertsHTML += this.createDangerAlert('🛞', 'الإطارات', `قطعت ${carData.tiresKm.toLocaleString()} كم - افحصها فوراً!`);
        } else if (carData.tiresKm > 40000) {
            warningsHTML += this.createWarningCard('🛞', 'الإطارات', `قطعت ${carData.tiresKm.toLocaleString()} كم`, Math.max(0, (60000 - carData.tiresKm) / 60000 * 100));
        }

        // Timing Belt
        const timingKm = carData.odometer - carData.timingBelt;
        if (timingKm > 100000) {
            alertsHTML += this.createDangerAlert('⛓️', 'سير الكاتينة', `خطر! تجاوز ${(timingKm - 90000).toLocaleString()} كم - قد يتلف المحرك!`);
        } else if (timingKm > 80000) {
            warningsHTML += this.createWarningCard('⛓️', 'سير الكاتينة', `قطع ${timingKm.toLocaleString()} كم`, Math.max(0, (100000 - timingKm) / 100000 * 100));
        }

        // Build final HTML
        let html = '';
        if (alertsHTML) {
            html += `
                <div class="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-4">
                    <h3 class="text-red-400 font-bold mb-3">🚨 تنبيهات عاجلة</h3>
                    <div class="space-y-2">${alertsHTML}</div>
                </div>`;
        }
        if (warningsHTML) {
            html += `
                <div class="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-4">
                    <h3 class="text-yellow-400 font-bold mb-3">⚠️ استعد للصيانة</h3>
                    <div class="space-y-2">${warningsHTML}</div>
                </div>`;
        }
        if (!html) {
            html = `
                <div class="bg-green-900/30 border border-green-700 rounded-xl p-4 mb-4">
                    <h3 class="text-green-400 font-bold mb-3">✅ حالة ممتازة</h3>
                    <p class="text-green-300">جميع القطع في حالة جيدة!</p>
                </div>`;
        }

        container.innerHTML = html;
    },

    /**
     * Create danger alert HTML
     */
    createDangerAlert(icon, title, text) {
        return `
            <div class="bg-red-900/50 rounded-lg p-3 flex items-start gap-3">
                <span class="text-2xl">${icon}</span>
                <div>
                    <p class="font-semibold">${title}</p>
                    <p class="text-sm text-red-300">${text}</p>
                </div>
            </div>`;
    },

    /**
     * Create warning card HTML
     */
    createWarningCard(icon, title, subtitle, percent) {
        return `
            <div class="bg-yellow-900/40 rounded-lg p-3">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-semibold">${icon} ${title}</span>
                    <span class="text-yellow-300 text-sm">${subtitle}</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-2">
                    <div class="bg-yellow-500 h-2 rounded-full progress-bar" style="width: ${percent}%"></div>
                </div>
            </div>`;
    },

    /**
     * Update history lists
     */
    updateHistory() {
        const historyList = document.getElementById('history-list');
        const upcomingList = document.getElementById('upcoming-list');
        const carData = Data.carData;

        // History
        if (carData.maintenanceHistory.length === 0) {
            historyList.innerHTML = '<p class="text-gray-500 text-center py-4">لا توجد صيانات مسجلة</p>';
        } else {
            historyList.innerHTML = carData.maintenanceHistory.map(item => `
                <div class="bg-gray-700/50 rounded-lg p-3 border-r-4 border-green-500">
                    <div class="flex justify-between items-start mb-2">
                        <p class="font-semibold">${this.getMaintenanceIcon(item.type)} ${item.typeName}</p>
                        <span class="text-xs text-gray-400">${item.date}</span>
                    </div>
                    <div class="text-sm text-gray-300 space-y-1">
                        <p>📍 العداد: ${item.odometer.toLocaleString()} كم</p>
                        ${item.notes ? `<p>📝 ${item.notes}</p>` : ''}
                        ${item.cost ? `<p>💰 التكلفة: ${item.cost} ريال</p>` : ''}
                    </div>
                </div>
            `).join('');
        }

        // Upcoming
        const upcoming = Health.getUpcomingMaintenance();
        if (upcoming.length === 0) {
            upcomingList.innerHTML = '<p class="text-gray-500 text-center py-4">لا توجد صيانات قادمة قريباً</p>';
        } else {
            upcomingList.innerHTML = upcoming.map(item => {
                const bgColor = item.priority === 1 ? 'red' : 'yellow';
                const label = item.priority === 1 ? 'عاجل' : 'قريباً';
                return `
                    <div class="bg-${bgColor}-900/30 border-r-4 border-${bgColor}-500 rounded-lg p-3">
                        <div class="flex justify-between items-start">
                            <div>
                                <span class="bg-${bgColor}-600 text-xs px-2 py-1 rounded ${bgColor === 'yellow' ? 'text-black' : ''}">${label}</span>
                                <p class="font-semibold mt-1">${item.title}</p>
                                <p class="text-sm text-gray-400">${item.subtitle}</p>
                            </div>
                            <button onclick="Maintenance.quick('${item.type}')" class="bg-${bgColor}-600 hover:bg-${bgColor}-700 px-3 py-1 rounded-lg text-sm ${bgColor === 'yellow' ? 'text-black' : ''}">تم ✓</button>
                        </div>
                    </div>`;
            }).join('');
        }
    },

    /**
     * Update AI prediction
     */
    updateAIPrediction() {
        const predictions = Health.getAIPredictions();
        const predictionEl = document.getElementById('ai-prediction');
        const carData = Data.carData;

        if (predictions.length > 0) {
            predictionEl.innerHTML = `
                <span class="text-purple-400 font-bold">بناءً على ${carData.brand} ${carData.model} ${carData.year} (${carData.odometer.toLocaleString()} كم):</span><br>
                ${predictions.map(p => `• ${p}`).join('<br>')}
            `;
        } else {
            predictionEl.innerHTML = 'سيارتك في مرحلة جيدة! استمر في الصيانة الدورية.';
        }
    },

    /**
     * Update diagnose tab content
     */
    updateDiagnoseTab() {
        // Symptoms list with inline diagnosis
        const symptomsList = document.getElementById('symptoms-list');
        symptomsList.innerHTML = CONFIG.SYMPTOMS.map(s => {
            const diagnosis = CONFIG.DIAGNOSES[s.id];
            return `
                <div class="bg-gray-700 rounded-lg overflow-hidden">
                    <button type="button" onclick="Diagnosis.toggleDiagnosis('${s.id}')" class="w-full text-right p-3 flex items-center gap-3 transition hover:bg-gray-600">
                        <span class="text-2xl">${s.icon}</span>
                        <span class="flex-1">${s.text}</span>
                        <span class="text-gray-400">👆</span>
                    </button>
                    <div id="diagnosis-${s.id}" class="hidden bg-blue-900/30 border-t border-blue-600 p-4 slide-up">
                        <h4 class="text-blue-400 font-bold mb-2">${diagnosis.title}</h4>
                        <p class="text-gray-200 text-sm">${diagnosis.text}</p>
                    </div>
                </div>
            `;
        }).join('');

        // Parts lifespan
        const partsLifespan = document.getElementById('parts-lifespan');
        partsLifespan.innerHTML = CONFIG.PARTS_LIFESPAN.map(p => `
            <div class="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                <span>${p.icon} ${p.name}</span>
                <span class="text-gray-400">${p.lifespan}</span>
            </div>
        `).join('');
    },

    /**
     * Get maintenance icon
     */
    getMaintenanceIcon(type) {
        const typeConfig = CONFIG.MAINTENANCE_TYPES[type];
        return typeConfig ? typeConfig.icon : '🔧';
    },

    /**
     * Switch tab
     */
    switchTab(tab) {
        ['dashboard', 'log', 'diagnose'].forEach(t => {
            document.getElementById('content-' + t).classList.add('hidden');
            document.getElementById('tab-' + t).classList.remove('tab-active');
            document.getElementById('tab-' + t).classList.add('text-gray-400');
        });
        document.getElementById('content-' + tab).classList.remove('hidden');
        document.getElementById('tab-' + tab).classList.add('tab-active');
        document.getElementById('tab-' + tab).classList.remove('text-gray-400');
    },

    /**
     * Show toast message
     */
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-message');
        toast.className = `fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-xl z-50 ${type === 'warning' ? 'bg-yellow-600' : 'bg-green-600'}`;
        toastMsg.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    }
};
