import {
    Center,
    Stack,
    TextInput,
    Group,
    Checkbox,
    Loader,
    PasswordInput,
    Popover,
} from '@mantine/core';
import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button } from 'reactstrap';
import { AuthHelper } from '../../helpers/AuthHelper';
import { RootState } from '../../redux';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DateTime } from 'luxon';
import { secondsToHourMinutesSeconds } from '../../helpers/Utils';
import AuthLayout from './auth-layout';

const Login: React.FC = () => {
    const loading = useSelector((root: RootState) => root.auth.loading);
    const dispatchFn = useDispatch();
    const intl = useIntl();
    const authHelper = React.useMemo(
        () => new AuthHelper(dispatchFn),
        [dispatchFn],
    );
    const [error, setError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [sending, setSending] = React.useState(false);
    const [suspendedSec, setSuspendedSec] = React.useState(-1);
    const [showTooltip, setShowTooltip] = React.useState(false);
    const [intervalValue, setIntervalValue] = React.useState<null | NodeJS.Timeout>(null);
    const navigate = useNavigate();

    const schema = Yup.object().shape({
        email: Yup.string()
            .required(intl.formatMessage({ id: 'auth.email.required' }))
            .email(intl.formatMessage({ id: 'auth.email.invalid' })),
        password: Yup.string().required(
            intl.formatMessage({ id: 'auth.password.required' }),
        ),
        rememberMe: Yup.bool().optional(),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<{ email: string; password: string, rememberMe: boolean }>({
        resolver: yupResolver(schema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    const onLoginSubmit = (data: { email: string; password: string, rememberMe: boolean }) => {
        setSending(true);
        setError(false);
        authHelper
            .loginRequest(data)
            .then(() => {
                setSending(false);
                navigate('/');
            })
            .catch((err) => {
                // check if err is 401
                setSending(false);
                setError(true);
                setSuspendedSec(-1);
                if (err.response && err.response.status === 401) {
                    const status = err.response.data.status;
                    if (status === 'suspended') {
                        const suspendedTillStr = err.response.data.suspendedTill;
                        const suspendedTillDate = DateTime.fromISO(suspendedTillStr);
                        const now = DateTime.utc();
                        const diff = suspendedTillDate.diff(now, 'seconds').seconds;
                        setSuspendedSec(diff);
                        if (intervalValue !== null) {
                            clearInterval(intervalValue);
                        }
                        const intervalVal = setInterval(() => {
                            setSuspendedSec((prev) => {
                                return prev <= 0 ? -1 : prev - 1;
                            });
                        }, 1000);
                        setIntervalValue(intervalVal);
                    

                    }  else if (status === 'unauthorized') {
                        const retries = err.response.data.retries;
                        if (retries === 2) {
                            setErrorMessage('Invalid email or password. 2 attempts remaining.');
                        } else if (retries === 1) {
                            setErrorMessage('Invalid email or password. 1 attempt remaining.');
                        } else {
                            setErrorMessage('Invalid email or password.');
                        }
                    } else {
                        setErrorMessage('Something went wrong. Try again later!');
                    }

                } else {
                }
            });
    };

    React.useEffect(() => {
        return () => {
            if (intervalValue !== null) {
                clearInterval(intervalValue);
            }
        }
    }, [intervalValue]);


    return (
        <AuthLayout>
            <form
                onSubmit={handleSubmit(onLoginSubmit)}
                className="w-full">
                <Stack className="w-full">
                    <h1 className="font-bold text-3xl">Login</h1>
                    {(sending || loading) && (
                        <Center>
                            <Loader variant="dots" />
                        </Center>
                    )}
                    {!(sending || loading) && error && (
                        <>
                            {suspendedSec === -1 && (
                                <Alert color='danger'><p className='text-lg'>{errorMessage}</p></Alert>
                            )}
                            {suspendedSec === 0 && ''}
                            {suspendedSec > 0 && 
                            <Alert color='danger'>
                                <p className='text-lg'>
                                    {`Account suspended for ${secondsToHourMinutesSeconds(suspendedSec)}`}
                                </p>
                            </Alert>}
                        </>
                    )}
                    <TextInput
                        {...register('email')}
                        error={errors.email ? errors.email.message : ''}
                        size={'md'}
                        icon={<i className="simple-icon-envelope" />}
                        label="Email"
                        placeholder='Enter your email'
                    />
                    <PasswordInput
                        {...register('password')}
                        error={
                            errors.password
                                ? errors.password.message
                                : ''
                        }
                        type="password"
                        size={'md'}
                        icon={<i className="simple-icon-lock" />}
                        label="Password"
                        placeholder="*********"
                    />
                    <Group position="apart">
                        <Group>
                            <Checkbox {...register('rememberMe')} label="Keep me signed in" />
                            <Popover title={<p className='font-bold'>"Keep me signed in" Checkbox</p>} withCloseButton withArrow position='top' opened={showTooltip} onClose={() => {
                                setShowTooltip(false);
                            }} target={
                                <p style={{position: 'relative', top: 1.3}} className='text-blue-500 cursor-pointer' onClick={() => {
                                    setShowTooltip(prev => !prev);
                                }}>Details <i className='simple-icon-arrow-down relative' style={{fontSize: '0.6rem', top: 1}} /></p>
                            }>
                                <div className='w-[300px]'>
                                    <p className='mb-1'>Selecting "keep me signed" in reduces the number of times you're asked to Login on this device. This option will keep you logged in for <span className='font-bold'>14</span> days.</p>
                                    <p>To keep your account secure, use this option only on your personal devices.</p>
                                </div>
                            </Popover>
                        </Group>
                        <p onClick={() => {
                            navigate('/user/forgot-password');
                        }} className="text-blue-500 hover:text-blue-700 cursor-pointer underline">
                            Forgot Password?
                        </p>
                    </Group>
                    <span className="w-full mt-4">
                        <Button
                            size="lg"
                            className="w-full"
                            color="primary">
                            Login
                        </Button>
                    </span>
                    <Group position="center">
                        <p>
                            Don't have an account?
                            <Link
                                className="ml-2 underline text-blue-500"
                                to="/user/register">
                                Sign Up
                            </Link>
                        </p>
                    </Group>
                </Stack>
            </form>
        </AuthLayout>
    );
};

export default Login;
