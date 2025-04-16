'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { profileSchema } from '../../../shemas/profileShema';
import { useTranslations } from 'next-intl';
import { changePassword } from '@/lib/fireauth';

const Profile = () => {
    const [userData, setUserData] = useState<any>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const t = useTranslations();

    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const docRef = doc(db, 'users', currentUser.uid);
            const snap = await getDoc(docRef);

            if (snap.exists()) {
                setUserData({ ...snap.data(), email: currentUser.email });
            }
        };

        fetchUserData();
    }, []);

    const handleChangePassword = async (values: any, { resetForm }: any) => {
        setError('');
        setSuccess('');

        const user = auth.currentUser;
        if (!user || !user.email) return setError('Kullanıcı oturumu bulunamadı');

        try {
            await changePassword(user.email, values.currentPassword, values.newPassword);
            setSuccess(t('password_update_success'));
            resetForm();
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (!userData) return <p>Loading...</p>;

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-md-3">
                    <div className="card shadow-sm rounded-4 p-3">
                        <div className="text-center mb-3">
                            <div className="avatar bg-secondary rounded-circle mx-auto" style={{ width: 80, height: 80 }}></div>
                            <p className="fw-semibold mt-2">{userData.email}</p>
                        </div>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item">{t('user_profile')}</li>
                            <li className="list-group-item">{t('referrals')}</li>
                            <li className="list-group-item">{t('api_keys')}</li>
                            <li className="list-group-item">{t('login_history')}</li>
                            <li className="list-group-item">{t('two_fa')}</li>
                            <li className="list-group-item">{t('change_password')}</li>
                        </ul>
                    </div>
                </div>

                <div className="col-md-9">
                    <div className="card shadow-sm rounded-4 p-4">
                        <h4 className="mb-4">{t('user_profile')}</h4>

                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <label>{t('username')}</label>
                                <input className="form-control" value={userData.nickname || ''} disabled />
                            </div>
                            <div className="col-md-6">
                                <label>{t('user_email')}</label>
                                <input className="form-control" value={userData.email || ''} disabled />
                            </div>
                            <div className="col-md-6">
                                <label>{t('country')}</label>
                                <input className="form-control" value={userData.country || ''} disabled />
                            </div>
                        </div>

                        <Formik
                            initialValues={{
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: '',
                            }}
                            validationSchema={profileSchema(t)}
                            onSubmit={handleChangePassword}
                        >
                            <Form className="row g-3">
                                <div className="col-md-6">
                                    <label>{t('current_password')}</label>
                                    <Field name="currentPassword" type="password" className="form-control" />
                                    <ErrorMessage name="currentPassword" component="div" className="text-danger" />
                                </div>
                                <div className="col-md-6">
                                    <label>{t('new_password')}</label>
                                    <Field name="newPassword" type="password" className="form-control" />
                                    <ErrorMessage name="newPassword" component="div" className="text-danger" />
                                </div>
                                <div className="col-md-6">
                                    <label>{t('confirm_password')}</label>
                                    <Field name="confirmPassword" type="password" className="form-control" />
                                    <ErrorMessage name="confirmPassword" component="div" className="text-danger" />
                                </div>
                                <div className="col-12">
                                    <button type="submit" className="btn btn-primary mt-3">{t('change_password')}</button>
                                    {error && <p className="text-danger mt-2">{error}</p>}
                                    {success && <p className="text-success mt-2">{success}</p>}
                                </div>
                            </Form>
                        </Formik>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
