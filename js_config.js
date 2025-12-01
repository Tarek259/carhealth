/**
 * Configuration and Constants
 * الثوابت والإعدادات
 */

const CONFIG = {
    // App Info
    APP_NAME: 'الملف الطبي للسيارة',
    APP_NAME_EN: 'Car Health Monitor',
    VERSION: '2.1.0',
    
    // Storage Keys (managed by Auth module)
    STORAGE: {
        USERS: 'carHealth_users',
        CURRENT_USER: 'carHealth_currentUser'
    },
    
    // Default Values
    DEFAULTS: {
        oilInterval: 10000,
        brakesLifespan: 50000,
        brakesWarning: 35000,
        tiresLifespan: 60000,
        tiresWarning: 40000,
        timingBeltLifespan: 100000,
        timingBeltWarning: 80000,
        batteryLifespanYears: 3,
        batteryWarningYears: 2
    },
    
    // Status Colors
    COLORS: {
        good: '#22c55e',
        warning: '#eab308',
        danger: '#ef4444'
    },
    
    // Maintenance Types
    MAINTENANCE_TYPES: {
        oil: {
            name: 'تغيير زيت المحرك',
            icon: '🛢️',
            extraFields: [
                { id: 'oil-type', label: 'نوع الزيت', placeholder: 'مثال: 5W30' },
                { id: 'oil-brand', label: 'ماركة الزيت', placeholder: 'مثال: Shell, Mobil' }
            ]
        },
        tires: {
            name: 'تغيير الإطارات',
            icon: '🛞',
            extraFields: [
                { id: 'tire-brand', label: 'ماركة الإطارات', placeholder: 'مثال: Michelin' },
                { id: 'tire-size', label: 'المقاس', placeholder: 'مثال: 205/55 R16' }
            ]
        },
        battery: {
            name: 'تغيير البطارية',
            icon: '🔋',
            extraFields: [
                { id: 'battery-brand', label: 'ماركة البطارية', placeholder: 'مثال: Varta, Bosch' },
                { id: 'battery-amp', label: 'السعة (أمبير)', placeholder: 'مثال: 60' }
            ]
        },
        brakes: {
            name: 'تغيير الفرامل',
            icon: '🛑',
            extraFields: [
                { id: 'brakes-type', label: 'نوع التيل', placeholder: 'أمامي / خلفي / كلاهما' },
                { id: 'brakes-brand', label: 'الماركة', placeholder: 'مثال: Brembo' }
            ]
        },
        'timing-belt': {
            name: 'تغيير سير الكاتينة',
            icon: '⛓️',
            extraFields: [
                { id: 'timing-brand', label: 'الماركة', placeholder: 'مثال: Gates' }
            ]
        },
        service: {
            name: 'صيانة دورية',
            icon: '⚙️',
            extraFields: [
                { id: 'service-details', label: 'تفاصيل الصيانة', placeholder: 'ما تم عمله...' }
            ]
        }
    },
    
    // Symptoms for Diagnosis
    SYMPTOMS: [
        { id: 'brake-squeal', icon: '🔊', text: 'صوت صفير عند الفرامل' },
        { id: 'vibration', icon: '📳', text: 'اهتزاز عند سرعة عالية' },
        { id: 'hard-start', icon: '🔑', text: 'صعوبة في التشغيل' },
        { id: 'pull-side', icon: '↔️', text: 'السيارة تميل لجانب' },
        { id: 'engine-noise', icon: '🔧', text: 'صوت طقطقة من المحرك' },
        { id: 'ac-weak', icon: '❄️', text: 'ضعف تبريد المكيف' },
        { id: 'smoke-exhaust', icon: '💨', text: 'دخان من العادم' },
        { id: 'oil-leak', icon: '🛢️', text: 'تسريب زيت' }
    ],
    
    // Diagnosis Results
    DIAGNOSES: {
        'brake-squeal': { 
            title: '🔊 صوت صفير الفرامل', 
            text: 'احتمال تآكل تيل الفرامل أو وجود أتربة. إذا استمر الصوت، افحص التيل فوراً.' 
        },
        'vibration': { 
            title: '📳 اهتزاز السيارة', 
            text: 'غالباً تحتاج ترصيص إطارات (Wheel Balancing) أو فحص المساعدين.' 
        },
        'hard-start': { 
            title: '🔑 صعوبة التشغيل', 
            text: 'الأسباب: ضعف البطارية، شمعات الإشعال، أو طرمبة البنزين. ابدأ بفحص البطارية.' 
        },
        'pull-side': { 
            title: '↔️ ميلان السيارة', 
            text: 'تحتاج ضبط زوايا العجلات (Alignment). تأكد من تساوي ضغط الإطارات.' 
        },
        'engine-noise': { 
            title: '🔧 صوت المحرك', 
            text: 'افحص مستوى الزيت أولاً. قد يكون السبب الصبابات أو سير المحرك.' 
        },
        'ac-weak': { 
            title: '❄️ ضعف المكيف', 
            text: 'يحتاج شحن فريون أو تغيير فلتر المكيف. قد يكون هناك تسريب.' 
        },
        'smoke-exhaust': { 
            title: '💨 دخان العادم', 
            text: 'دخان أبيض = مشكلة في الماء. دخان أزرق = حرق زيت. دخان أسود = خليط غني (وقود زائد).' 
        },
        'oil-leak': { 
            title: '🛢️ تسريب الزيت', 
            text: 'افحص جوانات المحرك وكارتير الزيت. تجنب القيادة لمسافات طويلة قبل الإصلاح.' 
        }
    },
    
    // Parts Lifespan Reference
    PARTS_LIFESPAN: [
        { icon: '🛢️', name: 'زيت المحرك', lifespan: '5,000 - 10,000 كم' },
        { icon: '🛞', name: 'تيل الفرامل', lifespan: '30,000 - 50,000 كم' },
        { icon: '🔋', name: 'البطارية', lifespan: '2 - 4 سنوات' },
        { icon: '🛞', name: 'الإطارات', lifespan: '40,000 - 60,000 كم' },
        { icon: '⛓️', name: 'سير الكاتينة', lifespan: '80,000 - 100,000 كم' },
        { icon: '💧', name: 'سائل التبريد', lifespan: '40,000 - 60,000 كم' },
        { icon: '🔧', name: 'شمعات الإشعال', lifespan: '30,000 - 50,000 كم' },
        { icon: '⚙️', name: 'زيت القير', lifespan: '60,000 - 80,000 كم' }
    ]
};
