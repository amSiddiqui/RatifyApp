import {
    Center,
    SimpleGrid,
    Stack,
    Card,
    TextInput,
    Group,
    Checkbox,
    Loader,
    PasswordInput,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'reactstrap';
import { AuthHelper } from '../../helpers/AuthHelper';
import { RootState } from '../../redux';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import AuthMessage from './auth_message';
import { DateTime } from 'luxon';
import { secondsToHourMinutesSeconds } from '../../helpers/Utils';

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
    const isSmall = useMediaQuery('(max-width: 599px)');
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


    return (
        <SimpleGrid
            className="py-10"
            cols={2}
            breakpoints={[{ maxWidth: 600, cols: 1 }]}>
            <Center className="h-full w-full p-3">
                <Card className="shadow-md w-full sm:w-[500px] p-6 md:p-12">
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
                                <p className="text-red-500 text-lg text-center">
                                    {suspendedSec === -1 && errorMessage}
                                    {suspendedSec === 0 && ''}
                                    {suspendedSec > 0 && `Account suspended for ${secondsToHourMinutesSeconds(suspendedSec)}`}
                                </p>
                            )}
                            <TextInput
                                {...register('email')}
                                error={errors.email ? errors.email.message : ''}
                                required
                                size={isSmall ? 'md' : 'lg'}
                                icon={<i className="simple-icon-envelope" />}
                                label="Email"
                                placeholder="Email"
                            />
                            <PasswordInput
                                {...register('password')}
                                error={
                                    errors.password
                                        ? errors.password.message
                                        : ''
                                }
                                required
                                type="password"
                                size={isSmall ? 'md' : 'lg'}
                                icon={<i className="simple-icon-lock" />}
                                label="Password"
                                placeholder="*********"
                            />
                            <Group position="apart">
                                <Checkbox {...register('rememberMe')} label="Remember Me" />
                                <p className="text-blue-500 hover:text-blue-700 cursor-pointer underline">
                                    Forgot Password?
                                </p>
                            </Group>
                            <span className="w-full">
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
                </Card>
            </Center>
            <Center className="px-10 sm:h-[78vh] mt-10 sm:mt-0">
                <AuthMessage />
            </Center>
        </SimpleGrid>
    );
};

export default Login;
