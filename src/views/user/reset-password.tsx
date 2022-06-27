import { Center, Loader, Stack } from '@mantine/core';
import React from 'react';
import AuthLayout from './auth-layout';
import * as Yup from 'yup';
import { useIntl } from 'react-intl';
import { passwordValidation } from '../../helpers/Utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AuthHelper } from '../../helpers/AuthHelper';
import PasswordStrength from './password-strength';
import PasswordConfirm from './password-confirm';
import { Alert, Button } from 'reactstrap';

const ResetPassword:React.FC = () => {
    
    const intl = useIntl();
    const navigate = useNavigate();
    const dispatchFn = useDispatch();
    const authHelper = React.useMemo(
        () => new AuthHelper(dispatchFn),
        [dispatchFn],
    );
    const [searchParams] = useSearchParams();
    const [token, setToken] = React.useState('');
    const [completed, setCompleted] = React.useState(true);
    const [sending, setSending] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    
    const schema = Yup.object().shape({
        password: Yup.string()
            .min(8, intl.formatMessage({ id: 'auth.password.min' }))
            .required(intl.formatMessage({ id: 'auth.password.required' }))
            .test(
                'password-validation',
                intl.formatMessage({ id: 'auth.password.invalid' }),
                passwordValidation,
            ),
        confirm_password: Yup.string()
            .oneOf(
                [Yup.ref('password')],
                intl.formatMessage({ id: 'auth.password.mismatch' }),
            )
            .required(intl.formatMessage({ id: 'auth.password.confirm' })),
    });

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<{password: string, confirm_password: string}>({
        resolver: yupResolver(schema),
        defaultValues: {
            password: '',
            confirm_password: '',
        },
    });

    const password = watch('password');

    const onSubmit = (data: {password: string, confirm_password: string}) => {
        setSending(true);
        setErrorMessage('');
        authHelper.resetPassword({token, password: data.password, confirm_password: data.confirm_password}).then(() => {
            setSending(false);
            setCompleted(true);
        }).catch(err => {
            setSending(false);
            if (err.response && err.response.status === 400) {
                console.log(err.response.data);
                const status = err.response.data.status;
                if (status === 'invalid') {
                    setErrorMessage('You are not authorized to reset the password. Please generate a new password reset link.');
                } else if (status === 'expired') {
                    setErrorMessage('The password reset link has expired. Please generate a new password reset link.');
                } else if (status === 'password') {
                    setErrorMessage('The password you entered is invalid. Please try again.');
                } else if (status === 'confirm_password') {
                    setErrorMessage('The passwords you entered do not match. Please try again.');
                } else {
                    setErrorMessage('Something went wrong. Try again later!');
                }
            } else {
                setErrorMessage('Something went wrong. Try again later!');
            }
        })
    }

    React.useEffect(() => {
        const tokenStr = searchParams.get('token');
        if (tokenStr === null || tokenStr.length === 0) {
            navigate('/');
            return;
        }
        setToken(tokenStr);
    
    }, [searchParams, navigate]);

    return <AuthLayout>
        {!completed && <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
            <Stack className='w-full'>
                <h1 className='font-bold text-3xl'>Reset Your Password</h1>
                {sending && (
                    <Center>
                        <Loader variant="dots" />
                    </Center>
                )}
                {!sending && errorMessage.length > 0 && (
                    <p className='text-danger text-center text-lg'>{errorMessage}</p>
                )}
                <p className='text-muted text-sm'>Strong password should include letters in lower and uppercase, at least 1 number and the password should be longer than 8 characters long.</p>
                <PasswordStrength
                        error={errors.password ? errors.password.message : ''}
                        name={register('password').name}
                        label="Password"
                        placeholder="********"
                        size={'md'}
                        onChange={register('password').onChange}
                        onBlur={register('password').onBlur}
                        ref={register('password').ref}
                    />
                    <PasswordConfirm
                        error={errors.confirm_password ? errors.confirm_password.message : ''}
                        name={register('confirm_password').name}
                        label="Confirm Password"
                        placeholder="********"
                        size={'md'}
                        onChange={register('confirm_password').onChange}
                        onBlur={register('confirm_password').onBlur}
                        ref={register('confirm_password').ref}
                        password={password}
                    />
                    <span className="w-full mt-4">
                        <Button
                            size="lg"
                            className="w-full"
                            color="primary">
                            Submit
                        </Button>
                    </span>
                    
            </Stack>
        </form>}
        {completed && <Stack>
            <h1 className='font-bold text-3xl'>Password Reset</h1>
            <Alert>
                <p className='text-lg'>New password saved successfully!</p>
                <p className='text-xs'>You will be redirected to your dashboard in a moment.</p>
            </Alert>
            <p className='text-sm text-muted'>If you are not automatically redirected in 5 seconds, please click the link below.</p>
            <span className='text-blue-500 underline cursor-pointer' onClick={() => {
                navigate('/')
            }}>
                Dashboard
            </span>
        </Stack>}
    </AuthLayout>
}

export default ResetPassword;