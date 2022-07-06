import React from 'react';
import AuthLayout from './auth-layout';
import SignupForm from './signup-form';

const Register: React.FC = () => {

    return (
        <AuthLayout>
            <SignupForm title='Register' buttonTitle='Register' />
        </AuthLayout>
    );
};

export default Register;
