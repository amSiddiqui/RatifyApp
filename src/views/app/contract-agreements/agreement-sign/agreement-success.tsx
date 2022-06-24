import React from 'react';
import {
    Card,
    Center,
    Group,
    Loader,
    SimpleGrid,
    Stack,
    TextInput,
    Image
} from '@mantine/core';
import { Button } from 'reactstrap';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AuthHelper } from '../../../../helpers/AuthHelper';
import { SignUpDataType } from '../../../../types/AuthTypes';
import * as Yup from 'yup';
import { passwordValidation } from '../../../../helpers/Utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { useMediaQuery } from '@mantine/hooks';
import { AxiosError } from 'axios';
import PasswordStrength from '../../../user/password-strength';
import PasswordConfirm from '../../../user/password-confirm';

const AgreementSuccess: React.FC = () => {
    const intl = useIntl();
    const navigate = useNavigate();
    const dispatchFn = useDispatch();
    const authHelper = React.useMemo(
        () => new AuthHelper(dispatchFn),
        [dispatchFn],
    );
    const [error, setError] = React.useState('');
    const [sending, setSending] = React.useState(false);
    const isSmall = useMediaQuery('(max-width: 599px)');

    const schema = Yup.object().shape({
        email: Yup.string()
            .email(intl.formatMessage({ id: 'auth.email.invalid' }))
            .required(intl.formatMessage({ id: 'auth.email.required' })),
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
    } = useForm<SignUpDataType>({
        resolver: yupResolver(schema),
        defaultValues: {
            email: '',
            password: '',
            confirm_password: '',
        },
    });

    const password = watch('password');

    const onUserRegister = (data: SignUpDataType) => {
        setSending(true);
        setError('');
        authHelper
            .registerRequest(data)
            .then(() => {
                navigate('/user/verify-email');
                setSending(false);
            })
            .catch((err: AxiosError) => {
                if (err.response) {
                    if (err.response.status === 400) {
                        setError(err.response.data.message);
                    } else {
                        setError(intl.formatMessage({ id: 'server-error' }));
                    }
                }
                setSending(false);
            });
    };

    return (
        <div style={{ backgroundColor: '#F8F8F8' }}>
            <SimpleGrid className='h-screen' cols={2} breakpoints={[{ maxWidth: 600, cols: 1 }]}>
                <Center className="px-10 mb-36 h-100 mt-10 sm:mt-0">
                    <Stack>
                        <Center>
                            <Image className='mb-4 w-[120px] sm:w-[150px] relative' style={{ right: 15 }} src='/static/logos/black.svg' alt='Ratify' />
                        </Center>
                        <h4 className="text-2xl text-center font-bold">
                            You've filled and signed the document
                        </h4>
                        <p className="text-center text-muted">
                            The sender will be notified and will receive the
                            signed document
                        </p>
                        <Group position="center">
                            <span>
                                <Button color="light">
                                    Get My Document Copy
                                </Button>
                            </span>
                            <span>
                                <Button color="primary">Try Ratify</Button>
                            </span>
                        </Group>
                    </Stack>
                </Center>
                <Center className="w-full h-full p-3">
                    <Card className="shadow-md w-full sm:w-[500px] p-6 md:p-12">
                        <form
                            onSubmit={handleSubmit(onUserRegister)}
                            className="w-full">
                            <Stack className="w-full">
                                <h1 className="font-bold text-2xl">Try ratify for free</h1>
                                {sending && (
                                    <Center>
                                        <Loader variant="dots" />
                                    </Center>
                                )}
                                {!sending && error && (
                                    <p className="text-red-500 text-lg text-center">
                                        {error}
                                    </p>
                                )}
                                <TextInput
                                    {...register('email')}
                                    error={errors.email ? errors.email.message : ''}
                                    required
                                    size='sm'
                                    icon={<i className="simple-icon-envelope" />}
                                    label="Email"
                                    placeholder="Email"
                                />
                                <PasswordStrength
                                    error={
                                        errors.password
                                            ? errors.password.message
                                            : ''
                                    }
                                    name={register('password').name}
                                    label="Password"
                                    placeholder="********"
                                    size='md'
                                    onChange={register('password').onChange}
                                    onBlur={register('password').onBlur}
                                    ref={register('password').ref}
                                />
                                <PasswordConfirm
                                    error={
                                        errors.confirm_password
                                            ? errors.confirm_password.message
                                            : ''
                                    }
                                    name={register('confirm_password').name}
                                    label="Confirm Password"
                                    placeholder="********"
                                    size='md'
                                    onChange={register('confirm_password').onChange}
                                    onBlur={register('confirm_password').onBlur}
                                    ref={register('confirm_password').ref}
                                    password={password}
                                />
                                <span className="w-full">
                                    <Button
                                        size="lg"
                                        className="w-full"
                                        color="primary">
                                        Register
                                    </Button>
                                </span>
                                <Group position="center">
                                    <p>
                                        Already have an account?
                                        <Link
                                            className="ml-2 underline text-blue-500"
                                            to="/user/login">
                                            Login
                                        </Link>
                                    </p>
                                </Group>
                            </Stack>
                        </form>
                    </Card>
                </Center>
            </SimpleGrid>
        </div>
    );
};

export default AgreementSuccess;
