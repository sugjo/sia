import { auth, provider } from '../firebase';
import { settings, settingsToDefault } from '../../../store/settings.store';
import { userToDefault, user as userStore } from '../../../store/user.store';
import {
	sendPasswordResetEmail,
	signInWithRedirect,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	getRedirectResult
} from 'firebase/auth';

export const login = async (email, password) => {
	try {
		await signInWithEmailAndPassword(auth, email, password);
		//TODO: загрузка пользовательских настроек
	} catch (error) {
		return { type: 'other', message: error.message };
	}
};

export const passwordReset = async (email) => {
	try {
		await sendPasswordResetEmail(auth, email);
	} catch (error) {
		if (error.code == 'auth/invalid-email')
			return { type: 'email', message: 'Введите существующий Email' };
		if (error.code == 'auth/user-not-found')
			return { type: 'email', message: 'Пользователь не найден' };
		return { type: 'other', message: error.message };
	}
};

export const register = async (email, password) => {
	//✔
	try {
		await createUserWithEmailAndPassword(auth, email, password);
		login(email, password);
	} catch (error) {
		if (error.code == 'auth/email-already-in-use')
			return { type: 'email', message: 'Email уже используется' };
		if (error.code == 'auth/invalid-email')
			return { type: 'email', message: 'Введите существующий Email' };
		if (error.code == 'auth/weak-password')
			return { type: 'password', message: 'Пароль слишком простой' };
		return { type: 'other', message: error.message };
	}
};

export const logout = () => {
	//✔
	signOut(auth);
	settingsToDefault();
	userToDefault();
};

export const googleAuth = async () => {
	try {
		await signInWithRedirect(auth, provider);
	} catch (error) {
		return { type: 'other', message: error.message };
	}
};

export const googleAuthHandler = async () => {
	try {
		const redirectResult = await getRedirectResult(auth);
		if (!redirectResult) return;
		userStore.update((user) => (user = { ...user, uid: redirectResult.user.uid }));
	} catch (error) {
		if (error.code == 'auth/account-exists-with-different-credential')
			return 'TODO: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#signinwithpopup';
		return { type: 'other', message: error.message };
	}
};