/**
 * Modals Module
 * النوافذ المنبثقة
 */

const Modals = {
	container: null,
	selectedMaintenanceType: '',

	/**
	 * Initialize modals container
	 */
	init() {
		this.container = document.getElementById('modals-container');
		this.createModals();
		this.bindEvents();
	},

	/**
	 * Create all modal HTML
	 */
	createModals() {
		this.container.innerHTML = `
			<!-- Maintenance Modal -->
			<div id="maintenance-modal" class="fixed inset-0 bg-black/70 z-50 hidden flex items-end justify-center">
				<div class="bg-gray-800 w-full max-w-md rounded-t-3xl p-6 slide-up max-h-[90vh] overflow-y-auto">
					<div class="flex justify-between items-center mb-6">
						<h3 class="text-xl font-bold">➕ إضافة صيانة</h3>
						<button onclick="Modals.closeMaintenance()" class="text-gray-400 hover:text-white text-2xl">&times;</button>
					</div>
                    
					<div class="grid grid-cols-2 gap-3 mb-6" id="maintenance-types"></div>

					<div id="maintenance-form" class="hidden space-y-4">
						<div>
							<label class="block text-gray-400 mb-1">نوع الصيانة</label>
							<input type="text" id="form-type" class="w-full bg-gray-700 rounded-lg p-3 text-white" readonly>
						</div>
						<div>
							<label class="block text-gray-400 mb-1">قراءة العداد (كم)</label>
							<input type="number" id="form-odometer" class="w-full bg-gray-700 rounded-lg p-3 text-white">
						</div>
						<div>
							<label class="block text-gray-400 mb-1">التاريخ</label>
							<input type="date" id="form-date" class="w-full bg-gray-700 rounded-lg p-3 text-white">
						</div>
						<div id="extra-fields"></div>
						<div>
							<label class="block text-gray-400 mb-1">ملاحظات</label>
							<textarea id="form-notes" class="w-full bg-gray-700 rounded-lg p-3 text-white h-20" placeholder="تفاصيل إضافية..."></textarea>
						</div>
						<div>
							<label class="block text-gray-400 mb-1">التكلفة (اختياري)</label>
							<input type="number" id="form-cost" class="w-full bg-gray-700 rounded-lg p-3 text-white" placeholder="بالريال">
						</div>
						<div class="flex gap-3">
							<button onclick="Maintenance.save()" class="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold">💾 حفظ</button>
							<button onclick="Modals.backToTypes()" class="px-6 bg-gray-600 hover:bg-gray-700 py-3 rounded-xl">رجوع</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Odometer Modal -->
			<div id="odometer-modal" class="fixed inset-0 bg-black/70 z-50 hidden flex items-center justify-center p-4">
				<div class="bg-gray-800 w-full max-w-sm rounded-2xl p-6 slide-up">
					<h3 class="text-xl font-bold mb-4">📍 تحديث قراءة العداد</h3>
					<div class="mb-4">
						<label class="block text-gray-400 mb-1">القراءة الحالية (كم)</label>
						<input type="number" id="new-odometer" class="w-full bg-gray-700 rounded-lg p-3 text-white text-xl text-center">
					</div>
					<div class="flex gap-3">
						<button onclick="Modals.updateOdometer()" class="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold">تحديث</button>
						<button onclick="Modals.closeOdometer()" class="px-6 bg-gray-600 hover:bg-gray-700 py-3 rounded-xl">إلغاء</button>
					</div>
				</div>
			</div>

			<!-- Part Details Modal -->
			<div id="part-modal" class="fixed inset-0 bg-black/70 z-50 hidden flex items-center justify-center p-4">
				<div class="bg-gray-800 w-full max-w-sm rounded-2xl p-6 slide-up">
					<div class="flex justify-between items-center mb-4">
						<h3 class="text-xl font-bold" id="part-modal-title">تفاصيل القطعة</h3>
						<button onclick="Modals.closePart()" class="text-gray-400 hover:text-white text-2xl">&times;</button>
					</div>
					<div id="part-modal-content" class="space-y-3"></div>
					<button onclick="Modals.closePart()" class="w-full mt-4 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl">إغلاق</button>
				</div>
			</div>

			<!-- Settings Modal -->
			<div id="settings-modal" class="fixed inset-0 bg-black/70 z-50 hidden flex items-end justify-center">
				<div class="bg-gray-800 w-full max-w-md rounded-t-3xl p-6 slide-up max-h-[80vh] overflow-y-auto">
					<div class="flex justify-between items-center mb-6">
						<h3 class="text-xl font-bold">⚙️ إعدادات السيارة</h3>
						<button onclick="Modals.closeSettings()" class="text-gray-400 hover:text-white text-2xl">&times;</button>
					</div>
                    
					<div class="space-y-4">
						<div>
							<label class="block text-gray-400 mb-1">ماركة السيارة</label>
							<input type="text" id="settings-brand" class="w-full bg-gray-700 rounded-lg p-3 text-white">
						</div>
						<div>
							<label class="block text-gray-400 mb-1">الموديل</label>
							<input type="text" id="settings-model" class="w-full bg-gray-700 rounded-lg p-3 text-white">
						</div>
						<div>
							<label class="block text-gray-400 mb-1">سنة الصنع</label>
							<input type="number" id="settings-year" class="w-full bg-gray-700 rounded-lg p-3 text-white">
						</div>
						<div>
							<label class="block text-gray-400 mb-1">دورة تغيير الزيت (كم)</label>
							<select id="settings-oil-interval" class="w-full bg-gray-700 rounded-lg p-3 text-white">
								<option value="5000">كل 5,000 كم</option>
								<option value="7500">كل 7,500 كم</option>
								<option value="10000">كل 10,000 كم</option>
							</select>
						</div>
						<button onclick="Modals.saveSettings()" class="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold">💾 حفظ التغييرات</button>
						<button onclick="Modals.resetApp()" class="w-full bg-red-600/50 hover:bg-red-600 py-3 rounded-xl font-bold">🗑️ إعادة تعيين التطبيق</button>
					</div>
				</div>
			</div>
		`;

		// Populate maintenance types
		this.populateMaintenanceTypes();
	},

	/**
	 * Populate maintenance types buttons
	 */
	populateMaintenanceTypes() {
		const container = document.getElementById('maintenance-types');
		container.innerHTML = Object.entries(CONFIG.MAINTENANCE_TYPES).map(([key, type]) => `
			<button onclick="Modals.selectMaintenanceType('${key}')" class="maintenance-type-btn bg-gray-700 hover:bg-blue-600 p-4 rounded-xl text-center transition">
				<span class="text-3xl">${type.icon}</span>
				<p class="mt-1">${type.name.replace('تغيير ', '')}</p>
			</button>
		`).join('');
	},

	/**
	 * Bind modal close events
	 */
	bindEvents() {
		['maintenance-modal', 'odometer-modal', 'part-modal', 'settings-modal'].forEach(id => {
			document.getElementById(id).addEventListener('click', (e) => {
				if (e.target === e.currentTarget) {
					this.closeAll();
				}
			});
		});
	},

	/**
	 * Close all modals
	 */
	closeAll() {
		['maintenance-modal', 'odometer-modal', 'part-modal', 'settings-modal'].forEach(id => {
			document.getElementById(id).classList.add('hidden');
		});
	},

	// ==================== Maintenance Modal ====================

	openMaintenance() {
		document.getElementById('maintenance-modal').classList.remove('hidden');
		document.getElementById('maintenance-types').classList.remove('hidden');
		document.getElementById('maintenance-form').classList.add('hidden');
		document.getElementById('form-odometer').value = Data.carData.odometer;
		document.getElementById('form-date').value = new Date().toISOString().split('T')[0];
	},

	closeMaintenance() {
		document.getElementById('maintenance-modal').classList.add('hidden');
	},

	selectMaintenanceType(type) {
		this.selectedMaintenanceType = type;
		const typeConfig = CONFIG.MAINTENANCE_TYPES[type];
        
		document.getElementById('form-type').value = typeConfig.name;
		document.getElementById('maintenance-types').classList.add('hidden');
		document.getElementById('maintenance-form').classList.remove('hidden');

		// Build extra fields
		const extraFieldsContainer = document.getElementById('extra-fields');
		if (typeConfig.extraFields && typeConfig.extraFields.length > 0) {
			extraFieldsContainer.innerHTML = typeConfig.extraFields.map(field => `
				<div>
					<label class="block text-gray-400 mb-1">${field.label}</label>
					<input type="text" id="extra-${field.id}" class="w-full bg-gray-700 rounded-lg p-3 text-white" placeholder="${field.placeholder}">
				</div>
			`).join('');
		} else {
			extraFieldsContainer.innerHTML = '';
		}
	},

	backToTypes() {
		document.getElementById('maintenance-types').classList.remove('hidden');
		document.getElementById('maintenance-form').classList.add('hidden');
	},

	getSelectedType() {
		return this.selectedMaintenanceType;
	},

	// ==================== Odometer Modal ====================

	openOdometer() {
		document.getElementById('odometer-modal').classList.remove('hidden');
		document.getElementById('new-odometer').value = Data.carData.odometer;
	},

	closeOdometer() {
		document.getElementById('odometer-modal').classList.add('hidden');
	},

	updateOdometer() {
		const newValue = parseInt(document.getElementById('new-odometer').value);
		if (newValue && newValue >= Data.carData.odometer) {
			Data.updateOdometer(newValue);
			UI.updateAll();
			this.closeOdometer();
			UI.showToast('✓ تم تحديث العداد!');
		} else {
			UI.showToast('⚠️ القراءة يجب أن تكون أكبر من الحالية', 'warning');
		}
	},

	// ==================== Part Details Modal ====================

	showPartDetails(part) {
		const modal = document.getElementById('part-modal');
		const title = document.getElementById('part-modal-title');
		const content = document.getElementById('part-modal-content');

		const details = Health.getPartDetails(part);
		if (!details) return;

		title.textContent = details.title;

		let html = details.details.map(d => `
			<p><strong>${d.label}:</strong> ${d.value}</p>
		`).join('');

		if (details.percent !== undefined) {
			const colorClass = details.status === 'good' ? 'bg-green-500' : details.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500';
			html += `
				<div class="w-full bg-gray-700 rounded-full h-3 mt-2">
					<div class="${colorClass} h-3 rounded-full" style="width: ${details.percent}%"></div>
				</div>
			`;
		}

		if (details.statusText) {
			const textClass = details.status === 'good' ? 'text-green-400' : details.status === 'warning' ? 'text-yellow-400' : 'text-red-400';
			html += `<p class="${textClass} mt-2">${details.statusText}</p>`;
		}

		content.innerHTML = html;
		modal.classList.remove('hidden');
	},

	closePart() {
		document.getElementById('part-modal').classList.add('hidden');
	},

	// ==================== Settings Modal ====================

	openSettings() {
		document.getElementById('settings-modal').classList.remove('hidden');
		document.getElementById('settings-brand').value = Data.carData.brand;
		document.getElementById('settings-model').value = Data.carData.model;
		document.getElementById('settings-year').value = Data.carData.year;
		document.getElementById('settings-oil-interval').value = Data.carData.oilInterval;
	},

	closeSettings() {
		document.getElementById('settings-modal').classList.add('hidden');
	},

	saveSettings() {
		Data.update({
			brand: document.getElementById('settings-brand').value,
			model: document.getElementById('settings-model').value,
			year: parseInt(document.getElementById('settings-year').value),
			oilInterval: parseInt(document.getElementById('settings-oil-interval').value)
		});
		UI.updateAll();
		this.closeSettings();
		UI.showToast('✓ تم حفظ الإعدادات!');
	},

	resetApp() {
		if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟')) {
			Data.reset();
			location.reload();
		}
	}
};

