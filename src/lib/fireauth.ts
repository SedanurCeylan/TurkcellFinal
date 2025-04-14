import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    User,
} from 'firebase/auth';
import { app } from "./firebase"

export const registerUser = async (
    email: string,
    password: string
): Promise<User> => {
    const auth = getAuth(app);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: any) {
        console.error('Hata:', error.message);
        throw error;
    }
};

export const signIn = async (
    email: string,
    password: string
): Promise<{ uid: string; email: string | null }> => {
    const auth = getAuth(app);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Kullanıcı giriş yaptı:', userCredential.user);
        return {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
        };
    } catch (error: any) {
        console.error('Hata:', error.message);
        throw error;
    }
};
