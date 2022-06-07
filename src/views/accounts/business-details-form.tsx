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
import { OrganizationBasicInfo } from '../../types/AuthTypes';
import { Button } from 'reactstrap';

const addressSchema = Yup.object().shape({
    address1: Yup.string().required('Please enter an address'),
    address2: Yup.string().optional(),
    city: Yup.string().required('Please enter a city'),
    state: Yup.string().required('Please enter a state'),
    zipcode: Yup.string().required('Please enter a zip code'),
    country: Yup.string().required('Please enter a country'),
});

const BusinessDetailsForm: React.FC<{
    authHelper: AuthHelper;
    onNextStep: () => void;
}> = ({ authHelper, onNextStep }) => {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(false);

    const schema = Yup.object().shape({
        name: Yup.string().required('Please enter a business name'),
        description: Yup.string().optional(),
        website: Yup.string()
            .url('Please enter a valid website url')
            .optional(),
        companyAddressSame: Yup.boolean(),
        billingAddress: addressSchema,
        companyAddress: Yup.object().when('companyAddressSame', {
            is: false,
            then: addressSchema,
        }),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<OrganizationBasicInfo>({
        resolver: yupResolver(schema),
    });

    const sameAddress = watch('companyAddressSame');

    const onSubmit = (values: OrganizationBasicInfo) => {
        console.log('Submitted values: ', {values});
    };

    React.useEffect(() => {
        setLoading(false);
        setError(false);
    }, []);


    return (
        <>
            <form
                className="mt-4"
                onSubmit={handleSubmit(onSubmit)}>
                {!loading && !error && (
                    <Stack>
                        <SimpleGrid
                            cols={2}
                            breakpoints={[{ maxWidth: 600, cols: 1 }]}>
                            <Stack className="p-4">
                                <TextInput
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

                        <SimpleGrid
                            cols={2}
                            breakpoints={[{ maxWidth: 600, cols: 1 }]}>
                            <Stack className="p-4">
                                <h4 className="font-bold my-2">
                                    Billing Address{' '}
                                    <span className="text-danger">*</span>
                                </h4>
                                <TextInput
                                    {...register('billingAddress.address1')}
                                    error={
                                        errors.billingAddress?.address1
                                            ? errors.billingAddress.address1
                                                  .message
                                            : ''
                                    }
                                    placeholder="Address"
                                    label="Address Line 1"
                                />

                                <TextInput
                                    {...register('billingAddress.address2')}
                                    error={
                                        errors.billingAddress?.address2
                                            ? errors.billingAddress.address2
                                                  .message
                                            : ''
                                    }
                                    placeholder="Address"
                                    label="Address Line 2"
                                />

                                <SimpleGrid cols={2}>
                                    <TextInput
                                        {...register('billingAddress.country')}
                                        error={
                                            errors.billingAddress?.country
                                                ? errors.billingAddress.country
                                                      .message
                                                : ''
                                        }
                                        placeholder="Country"
                                        label="Country"
                                    />

                                    <TextInput
                                        {...register('billingAddress.zipcode')}
                                        error={
                                            errors.billingAddress?.zipcode
                                                ? errors.billingAddress.zipcode
                                                      .message
                                                : ''
                                        }
                                        placeholder="Zip"
                                        label="Zip"
                                    />
                                </SimpleGrid>

                                <SimpleGrid cols={2}>
                                    <TextInput
                                        {...register('billingAddress.city')}
                                        error={
                                            errors.billingAddress?.city
                                                ? errors.billingAddress.city
                                                      .message
                                                : ''
                                        }
                                        placeholder="City"
                                        label="City"
                                    />

                                    <TextInput
                                        {...register('billingAddress.state')}
                                        error={
                                            errors.billingAddress?.state
                                                ? errors.billingAddress.state
                                                      .message
                                                : ''
                                        }
                                        placeholder="State"
                                        label="State"
                                    />
                                </SimpleGrid>
                            </Stack>
                            <Stack className="p-4">
                                <Group position="apart">
                                    <h4 className="font-bold my-2">
                                        Company Address
                                    </h4>
                                    <Checkbox
                                        defaultChecked={sameAddress}
                                        onChange={(event) => {
                                            setValue(
                                                'companyAddressSame',
                                                event.target.checked,
                                            );
                                        }}
                                        label="Same billing address"
                                        size="md"
                                    />
                                </Group>
                                <TextInput
                                    disabled={sameAddress}
                                    {...register('companyAddress.address1')}
                                    error={
                                        errors.companyAddress?.address1
                                            ? errors.companyAddress.address1
                                                  .message
                                            : ''
                                    }
                                    placeholder="Address"
                                    label="Address Line 1"
                                />

                                <TextInput
                                    disabled={sameAddress}
                                    {...register('companyAddress.address2')}
                                    error={
                                        errors.companyAddress?.address2
                                            ? errors.companyAddress.address2
                                                  .message
                                            : ''
                                    }
                                    placeholder="Address"
                                    label="Address Line 2"
                                />

                                <SimpleGrid cols={2}>
                                    <TextInput
                                        disabled={sameAddress}
                                        {...register('companyAddress.country')}
                                        error={
                                            errors.companyAddress?.country
                                                ? errors.companyAddress.country
                                                      .message
                                                : ''
                                        }
                                        placeholder="Country"
                                        label="Country"
                                    />

                                    <TextInput
                                        {...register('companyAddress.zipcode')}
                                        disabled={sameAddress}
                                        error={
                                            errors.companyAddress?.zipcode
                                                ? errors.companyAddress.zipcode
                                                      .message
                                                : ''
                                        }
                                        placeholder="Zip"
                                        label="Zip"
                                    />
                                </SimpleGrid>

                                <SimpleGrid cols={2}>
                                    <TextInput
                                        {...register('companyAddress.city')}
                                        disabled={sameAddress}
                                        error={
                                            errors.companyAddress?.city
                                                ? errors.companyAddress.city
                                                      .message
                                                : ''
                                        }
                                        placeholder="City"
                                        label="City"
                                    />

                                    <TextInput
                                        {...register('companyAddress.state')}
                                        disabled={sameAddress}
                                        error={
                                            errors.companyAddress?.state
                                                ? errors.companyAddress.state
                                                      .message
                                                : ''
                                        }
                                        placeholder="State"
                                        label="State"
                                    />
                                </SimpleGrid>
                            </Stack>
                        </SimpleGrid>
                    </Stack>
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
                {!loading && <Group position="right" className="mt-4">
                    <Button type="submit" color='primary'>
                        Save and continue
                    </Button>
                </Group>}
            </form>
        </>
    );
};

export default BusinessDetailsForm;
