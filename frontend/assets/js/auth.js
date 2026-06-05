import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged as firebaseOnAuthStateChanged, doc, setDoc, getDoc } from './firebase-config.js';

// Wait for Firebase to be initialized
let firebaseReady = new Promise((resolve) => {
    if (auth && db) {
        resolve();
    }
});

// Export function to check if Firebase is ready
export async function waitForFirebaseInit() {
    try {
        await firebaseReady;
        console.log('[Auth] Firebase is initialized and ready');
        return true;
    } catch (error) {
        console.error('[Auth] Firebase initialization failed:', error);
        return false;
    }
}

// Sign up new user
export async function signUpUser(username, email, password) {
    try {
        console.log('[Auth] ===== SIGNUP PROCESS STARTED =====');
        console.log('[Auth] Username:', username);
        console.log('[Auth] Email:', email);
        console.log('[Auth] Firebase Project ID:', auth.app.options.projectId);
        console.log('[Auth] Auth Domain:', auth.app.options.authDomain);
        console.log('[Auth] Database instance:', db.app.options.projectId);
        
        // Create user with email and password
        console.log('[Auth] Step 1: Creating Firebase Auth account...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('[Auth] ✅ Firebase Auth account created!');
        console.log('[Auth] User UID:', user.uid);
        console.log('[Auth] 🔗 Check user in console: https://console.firebase.google.com/project/' + auth.app.options.projectId + '/authentication/users');

        // Store user data in Firestore
        console.log('[Auth] Step 2: Storing user data in Firestore...');
        
        const userData = {
            username: username,
            email: email,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        const userDocRef = doc(db, 'users', user.uid);
        console.log('[Auth] Writing to document path: users/' + user.uid);
        
        await setDoc(userDocRef, userData);
        console.log('[Auth] ✅ User document created!');
        console.log('[Auth] 🔗 Check document in console: https://console.firebase.google.com/project/' + db.app.options.projectId + '/firestore/data/~2Fusers~2F' + user.uid);

        // Create username mapping (IMPORTANT - must succeed for username login to work!)
        console.log('[Auth] Step 3: Creating username mapping...');
        const usernameDocRef = doc(db, 'usernames', username.toLowerCase());
        console.log('[Auth] Writing to document path: usernames/' + username.toLowerCase());
        console.log('[Auth] Mapping data: uid=' + user.uid + ', email=' + email);
        
        try {
            await setDoc(usernameDocRef, {
                uid: user.uid,
                email: email
            });
            console.log('[Auth] ✅ Username mapping created successfully!');
            console.log('[Auth] 🔗 Check in console: https://console.firebase.google.com/project/' + db.app.options.projectId + '/firestore/data/~2Fusernames~2F' + username.toLowerCase());
        } catch (usernameError) {
            console.error('[Auth] ❌ CRITICAL ERROR: Username mapping creation failed!');
            console.error('[Auth] Error code:', usernameError.code);
            console.error('[Auth] Error message:', usernameError.message);
            
            // Still throw this error so the user knows their username might not work
            throw new Error('Failed to create username mapping: ' + usernameError.message + '. You can still login with your email address.');
        }

        console.log('[Auth] ===== SIGNUP COMPLETED SUCCESSFULLY =====');
        console.log('[Auth] 🎉 User account fully created!');
        console.log('[Auth] 👉 Firebase Console Links:');
        console.log('[Auth]    Authentication: https://console.firebase.google.com/project/csp-c0aad/authentication/users');
        console.log('[Auth]    Firestore Data: https://console.firebase.google.com/project/csp-c0aad/firestore/data');
        return { success: true, user: user };
        
    } catch (error) {
        console.error('[Auth] ===== SIGNUP FAILED =====');
        console.error('[Auth] Error code:', error.code);
        console.error('[Auth] Error message:', error.message);
        return { success: false, error: error.message };
    }
}

// Sign in existing user
export async function signInUser(usernameOrEmail, password) {
    try {
        console.log('[Auth] ===== LOGIN PROCESS STARTED =====');
        let email = usernameOrEmail;
        let isUsername = false;

        // Check if input is username (doesn't contain @)
        if (!usernameOrEmail.includes('@')) {
            isUsername = true;
            console.log('[Auth] Input appears to be username, looking up email in Firestore...');
            try {
                // Look up email from username
                const usernameDoc = await getDoc(doc(db, 'usernames', usernameOrEmail.toLowerCase()));
                if (!usernameDoc.exists()) {
                    console.error('[Auth] Username not found in Firestore:', usernameOrEmail.toLowerCase());
                    throw new Error('Username not found. Please check your username or sign up.');
                }
                email = usernameDoc.data().email;
                console.log('[Auth] ✅ Username found, using email:', email);
            } catch (firestoreError) {
                console.error('[Auth] ❌ Error looking up username:', firestoreError.message);
                throw firestoreError;  // Re-throw so we handle it properly below
            }
        } else {
            console.log('[Auth] Input appears to be email, skipping username lookup');
        }

        console.log('[Auth] Attempting Firebase Auth sign in with email:', email);
        // Sign in with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('[Auth] ✅ Firebase Auth sign in successful!');

        // Update last login time
        console.log('[Auth] Updating last login time...');
        await setDoc(doc(db, 'users', user.uid), {
            lastLogin: new Date().toISOString()
        }, { merge: true });
        console.log('[Auth] ✅ Last login time updated!');

        console.log('[Auth] ===== LOGIN COMPLETED SUCCESSFULLY =====');
        console.log('User signed in successfully:', user.uid);
        return { success: true, user: user };
    } catch (error) {
        console.error('[Auth] ===== LOGIN FAILED =====');
        console.error('[Auth] Error code:', error.code);
        console.error('[Auth] Error message:', error.message);
        console.error('[Auth] Full error:', error);
        
        let errorMessage = 'Invalid username/email or password';
        
        // Handle specific Firebase Auth errors
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email format';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later';
        } else if (error.message && error.message.includes('Username not found')) {
            errorMessage = 'Username not found. Please check your username or sign up.';
        } else if (error.message && error.message.includes('Network error')) {
            errorMessage = 'Network connection error. Please check your internet.';
        }
        
        return { success: false, error: errorMessage };
    }
}

// Sign out user
export async function signOutUser() {
    try {
        await signOut(auth);
        console.log('User signed out successfully');
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
}

// Get current user
export function getCurrentUser() {
    return auth.currentUser;
}

// Get user data from Firestore
export async function getUserData(uid) {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return { success: true, data: userDoc.data() };
        } else {
            return { success: false, error: 'User data not found' };
        }
    } catch (error) {
        console.error('Get user data error:', error);
        return { success: false, error: error.message };
    }
}

// Check if user is logged in
export function onAuthStateChanged(callback) {
    return firebaseOnAuthStateChanged(auth, callback);
}
