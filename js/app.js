/**
 * Main App Module
 * التطبيق الرئيسي
 */

const App = {
	initialized: false,
	DEV_MODE: true, // 🚧 تفعيل وضع التطوير - تعطيل تسجيل الدخول مؤقتاً

	/**
	 * Initialize the application
	 */
	init() {
		// Prevent double initialization
		if (this.initialized) return;
		this.initialized = true;

		console.log('🚗 Car Health Monitor v' + this.getVersion() + ' - Initializing...');
        
		// 🚧 DEV MODE: Skip authentication
		if (this.DEV_MODE) {
			console.log('⚠️ DEV MODE: Authentication disabled');
			this.initDevMode();
			return;
		}
        
		try {
			// Check if user is logged in
			if (!Auth.isLoggedIn()) {
				// Show login screen
				Screens.showLogin();
				console.log('📝 No user logged in - showing login screen');
			} else {
				// User is logged in, check for cars
				const cars = Auth.getUserCars();
				const user = Auth.getCurrentUser();
				console.log(`👤 Welcome back, ${user.fullName}!`);
                
				if (cars.length === 0) {
					// No cars, show setup
					Screens.showSetup();
					console.log('📝 User has no cars - showing setup screen');
				} else {
					// Load active car and show main app
					const activeCar = Auth.getActiveCar();
					if (activeCar) {
						Data.loadCar(activeCar);
						console.log(`🚗 Loaded car: ${activeCar.brand} ${activeCar.model}`);
					} else {
						// No active car set, use first car
						const firstCar = cars[0];
						Auth.setActiveCar(firstCar.id);
						Data.loadCar(firstCar);
						console.log(`🚗 Auto-selected first car: ${firstCar.brand} ${firstCar.model}`);
					}
					Screens.showMainApp();
					console.log('✓ App ready!');
				}
			}
		} catch (error) {
			console.error('❌ Error initializing app:', error);
			// Show login as fallback
			Screens.showLogin();
		}
	},

	/**
	 * Initialize in development mode (skip authentication)
	 */
	initDevMode() {
		// Apply dark mode from settings (default to true)
		const darkMode = true; // Default to dark mode in dev mode
		this.applyDarkMode(darkMode);
        
		// Check if there's already data
		const existingData = Data.init();
        
		if (existingData && Data.carData.brand) {
			// Load existing car data and show main app
			console.log(`🚗 Loaded existing car: ${Data.carData.brand} ${Data.carData.model}`);
			Screens.showMainApp();
		} else {
			// No data, show setup screen
			console.log('📝 No car data - showing setup screen');
			Screens.showSetup();
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
	 * Get app version
	 */
	getVersion() {
		return '2.1.0';
	},

	/**
	 * Export user data as JSON
	 */
	exportData() {
		const user = Auth.getCurrentUser();
		if (!user) {
			UI.showToast('⚠️ يجب تسجيل الدخول أولاً', 'warning');
			return null;
		}

		const exportData = {
			appVersion: this.getVersion(),
			exportDate: new Date().toISOString(),
			user: {
				fullName: user.fullName,
				email: user.email,
				phone: user.phone,
				settings: user.settings
			},
			cars: user.cars.map(car => ({
				...car,
				// Remove internal IDs for clean export
				id: undefined,
				createdAt: undefined
			}))
		};

		const dataStr = JSON.stringify(exportData, null, 2);
		const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
		const exportName = `car-health-backup-${user.username}-${new Date().toISOString().split('T')[0]}.json`;
        
		const linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportName);
		linkElement.click();
        
		UI.showToast('✓ تم تصدير البيانات!');
		return exportData;
	},

	/**
	 * Import data from JSON
	 */
	importData(jsonData) {
		try {
			const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
			if (!data.cars || !Array.isArray(data.cars)) {
				UI.showToast('⚠️ ملف غير صالح', 'warning');
				return false;
			}

			let imported = 0;
			data.cars.forEach(car => {
				// Clean car data before import
				const cleanCar = {
					brand: car.brand,
					model: car.model,
					year: car.year,
					odometer: car.odometer || 0,
					oilInterval: car.oilInterval || 10000,
					lastOil: car.lastOil || 0,
					lastBrakes: car.lastBrakes || 0,
					batteryDate: car.batteryDate || null,
					tiresKm: car.tiresKm || 0,
					timingBelt: car.timingBelt || 0,
					maintenanceHistory: car.maintenanceHistory || []
				};
                
				const result = Auth.addCar(cleanCar);
				if (result.success) imported++;
			});

			if (imported > 0) {
				UI.showToast(`✓ تم استيراد ${imported} سيارة بنجاح!`);
                
				// Reload active car
				const activeCar = Auth.getActiveCar();
				if (activeCar) {
					Data.loadCar(activeCar);
					UI.updateAll();
				}
				return true;
			} else {
				UI.showToast('⚠️ لم يتم استيراد أي سيارة', 'warning');
				return false;
			}
		} catch (e) {
			console.error('Import error:', e);
			UI.showToast('⚠️ خطأ في قراءة الملف', 'warning');
			return false;
		}
	},

	/**
	 * Save current car data to user account
	 */
	saveCarData() {
		if (!Auth.isLoggedIn()) return false;
        
		const activeCar = Auth.getActiveCar();
		if (activeCar && Data.carData.id) {
			const result = Auth.updateCar(Data.carData.id, Data.carData);
			return result.success;
		}
		return false;
	},

	/**
	 * Clear all app data (for debugging)
	 */
	clearAllData() {
		if (confirm('⚠️ هل أنت متأكد من حذف جميع البيانات؟\nهذا الإجراء لا يمكن التراجع عنه!')) {
			localStorage.clear();
			location.reload();
		}
	},

	/**
	 * Get storage statistics
	 */
	getStorageStats() {
		const users = Auth.getUsers();
		const userCount = Object.keys(users).length;
		let totalCars = 0;
		let totalMaintenance = 0;

		Object.values(users).forEach(user => {
			totalCars += user.cars?.length || 0;
			user.cars?.forEach(car => {
				totalMaintenance += car.maintenanceHistory?.length || 0;
			});
		});

		const storageUsed = new Blob([JSON.stringify(localStorage)]).size;
        
		return {
			users: userCount,
			cars: totalCars,
			maintenanceRecords: totalMaintenance,
			storageUsed: `${(storageUsed / 1024).toFixed(2)} KB`,
			storageLimit: '5 MB (localStorage)'
		};
	}
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	App.init();
});

// Fallback initialization
if (document.readyState === 'complete' || document.readyState === 'interactive') {
	setTimeout(() => {
		if (!App.initialized) {
			App.init();
		}
	}, 100);
}

