/**
 * Reports & Analytics Module
 * التقارير والتحليلات
 */

const Reports = {
	/**
	 * Get comprehensive statistics for user
	 */
	getUserStats() {
		const user = Auth.getCurrentUser();
		if (!user) return null;

		const stats = {
			totalCars: user.cars.length,
			totalMaintenanceRecords: 0,
			totalSpending: 0,
			spendingByCar: {},
			spendingByType: {},
			spendingByMonth: {},
			spendingByYear: {},
			maintenanceTimeline: [],
			averageHealthScore: 0,
			accountAge: this.getAccountAge(user.createdAt)
		};

		// Calculate stats for each car
		user.cars.forEach(car => {
			const carKey = `${car.brand} ${car.model} ${car.year}`;
			stats.spendingByCar[carKey] = 0;

			if (car.maintenanceHistory && car.maintenanceHistory.length > 0) {
				car.maintenanceHistory.forEach(record => {
					stats.totalMaintenanceRecords++;
					const cost = parseFloat(record.cost) || 0;
					stats.totalSpending += cost;
					stats.spendingByCar[carKey] += cost;

					// By type
					const typeName = record.typeName || record.type || 'أخرى';
					stats.spendingByType[typeName] = (stats.spendingByType[typeName] || 0) + cost;

					// By month/year
					if (record.date) {
						const date = new Date(record.date);
						const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
						const yearKey = date.getFullYear().toString();
                        
						stats.spendingByMonth[monthKey] = (stats.spendingByMonth[monthKey] || 0) + cost;
						stats.spendingByYear[yearKey] = (stats.spendingByYear[yearKey] || 0) + cost;

						// Timeline
						stats.maintenanceTimeline.push({
							date: record.date,
							car: carKey,
							type: typeName,
							cost: cost,
							odometer: record.odometer,
							notes: record.notes
						});
					}
				});
			}
		});

		// Sort timeline by date
		stats.maintenanceTimeline.sort((a, b) => new Date(b.date) - new Date(a.date));

		// Calculate average health score
		if (user.cars.length > 0) {
			let totalHealth = 0;
			user.cars.forEach(car => {
				const tempData = Data.carData;
				Data.carData = car;
				const health = Health.calculate();
				totalHealth += health.score;
				Data.carData = tempData;
			});
			stats.averageHealthScore = Math.round(totalHealth / user.cars.length);
		}

		return stats;
	},

	/**
	 * Get account age in days
	 */
	getAccountAge(createdAt) {
		const created = new Date(createdAt);
		const now = new Date();
		const diffTime = Math.abs(now - created);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	},

	/**
	 * Get spending report for a specific period
	 */
	getSpendingReport(startDate, endDate) {
		const user = Auth.getCurrentUser();
		if (!user) return null;

		const report = {
			period: { start: startDate, end: endDate },
			totalSpending: 0,
			records: [],
			byType: {},
			byCar: {}
		};

		const start = new Date(startDate);
		const end = new Date(endDate);

		user.cars.forEach(car => {
			const carKey = `${car.brand} ${car.model} ${car.year}`;
            
			if (car.maintenanceHistory) {
				car.maintenanceHistory.forEach(record => {
					if (record.date) {
						const recordDate = new Date(record.date);
						if (recordDate >= start && recordDate <= end) {
							const cost = parseFloat(record.cost) || 0;
							report.totalSpending += cost;
							report.records.push({
								...record,
								car: carKey
							});

							const typeName = record.typeName || record.type || 'أخرى';
							report.byType[typeName] = (report.byType[typeName] || 0) + cost;
							report.byCar[carKey] = (report.byCar[carKey] || 0) + cost;
						}
					}
				});
			}
		});

		report.records.sort((a, b) => new Date(b.date) - new Date(a.date));
		return report;
	},

	/**
	 * Get car history report
	 */
	getCarHistoryReport(carId) {
		const user = Auth.getCurrentUser();
		if (!user) return null;

		const car = user.cars.find(c => c.id === carId);
		if (!car) return null;

		const report = {
			car: {
				brand: car.brand,
				model: car.model,
				year: car.year,
				odometer: car.odometer,
				createdAt: car.createdAt
			},
			totalSpending: 0,
			totalRecords: 0,
			odometerHistory: [],
			maintenanceByType: {},
			healthHistory: [],
			lastMaintenances: {}
		};

		if (car.maintenanceHistory) {
			car.maintenanceHistory.forEach(record => {
				const cost = parseFloat(record.cost) || 0;
				report.totalSpending += cost;
				report.totalRecords++;

				const typeName = record.typeName || record.type || 'أخرى';
				if (!report.maintenanceByType[typeName]) {
					report.maintenanceByType[typeName] = {
						count: 0,
						totalCost: 0,
						records: []
					};
				}
				report.maintenanceByType[typeName].count++;
				report.maintenanceByType[typeName].totalCost += cost;
				report.maintenanceByType[typeName].records.push(record);

				// Track odometer history
				if (record.odometer) {
					report.odometerHistory.push({
						date: record.date,
						odometer: record.odometer
					});
				}

				// Track last maintenance per type
				if (!report.lastMaintenances[record.type] || 
					new Date(record.date) > new Date(report.lastMaintenances[record.type].date)) {
					report.lastMaintenances[record.type] = record;
				}
			});
		}

		// Sort odometer history
		report.odometerHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

		return report;
	},

	/**
	 * Get maintenance predictions
	 */
	getMaintenancePredictions(carId) {
		const user = Auth.getCurrentUser();
		if (!user) return null;

		const car = user.cars.find(c => c.id === carId);
		if (!car) return null;

		const predictions = [];
		const now = new Date();

		// Oil change prediction
		const oilKm = car.odometer - (car.lastOil || 0);
		const oilRemaining = (car.oilInterval || 10000) - oilKm;
		predictions.push({
			type: 'oil',
			name: 'تغيير زيت المحرك',
			icon: '🛢️',
			currentKm: oilKm,
			remainingKm: oilRemaining,
			urgency: oilRemaining <= 0 ? 'danger' : oilRemaining <= 2000 ? 'warning' : 'normal',
			estimatedDate: this.estimateDate(car, oilRemaining),
			estimatedCost: this.getAverageCost(car, 'oil') || 150
		});

		// Brakes prediction
		const brakesKm = car.odometer - (car.lastBrakes || 0);
		const brakesRemaining = 50000 - brakesKm;
		predictions.push({
			type: 'brakes',
			name: 'تغيير تيل الفرامل',
			icon: '🛑',
			currentKm: brakesKm,
			remainingKm: brakesRemaining,
			urgency: brakesRemaining <= 0 ? 'danger' : brakesRemaining <= 10000 ? 'warning' : 'normal',
			estimatedDate: this.estimateDate(car, brakesRemaining),
			estimatedCost: this.getAverageCost(car, 'brakes') || 300
		});

		// Battery prediction
		if (car.batteryDate) {
			const batteryAge = (now - new Date(car.batteryDate)) / (1000 * 60 * 60 * 24 * 365);
			const batteryRemaining = 3 - batteryAge;
			predictions.push({
				type: 'battery',
				name: 'تغيير البطارية',
				icon: '🔋',
				currentAge: batteryAge.toFixed(1) + ' سنة',
				remainingYears: batteryRemaining.toFixed(1) + ' سنة',
				urgency: batteryRemaining <= 0 ? 'danger' : batteryRemaining <= 0.5 ? 'warning' : 'normal',
				estimatedDate: this.addYears(new Date(car.batteryDate), 3),
				estimatedCost: this.getAverageCost(car, 'battery') || 400
			});
		}

		// Tires prediction
		const tiresRemaining = 60000 - (car.tiresKm || 0);
		predictions.push({
			type: 'tires',
			name: 'تغيير الإطارات',
			icon: '🛞',
			currentKm: car.tiresKm || 0,
			remainingKm: tiresRemaining,
			urgency: tiresRemaining <= 0 ? 'danger' : tiresRemaining <= 10000 ? 'warning' : 'normal',
			estimatedDate: this.estimateDate(car, tiresRemaining),
			estimatedCost: this.getAverageCost(car, 'tires') || 1500
		});

		// Timing belt prediction
		const timingKm = car.odometer - (car.timingBelt || 0);
		const timingRemaining = 100000 - timingKm;
		predictions.push({
			type: 'timing-belt',
			name: 'تغيير سير الكاتينة',
			icon: '⛓️',
			currentKm: timingKm,
			remainingKm: timingRemaining,
			urgency: timingRemaining <= 0 ? 'danger' : timingRemaining <= 10000 ? 'warning' : 'normal',
			estimatedDate: this.estimateDate(car, timingRemaining),
			estimatedCost: this.getAverageCost(car, 'timing-belt') || 800
		});

		return predictions.sort((a, b) => {
			const urgencyOrder = { danger: 0, warning: 1, normal: 2 };
			return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
		});
	},

	/**
	 * Estimate date based on average daily km
	 */
	estimateDate(car, remainingKm) {
		if (remainingKm <= 0) return 'الآن';
        
		// Calculate average daily km from maintenance history
		let avgDailyKm = 50; // Default assumption
        
		if (car.maintenanceHistory && car.maintenanceHistory.length >= 2) {
			const sorted = [...car.maintenanceHistory]
				.filter(r => r.odometer && r.date)
				.sort((a, b) => new Date(a.date) - new Date(b.date));
            
			if (sorted.length >= 2) {
				const first = sorted[0];
				const last = sorted[sorted.length - 1];
				const kmDiff = last.odometer - first.odometer;
				const daysDiff = (new Date(last.date) - new Date(first.date)) / (1000 * 60 * 60 * 24);
				if (daysDiff > 0 && kmDiff > 0) {
					avgDailyKm = kmDiff / daysDiff;
				}
			}
		}

		const daysRemaining = Math.ceil(remainingKm / avgDailyKm);
		const estimatedDate = new Date();
		estimatedDate.setDate(estimatedDate.getDate() + daysRemaining);
        
		return estimatedDate.toLocaleDateString('ar-SA');
	},

	/**
	 * Add years to date
	 */
	addYears(date, years) {
		const result = new Date(date);
		result.setFullYear(result.getFullYear() + years);
		return result.toLocaleDateString('ar-SA');
	},

	/**
	 * Get average cost for maintenance type
	 */
	getAverageCost(car, type) {
		if (!car.maintenanceHistory) return null;
        
		const records = car.maintenanceHistory.filter(r => r.type === type && r.cost);
		if (records.length === 0) return null;

		const total = records.reduce((sum, r) => sum + parseFloat(r.cost), 0);
		return Math.round(total / records.length);
	},

	/**
	 * Export user data as JSON
	 */
	exportUserData() {
		const user = Auth.getCurrentUser();
		if (!user) return null;

		const exportData = {
			exportDate: new Date().toISOString(),
			appVersion: CONFIG.VERSION,
			user: {
				fullName: user.fullName,
				email: user.email,
				phone: user.phone,
				createdAt: user.createdAt
			},
			cars: user.cars.map(car => ({
				...car,
				id: undefined // Remove internal ID
			}))
		};

		return exportData;
	},
    
	/**
	 * Generate PDF-ready report data
	 */
	generatePrintableReport(carId) {
		const carReport = this.getCarHistoryReport(carId);
		const predictions = this.getMaintenancePredictions(carId);
		const user = Auth.getCurrentUser();

		return {
			generatedAt: new Date().toLocaleString('ar-SA'),
			owner: user.fullName,
			car: carReport.car,
			healthScore: (() => {
				const car = user.cars.find(c => c.id === carId);
				const tempData = Data.carData;
				Data.carData = car;
				const health = Health.calculate();
				Data.carData = tempData;
				return health.score;
			})(),
			totalSpending: carReport.totalSpending,
			totalRecords: carReport.totalRecords,
			maintenanceHistory: carReport.maintenanceByType,
			upcomingMaintenance: predictions
		};
	}
};

