/**
 * Setup Module
 * إعداد السيارة لأول مرة
 */

const Setup = {
    /**
     * Save initial setup data
     */
    save() {
        const brand = document.getElementById('setup-brand').value;
        const model = document.getElementById('setup-model').value;
        const year = document.getElementById('setup-year').value;
        const odometer = document.getElementById('setup-odometer').value;

        // Validate required fields
        if (!brand || !model || !year || !odometer) {
            UI.showToast('⚠️ يرجى ملء البيانات الأساسية', 'warning');
            return;
        }

        // Get optional maintenance data
        const lastOil = document.getElementById('setup-last-oil').value;
        const oilInterval = document.getElementById('setup-oil-interval').value;
        const batteryDate = document.getElementById('setup-battery-date').value;
        const lastBrakes = document.getElementById('setup-last-brakes').value;
        const tiresKm = document.getElementById('setup-tires-km').value;
        const timingBelt = document.getElementById('setup-timing-belt').value;

        // Build car data object
        const carData = {
            brand: brand,
            model: model,
            year: parseInt(year),
            odometer: parseInt(odometer),
            oilInterval: parseInt(oilInterval) || CONFIG.DEFAULTS.oilInterval,
            lastOil: parseInt(lastOil) || parseInt(odometer),
            lastBrakes: parseInt(lastBrakes) || 0,
            batteryDate: batteryDate || null,
            tiresKm: parseInt(tiresKm) || 0,
            timingBelt: parseInt(timingBelt) || 0,
            maintenanceHistory: []
        };

        // Check if user is logged in (production mode)
        if (Auth.isLoggedIn()) {
            // Check if we're editing or adding new
            if (window.editingCarId) {
                // Update existing car
                const result = Auth.updateCar(window.editingCarId, carData);
                if (result.success) {
                    Data.carData = result.car;
                    window.editingCarId = null;
                    UI.showToast('✓ تم تحديث بيانات السيارة!');
                }
            } else {
                // Add new car
                const result = Auth.addCar(carData);
                if (result.success) {
                    Data.carData = result.car;
                    UI.showToast('✓ تم حفظ بيانات السيارة بنجاح!');
                }
            }
        } else {
            // Dev mode: save directly to Data
            Data.carData = carData;
            Data.save();
            UI.showToast('✓ تم حفظ بيانات السيارة (وضع التطوير)!');
        }

        // Show main app
        this.showMainApp();
    },

    /**
     * Show main app and hide setup
     */
    showMainApp() {
        Screens.showMainApp();
    },

    /**
     * Show setup screen
     */
    showSetupScreen() {
        Screens.showSetup();
        this.clearForm();
    },

    /**
     * Clear setup form
     */
    clearForm() {
        window.editingCarId = null;
        document.getElementById('setup-brand').value = '';
        document.getElementById('setup-model').value = '';
        document.getElementById('setup-year').value = '';
        document.getElementById('setup-odometer').value = '';
        document.getElementById('setup-last-oil').value = '';
        document.getElementById('setup-oil-interval').value = '10000';
        document.getElementById('setup-battery-date').value = '';
        document.getElementById('setup-last-brakes').value = '';
        document.getElementById('setup-tires-km').value = '';
        document.getElementById('setup-timing-belt').value = '';
    },

    /**
     * Check if setup is needed (deprecated - use Auth)
     */
    isSetupNeeded() {
        return !Auth.isLoggedIn() || Auth.getUserCars().length === 0;
    },

    /**
     * Pre-fill setup form (for editing)
     */
    prefillForm() {
        const carData = Data.carData;
        
        document.getElementById('setup-brand').value = carData.brand;
        document.getElementById('setup-model').value = carData.model;
        document.getElementById('setup-year').value = carData.year;
        document.getElementById('setup-odometer').value = carData.odometer;
        document.getElementById('setup-last-oil').value = carData.lastOil;
        document.getElementById('setup-oil-interval').value = carData.oilInterval;
        document.getElementById('setup-battery-date').value = carData.batteryDate || '';
        document.getElementById('setup-last-brakes').value = carData.lastBrakes;
        document.getElementById('setup-tires-km').value = carData.tiresKm;
        document.getElementById('setup-timing-belt').value = carData.timingBelt;
    },

    /**
     * Cancel setup and go back
     */
    cancel() {
        window.editingCarId = null;
        const cars = Auth.getUserCars();
        if (cars.length > 0) {
            Screens.showProfile();
            Profile.switchTab('cars');
        } else {
            Screens.showMainApp();
        }
    }
};
