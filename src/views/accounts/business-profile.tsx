import { Center, Grid, Group, Loader, Menu, Stack, Textarea, TextInput } from '@mantine/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Row, Card, CardBody, Button } from 'reactstrap';
import { Colxx, Separator } from '../../components/common/CustomBootstrap';
import Breadcrumb from '../../containers/navs/Breadcrumb';
import { AuthHelper } from '../../helpers/AuthHelper';
import { AppDispatch } from '../../redux';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { Organization } from '../../types/AuthTypes';
import { yupResolver } from '@hookform/resolvers/yup';

const BusinessProfile:React.FC = () => {
    const match = useLocation();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [image, setImage] = React.useState<string>('');
    const [lockButton, setLockButton] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(false);
    const navigate = useNavigate();
    const dispatchFn = useDispatch<AppDispatch>();
    const authHelper = React.useMemo(
        () => new AuthHelper(dispatchFn),
        [dispatchFn],
    );

    const schema = Yup.object().shape({
        name: Yup.string().required('Please enter a business name'),
        description: Yup.string().optional(),
        address: Yup.string().optional(),
        city: Yup.string().optional(),
        state: Yup.string().optional(),
        zipcode: Yup.string().optional(),
        country: Yup.string().optional(),
        phone: Yup.string().optional(),
        email: Yup.string().email('Please enter a valid email address').optional(),
        website: Yup.string().url('Please enter a valid website url').optional(),
    });
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<Organization>({
        resolver: yupResolver(schema),
    });


    const onImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files && event.currentTarget.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result as string);
                authHelper.updateOrganizationLogo(reader.result as string).then(() => {
                    toast.success('Logo uploaded successfully');
                }).catch(err => {
                    toast.error('Cannot upload logo. Try again later!');
                });
            };
            reader.readAsDataURL(file);
        }
    }

    const onSubmit = (values: Organization) => {
        authHelper.updateOrganization(values).then(() => {
            toast.success('Business profile updated successfully');
        }).catch(err => {
            toast.error('Error updating business profile. Try again later');
        })
    }

    React.useEffect(() => {
        authHelper.getUserOrganization().then(data => {
            setLoading(false);
            if (data.name !== 'Default') {
                setValue('name', data.name);
            }
            setValue('description', data.description);
            setValue('address', data.address);
            setValue('city', data.city);
            setValue('state', data.state);
            setValue('zipcode', data.zipcode);
            setValue('country', data.country);
            setValue('phone', data.phone);
            setValue('email', data.email);
            setValue('website', data.website);
        }).catch(err => {
            setLoading(false);
            setError(true);
            console.log(err);
        });
    }, [authHelper, setValue]);

    React.useEffect(() => {
        authHelper.getOrganizationLogo().then(data => {
            setImage(data);
        }).catch(err => {
            console.log(err);
        });
    }, [authHelper]);

    return (<>
        <Row>
            <Colxx xxs="12">
                <Breadcrumb
                    heading="account.business-profile"
                    match={match}
                />
                <Separator className="mb-5" />
            </Colxx>
        </Row>
        <Center>
            <Card>
                <CardBody>
                    {loading && <Center style={{width: 450, height: 300}}>
                        <Loader />
                    </Center>}
                    {!loading && error && <Stack>
                        <p className='text-xl text-gray-600'>Cannot edit organization data right now. Try again later</p>
                        <Group position='right'>
                            <span onClick={() => {navigate(`/`)}}><Button color='primary'>Back</Button></span>
                        </Group>
                    </Stack>
                    }
                    {!loading && !error && <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack>
                            <div className="profile-picture-container">
                                <img
                                    src={
                                        image.length === 0
                                            ? '/static/img/logo-placeholder.jpg'
                                            : image
                                    }
                                    className="object-cover w-24 h-24 shadow"
                                    alt="Logo"
                                />
                                <span>
                                    <Menu className='relative top-11 right-4'>
                                        <Menu.Item className='hover:bg-gray-100' onClick={() => {
                                            if (!lockButton) {
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.click();
                                                }
                                                setLockButton(true);
                                                setTimeout(() => {
                                                    setLockButton(false);
                                                }, 1000);
                                            }
                                        }}>
                                            Upload
                                        </Menu.Item>
                                        <Menu.Item onClick={() => {
                                            if (!lockButton) {
                                                setLockButton(true);
                                                authHelper.deleteOrganizationLogo().then(() => {
                                                    setImage('');
                                                }).catch(err => {
                                                    toast.error('Error deleting logo. Try again later');
                                                });
                                                
                                                setTimeout(() => {
                                                    setLockButton(true);
                                                }, 1000);
                                            }
                                        }}
                                        className='hover:bg-gray-100' color='red'>
                                            Remove
                                        </Menu.Item>
                                    </Menu>
                                </span>
                                <input
                                    onChange={onImageUpload}
                                    accept="image/*"
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                />
                            </div>
                            <TextInput
                                required={true}
                                placeholder='Business Name'
                                label='Business Name'
                                {...register('name')}
                                error={errors.name ? errors.name.message : ''}
                            />
                            <Textarea {...register('description')} error={errors.description ? errors.description.message : ''} placeholder='Describe your business...' label='Description' />

                            <TextInput {...register('email')} error={errors.email ? errors.email.message : ''} placeholder='Business Email' label='Business Email' />
                            <TextInput {...register('phone')} error={errors.phone ? errors.phone.message : ''} placeholder='Contact' label='Contact' />
                            <TextInput {...register('website')} error={errors.website ? errors.website.message : ''} placeholder='Website' label='Website' />
                            <TextInput {...register('address')} error={errors.address ? errors.address.message : ''} placeholder='Address' label='Address' />
                            <Grid columns={12}>
                                <Grid.Col span={6}>
                                    <TextInput {...register('city')} error={errors.city ? errors.city.message : ''} placeholder='City' label='City' />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput {...register('state')} error={errors.state ? errors.state.message : ''} placeholder='State' label='State' />
                                </Grid.Col>
                            </Grid>
                            <Grid columns={12}>
                                <Grid.Col span={6}>
                                    <TextInput {...register('country')} error={errors.country ? errors.country.message : ''} placeholder='Country' label='Country' />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput {...register('zipcode')} error={errors.zipcode ? errors.zipcode.message : ''} placeholder='Zip' label='Zip' />
                                </Grid.Col>
                            </Grid>
                                
                            <Group position='right'>
                                <span><Button color='primary'>Save</Button></span>
                            </Group>
                        </Stack>
                    </form>}
                </CardBody>
            </Card>
        </Center>
    </>)
}

export default BusinessProfile;