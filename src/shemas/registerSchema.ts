import * as Yup from 'yup';

export const registerSchema = Yup.object({
    email: Yup.string()
        .email('Geçerli bir email giriniz.')
        .required('Email zorunludur'),
    password: Yup.string()
        .min(8, 'En az 8 karakter')
        .matches(/[0-9]/, 'En az bir rakam içermeli')
        .required('Şifre zorunludur'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Şifreler uyuşmuyor')
        .required('Tekrar şifre zorunludur'),
    nickname: Yup.string()
        .matches(/^[a-zA-Z0-9]+$/, 'Sadece harf ve rakam kullanılabilir')
        .required('Nick zorunludur'),
    phone: Yup.string()
        .matches(/^[0-9]+$/, 'Sadece rakam giriniz')
        .required('Telefon numarası zorunludur'),
    country: Yup.string().required('Ülke seçimi zorunludur'),
    uidCode: Yup.string().optional(),
});
