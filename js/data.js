/**
 * Data Management Module
 * إدارة البيانات والتخزين
 * 
 * ملاحظة: هذا الملف يدير بيانات السيارة الحالية في الذاكرة
 * التخزين الدائم يتم عبر Auth module في حساب المستخدم
 */

const Data = {
	// Car Data Structure (in-memory)
	carData: {
		id: null,
		brand: '',
		model: '',
		year: 2020,
		odometer: 0,
		oilInterval: 10000,
		lastOil: 0,
		lastBrakes: 0,
		batteryDate: null,
		tiresKm: 0,
		timingBelt: 0,
		maintenanceHistory: []
	},

	/**
	 * Get default car data structure
	 */
	getDefaultCarData() {
		return {
			id: null,
			brand: '',
			model: '',
			year: new Date().getFullYear(),
			odometer: 0,
			oilInterval: 10000,
			lastOil: 0,
			lastBrakes: 0,
			batteryDate: null,
			tiresKm: 0,
			timingBelt: 0,
			maintenanceHistory: []
		};
	},

	/**
	 * Initialize data from user's active car or localStorage (dev mode)
	 */
	init() {
		// Try to load from Auth (production mode)
		if (Auth.isLoggedIn()) {
			const activeCar = Auth.getActiveCar();
			if (activeCar) {
				this.carData = { ...this.getDefaultCarData(), ...activeCar };
				return true;
			}
		}
        
		// Fallback to localStorage for dev mode
		const stored = localStorage.getItem('carHealth_devData');
		if (stored) {
			try {
				this.carData = JSON.parse(stored);
				return true;
			} catch (e) {
				console.error('Error loading dev data:', e);
			}
		}
        
		return false;
	},

	/**
	 * Save current car data to user account or localStorage (dev mode)
	 */
	save() {
		if (Auth.isLoggedIn() && this.carData.id) {
			// Production mode: save to user account
			Auth.updateCar(this.carData.id, this.carData);
		} else {
			// Dev mode: save to localStorage
			localStorage.setItem('carHealth_devData', JSON.stringify(this.carData));
		}
	},

	/**
	 * Reset current car data (in-memory only)
	 */
	reset() {
		this.carData = this.getDefaultCarData();
	},

	/**
	 * Load specific car data
	 */
	loadCar(car) {
		this.carData = { ...this.getDefaultCarData(), ...car };
	},

	/**
	 * Update car data
	 */
	update(newData) {
		Object.assign(this.carData, newData);
		this.save();
	},

	/**
	 * Add maintenance record
	 */
	addMaintenance(record) {
		if (!this.carData.maintenanceHistory) {
			this.carData.maintenanceHistory = [];
		}
		this.carData.maintenanceHistory.unshift(record);
		this.save();
	},

	/**
	 * Get car info string
	 */
	getCarInfo() {
		return `${this.carData.brand} ${this.carData.model} ${this.carData.year}`;
	},

	/**
	 * Update odometer and related values
	 */
	updateOdometer(newValue) {
		const diff = newValue - this.carData.odometer;
		if (diff > 0) {
			this.carData.tiresKm = (this.carData.tiresKm || 0) + diff;
		}
		this.carData.odometer = newValue;
		this.save();
	},

	/**
	 * Record quick maintenance
	 */
	quickMaintenance(type) {
		const today = new Date().toISOString().split('T')[0];
		const typeConfig = CONFIG.MAINTENANCE_TYPES[type];
        
		switch(type) {
			case 'oil':
				this.carData.lastOil = this.carData.odometer;
				break;
			case 'brakes':
				this.carData.lastBrakes = this.carData.odometer;
				break;
			case 'battery':
				this.carData.batteryDate = today;
				break;
			case 'tires':
				this.carData.tiresKm = 0;
				break;
			case 'timing-belt':
				this.carData.timingBelt = this.carData.odometer;
				break;
		}

		this.addMaintenance({
			type: type,
			typeName: typeConfig ? typeConfig.name : 'صيانة',
			odometer: this.carData.odometer,
			date: today,
			notes: '',
			cost: ''
		});
	},

	/**
	 * Validate car data
	 */
	validate(data) {
		const errors = [];
        
		if (!data.brand || data.brand.trim() === '') {
			errors.push('ماركة السيارة مطلوبة');
		}
		if (!data.model || data.model.trim() === '') {
			errors.push('موديل السيارة مطلوب');
		}
		if (!data.year || data.year < 1900 || data.year > new Date().getFullYear() + 1) {
			errors.push('سنة الصنع غير صحيحة');
		}
		if (!data.odometer || data.odometer < 0) {
			errors.push('قراءة العداد غير صحيحة');
		}
        
		return {
			valid: errors.length === 0,
			errors: errors
		};
	}
};

