import { yupResolver } from '@hookform/resolvers/yup';
import {
    Checkbox,
    Group,
    SimpleGrid,
    Stack,
    Textarea,
    TextInput,
} from '@mantine/core';
import React from 'react';
import { useForm } from 'react-hook-form';
import { AuthHelper } from '../../helpers/AuthHelper';
import * as Yup from 'yup';
import { LegalEntity, Organization, OrganizationBasicInfo } from '../../types/AuthTypes';
import { Button } from 'reactstrap';
import { toast } from 'react-toastify';

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
    organization: Organization;
    onDefaultLegalEntity: (legalEntity: LegalEntity) => void;
}> = ({ authHelper, onNextStep, organization, onDefaultLegalEntity }) => {

    const schema = Yup.object().shape({
        name: Yup.string().required('Please enter a business name'),
        description: Yup.string().optional(),
        website: Yup.string()
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
        defaultValues: {
            name: organization.name,
            description: organization.description,
            website: organization.website,
            companyAddressSame: organization.companyAddressSame,
            billingAddress:
                organization.billingAddress === null
                    ? undefined
                    : organization.billingAddress,
            companyAddress:
                organization.companyAddress === null
                    ? undefined
                    : organization.companyAddress,
        },
    });

    const sameAddress = watch('companyAddressSame');

    const onSubmit = (values: OrganizationBasicInfo) => {
        authHelper.updateOrganizationBasicInfo(values).then(() => {
            onNextStep();
            toast.success('Business details saved successfully');
            // generate random id
            const id = Math.floor(Math.random() * 1000000);
            const legalEntity: LegalEntity = {
                id,
                name: values.name,
                description: values.description,
            }
            onDefaultLegalEntity(legalEntity);
        }).catch(err => {
            console.log(err);
            toast.error('Something went wrong, try again later');
        });
    };

    return (
        <>
            <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
                <Stack>
                    <SimpleGrid
                        cols={2}
                        breakpoints={[{ maxWidth: 600, cols: 1 }]}>
                        <Stack className="p-4">
                            <TextInput
                                placeholder="Business Name"
                                label="Business Name"
                                {...register('name')}
                                error={errors.name ? errors.name.message : ''}
                            />
                            <TextInput
                                {...register('website')}
                                error={
                                    errors.website ? errors.website.message : ''
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
                                        ? errors.billingAddress.address1.message
                                        : ''
                                }
                                placeholder="Address"
                                label="Address Line 1"
                            />

                            <TextInput
                                {...register('billingAddress.address2')}
                                error={
                                    errors.billingAddress?.address2
                                        ? errors.billingAddress.address2.message
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
                                            ? errors.billingAddress.city.message
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
                                        ? errors.companyAddress.address1.message
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
                                        ? errors.companyAddress.address2.message
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
                                            ? errors.companyAddress.city.message
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

                <Group position="right" className="mt-4">
                    <Button type="submit" color="primary">
                        Save and continue
                    </Button>
                </Group>
            </form>
        </>
    );
};

export default BusinessDetailsForm;
