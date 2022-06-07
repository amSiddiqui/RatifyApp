import { Stepper, Space } from '@mantine/core';
import React from 'react';
import { AuthHelper } from '../../helpers/AuthHelper';
import BusinessContactForm from './business-contact-form';
import BusinessDetailsForm from './business-details-form';
import BusinessLegalEntities from './business-legal-entities';
import BusinessLogo from './business-logo';

const BusinessProfileStepperForm: React.FC<{ authHelper: AuthHelper }> = ( {authHelper} ) => {
    const [active, setActive] = React.useState(0);

    const nextStep = () =>
        setActive((current) => (current < 3 ? current + 1 : current));
    const prevStep = () =>
        setActive((current) => (current > 0 ? current - 1 : current));

    return <>
        <BusinessLogo authHelper={authHelper} />
        <Space h='lg'/>
        <Stepper size='sm' active={active} onStepClick={setActive} breakpoint='sm'>
            <Stepper.Step allowStepSelect={active > 0} label='Business Details' description='Provide business details' >
                <BusinessDetailsForm onNextStep={nextStep} authHelper={authHelper} />
            </Stepper.Step>
            <Stepper.Step allowStepSelect={active > 1} label='Contacts' description='Provide business contacts' >
                <BusinessContactForm prevStep={prevStep} nextStep={nextStep} />
            </Stepper.Step>
            <Stepper.Step allowStepSelect={active > 2} label='Legal Entities' description='Add legal entities' >
                <BusinessLegalEntities prevStep={prevStep} />
            </Stepper.Step>
        </Stepper>
    </>;
};

export default BusinessProfileStepperForm;
