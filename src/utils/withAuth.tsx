

//bu sayfa kullanıcıları kısıtlayan sayfa giri yapıp yapmadığını kontrol eden bir sayfa
'use client'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const withAuth = (WrappedComponent: any) => {
    return function ProtectedComponent(props: any) {
        const router = useRouter();

        useEffect(() => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (!user) {
                    router.push('/login');
                }
            });

            return () => unsubscribe();
        }, []);

        return <WrappedComponent {...props} />;
    };
};

export default withAuth;
