import { yupResolver } from '@hookform/resolvers/yup';
import {
    Center,
    Checkbox,
    Group,
    Loader,
    SimpleGrid,
    Stack,
    Textarea,
    TextInput,
} from '@mantine/core';
import React from 'react';
import { useForm } from 'react-hook-form';
import { AuthHelper } from '../../helpers/AuthHelper';
import * as Yup from 'yup';
import { Organization } from '../../types/AuthTypes';
import { toast } from 'react-toastify';

const BusinessDetailsForm: React.FC<{ authHelper: AuthHelper }> = ({
    authHelper,
}) => {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(false);

    const schema = Yup.object().shape({
        name: Yup.string().required('Please enter a business name'),
        description: Yup.string().optional(),
        address: Yup.string().optional(),
        city: Yup.string().optional(),
        state: Yup.string().optional(),
        zipcode: Yup.string().optional(),
        country: Yup.string().optional(),
        phone: Yup.string().optional(),
        email: Yup.string()
            .email('Please enter a valid email address')
            .optional(),
        website: Yup.string()
            .url('Please enter a valid website url')
            .optional(),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<Organization>({
        resolver: yupResolver(schema),
    });

    const onSubmit = (values: Organization) => {
        authHelper
            .updateOrganization(values)
            .then(() => {
                toast.success('Business profile updated successfully');
            })
            .catch((err) => {
                toast.error('Error updating business profile. Try again later');
            });
    };

    React.useEffect(() => {
        authHelper
            .getUserOrganization()
            .then((data) => {
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
            })
            .catch((err) => {
                setLoading(false);
                setError(true);
                console.log(err);
            });
    }, [authHelper, setValue]);

    return (
        <>
            {!loading && !error && (
                <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
                    <Stack>
                        <SimpleGrid cols={2} breakpoints={[
                            {maxWidth: 600, cols: 1},
                        ]}>
                            <Stack className="p-4">
                                <TextInput
                                    required={true}
                                    placeholder="Business Name"
                                    label="Business Name"
                                    {...register('name')}
                                    error={
                                        errors.name ? errors.name.message : ''
                                    }
                                />
                                <TextInput
                                    {...register('website')}
                                    error={
                                        errors.website
                                            ? errors.website.message
                                            : ''
                                    }
                                    placeholder="Website"
                                    label="Website"
                                />
                            </Stack>
                            <Stack className="p-4">
                                <Textarea
                                    {...register('description')}
                                    error={
                                        errors.description
                                            ? errors.description.message
                                            : ''
                                    }
                                    placeholder="Describe your business..."
                                    label="Description"
                                />
                            </Stack>
                        </SimpleGrid>

                        <SimpleGrid cols={2} breakpoints={[
                            {maxWidth: 600, cols: 1},
                        ]}>
                            <Stack className='p-4'>
                                <h4 className="font-bold my-2">
                                    Billing Address
                                </h4>
                                <TextInput
                                    {...register('address')}
                                    error={
                                        errors.address
                                            ? errors.address.message
                                            : ''
                                    }
                                    placeholder="Address"
                                    label="Address Line 1"
                                />

                                <TextInput
                                    {...register('address')}
                                    error={
                                        errors.address
                                            ? errors.address.message
                                            : ''
                                    }
                                    placeholder="Address"
                                    label="Address Line 2"
                                />
                                <SimpleGrid cols={2}>
                                    <TextInput
                                        {...register('city')}
                                        error={
                                            errors.city
                                                ? errors.city.message
                                                : ''
                                        }
                                        placeholder="City"
                                        label="City"
                                    />

                                    <TextInput
                                        {...register('state')}
                                        error={
                                            errors.state
                                                ? errors.state.message
                                                : ''
                                        }
                                        placeholder="State"
                                        label="State"
                                    />
                                </SimpleGrid>

                                <SimpleGrid cols={2}>
                                    <TextInput
                                        {...register('country')}
                                        error={
                                            errors.country
                                                ? errors.country.message
                                                : ''
                                        }
                                        placeholder="Country"
                                        label="Country"
                                    />

                                    <TextInput
                                        {...register('zipcode')}
                                        error={
                                            errors.zipcode
                                                ? errors.zipcode.message
                                                : ''
                                        }
                                        placeholder="Zip"
                                        label="Zip"
                                    />
                                </SimpleGrid>
                            </Stack>
                            <Stack className='p-4'>
                                <Group position='apart'>
                                    <h4 className="font-bold my-2">
                                        Company Address
                                    </h4>
                                    <Checkbox label='Same billing address' size='md' />
                                </Group>
                                <TextInput
                                    {...register('address')}
                                    error={
                                        errors.address
                                            ? errors.address.message
                                            : ''
                                    }
                                    placeholder="Address"
                                    label="Address Line 1"
                                />

                                <TextInput
                                    {...register('address')}
                                    error={
                                        errors.address
                                            ? errors.address.message
                                            : ''
                                    }
                                    placeholder="Address"
                                    label="Address Line 2"
                                />
                                <SimpleGrid cols={2}>
                                    <TextInput
                                        {...register('city')}
                                        error={
                                            errors.city
                                                ? errors.city.message
                                                : ''
                                        }
                                        placeholder="City"
                                        label="City"
                                    />

                                    <TextInput
                                        {...register('state')}
                                        error={
                                            errors.state
                                                ? errors.state.message
                                                : ''
                                        }
                                        placeholder="State"
                                        label="State"
                                    />
                                </SimpleGrid>

                                <SimpleGrid cols={2}>
                                    <TextInput
                                        {...register('country')}
                                        error={
                                            errors.country
                                                ? errors.country.message
                                                : ''
                                        }
                                        placeholder="Country"
                                        label="Country"
                                    />

                                    <TextInput
                                        {...register('zipcode')}
                                        error={
                                            errors.zipcode
                                                ? errors.zipcode.message
                                                : ''
                                        }
                                        placeholder="Zip"
                                        label="Zip"
                                    />
                                </SimpleGrid>
                            </Stack>
                        </SimpleGrid>
                    </Stack>
                </form>
            )}
            {loading && (
                <Center style={{ height: 200 }}>
                    <Loader />
                </Center>
            )}
            {!loading && error && (
                <Center style={{ height: 200 }}>
                    <h4 className="text-muted text-center text-lg">
                        Cannot load the business form the moment. Try again
                        later!
                    </h4>
                </Center>
            )}
        </>
    );
};

export default BusinessDetailsForm;
