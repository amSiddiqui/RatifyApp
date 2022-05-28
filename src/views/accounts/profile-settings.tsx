import React from 'react';
import { Row, Card, CardBody, Button } from 'reactstrap';
import { Colxx, Separator } from '../../components/common/CustomBootstrap';
import Breadcrumb from '../../containers/navs/Breadcrumb';
import { useLocation } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Center, Collapse, Grid, Group, Stack, TextInput } from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux';
import { AuthHelper } from '../../helpers/AuthHelper';
import { MdEdit } from 'react-icons/md';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { passwordValidation } from '../../helpers/Utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { UserSettingsFormType, UserSettingsWithImage, UserType } from '../../types/AuthTypes';
import { authActions } from '../../redux/auth-slice';

const ProfileSettings: React.FC = () => {
    const match = useLocation();
    const intl = useIntl();
    const auth = useSelector((root: RootState) => root.auth);
    const [image, setImage] = React.useState(() => {
        if (auth.user && auth.user.img) {
            return 'data:image/jpeg;base64,' + auth.user.img;
        } else {
            return '';
        }
    });
    const [imgUpdated, setImgUpdated] = React.useState(false);
    const dispatchFn = useDispatch<AppDispatch>();
    const authHelper = React.useMemo(
        () => new AuthHelper(dispatchFn),
        [dispatchFn],
    );

    const schema = Yup.object().shape({
        changePassword: Yup.boolean(),
        firstName: Yup.string().required('Please enter your first name'),
        lastName: Yup.string().optional(),
        email: Yup.string()
            .email(intl.formatMessage({ id: 'auth.email.invalid' }))
            .required(intl.formatMessage({ id: 'auth.email.required' })),
        // oldPassword required when changePassword
        oldPassword: Yup.string().when('changePassword', {
            is: true,
            then: Yup.string()
                .min(8, intl.formatMessage({ id: 'auth.password.min' }))
                .required(intl.formatMessage({ id: 'auth.password.required' }))
                .test(
                    'password-validation',
                    intl.formatMessage({ id: 'auth.password.invalid' }),
                    passwordValidation,
                ),
        }),
        newPassword: Yup.string().when('changePassword', {
            is: true,
            then: Yup.string()
                .min(8, intl.formatMessage({ id: 'auth.password.min' }))
                .required(intl.formatMessage({ id: 'auth.password.required' }))
                .test(
                    'password-validation',
                    intl.formatMessage({ id: 'auth.password.invalid' }),
                    passwordValidation,
                ),
        }),
        confirmPassword: Yup.string().when('changePassword', {
            is: true,
            then: Yup.string()
                .oneOf(
                    [Yup.ref('newPassword')],
                    intl.formatMessage({ id: 'auth.password.mismatch' }),
                )
                .required(intl.formatMessage({ id: 'auth.password.confirm' })),
        }),
    });

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        watch,
        formState: { errors },
    } = useForm<UserSettingsFormType>({
        resolver: yupResolver(schema),
        defaultValues: {
            changePassword: false,
            email: auth.user ? auth.user.email : '',
            firstName: auth.user ? auth.user.first_name : '',
            lastName: auth.user ? auth.user.last_name : '',
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });
    
    const showPassword = watch('changePassword');

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const onImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files && event.currentTarget.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result as string);
                setImgUpdated(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = (data: UserSettingsFormType) => {
        let userData = {...data, imgUpdated: false} as UserSettingsWithImage;
        let newImg = auth.user ? auth.user.img : '';
        if (imgUpdated) {
            let userImage = image;
            if (userImage.startsWith('data')) {
                let parts = image.split(',');
                userImage = parts.slice(1).join('');
            }
            userData.img = userImage;
            userData.imgUpdated = true;
            newImg = userImage;
        }
        console.log('Sending data: ', {userData});
        authHelper.updateUser(userData).then(() => {
            const newUser = {
                ...auth.user,
                first_name: userData.firstName,
                last_name: userData.lastName,
                email: userData.email,
                img: newImg,
            } as UserType;
            console.log('Setting user: ', {newUser});
            dispatchFn(authActions.setUser(newUser));
            toast.success('User updated successfully');
        }).catch(err => {
            if (err.response && err.response.data && err.response.data.status === 'error') {
                toast.error(err.response.data.message);
            } else {
                toast.error('Something went wrong! Try again later!');
            }
            console.log(err);
        });  
    };

    return (
        <>
            <Row>
                <Colxx xxs="12">
                    <Breadcrumb
                        heading="account.settings.profile"
                        match={match}
                    />
                    <Separator className="mb-5" />
                </Colxx>
            </Row>
            <Center>
                <Card>
                    <CardBody>
                        <form
                            onSubmit={handleSubmit(onSubmit)}>
                            <Stack>
                                <div className="profile-picture-container">
                                    <img
                                        src={
                                            image.length === 0
                                                ? '/static/img/default.jpg'
                                                : image
                                        }
                                        className="object-cover w-24 h-24 rounded-full shadow"
                                        alt="Profile"
                                    />
                                    <span
                                        onClick={() => {
                                            if (fileInputRef.current) {
                                                fileInputRef.current.click();
                                            }
                                        }}
                                        className="relative top-10 right-6 p-1 cursor-pointer rounded bg-blue-500 ">
                                        <MdEdit className="text-md text-white" />
                                    </span>
                                    <input
                                        onChange={onImageUpload}
                                        accept="image/*"
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                    />
                                </div>
                                <Grid columns={12}>
                                    <Grid.Col span={6}>
                                        <TextInput
                                            {...register('firstName')}
                                            error={
                                                errors.firstName
                                                    ? errors.firstName.message
                                                    : ''
                                            }
                                            placeholder={intl.formatMessage({
                                                id: 'profile-settings.first-name',
                                            })}
                                            label={intl.formatMessage({
                                                id: 'profile-settings.first-name',
                                            })}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <TextInput
                                            {...register('lastName')}
                                            error={
                                                errors.lastName
                                                    ? errors.lastName.message
                                                    : ''
                                            }
                                            placeholder={intl.formatMessage({
                                                id: 'profile-settings.first-name',
                                            })}
                                            label={intl.formatMessage({
                                                id: 'profile-settings.last-name',
                                            })}
                                        />
                                    </Grid.Col>
                                </Grid>
                                <TextInput
                                    {...register('email')}
                                    error={
                                        errors.email ? errors.email.message : ''
                                    }
                                    placeholder={intl.formatMessage({
                                        id: 'profile-settings.email',
                                    })}
                                    label={intl.formatMessage({
                                        id: 'profile-settings.email',
                                    })}
                                />

                                <p
                                    className="cursor-pointer"
                                    onClick={() => {
                                        let prev = getValues().changePassword;
                                        setValue(
                                            'changePassword',
                                            !prev,
                                        );
                                    }}>
                                    <i
                                        className={
                                            showPassword
                                                ? 'simple-icon-arrow-down'
                                                : 'simple-icon-arrow-right '
                                        }
                                    />
                                    <span className="ml-3">
                                        Change Password
                                    </span>
                                </p>
                                <Collapse in={showPassword}>
                                    <Stack>
                                        <TextInput
                                            {...register('oldPassword')}
                                            error={
                                                errors.oldPassword
                                                    ? errors.oldPassword.message
                                                    : ''
                                            }
                                            type="password"
                                            label="Old Password"
                                            placeholder="Old Password"
                                        />
                                        <TextInput
                                            {...register('newPassword')}
                                            error={
                                                errors.newPassword
                                                    ? errors.newPassword.message
                                                    : ''
                                            }
                                            type="password"
                                            label="New Password"
                                            placeholder="New Password"
                                        />
                                        <TextInput
                                            {...register('confirmPassword')}
                                            error={
                                                errors.confirmPassword
                                                    ? errors.confirmPassword.message
                                                    : ''
                                            }
                                            type="password"
                                            label="Confirm Password"
                                            placeholder="Confirm Password"
                                        />
                                    </Stack>
                                </Collapse>

                                <Group position="right">
                                    <span>
                                        <Button color="primary">
                                            {intl.formatMessage({
                                                id: 'profile-settings.save',
                                            })}
                                        </Button>
                                    </span>
                                </Group>
                            </Stack>
                        </form>
                    </CardBody>
                </Card>
            </Center>
        </>
    );
};

export default ProfileSettings;
