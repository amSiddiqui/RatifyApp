import { yupResolver } from '@hookform/resolvers/yup';
import { Checkbox, Collapse, Group, SimpleGrid, Space, Stack, TextInput } from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import * as Yup from 'yup';
import { AuthHelper } from '../../helpers/AuthHelper';
import { Contact, Organization, OrganizationContactInfo } from '../../types/AuthTypes';

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

const getEmptyContact = () => {
    return {
        name: '',
        email: '',
        phone: '',
    } as Contact;
}

const BusinessContactForm:React.FC<{
    prevStep?: () => void, 
    nextStep?: (contactInfo?:OrganizationContactInfo) => void, 
    authHelper: AuthHelper,
    organization: Organization,
    size: 'xs' | 'md'
}> = ({nextStep, prevStep, authHelper, organization, size}) => {

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
        setError,
    } = useForm<OrganizationContactInfo>({
        resolver: yupResolver(schema),
        defaultValues: {
            showSecondaryContact: organization.showSecondaryContact,
            sameBillingContact: organization.sameBillingContact,
            primaryContact: organization.primaryContact === null ? getEmptyContact(): organization.primaryContact,
            secondaryContact: organization.secondaryContact === null ? getEmptyContact(): organization.secondaryContact,
            billingContact: organization.billingContact === null ? getEmptyContact(): organization.billingContact,
        }
    });

    const showSecondaryContact = watch('showSecondaryContact');
    const sameBillingContact = watch('sameBillingContact');

    const onSubmit = (data: OrganizationContactInfo) => {
        authHelper.updateOrganizationContact(data).then(() => {
            toast.success('Business contacts saved!');
            if (!!nextStep) {
                nextStep(data);
            }
        }).catch(err => {
            console.log(err);
            toast.error('Something went wrong, try again later!');
        })
    }

    return <>
        <form onSubmit={handleSubmit(onSubmit)} className={size === 'xs' ? '' : 'mt-4'}>
            <Stack>
                <SimpleGrid spacing={'xl'} cols={2} breakpoints={[
                    { maxWidth: 600, cols: 1 },
                ]}>
                    <Stack className='p-4' spacing='lg'>
                        <h4 className={classNames('font-bold', {'text-lg': size==='xs', 'text-xl': size === 'md' })}>Primary Contact <span className='text-danger'>*</span></h4>
                        <TextInput size={size} {...register('primaryContact.name')} error={
                            errors.primaryContact?.name ? errors.primaryContact.name.message : ''
                        } label='Name' placeholder='Name' icon={<i className='simple-icon-user' />} />
                        <SimpleGrid cols={2} breakpoints={[
                            { maxWidth: 600, cols: 1 },
                        ]}>
                            <TextInput size={size} type='email' {...register('primaryContact.email')} error={
                                errors.primaryContact?.email ? errors.primaryContact.email.message : ''
                            } label='Email' placeholder='Email' icon={<i className='simple-icon-envelope' />} />
                            <TextInput size={size} label='Phone' {...register('primaryContact.phone')} error={
                                errors.primaryContact?.phone ? errors.primaryContact.phone.message : ''
                            } placeholder='Phone' icon={<i className='simple-icon-phone' />} />
                        </SimpleGrid>
                        <Space h='lg' />
                        <h4 className={classNames('font-bold', {'text-lg': size==='xs', 'text-xl': size === 'md' })}>Billing Contact <span className='text-danger'>*</span></h4>
                        <Checkbox size={size} defaultChecked={sameBillingContact} onChange={(event) => {
                            setValue('sameBillingContact', event.target.checked);
                            if (event.target.checked) {
                                setError('billingContact.email', {type: 'required', message: ''});
                                setError('billingContact.email', {type: 'email', message: ''});
                                setError('billingContact.name', {type: 'required', message: ''});
                                setError('billingContact.phone', {type: 'matches', message: ''});
                            }
                        }} label='Same as primary contact' />
                        <TextInput size={size} disabled={sameBillingContact} {...register('billingContact.name')} error={
                            errors.billingContact?.name ? errors.billingContact.name.message : ''
                        } label='Name' placeholder='Name' icon={<i className='simple-icon-user' />} />
                        <SimpleGrid cols={2} breakpoints={[
                            { maxWidth: 600, cols: 1 },
                        ]}>
                            <TextInput size={size} disabled={sameBillingContact} {...register('billingContact.email')} error={
                                errors.billingContact?.email ? errors.billingContact.email.message : ''
                            } label='Email' placeholder='Email' icon={<i className='simple-icon-envelope' />} />
                            <TextInput size={size} disabled={sameBillingContact} {...register('billingContact.phone')} error={
                                errors.billingContact?.phone ? errors.billingContact.phone.message : ''
                            } label='Phone' placeholder='Phone' icon={<i className='simple-icon-phone' />} />
                        </SimpleGrid>
                    </Stack>
                    <Stack spacing='lg' className='p-4'>
                        <Group>
                            <Checkbox size={size} defaultChecked={showSecondaryContact} onChange={(event) => {
                                setValue('showSecondaryContact', event.target.checked);
                            }} />
                            <h4 className={classNames('font-bold', {'text-lg': size==='xs', 'text-xl': size === 'md' })}>
                                {showSecondaryContact ? 'Secondary Contact' : 'Add Secondary Contact'}
                            </h4>
                        </Group>
                        <Collapse in={showSecondaryContact}>
                            <Stack>
                                <TextInput size={size} disabled={!showSecondaryContact} {...register('secondaryContact.name')} error={
                                    errors.secondaryContact?.name ? errors.secondaryContact.name.message : ''
                                } label='Name' placeholder='Name' icon={<i className='simple-icon-user' />} />
                                <SimpleGrid cols={2} breakpoints={[
                                    { maxWidth: 600, cols: 1 },
                                ]}>
                                    <TextInput size={size} disabled={!showSecondaryContact} {...register('secondaryContact.email')} error={
                                        errors.secondaryContact?.email ? errors.secondaryContact.email.message : ''
                                    } label='Email' placeholder='Email' icon={<i className='simple-icon-envelope' />} />
                                    <TextInput size={size} disabled={!showSecondaryContact} {...register('secondaryContact.phone')} error={
                                        errors.secondaryContact?.phone ? errors.secondaryContact.phone.message : ''
                                    } label='Phone' placeholder='Phone' icon={<i className='simple-icon-phone' />} />
                                </SimpleGrid>

                            </Stack>
                        </Collapse>
                    </Stack>
                </SimpleGrid>
            </Stack>
                <Group position='right'>
                    {!!prevStep &&
                    <span onClick={() => {prevStep()}}><Button type='button' color='light'>Back</Button></span>
                    }
                    <Button size={size} color='primary'>{size === 'xs' ? 'Save' : 'Save and continue'}</Button>
                </Group>
        </form>
    </>;
}

export default BusinessContactForm;