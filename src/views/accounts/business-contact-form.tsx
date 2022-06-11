import { yupResolver } from '@hookform/resolvers/yup';
import { Checkbox, Collapse, Group, SimpleGrid, Stack, TextInput } from '@mantine/core';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import * as Yup from 'yup';
import { AuthHelper } from '../../helpers/AuthHelper';
import { Organization, OrganizationContactInfo } from '../../types/AuthTypes';

const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

const contactSchema = Yup.object().shape({
    name: Yup.string().required('Please provide a name'),
    email: Yup.string().email('Please provide a valid email address').when('phone', {
        is: (phone: string) => phone.length === 0,
        then: (schema) => schema.required('Please provide an email or phone number'),
        otherwise: (schema) => schema.optional(),
    }),
    phone: Yup.string().matches(phoneRegex, {message: 'Please provide a valid phone number', excludeEmptyString: true}),
});

const BusinessContactForm:React.FC<{
    prevStep: () => void, 
    nextStep: () => void, 
    authHelper: AuthHelper,
    organization: Organization,
}> = ({nextStep, prevStep, authHelper, organization}) => {

    const schema = Yup.object().shape({
        primaryContact: contactSchema,
        showSecondaryContact: Yup.boolean(),
        secondaryContact: Yup.object().when('showSecondaryContact', {
            is: true,
            then: contactSchema,
        }),
        sameBillingContact: Yup.boolean(),
        billingContact: Yup.object().when('sameBillingContact', {
            is: false,
            then: contactSchema,
        }),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<OrganizationContactInfo>({
        resolver: yupResolver(schema),
        defaultValues: {
            showSecondaryContact: organization.showSecondaryContact,
            sameBillingContact: organization.sameBillingContact,
            primaryContact: organization.primaryContact === null ? undefined: organization.primaryContact,
            secondaryContact: organization.secondaryContact === null ? undefined: organization.secondaryContact,
            billingContact: organization.billingContact === null ? undefined: organization.billingContact,
        }
    });

    const showSecondaryContact = watch('showSecondaryContact');
    const sameBillingContact = watch('sameBillingContact');

    const onSubmit = (data: OrganizationContactInfo) => {
        authHelper.updateOrganizationContact(data).then(() => {
            toast.success('Business contacts saved!');
            nextStep();
        }).catch(err => {
            console.log(err);
            toast.error('Something went wrong, try again later!');
        })
    }

    return <>
        <form onSubmit={handleSubmit(onSubmit)} className='mt-4'>
            <Stack>
                <SimpleGrid cols={2} breakpoints={[
                    { maxWidth: 600, cols: 1 },
                ]}>
                    <Stack className='p-4'>
                        <h4 className='font-bold'>Primary Contact <span className='text-danger'>*</span></h4>
                        <TextInput {...register('primaryContact.name')} error={
                            errors.primaryContact?.name ? errors.primaryContact.name.message : ''
                        } label='Name' placeholder='Name' icon={<i className='simple-icon-user' />} />
                        <SimpleGrid cols={2} breakpoints={[
                            { maxWidth: 600, cols: 1 },
                        ]}>
                            <TextInput type='email' {...register('primaryContact.email')} error={
                                errors.primaryContact?.email ? errors.primaryContact.email.message : ''
                            } label='Email' placeholder='Email' icon={<i className='simple-icon-envelope' />} />
                            <TextInput label='Phone' {...register('primaryContact.phone')} error={
                                errors.primaryContact?.phone ? errors.primaryContact.phone.message : ''
                            } placeholder='Phone' icon={<i className='simple-icon-phone' />} />
                        </SimpleGrid>
                        <h4 className='font-bold mt-4'>Billing Contact <span className='text-danger'>*</span></h4>
                        <Checkbox defaultChecked={sameBillingContact} onChange={(event) => {
                            setValue('sameBillingContact', event.target.checked);
                        }} label='Same as primary contact' size='md' />
                        <TextInput disabled={sameBillingContact} {...register('billingContact.name')} error={
                            errors.billingContact?.name ? errors.billingContact.name.message : ''
                        } label='Name' placeholder='Name' icon={<i className='simple-icon-user' />} />
                        <SimpleGrid cols={2} breakpoints={[
                            { maxWidth: 600, cols: 1 },
                        ]}>
                            <TextInput disabled={sameBillingContact} {...register('billingContact.email')} error={
                                errors.billingContact?.email ? errors.billingContact.email.message : ''
                            } label='Email' placeholder='Email' icon={<i className='simple-icon-envelope' />} />
                            <TextInput disabled={sameBillingContact} {...register('billingContact.phone')} error={
                                errors.billingContact?.phone ? errors.billingContact.phone.message : ''
                            } label='Phone' placeholder='Phone' icon={<i className='simple-icon-phone' />} />
                        </SimpleGrid>
                    </Stack>
                    <Stack className='p-4'>
                        <Group>
                            <Checkbox defaultChecked={showSecondaryContact} onChange={(event) => {
                                setValue('showSecondaryContact', event.target.checked);
                            }} className='relative' style={{top: 5}} />
                            <h4 className='font-bold mt-2'>
                                {showSecondaryContact ? 'Secondary Contact' : 'Add Secondary Contact'}
                            </h4>
                        </Group>
                        <Collapse in={showSecondaryContact}>
                            <Stack>
                                <TextInput disabled={!showSecondaryContact} {...register('secondaryContact.name')} error={
                                    errors.secondaryContact?.name ? errors.secondaryContact.name.message : ''
                                } label='Name' placeholder='Name' icon={<i className='simple-icon-user' />} />
                                <SimpleGrid cols={2} breakpoints={[
                                    { maxWidth: 600, cols: 1 },
                                ]}>
                                    <TextInput disabled={!showSecondaryContact} {...register('secondaryContact.email')} error={
                                        errors.secondaryContact?.email ? errors.secondaryContact.email.message : ''
                                    } label='Email' placeholder='Email' icon={<i className='simple-icon-envelope' />} />
                                    <TextInput disabled={!showSecondaryContact} {...register('secondaryContact.phone')} error={
                                        errors.secondaryContact?.phone ? errors.secondaryContact.phone.message : ''
                                    } label='Phone' placeholder='Phone' icon={<i className='simple-icon-phone' />} />
                                </SimpleGrid>

                            </Stack>
                        </Collapse>
                    </Stack>
                </SimpleGrid>
            </Stack>
            <Group position='right'>
                <span onClick={() => {prevStep()}}><Button type='button' color='light'>Back</Button></span>
                <Button color='primary'>Save and continue</Button>
            </Group>
        </form>
    </>;
}

export default BusinessContactForm;