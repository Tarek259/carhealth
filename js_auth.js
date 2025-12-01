/**
 * Authentication Module
 * نظام المصادقة وإدارة الحسابات
 */

const Auth = {
    // Use CONFIG storage keys if available, fallback to defaults
    get USERS_KEY() {
        return CONFIG?.STORAGE?.USERS || 'carHealth_users';
    },
    get CURRENT_USER_KEY() {
        return CONFIG?.STORAGE?.CURRENT_USER || 'carHealth_currentUser';
    },
    
    /**
     * Get all users
     */
    getUsers() {
        const users = localStorage.getItem(this.USERS_KEY);
        return users ? JSON.parse(users) : {};
    },

    /**
     * Save users to storage
     */
    saveUsers(users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    },

    /**
     * Get current logged in user
     */
    getCurrentUser() {
        const userId = localStorage.getItem(this.CURRENT_USER_KEY);
        if (!userId) return null;
        
        const users = this.getUsers();
        return users[userId] || null;
    },

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    /**
     * Register new user
     */
    register(userData) {
        const users = this.getUsers();
        
        // Check if email already exists
        const emailExists = Object.values(users).some(u => u.email === userData.email);
        if (emailExists) {
            return { success: false, error: 'البريد الإلكتروني مسجل مسبقاً' };
        }

        // Check if username already exists
        if (users[userData.username]) {
            return { success: false, error: 'اسم المستخدم موجود مسبقاً' };
        }

        // Determine role - first user is admin
        const isFirstUser = Object.keys(users).length === 0;
        
        // Create new user
        const newUser = {
            id: userData.username,
            username: userData.username,
            email: userData.email,
            password: this.hashPassword(userData.password),
            fullName: userData.fullName,
            phone: userData.phone || '',
            avatar: userData.avatar || '👤',
            role: isFirstUser ? 'admin' : 'user', // First user is admin
            createdAt: new Date().toISOString(),
            lastLogin: null,
            settings: {
                notifications: true,
                darkMode: true,
                language: 'ar',
                distanceUnit: 'km',
                currency: 'SAR'
            },
            cars: [],
            activeCar: null
        };

        users[newUser.id] = newUser;
        this.saveUsers(users);

        return { success: true, user: newUser };
    },

    /**
     * Login user
     */
    login(username, password) {
        const users = this.getUsers();
        const user = users[username];

        if (!user) {
            // Try to find by email
            const userByEmail = Object.values(users).find(u => u.email === username);
            if (!userByEmail) {
                return { success: false, error: 'المستخدم غير موجود' };
            }
            if (userByEmail.password !== this.hashPassword(password)) {
                return { success: false, error: 'كلمة المرور غير صحيحة' };
            }
            localStorage.setItem(this.CURRENT_USER_KEY, userByEmail.id);
            return { success: true, user: userByEmail };
        }

        if (user.password !== this.hashPassword(password)) {
            return { success: false, error: 'كلمة المرور غير صحيحة' };
        }

        localStorage.setItem(this.CURRENT_USER_KEY, user.id);
        return { success: true, user: user };
    },

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    },

    /**
     * Update user profile
     */
    updateProfile(updates) {
        const users = this.getUsers();
        const currentUserId = localStorage.getItem(this.CURRENT_USER_KEY);
        
        if (!currentUserId || !users[currentUserId]) {
            return { success: false, error: 'المستخدم غير موجود' };
        }

        // Update user data
        users[currentUserId] = {
            ...users[currentUserId],
            ...updates,
            id: currentUserId // Prevent changing ID
        };

        this.saveUsers(users);
        return { success: true, user: users[currentUserId] };
    },

    /**
     * Update user settings
     */
    updateSettings(settings) {
        const users = this.getUsers();
        const currentUserId = localStorage.getItem(this.CURRENT_USER_KEY);
        
        if (!currentUserId || !users[currentUserId]) {
            return { success: false, error: 'المستخدم غير موجود' };
        }

        users[currentUserId].settings = {
            ...users[currentUserId].settings,
            ...settings
        };

        this.saveUsers(users);
        return { success: true, settings: users[currentUserId].settings };
    },

    /**
     * Change password
     */
    changePassword(currentPassword, newPassword) {
        const users = this.getUsers();
        const currentUserId = localStorage.getItem(this.CURRENT_USER_KEY);
        
        if (!currentUserId || !users[currentUserId]) {
            return { success: false, error: 'المستخدم غير موجود' };
        }

        if (users[currentUserId].password !== this.hashPassword(currentPassword)) {
            return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
        }

        users[currentUserId].password = this.hashPassword(newPassword);
        this.saveUsers(users);
        
        return { success: true };
    },

    /**
     * Delete account
     */
    deleteAccount(password) {
        const users = this.getUsers();
        const currentUserId = localStorage.getItem(this.CURRENT_USER_KEY);
        
        if (!currentUserId || !users[currentUserId]) {
            return { success: false, error: 'المستخدم غير موجود' };
        }

        if (users[currentUserId].password !== this.hashPassword(password)) {
            return { success: false, error: 'كلمة المرور غير صحيحة' };
        }

        delete users[currentUserId];
        this.saveUsers(users);
        this.logout();
        
        return { success: true };
    },

    /**
     * Simple hash function (for demo - use proper hashing in production)
     */
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    },

    /**
     * Get user's cars
     */
    getUserCars() {
        const user = this.getCurrentUser();
        return user ? user.cars : [];
    },

    /**
     * Add car to user
     */
    addCar(carData) {
        const users = this.getUsers();
        const currentUserId = localStorage.getItem(this.CURRENT_USER_KEY);
        
        if (!currentUserId || !users[currentUserId]) {
            return { success: false, error: 'المستخدم غير موجود' };
        }

        const carId = 'car_' + Date.now();
        const newCar = {
            id: carId,
            ...carData,
            createdAt: new Date().toISOString()
        };

        users[currentUserId].cars.push(newCar);
        
        // Set as active if first car
        if (users[currentUserId].cars.length === 1) {
            users[currentUserId].activeCar = carId;
        }

        this.saveUsers(users);
        return { success: true, car: newCar };
    },

    /**
     * Update car
     */
    updateCar(carId, updates) {
        const users = this.getUsers();
        const currentUserId = localStorage.getItem(this.CURRENT_USER_KEY);
        
        if (!currentUserId || !users[currentUserId]) {
            return { success: false, error: 'المستخدم غير موجود' };
        }

        const carIndex = users[currentUserId].cars.findIndex(c => c.id === carId);
        if (carIndex === -1) {
            return { success: false, error: 'السيارة غير موجودة' };
        }

        users[currentUserId].cars[carIndex] = {
            ...users[currentUserId].cars[carIndex],
            ...updates,
            id: carId
        };

        this.saveUsers(users);
        return { success: true, car: users[currentUserId].cars[carIndex] };
    },

    /**
     * Delete car
     */
    deleteCar(carId) {
        const users = this.getUsers();
        const currentUserId = localStorage.getItem(this.CURRENT_USER_KEY);
        
        if (!currentUserId || !users[currentUserId]) {
            return { success: false, error: 'المستخدم غير موجود' };
        }

        users[currentUserId].cars = users[currentUserId].cars.filter(c => c.id !== carId);
        
        // Update active car if deleted
        if (users[currentUserId].activeCar === carId) {
            users[currentUserId].activeCar = users[currentUserId].cars.length > 0 
                ? users[currentUserId].cars[0].id 
                : null;
        }

        this.saveUsers(users);
        return { success: true };
    },

    /**
     * Set active car
     */
    setActiveCar(carId) {
        const users = this.getUsers();
        const currentUserId = localStorage.getItem(this.CURRENT_USER_KEY);
        
        if (!currentUserId || !users[currentUserId]) {
            return { success: false, error: 'المستخدم غير موجود' };
        }

        const car = users[currentUserId].cars.find(c => c.id === carId);
        if (!car) {
            return { success: false, error: 'السيارة غير موجودة' };
        }

        users[currentUserId].activeCar = carId;
        this.saveUsers(users);
        
        return { success: true, car: car };
    },

    /**
     * Get active car
     */
    getActiveCar() {
        const user = this.getCurrentUser();
        if (!user || !user.activeCar) return null;
        
        return user.cars.find(c => c.id === user.activeCar) || null;
    },

    /**
     * Check if current user is admin
     */
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    /**
     * Admin: Get all users list (without sensitive data)
     */
    adminGetAllUsers() {
        if (!this.isAdmin()) {
            return { success: false, error: 'غير مصرح - المدير فقط' };
        }

        const users = this.getUsers();
        const usersList = Object.values(users).map(u => ({
            id: u.id,
            username: u.username,
            fullName: u.fullName,
            email: u.email,
            phone: u.phone,
            role: u.role,
            avatar: u.avatar,
            createdAt: u.createdAt,
            lastLogin: u.lastLogin,
            carsCount: u.cars?.length || 0,
            totalMaintenanceRecords: u.cars?.reduce((sum, car) => sum + (car.maintenanceHistory?.length || 0), 0) || 0
        }));

        return { success: true, users: usersList };
    },

    /**
     * Admin: Get user details
     */
    adminGetUserDetails(userId) {
        if (!this.isAdmin()) {
            return { success: false, error: 'غير مصرح - المدير فقط' };
        }

        const users = this.getUsers();
        const user = users[userId];
        
        if (!user) {
            return { success: false, error: 'المستخدم غير موجود' };
        }

        // Return full user data (except password)
        const { password, ...userData } = user;
        return { success: true, user: userData };
    },

    /**
     * Admin: Delete user
     */
    adminDeleteUser(userId) {
        if (!this.isAdmin()) {
            return { success: false, error: 'غير مصرح - المدير فقط' };
        }

        const users = this.getUsers();
        const currentUserId = localStorage.getItem(this.CURRENT_USER_KEY);
        
        if (userId === currentUserId) {
            return { success: false, error: 'لا يمكنك حذف حسابك الخاص' };
        }

        if (!users[userId]) {
            return { success: false, error: 'المستخدم غير موجود' };
        }

        delete users[userId];
        this.saveUsers(users);
        
        return { success: true };
    },

    /**
     * Admin: Update user role
     */
    adminUpdateUserRole(userId, newRole) {
        if (!this.isAdmin()) {
            return { success: false, error: 'غير مصرح - المدير فقط' };
        }

        const users = this.getUsers();
        const currentUserId = localStorage.getItem(this.CURRENT_USER_KEY);
        
        if (userId === currentUserId) {
            return { success: false, error: 'لا يمكنك تغيير دورك الخاص' };
        }

        if (!users[userId]) {
            return { success: false, error: 'المستخدم غير موجود' };
        }

        if (!['admin', 'user'].includes(newRole)) {
            return { success: false, error: 'دور غير صحيح' };
        }

        users[userId].role = newRole;
        this.saveUsers(users);
        
        return { success: true, user: users[userId] };
    },

    /**
     * Admin: Get system statistics
     */
    adminGetSystemStats() {
        if (!this.isAdmin()) {
            return { success: false, error: 'غير مصرح - المدير فقط' };
        }

        const users = this.getUsers();
        const usersArray = Object.values(users);

        const stats = {
            totalUsers: usersArray.length,
            adminUsers: usersArray.filter(u => u.role === 'admin').length,
            regularUsers: usersArray.filter(u => u.role === 'user').length,
            totalCars: usersArray.reduce((sum, u) => sum + (u.cars?.length || 0), 0),
            totalMaintenanceRecords: usersArray.reduce((sum, u) => 
                sum + u.cars?.reduce((carSum, car) => carSum + (car.maintenanceHistory?.length || 0), 0) || 0, 0),
            storageUsed: new Blob([JSON.stringify(localStorage)]).size,
            registrationsByMonth: this.getRegistrationsByMonth(usersArray)
        };

        return { success: true, stats };
    },

    /**
     * Helper: Get registrations by month
     */
    getRegistrationsByMonth(usersArray) {
        const byMonth = {};
        usersArray.forEach(user => {
            if (user.createdAt) {
                const date = new Date(user.createdAt);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
            }
        });
        return byMonth;
    }
};
