import { Center, Group, Loader, Stack, TextInput } from '@mantine/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from 'reactstrap';
import { AuthHelper } from '../../helpers/AuthHelper';
import AuthLayout from './auth-layout';

const ForgotPassword:React.FC = () => {
    const dispatchFc = useDispatch();
    const authHelper = React.useMemo(
        () => new AuthHelper(dispatchFc),
        [dispatchFc]
    );
    const [error, setError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [sending, setSending] = React.useState(false);
    const navigate = useNavigate();
    const [email, setEmail] = React.useState('');
    const [emailSent, setEmailSent] = React.useState(false);

    const onSubmit = () => {
        setSending(true);
        setError(false);
        if (emailSent) { return; }
        authHelper.generatePasswordResetLink(email).then(() => {
            setSending(false);
            setEmailSent(true);
            // navigate('/auth/login');
        }).catch(err => {
            setError(true);
            if (err.response && err.response.status === 400) {
                setErrorMessage('A user with this email address does not exist.');   
            } else {
                setErrorMessage('Something went wrong. Try again later');
            }
            setSending(false);
        });
    }

    return (<AuthLayout>
        <Stack className='w-full'>
            <h1 className='font-bold text-3xl'>Forgot Password?</h1>
            {sending && (
                <Center>
                    <Loader variant='dots' />
                </Center>
            )}
            {!sending && error && (
                <p className='text-center text-lg text-danger'>{errorMessage}</p>
            )}
            {!sending && !error && emailSent && (
                <p className='text-center text-lg text-success'>Password reset link sent to your email.</p>
            )}
            <TextInput
                required
                size={'md'}
                value={email}
                error={error}
                disabled={sending || emailSent}
                type='email'
                onChange={(e) => setEmail(e.currentTarget.value)}
                icon={<i className="simple-icon-envelope" />}
                placeholder='Email'
                description='We will send you a link to reset your password.'
                label='Please enter your email'
            />
            <Group position='right'>
                <p onClick={() => {
                    navigate('/user/login');
                }} className="text-blue-500 hover:text-blue-700 cursor-pointer underline">
                    Login, instead?
                </p>
            </Group>
            <span onClick={() => {onSubmit()}} className='w-full'>
                <Button color='primary' size='lg' className='w-full'>
                    Reset Password
                </Button>
            </span>
        </Stack>
    </AuthLayout>
    );
}

export default ForgotPassword;