/**
 * Diagnosis Module
 * التشخيص
 */

const Diagnosis = {
    /**
     * Toggle diagnosis for symptom (inline)
     */
    toggleDiagnosis(symptomId) {
        const resultEl = document.getElementById(`diagnosis-${symptomId}`);
        if (!resultEl) return;
        
        // Toggle visibility
        if (resultEl.classList.contains('hidden')) {
            // Hide all other diagnoses
            document.querySelectorAll('[id^="diagnosis-"]').forEach(el => {
                el.classList.add('hidden');
            });
            // Show this one
            resultEl.classList.remove('hidden');
        } else {
            resultEl.classList.add('hidden');
        }
    },

    /**
     * Get all symptoms
     */
    getSymptoms() {
        return CONFIG.SYMPTOMS;
    },

    /**
     * Get parts lifespan reference
     */
    getPartsLifespan() {
        return CONFIG.PARTS_LIFESPAN;
    },

    /**
     * Smart diagnosis based on car data
     */
    smartDiagnosis() {
        const suggestions = [];
        const carData = Data.carData;
        const carAge = new Date().getFullYear() - carData.year;

        // Check oil
        const oilKm = carData.odometer - carData.lastOil;
        if (oilKm > carData.oilInterval * 0.9) {
            suggestions.push({
                priority: 'high',
                message: 'الزيت يحتاج تغيير قريباً، قد تلاحظ صوت أعلى من المحرك'
            });
        }

        // Check brakes
        const brakesKm = carData.odometer - carData.lastBrakes;
        if (brakesKm > 40000) {
            suggestions.push({
                priority: 'medium',
                message: 'راقب أداء الفرامل، إذا سمعت صوت صفير فالتيل يحتاج تغيير'
            });
        }

        // Check battery
        if (carData.batteryDate) {
            const batteryAge = (new Date() - new Date(carData.batteryDate)) / (1000 * 60 * 60 * 24 * 365);
            if (batteryAge > 2 && batteryAge < 3) {
                suggestions.push({
                    priority: 'low',
                    message: 'البطارية في عمر متوسط، افحصها قبل الشتاء'
                });
            } else if (batteryAge >= 3) {
                suggestions.push({
                    priority: 'high',
                    message: 'البطارية قديمة، قد تواجه صعوبة في التشغيل'
                });
            }
        }

        // Check tires
        if (carData.tiresKm > 40000) {
            suggestions.push({
                priority: 'medium',
                message: 'الإطارات قطعت مسافة كبيرة، تحقق من عمق النقشة وترصيص العجلات'
            });
        }

        // General age-based suggestions
        if (carAge > 5) {
            suggestions.push({
                priority: 'low',
                message: 'السيارة عمرها أكثر من 5 سنوات، فكر في فحص المساعدين وخراطيم المياه'
            });
        }

        if (carData.odometer > 100000) {
            suggestions.push({
                priority: 'medium',
                message: 'الممشى تجاوز 100 ألف كم، افحص طرمبة البنزين ودينامو الشحن'
            });
        }

        return suggestions;
    }
};
