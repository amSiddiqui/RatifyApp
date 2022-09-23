import { Stack, Center, Loader, TextInput, Grid, PasswordInput } from '@mantine/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button } from 'reactstrap';
import { AuthHelper } from '../../helpers/AuthHelper';
import { AppDispatch } from '../../redux';
import { OrganizationUser, OrganizationUserDataResponse } from '../../types/AuthTypes';
import AuthLayout from './auth-layout';
import * as Yup from 'yup';
import { useIntl } from 'react-intl';
import { passwordValidation } from '../../helpers/Utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const ActivateUser:React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = React.useState('');
    const [user, setUser] = React.useState<OrganizationUser>();
    const [loading, setLoading] = React.useState(true);
    const [sending, setSending] = React.useState(false);
    const [error, setError] = React.useState('');
    const dispatchFn = useDispatch<AppDispatch>();
    const intl = useIntl();
    const authHelper = React.useMemo(() => new AuthHelper(dispatchFn), [dispatchFn]);

    const schema = Yup.object().shape({
        first_name: Yup.string()
            .required(intl.formatMessage({ id: 'auth.first_name.required' })),
        last_name: Yup.string()
            .optional(),
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
        formState: { errors },
    } = useForm<OrganizationUserDataResponse>({
        resolver: yupResolver(schema),
        defaultValues: {
            first_name: '',
            last_name: '',
            password: '',
            confirm_password: '',
        }
    });

    const formSubmitHandler = (data: OrganizationUserDataResponse) => {
        setError('');
        setSending(true);
        if (user && token) {
            authHelper.activateUser(token, data).then(() => {
                authHelper.loginRequest({ email: user.email, password: data.password, rememberMe: true }).then(() => {
                    navigate('/');
                    setSending(false);
                }).catch(err => {
                    setError(err.message);
                    setSending(false);
                });
            }).catch(err => {
                setError(err.message);
                setSending(false);
            });
        }
    }

    React.useEffect(() => {
        let shouldUpdate = true;
        const tokenStr = searchParams.get('token');
        if (!tokenStr) {
            navigate('/');
            return;
        }

        setToken(tokenStr);

        setError('');
        authHelper.validateUserActivationToken(tokenStr).then(user => {
            if (shouldUpdate) {
                setUser(user);
                setLoading(false);
            }
        }).catch(err => {
            if (err.response) {
                if (shouldUpdate) {
                    setError(err.response.data.message || 'error');
                    setLoading(false);
                }
            }
        });

        return () => { shouldUpdate = false; }

    }, [searchParams, navigate, authHelper]);

    
    return <AuthLayout>
        <form
            onSubmit={handleSubmit(formSubmitHandler)}
            className='w-full'
        >
            <Stack className='w-full'>
                <h1 className='font-bold text-3xl'>Setup Account</h1>
                {(loading || sending) && (
                    <Center>
                        <Loader variant='dots' />
                    </Center>
                )}
                {(!loading && error) && (
                    <Alert color='danger'>
                        Something went wrong! Please contact the sender to resend the activation link.
                    </Alert>
                )}
                <TextInput 
                    size="md" 
                    icon={<i className='simple-icon-envelope' />}
                    label='Email'
                    placeholder='Email'
                    value={user?.email}
                    disabled
                />
                <Grid>
                    <Grid.Col md={6}>
                        <TextInput
                            {...register('first_name')}
                            error={errors.first_name ? errors.first_name : ''}
                            size='md'
                            icon={<i className='simple-icon-user' />}
                            label='First Name'
                            placeholder='First Name'
                        />
                    </Grid.Col>
                    <Grid.Col md={6}>
                        <TextInput
                            {...register('last_name')}
                            error={errors.last_name ? errors.last_name : ''}
                            size='md'
                            icon={<i className='simple-icon-user' />}
                            label='Last Name'
                            placeholder='Last Name'
                        />
                    </Grid.Col>
                </Grid>
                <PasswordInput
                    {...register('password')}
                    error={errors.password ? errors.password : ''}
                    size="md"
                    icon={<i className='simple-icon-lock' />}
                    label='Password'
                    placeholder="*********"
                    description={
                        <p className="text-muted text-xs">
                            Password must include at least one number, one
                            uppercase, one lowercase and at least 8 characters
                        </p>
                    }
                />
                <PasswordInput
                    {...register('confirm_password')}
                    error={
                        errors.confirm_password
                            ? errors.confirm_password.message
                            : ''
                    }
                    size="md"
                    icon={<i className="simple-icon-lock" />}
                    label="Confirm Password"
                    placeholder="*********"
                />
                <span className='w-full mt-4'>
                    <Button disabled={error.length > 0} size="lg" className='w-full' color='primary'>
                        Submit
                    </Button>
                </span>
            </Stack>
        </form>
    </AuthLayout>;
}

export default ActivateUser;