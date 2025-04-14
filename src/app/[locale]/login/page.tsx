'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { signIn } from '../../../lib/fireauth'; // signIn fonksiyonun yolu
import { useRouter } from 'next/navigation';
import { loginSchema } from '../../../shemas/loginShema'; // loginSchema dosyasının yolu


const Login = () => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');
  const [firebaseError, setFirebaseError] = useState('');
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setFirebaseError('');
      try {
        await signIn(values.email, values.password);
        router.push('/'); // başarılı girişten sonra yönlendirme
      } catch (error: any) {
        setFirebaseError(error.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <section className="container py-5">
      <h2 className="fw-bold text-center mb-3">Login</h2>
      <nav className="breadcrumb mb-4">
        <span className="breadcrumb-item">Home</span>
        <span className="breadcrumb-item active">Login</span>
      </nav>

      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <div className="text-center mb-4">
            <h3 className="fw-bold">Login To Rockie</h3>
            <p>Welcome back! Log In now to start trading</p>
            <div className="bg-light rounded-pill py-1 px-3 d-inline-block mb-3">
              🔒 <span className="text-success fw-semibold">https://accounts.rockie.com/login</span>
            </div>

            <div className="d-flex justify-content-center gap-3 mb-3">
              <button
                className={`btn ${loginMethod === 'email' ? 'btn-primary' : 'btn-outline-secondary'} btn-sm`}
                onClick={() => setLoginMethod('email')}
              >
                Email
              </button>
              <button
                className={`btn ${loginMethod === 'mobile' ? 'btn-primary' : 'btn-outline-secondary'} btn-sm`}
                onClick={() => setLoginMethod('mobile')}
              >
                Mobile
              </button>
            </div>
          </div>

          <form onSubmit={formik.handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                placeholder="Please fill in the email form."
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="invalid-feedback">{formik.errors.email}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                  placeholder="Please enter a password."
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <span className="input-group-text">
                  <i className="bi bi-eye" />
                </span>
                {formik.touched.password && formik.errors.password && (
                  <div className="invalid-feedback d-block ms-2">{formik.errors.password}</div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="rememberMe" />
                <label className="form-check-label" htmlFor="rememberMe">
                  Remember Me
                </label>
              </div>
              <Link href="#" className="text-danger small">
                Forgot Password?
              </Link>
            </div>

            {firebaseError && <div className="alert alert-danger">{firebaseError}</div>}

            <button type="submit" className="btn btn-primary w-100" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center mt-3">
            Not a Member?{' '}
            <Link href="/register" className="fw-semibold">
              Register
            </Link>
          </p>
        </div>

        <div className="col-lg-4 d-none d-lg-block">
          <div className="text-center">
            <div className="bg-secondary" style={{ width: 200, height: 200, margin: '0 auto' }} />
            <p className="fw-semibold mt-3">Login With QR Code</p>
            <p className="small">
              Scan this code with the <Link href="#" className="text-primary">Rockie mobile app</Link> to log in instantly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
