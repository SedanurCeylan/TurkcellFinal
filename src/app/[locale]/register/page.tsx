'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { registerSchema } from './../../../shemas/registerSchema';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import Link from 'next/link';
import { useState } from 'react';
import { registerUser } from '@/lib/fireauth';

const Register = () => {
  const [firebaseError, setFirebaseError] = useState('');
  const [success, setSuccess] = useState('');

  const initialValues = {
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    country: 'Turkey (+90)',
    phone: '',
    uidCode: '',
  };
  interface RegisterFormValues {
    email: string;
    password: string;
  }

  const handleSubmit = async (values: RegisterFormValues) => {
    setFirebaseError('');
    setSuccess('');

    try {
      const userCredential = await registerUser(values.email, values.password);

      if (!userCredential || !userCredential.uid) {
        throw new Error("Kayıt sırasında bir sorun oluştu.");
      }

      setSuccess('Kayıt başarılı!');
      console.log("User registered successfully");
    } catch (error: any) {
      setFirebaseError(error.message || "Bir hata oluştu.");
      console.error("Kayıt hatası:", error);
    }
  };



  return (
    <section className="container py-5">
      <h2 className="text-center fw-bold mb-4">Register</h2>

      <div className="row justify-content-center">
        <div className="col-lg-6">
          <h3 className="fw-semibold mb-1">Register To Rockie</h3>
          <p className="text-muted mb-4">Register in advance and enjoy the event benefits</p>

          <Formik
            initialValues={initialValues}
            validationSchema={registerSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form>
                <div className="mb-3 d-flex gap-2">
                  <Field
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="Please fill in the email form"
                  />
                  <button type="button" className="btn btn-primary">Authenticate</button>
                </div>
                <ErrorMessage name="email" component="div" className="text-danger mb-2" />

                <label className="form-label">
                  Password <span className="text-danger">(8 Or More Characters, Including Numbers And Special Characters)</span>
                </label>
                <div className="mb-3">
                  <Field
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder="Please enter a password"
                  />
                  <ErrorMessage name="password" component="div" className="text-danger" />
                </div>

                <div className="mb-3">
                  <Field
                    name="confirmPassword"
                    type="password"
                    className="form-control"
                    placeholder="Please re-enter your password"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="text-danger" />
                </div>

                <label className="form-label">
                  NickName <span className="text-danger">(Excluding Special Characters)</span>
                </label>
                <div className="mb-3">
                  <Field
                    name="nickname"
                    type="text"
                    className="form-control"
                    placeholder="Enter Nickname"
                  />
                  <ErrorMessage name="nickname" component="div" className="text-danger" />
                </div>

                <div className="mb-3">
                  <Field name="country" as="select" className="form-select">
                    <option>South Korea (+82)</option>
                    <option>Turkey (+90)</option>
                    <option>Germany (+49)</option>
                    <option>USA (+1)</option>
                  </Field>
                  <ErrorMessage name="country" component="div" className="text-danger" />
                </div>

                <label className="form-label">
                  Phone <span className="text-danger">(Enter Numbers Only)</span>
                </label>
                <div className="mb-3">
                  <Field
                    name="phone"
                    type="text"
                    className="form-control"
                    placeholder="0500 000 00 00"
                  />
                  <ErrorMessage name="phone" component="div" className="text-danger" />
                </div>

                <div className="mb-3">
                  <Field
                    name="uidCode"
                    type="text"
                    className="form-control"
                    placeholder="Please enter your invitation code"
                  />
                </div>

                {firebaseError && <p className="text-danger">{firebaseError}</p>}
                {success && <p className="text-success">{success}</p>}

                <button type="submit" className="btn btn-primary w-100">
                  Pre-Registration
                </button>

                <p className="text-center mt-3">
                  Already Have An Account? <Link href="/login">Login</Link>
                </p>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </section>
  );
};

export default Register;
