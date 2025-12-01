/**
 * Screens Module
 * إدارة الشاشات
 */

const Screens = {
    /**
     * Show login screen
     */
    showLogin() {
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('main-app').classList.add('hidden');
        document.getElementById('profile-screen').classList.add('hidden');
    },

    /**
     * Show register screen
     */
    showRegister() {
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('main-app').classList.add('hidden');
        document.getElementById('profile-screen').classList.add('hidden');
    },

    /**
     * Show setup screen (add car)
     */
    showSetup() {
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('setup-screen').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
        document.getElementById('profile-screen').classList.add('hidden');
    },

    /**
     * Show main app
     */
    showMainApp() {
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        document.getElementById('profile-screen').classList.add('hidden');
        
        Modals.init();
        UI.updateAll();
    },

    /**
     * Show profile screen
     */
    showProfile() {
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('main-app').classList.add('hidden');
        document.getElementById('profile-screen').classList.remove('hidden');
        
        Profile.load();
    },

    /**
     * Handle login
     */
    handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            UI.showToast('⚠️ يرجى ملء جميع الحقول', 'warning');
            return;
        }

        const result = Auth.login(username, password);
        if (result.success) {
            UI.showToast('✓ تم تسجيل الدخول بنجاح!');
            this.afterLogin();
        } else {
            UI.showToast('⚠️ ' + result.error, 'warning');
        }
    },

    /**
     * Handle register
     */
    handleRegister() {
        const fullName = document.getElementById('register-fullname').value.trim();
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const phone = document.getElementById('register-phone').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (!fullName || !username || !email || !password) {
            UI.showToast('⚠️ يرجى ملء جميع الحقول المطلوبة', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            UI.showToast('⚠️ كلمتا المرور غير متطابقتين', 'warning');
            return;
        }

        if (password.length < 6) {
            UI.showToast('⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'warning');
            return;
        }

        const result = Auth.register({ fullName, username, email, phone, password });
        if (result.success) {
            // Auto login after registration
            Auth.login(username, password);
            UI.showToast('✓ تم إنشاء الحساب بنجاح!');
            this.showSetup();
        } else {
            UI.showToast('⚠️ ' + result.error, 'warning');
        }
    },

    /**
     * Handle logout
     */
    handleLogout() {
        if (confirm('هل تريد تسجيل الخروج؟')) {
            Auth.logout();
            this.showLogin();
            UI.showToast('تم تسجيل الخروج');
        }
    },

    /**
     * After login - check if user has cars
     */
    afterLogin() {
        const cars = Auth.getUserCars();
        if (cars.length === 0) {
            this.showSetup();
        } else {
            // Load active car data
            const activeCar = Auth.getActiveCar();
            if (activeCar) {
                Data.carData = activeCar;
            }
            this.showMainApp();
        }
    },

    /**
     * Clear form
     */
    clearForms() {
        document.querySelectorAll('#auth-screen input').forEach(input => {
            input.value = '';
        });
    }
};
