import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AuthHelper } from '../../helpers/AuthHelper';
import { SignUpDataType } from '../../types/AuthTypes'; 
import * as Yup from 'yup';
import { passwordValidation } from '../../helpers/Utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    Center,
    SimpleGrid,
    Stack,
    Card,
    TextInput,
    Group,
    Loader,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { RootState } from '../../redux';
import { Button } from 'reactstrap';
import AuthMessage from './auth_message';
import { AxiosError } from 'axios';

const Register:React.FC = () => {
    const navigate = useNavigate();
    const loading = useSelector((root: RootState) => root.auth.loading);

    const intl = useIntl();
    const dispatchFn = useDispatch();
    const authHelper = React.useMemo(
        () => new AuthHelper(dispatchFn),
        [dispatchFn]
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
                passwordValidation
            ),
        confirm_password: Yup.string()
            .oneOf([Yup.ref('password')], intl.formatMessage({ id: 'auth.password.mismatch' }))
            .required(intl.formatMessage({ id: 'auth.password.confirm' })),
    });

    const { register, handleSubmit, formState: { errors }} = useForm<SignUpDataType>({
        resolver: yupResolver(schema),
        defaultValues: {
            email: '',
            password: '',
            confirm_password: '',
        }
    });

    const onUserRegister = (data: SignUpDataType) => {
        setSending(true);
        setError('');
        authHelper.registerRequest(data).then(() => {
            navigate('/user/verify-email');
            setSending(false);
        }).catch((err: AxiosError) => {
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
            <SimpleGrid className='py-10' cols={2} breakpoints={[
                { maxWidth: 600, cols: 1 },
            ]}>
                <Center className='h-full w-full p-3'>
                    <Card className='shadow-md w-full sm:w-[500px] p-6 md:p-12'>
                        <form onSubmit={handleSubmit(onUserRegister)} className='w-full'>
                            <Stack className='w-full'>
                                <h1 className='font-bold text-3xl'>Register</h1>
                                {(sending || loading) && <Center><Loader variant='dots' /></Center>}
                                {!(sending || loading) && error && <p className='text-red-500 text-lg text-center'>{error}</p>}
                                <TextInput {...register('email')} error={errors.email ? errors.email.message : ''} required size={isSmall ? 'md' : 'lg'} icon={<i className='simple-icon-envelope' />} label='Email' placeholder='Email' />
                                <TextInput {...register('password')} error={errors.password ? errors.password.message : ''} required type='password' size={isSmall ? 'md' : 'lg'} icon={<i className='simple-icon-lock' />} label='Password' placeholder='*********' />
                                <TextInput {...register('confirm_password')} error={errors.confirm_password ? errors.confirm_password.message : ''} required type='password' size={isSmall ? 'md' : 'lg'} icon={<i className='simple-icon-lock' />} label='Confirm Password' placeholder='*********' />
                                <span className='w-full'><Button size='lg' className='w-full' color='primary'>Register</Button></span>
                                <Group position='center'>
                                    <p>Already have an account?<Link className='ml-2 underline text-blue-500' to='/user/login'>Login</Link></p>
                                </Group>
                            </Stack>
                        </form>
                    </Card>
                </Center>
                <Center className='px-10 sm:h-[78vh] mt-10 sm:mt-0'>
                    <AuthMessage />
                </Center>

            </SimpleGrid>
    
    );
}

export default Register;