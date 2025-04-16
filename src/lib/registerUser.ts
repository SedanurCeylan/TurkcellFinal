// lib/firebase/registerUser.ts
import { createUserWithEmailAndPassword, getAuth, User } from "firebase/auth";
import { app } from "./firebase";

export const registerUser = async (
    email: string,
    password: string
): Promise<User> => {
    const auth = getAuth(app);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: any) {
        console.error("Kayıt Hatası:", error.message);
        throw error;
    }
};
