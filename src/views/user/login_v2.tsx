import {
    Center,
    SimpleGrid,
    Stack,
    Card,
    TextInput,
    Group,
    Checkbox,
    Loader,
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

const Login: React.FC = () => {
    const loading = useSelector((root: RootState) => root.auth.loading);
    const dispatchFn = useDispatch();
    const intl = useIntl();
    const authHelper = React.useMemo(
        () => new AuthHelper(dispatchFn),
        [dispatchFn],
    );
    const [error, setError] = React.useState(false);
    const [sending, setSending] = React.useState(false);
    const isSmall = useMediaQuery('(max-width: 599px)');
    const navigate = useNavigate();

    const schema = Yup.object().shape({
        email: Yup.string()
            .required(intl.formatMessage({ id: 'auth.email.required' }))
            .email(intl.formatMessage({ id: 'auth.email.invalid' })),
        password: Yup.string().required(
            intl.formatMessage({ id: 'auth.password.required' }),
        ),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<{ email: string; password: string }>({
        resolver: yupResolver(schema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onLoginSubmit = (data: { email: string; password: string }) => {
        setSending(true);
        setError(false);
        authHelper
            .loginRequest(data)
            .then(() => {
                setSending(false);
                navigate('/');
            })
            .catch(() => {
                setSending(false);
                setError(true);
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
                                    {intl.formatMessage({
                                        id: 'auth.login.error',
                                    })}
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
                            <TextInput
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
                                <Checkbox label="Remember Me" />
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
