import React from 'react';
import { Row, Card, CardBody, Button, Alert } from 'reactstrap';
import { Colxx, Separator } from '../../components/common/CustomBootstrap';
import Breadcrumb from '../../containers/navs/Breadcrumb';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
    Center,
    Collapse,
    Grid,
    Group,
    Menu,
    PasswordInput,
    Stack,
    TextInput,
} from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux';
import { AuthHelper } from '../../helpers/AuthHelper';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { passwordValidation } from '../../helpers/Utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    OrganizationNameResponse,
    UserSettingsFormType,
    UserSettingsWithImage,
    UserType,
} from '../../types/AuthTypes';
import { authActions } from '../../redux/auth-slice';
import { DateTime } from 'luxon';
import UneditableInput from '../../components/common/UneditableInput';

const WAIT_BEFORE_RESENT_EMAIL_IN_SECONDS = 60 * 10;

const getDateDiff = (date: DateTime | null) => {
    if (!date) {
        return 0;
    }
    const now = DateTime.local();
    // get diff in seconds
    const diff = now.diff(date).as('seconds');
    return diff;
};

const ProfileSettings: React.FC = () => {
    const match = useLocation();
    const intl = useIntl();
    const auth = useSelector((root: RootState) => root.auth);
    console.log('auth', auth);
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

    const [lastVerificationSent, setLastVerificationSent] =
        React.useState<DateTime | null>(null);
    const [verificationSent, setVerificationSent] = React.useState(false);
    const [userVerified, setUserVerified] = React.useState(
        auth.user ? auth.user.verified : false,
    );
    
    const navigate = useNavigate();

    const [organization, setOrganization] = React.useState<OrganizationNameResponse>();
    const [editMode, setEditMode] = React.useState(false);

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
            job_title: auth.user ? auth.user.job_title : '',
            user_id_reference: auth.user ? auth.user.user_id_reference : '',
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
        let userData = { ...data, imgUpdated: false } as UserSettingsWithImage;
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
        authHelper
            .updateUser(userData)
            .then(() => {
                const newUser = {
                    ...auth.user,
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    email: userData.email,
                    img: newImg,
                } as UserType;
                console.log('Setting user: ', { newUser });
                dispatchFn(authActions.setUser(newUser));
                toast.success('User updated successfully');
                setEditMode(false);
            })
            .catch((err) => {
                if (
                    err.response &&
                    err.response.data &&
                    err.response.data.status === 'error'
                ) {
                    toast.error(err.response.data.message);
                } else {
                    toast.error('Something went wrong! Try again later!');
                }
                console.log(err);
            });
    };

    React.useEffect(() => {
        let shouldUpdate = true;
        authHelper
            .getUserVerified()
            .then((data) => {
                if (shouldUpdate) {
                    setUserVerified(data.verified);
                    setLastVerificationSent(
                        DateTime.fromISO(data.last_verification_sent).toLocal(),
                    );
                }
            })
            .catch((err) => {
                if (shouldUpdate) {
                    toast.error('Cannot user at the moment. Try again later!');
                    console.log(err);
                }
            });

        authHelper
            .getOrganizationName().then(resp => {
                if (shouldUpdate) {
                    setOrganization(resp);
                }
            }).catch(err => {
                console.log(err);
            });
        
            return () => { shouldUpdate = false; }
    }, [authHelper]);

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
                <Stack>
                    <Center>
                        <Stack>
                            {auth.user && !userVerified && (
                                <>
                                    {!verificationSent && (
                                        <Alert
                                            color="danger"
                                            style={{ width: 450 }}>
                                            <Stack>
                                                <p>
                                                    Please verify your account using
                                                    the link provided in the email.
                                                    If you have not received the
                                                    email, request for a new email
                                                </p>
                                                {getDateDiff(lastVerificationSent) >
                                                WAIT_BEFORE_RESENT_EMAIL_IN_SECONDS ? (
                                                    <span
                                                        onClick={() => {
                                                            authHelper
                                                                .sendVerificationLink()
                                                                .then(() => {
                                                                    setVerificationSent(true);
                                                                })
                                                                .catch((err) => {
                                                                    toast.error(
                                                                        'Cannot send a verification email. Try again later!',
                                                                    );
                                                                });
                                                        }}>
                                                        <Button
                                                            color="primary"
                                                            size="xs">
                                                            Resend Verification
                                                        </Button>
                                                    </span>
                                                ) : (
                                                    <p className="text-muted">
                                                        Wait 10 minutes before
                                                        creating a new link.
                                                    </p>
                                                )}
                                            </Stack>
                                        </Alert>
                                    )}
                                    {verificationSent && (
                                        <Alert
                                            color="success"
                                            style={{ width: 450 }}>
                                            <p>
                                                Verification email sent. Please
                                                check your email.
                                            </p>
                                        </Alert>
                                    )}
                                </>
                            )}
                            {organization && organization.stepsCompleted < 3 && (
                                <Alert color='warning' style={{ width: 450 }}>
                                    <Stack>
                                        <p>Business profile incomplete. Please click the button below to complete your business profile.</p>
                                        <span onClick={() => {
                                            navigate('/business-profile');
                                        }}><Button size='xs' color='primary'>Business Profile</Button></span>
                                    </Stack>
                                </Alert>
                            )}
                        </Stack>
                    </Center>
                    <Card>
                        <CardBody>
                            <form style={{maxWidth: 475}} onSubmit={handleSubmit(onSubmit)}>
                                <Stack>
                                    <div className="profile-picture-container ml-2">
                                        <img
                                            src={
                                                image.length === 0 ? '/static/img/default.jpg' : image
                                            }
                                            className="object-cover w-24 h-24 rounded-full shadow"
                                            alt="Profile"
                                        />
                                        {editMode && <span>
                                            <Menu className="relative top-10 right-4">
                                                <Menu.Item
                                                    className="hover:bg-gray-100"
                                                    onClick={() => {
                                                        if (fileInputRef.current) {
                                                            fileInputRef.current.click();
                                                        }
                                                    }}>
                                                    Upload
                                                </Menu.Item>
                                                <Menu.Item
                                                    onClick={() => {
                                                        authHelper
                                                            .deleteProfileImage()
                                                            .then(() => {
                                                                if (auth.user) {
                                                                    setImage('');
                                                                    setImgUpdated(false);
                                                                    dispatchFn(authActions.setUser({...auth.user, img: '',}));
                                                                }
                                                            })
                                                            .catch((err) => {
                                                                toast.error('Cannot delete profile image. Try again later!');
                                                                console.log(err);
                                                            });
                                                    }}
                                                    className="hover:bg-gray-100"
                                                    color="red">
                                                    Remove
                                                </Menu.Item>
                                            </Menu>
                                        </span>}

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
                                            {editMode && <TextInput
                                                required={true}
                                                {...register('firstName')}
                                                error={errors.firstName ? errors.firstName.message : ''}
                                                icon={<i className='simple-icon-user' />}
                                                placeholder={intl.formatMessage(
                                                    {
                                                        id: 'profile-settings.first-name',
                                                    },
                                                )}
                                                label={intl.formatMessage({
                                                    id: 'profile-settings.first-name',
                                                })}
                                            />}
                                            {!editMode && <Stack style={{ minWidth: 200 }} spacing={'sm'}>
                                                <p className='font-bold'>First Name</p>    
                                                <Group className='border-b-2 border-gray-200 pb-1 mr-3'><i className='simple-icon-user relative' style={{ top: -2 }} /><p>{auth.user?.first_name}</p></Group>
                                            </Stack>}
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            {editMode && <TextInput
                                                {...register('lastName')}
                                                error={
                                                    errors.lastName
                                                        ? errors.lastName
                                                              .message
                                                        : ''
                                                }
                                                icon={<i className='simple-icon-user' />}
                                                placeholder={intl.formatMessage(
                                                    {
                                                        id: 'profile-settings.last-name',
                                                    },
                                                )}
                                                label={intl.formatMessage({
                                                    id: 'profile-settings.last-name',
                                                })}
                                            />}
                                            {!editMode && <Stack style={{ minWidth: 200 }} spacing={'sm'}>
                                                <p className='font-bold'>Surname</p>    
                                                <Group className='border-b-2 border-gray-200 pb-1 mr-3'><i className='simple-icon-user relative' style={{ top: -2 }} /><p>{auth.user?.last_name}</p></Group>
                                            </Stack>}
                                        </Grid.Col>
                                    </Grid>
                                    {editMode && <UneditableInput
                                        icon={<i className='simple-icon-envelope' />}
                                        value={auth.user ? auth.user.email : ''}
                                        label={intl.formatMessage({
                                            id: 'profile-settings.email',
                                        })}
                                    />}
                                    {!editMode && <Stack style={{ minWidth: 220, width: '100%' }} spacing={'sm'}>
                                        <p className='font-bold'>Email</p>    
                                        <Group className='border-b-2 border-gray-200 pb-1 mr-3'><i className='simple-icon-envelope relative' style={{ top: -2 }} /><p>{auth.user?.email}</p></Group>
                                    </Stack>}
                                    
                                    {editMode && <TextInput
                                        {...register('job_title')}
                                        error={
                                            errors.job_title
                                                ? errors.job_title
                                                        .message
                                                : ''
                                        }
                                        icon={<i className='simple-icon-briefcase' />}
                                        placeholder={'Job Title'}
                                        label={'Job Title'}
                                    />}
                                    {!editMode && <Stack style={{ minWidth: 220, width: '100%' }} spacing={'sm'}>
                                        <p className='font-bold'>Job Title</p>    
                                        <Group className='border-b-2 border-gray-200 pb-1 mr-3'><i className='simple-icon-briefcase relative' style={{ top: -2 }} />
                                            <p>{auth.user?.job_title}</p>
                                        </Group>
                                    </Stack>}

                                    {editMode && <TextInput
                                        {...register('user_id_reference')}
                                        error={
                                            errors.user_id_reference
                                                ? errors.user_id_reference
                                                        .message
                                                : ''
                                        }
                                        icon={<i className='simple-icon-tag' />}
                                        placeholder={'User Id Reference'}
                                        label={'User Id Reference'}
                                    />}
                                    {!editMode && <Stack style={{ minWidth: 220, width: '100%' }} spacing={'sm'}>
                                        <p className='font-bold'>User Id Reference</p>    
                                        <Group className='border-b-2 border-gray-200 pb-1 mr-3'><i className='simple-icon-tag relative' style={{ top: -2 }} />
                                            <p>{auth.user?.user_id_reference}</p>
                                        </Group>
                                    </Stack>}

                                    {editMode && <p
                                        className="cursor-pointer"
                                        onClick={() => {
                                            let prev =
                                                getValues().changePassword;
                                            setValue('changePassword', !prev);
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
                                    </p>}
                                    {editMode && <Collapse in={showPassword}>
                                        <Stack>
                                            <PasswordInput
                                                {...register('oldPassword')}
                                                error={
                                                    errors.oldPassword
                                                        ? errors.oldPassword
                                                              .message
                                                        : ''
                                                }
                                                type="password"
                                                icon={<i className='simple-icon-lock' />}
                                                label="Old Password"
                                                placeholder="Old Password"
                                            />
                                            <PasswordInput
                                                {...register('newPassword')}
                                                error={errors.newPassword ? errors.newPassword.message : ''}
                                                size='md'
                                                icon={<i className="simple-icon-lock" />}
                                                label='Password'
                                                placeholder='*********'
                                            />
                                            <PasswordInput
                                                {...register('confirmPassword')}
                                                error={errors.confirmPassword ? errors.confirmPassword.message : ''}
                                                size='md'
                                                icon={<i className="simple-icon-lock" />}
                                                label='Confirm Password'
                                                placeholder='*********'
                                            />
                                        </Stack>
                                    </Collapse>}

                                    {editMode && <Group position="right">
                                        <span onClick={() => {
                                            setEditMode(false);
                                            setValue('changePassword', false);
                                        }}>
                                            <Button color='light'>
                                                Cancel
                                            </Button>
                                        </span>
                                        <span>
                                            <Button color="success">
                                                {intl.formatMessage({
                                                    id: 'profile-settings.save',
                                                })}
                                            </Button>
                                        </span>
                                    </Group>}

                                    {!editMode && <Group className='mt-2' position='right'>
                                        <span onClick={() => {
                                            setEditMode(true);
                                            setValue('changePassword', true);
                                        }}>
                                            <Button type='button' color='light'>Change Password</Button>
                                        </span>
                                        <span onClick={() => {
                                            setEditMode(true);
                                        }}>
                                            <Button type='button' color='primary'>Edit</Button>
                                        </span>
                                    </Group>}
                                </Stack>
                            </form>
                        </CardBody>
                    </Card>
                </Stack>
            </Center>
        </>
    );
};

export default ProfileSettings;
