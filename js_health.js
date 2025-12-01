/**
 * Health Calculation Module
 * حساب صحة السيارة
 */

const Health = {
    /**
     * Calculate overall health score
     */
    calculate() {
        let score = 100;
        const statuses = {};
        const carData = Data.carData;

        // Oil check
        const oilKm = carData.odometer - carData.lastOil;
        const oilPercent = (oilKm / carData.oilInterval) * 100;
        if (oilPercent > 100) {
            score -= 20;
            statuses.oil = 'danger';
        } else if (oilPercent > 80) {
            score -= 10;
            statuses.oil = 'warning';
        } else {
            statuses.oil = 'good';
        }

        // Brakes check
        const brakesKm = carData.odometer - carData.lastBrakes;
        if (brakesKm > CONFIG.DEFAULTS.brakesLifespan) {
            score -= 25;
            statuses.brakes = 'danger';
        } else if (brakesKm > CONFIG.DEFAULTS.brakesWarning) {
            score -= 10;
            statuses.brakes = 'warning';
        } else {
            statuses.brakes = 'good';
        }

        // Battery check
        if (carData.batteryDate) {
            const batteryAge = (new Date() - new Date(carData.batteryDate)) / (1000 * 60 * 60 * 24 * 365);
            if (batteryAge > CONFIG.DEFAULTS.batteryLifespanYears) {
                score -= 15;
                statuses.battery = 'danger';
            } else if (batteryAge > CONFIG.DEFAULTS.batteryWarningYears) {
                score -= 8;
                statuses.battery = 'warning';
            } else {
                statuses.battery = 'good';
            }
        } else {
            statuses.battery = 'good';
        }

        // Tires check
        if (carData.tiresKm > CONFIG.DEFAULTS.tiresLifespan - 10000) {
            score -= 15;
            statuses.tires = 'danger';
        } else if (carData.tiresKm > CONFIG.DEFAULTS.tiresWarning) {
            score -= 8;
            statuses.tires = 'warning';
        } else {
            statuses.tires = 'good';
        }

        // Timing belt check
        const timingKm = carData.odometer - carData.timingBelt;
        if (timingKm > CONFIG.DEFAULTS.timingBeltLifespan) {
            score -= 20;
            statuses['timing-belt'] = 'danger';
        } else if (timingKm > CONFIG.DEFAULTS.timingBeltWarning) {
            score -= 10;
            statuses['timing-belt'] = 'warning';
        } else {
            statuses['timing-belt'] = 'good';
        }

        return {
            score: Math.max(0, score),
            statuses: statuses
        };
    },

    /**
     * Get part details
     */
    getPartDetails(part) {
        const carData = Data.carData;
        
        switch(part) {
            case 'oil':
                const oilKm = carData.odometer - carData.lastOil;
                const oilRemaining = carData.oilInterval - oilKm;
                const oilPercent = Math.max(0, (oilRemaining / carData.oilInterval) * 100);
                return {
                    title: 'زيت المحرك',
                    details: [
                        { label: 'آخر تغيير', value: `${carData.lastOil.toLocaleString()} كم` },
                        { label: 'قطع منذ التغيير', value: `${oilKm.toLocaleString()} كم` },
                        { label: 'المتبقي', value: oilRemaining > 0 ? `${oilRemaining.toLocaleString()} كم` : 'تجاوز الموعد!' }
                    ],
                    percent: oilPercent,
                    status: oilPercent > 30 ? 'good' : oilPercent > 10 ? 'warning' : 'danger'
                };

            case 'brakes':
                const brakesKm = carData.odometer - carData.lastBrakes;
                return {
                    title: 'الفرامل',
                    details: [
                        { label: 'آخر تغيير', value: `${carData.lastBrakes.toLocaleString()} كم` },
                        { label: 'قطع منذ التغيير', value: `${brakesKm.toLocaleString()} كم` },
                        { label: 'العمر الافتراضي', value: '40,000 - 50,000 كم' }
                    ],
                    status: brakesKm > 50000 ? 'danger' : brakesKm > 40000 ? 'warning' : 'good',
                    statusText: brakesKm > 50000 ? '⚠️ يجب التغيير فوراً!' : brakesKm > 40000 ? '⚠️ يحتاج فحص' : '✅ حالة جيدة'
                };

            case 'battery':
                if (carData.batteryDate) {
                    const batteryAge = (new Date() - new Date(carData.batteryDate)) / (1000 * 60 * 60 * 24 * 365);
                    return {
                        title: 'البطارية',
                        details: [
                            { label: 'تاريخ التركيب', value: carData.batteryDate },
                            { label: 'العمر', value: `${batteryAge.toFixed(1)} سنة` },
                            { label: 'العمر الافتراضي', value: '2 - 4 سنوات' }
                        ],
                        status: batteryAge > 3 ? 'danger' : batteryAge > 2 ? 'warning' : 'good',
                        statusText: batteryAge > 3 ? '⚠️ يجب التغيير!' : batteryAge > 2 ? '⚠️ يحتاج فحص' : '✅ حالة جيدة'
                    };
                }
                return {
                    title: 'البطارية',
                    details: [{ label: 'الحالة', value: 'لم يتم تسجيل بيانات البطارية' }],
                    status: 'good'
                };

            case 'tires':
                return {
                    title: 'الإطارات',
                    details: [
                        { label: 'الكيلومترات المقطوعة', value: `${carData.tiresKm.toLocaleString()} كم` },
                        { label: 'العمر الافتراضي', value: '40,000 - 60,000 كم' }
                    ],
                    status: carData.tiresKm > 50000 ? 'danger' : carData.tiresKm > 40000 ? 'warning' : 'good',
                    statusText: carData.tiresKm > 50000 ? '⚠️ يجب الفحص/التغيير!' : carData.tiresKm > 40000 ? '⚠️ افحص عمق النقشة' : '✅ حالة جيدة'
                };

            case 'timing-belt':
                const timingKm = carData.odometer - carData.timingBelt;
                return {
                    title: 'سير الكاتينة',
                    details: [
                        { label: 'آخر تغيير', value: `${carData.timingBelt.toLocaleString()} كم` },
                        { label: 'قطع منذ التغيير', value: `${timingKm.toLocaleString()} كم` },
                        { label: 'العمر الافتراضي', value: '80,000 - 100,000 كم' }
                    ],
                    status: timingKm > 100000 ? 'danger' : timingKm > 80000 ? 'warning' : 'good',
                    statusText: timingKm > 100000 ? '🚨 خطر! قد يتلف المحرك!' : timingKm > 80000 ? '⚠️ يجب التغيير قريباً' : '✅ حالة جيدة'
                };

            case 'engine':
                return {
                    title: 'المحرك',
                    details: [
                        { label: 'الممشى الكلي', value: `${carData.odometer.toLocaleString()} كم` },
                        { label: 'عمر السيارة', value: `${new Date().getFullYear() - carData.year} سنة` },
                        { label: 'الحالة', value: carData.odometer > 200000 ? 'يحتاج متابعة' : 'جيدة' }
                    ],
                    status: carData.odometer > 200000 ? 'warning' : 'good',
                    statusText: carData.odometer > 200000 ? '⚠️ راقب استهلاك الزيت والأصوات' : '✅ افحص المحرك دورياً'
                };

            case 'coolant':
                return {
                    title: 'نظام التبريد',
                    details: [
                        { label: 'سائل التبريد', value: 'يُغيّر كل 40,000 - 60,000 كم' },
                        { label: 'الردياتير', value: 'افحص للتسريبات' },
                        { label: 'ثرموستات', value: 'تُغيّر عند الحاجة' }
                    ],
                    status: 'good',
                    statusText: '💡 افحص مستوى السائل أسبوعياً'
                };

            case 'ac':
                return {
                    title: 'نظام التكييف',
                    details: [
                        { label: 'غاز الفريون', value: 'يُشحن عند ضعف التبريد' },
                        { label: 'فلتر المكيف', value: 'يُغيّر كل 15,000 - 20,000 كم' },
                        { label: 'الكمبروسر', value: 'يُفحص عند وجود أصوات' }
                    ],
                    status: 'good',
                    statusText: '❄️ شغّل المكيف بانتظام حتى في الشتاء'
                };

            case 'transmission':
                return {
                    title: 'ناقل الحركة (القير)',
                    details: [
                        { label: 'زيت القير', value: 'يُغيّر كل 60,000 - 80,000 كم' },
                        { label: 'الممشى الحالي', value: `${carData.odometer.toLocaleString()} كم` },
                        { label: 'النوع', value: 'أوتوماتيك / عادي' }
                    ],
                    status: carData.odometer > 80000 ? 'warning' : 'good',
                    statusText: carData.odometer > 80000 ? '⚠️ قد يحتاج تغيير زيت القير' : '✅ حالة جيدة'
                };

            case 'exhaust':
                return {
                    title: 'نظام العادم',
                    details: [
                        { label: 'الشكمان', value: 'يُفحص للصدأ والثقوب' },
                        { label: 'الكتلايزر', value: 'مهم للانبعاثات' },
                        { label: 'العمر الافتراضي', value: '100,000+ كم' }
                    ],
                    status: 'good',
                    statusText: '💨 راقب لون الدخان ووجود أصوات'
                };

            case 'suspension':
                const carAge = new Date().getFullYear() - carData.year;
                return {
                    title: 'نظام التعليق',
                    details: [
                        { label: 'المساعدين', value: 'يُغيّروا كل 80,000 - 100,000 كم' },
                        { label: 'الجلب والمقصات', value: 'تُفحص دورياً' },
                        { label: 'عمر السيارة', value: `${carAge} سنة` }
                    ],
                    status: carAge > 5 || carData.odometer > 100000 ? 'warning' : 'good',
                    statusText: carAge > 5 ? '⚠️ افحص المساعدين والجلب' : '✅ حالة جيدة'
                };

            default:
                return null;
        }
    },

    /**
     * Get AI predictions
     */
    getAIPredictions() {
        const carData = Data.carData;
        const predictions = [];
        const carAge = new Date().getFullYear() - carData.year;

        if (carData.odometer > 100000) {
            predictions.push('دينامو الشحن قد يحتاج فحص في هذه المرحلة');
        }
        if (carData.odometer > 80000 && carData.odometer < 120000) {
            predictions.push('طرمبة المياه عادة تُستبدل مع سير الكاتينة');
        }
        if (carAge > 5) {
            predictions.push('المساعدين (الممتصات) قد تحتاج فحص');
        }
        if (carData.odometer > 60000) {
            predictions.push('فلتر ناقل الحركة (القير) يحتاج تغيير');
        }
        if (carData.odometer > 40000) {
            predictions.push('شمعات الإشعال قد تحتاج تغيير');
        }
        if (carAge > 3) {
            predictions.push('افحص خراطيم المياه والردياتير');
        }

        return predictions;
    },

    /**
     * Get upcoming maintenance list
     */
    getUpcomingMaintenance() {
        const carData = Data.carData;
        const upcoming = [];

        // Oil
        const oilRemaining = carData.oilInterval - (carData.odometer - carData.lastOil);
        if (oilRemaining <= carData.oilInterval * 0.3) {
            upcoming.push({
                priority: oilRemaining <= 0 ? 1 : 2,
                title: 'تغيير زيت المحرك',
                subtitle: oilRemaining <= 0 ? `متأخر ${Math.abs(oilRemaining).toLocaleString()} كم` : `متبقي ${oilRemaining.toLocaleString()} كم`,
                type: 'oil'
            });
        }

        // Brakes
        const brakesKm = carData.odometer - carData.lastBrakes;
        if (brakesKm > 30000) {
            upcoming.push({
                priority: brakesKm > 50000 ? 1 : 2,
                title: 'فحص/تغيير الفرامل',
                subtitle: `قطعت ${brakesKm.toLocaleString()} كم`,
                type: 'brakes'
            });
        }

        // Battery
        if (carData.batteryDate) {
            const batteryAge = (new Date() - new Date(carData.batteryDate)) / (1000 * 60 * 60 * 24 * 365);
            if (batteryAge > 1.5) {
                upcoming.push({
                    priority: batteryAge > 3 ? 1 : 2,
                    title: 'فحص/تغيير البطارية',
                    subtitle: `عمرها ${batteryAge.toFixed(1)} سنة`,
                    type: 'battery'
                });
            }
        }

        // Tires
        if (carData.tiresKm > 35000) {
            upcoming.push({
                priority: carData.tiresKm > 50000 ? 1 : 2,
                title: 'فحص/تغيير الإطارات',
                subtitle: `قطعت ${carData.tiresKm.toLocaleString()} كم`,
                type: 'tires'
            });
        }

        // Timing Belt
        const timingKm = carData.odometer - carData.timingBelt;
        if (timingKm > 70000) {
            upcoming.push({
                priority: timingKm > 100000 ? 1 : 2,
                title: 'تغيير سير الكاتينة',
                subtitle: `قطع ${timingKm.toLocaleString()} كم`,
                type: 'timing-belt'
            });
        }

        return upcoming.sort((a, b) => a.priority - b.priority);
    }
};
