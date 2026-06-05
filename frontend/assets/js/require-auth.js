import { onAuthStateChanged } from './auth.js';

onAuthStateChanged((user) => {
    if (!user) {
        const isPagesPath = window.location.pathname.includes('/pages/');
        window.location.href = isPagesPath ? '../../auth/login.html' : 'auth/login.html';
    }
});
