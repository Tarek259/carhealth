/**
 * Maintenance Module
 * إدارة الصيانات
 */

const Maintenance = {
    /**
     * Save maintenance record
     */
    save() {
        const type = Modals.getSelectedType();
        const odometer = parseInt(document.getElementById('form-odometer').value);
        const date = document.getElementById('form-date').value;
        const notes = document.getElementById('form-notes').value;
        const cost = document.getElementById('form-cost').value;

        if (!odometer || !date) {
            UI.showToast('⚠️ يرجى ملء البيانات المطلوبة', 'warning');
            return;
        }

        // Update car data based on maintenance type
        Data.carData.odometer = Math.max(Data.carData.odometer, odometer);

        switch(type) {
            case 'oil':
                Data.carData.lastOil = odometer;
                break;
            case 'brakes':
                Data.carData.lastBrakes = odometer;
                break;
            case 'battery':
                Data.carData.batteryDate = date;
                break;
            case 'tires':
                Data.carData.tiresKm = 0;
                break;
            case 'timing-belt':
                Data.carData.timingBelt = odometer;
                break;
        }

        // Collect extra fields
        const typeConfig = CONFIG.MAINTENANCE_TYPES[type];
        let extraData = {};
        if (typeConfig && typeConfig.extraFields) {
            typeConfig.extraFields.forEach(field => {
                const el = document.getElementById('extra-' + field.id);
                if (el && el.value) {
                    extraData[field.id] = el.value;
                }
            });
        }

        // Build notes with extra data
        let fullNotes = notes;
        if (Object.keys(extraData).length > 0) {
            const extraNotesArr = [];
            if (extraData['oil-type']) extraNotesArr.push(`نوع: ${extraData['oil-type']}`);
            if (extraData['oil-brand']) extraNotesArr.push(`ماركة: ${extraData['oil-brand']}`);
            if (extraData['tire-brand']) extraNotesArr.push(`ماركة: ${extraData['tire-brand']}`);
            if (extraData['tire-size']) extraNotesArr.push(`مقاس: ${extraData['tire-size']}`);
            if (extraData['battery-brand']) extraNotesArr.push(`ماركة: ${extraData['battery-brand']}`);
            if (extraData['battery-amp']) extraNotesArr.push(`سعة: ${extraData['battery-amp']} أمبير`);
            if (extraData['brakes-type']) extraNotesArr.push(`نوع: ${extraData['brakes-type']}`);
            if (extraData['brakes-brand']) extraNotesArr.push(`ماركة: ${extraData['brakes-brand']}`);
            if (extraData['timing-brand']) extraNotesArr.push(`ماركة: ${extraData['timing-brand']}`);
            if (extraData['service-details']) extraNotesArr.push(extraData['service-details']);
            
            if (extraNotesArr.length > 0) {
                fullNotes = extraNotesArr.join(' | ') + (notes ? ' | ' + notes : '');
            }
        }

        // Add to history
        const record = {
            type: type,
            typeName: typeConfig ? typeConfig.name : 'صيانة',
            odometer: odometer,
            date: date,
            notes: fullNotes,
            cost: cost,
            extraData: extraData
        };
        
        Data.addMaintenance(record);
        
        // Save to user account
        App.saveCarData();
        
        Modals.closeMaintenance();
        UI.updateAll();
        UI.showToast('✓ تم حفظ الصيانة بنجاح!');
    },

    /**
     * Quick maintenance (from upcoming list)
     */
    quick(type) {
        Data.quickMaintenance(type);
        App.saveCarData();
        UI.updateAll();
        UI.showToast('✓ تم تسجيل الصيانة!');
    },

    /**
     * Get maintenance history
     */
    getHistory() {
        return Data.carData.maintenanceHistory;
    },

    /**
     * Calculate total spending
     */
    getTotalSpending() {
        return Data.carData.maintenanceHistory.reduce((total, item) => {
            return total + (parseFloat(item.cost) || 0);
        }, 0);
    },

    /**
     * Get maintenance by type
     */
    getByType(type) {
        return Data.carData.maintenanceHistory.filter(item => item.type === type);
    },

    /**
     * Get last maintenance date for type
     */
    getLastMaintenanceDate(type) {
        const records = this.getByType(type);
        if (records.length === 0) return null;
        return records[0].date;
    }
};
