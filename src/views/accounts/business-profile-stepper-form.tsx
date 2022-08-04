import { Stepper, Space } from '@mantine/core';
import React from 'react';
import { AuthHelper } from '../../helpers/AuthHelper';
import { LegalEntity, Organization } from '../../types/AuthTypes';
import BusinessContactForm from './business-contact-form';
import BusinessDetailsForm from './business-details-form';
import BusinessFunctionForm from './business-function-form';
import BusinessLegalEntities from './business-legal-entities';
import BusinessLogo from './business-logo';

const BusinessProfileStepperForm: React.FC<{ authHelper: AuthHelper, organization: Organization, onComplete: () => void }> = ( {authHelper, organization, onComplete} ) => {
    const [active, setActive] = React.useState(() => {
        if (organization.stepsCompleted > 0 && organization.stepsCompleted < 4) {
            return organization.stepsCompleted;
        } else {
            return 0;
        }
    });

    const [defaultLegalEntity, setDefaultLegalEntity] = React.useState<LegalEntity>();

    const nextStep = () =>
        setActive((current) => (current < 4 ? current + 1 : current));
    const prevStep = () =>
        setActive((current) => (current > 0 ? current - 1 : current));

    return <>
        <BusinessLogo authHelper={authHelper} />
        <Space h='lg'/>
        <Stepper size='sm' active={active} onStepClick={setActive} breakpoint='sm'>
            <Stepper.Step allowStepSelect={active > 0} label='Business Details' description='Provide business details' >
                <BusinessDetailsForm size='md' onDefaultLegalEntity={(le) => {
                    setDefaultLegalEntity(le);
                }} organization={organization} onNextStep={nextStep} authHelper={authHelper} />
            </Stepper.Step>
            <Stepper.Step allowStepSelect={active > 1} label='Contacts' description='Provide business contacts' >
                <BusinessContactForm size='md' organization={organization} authHelper={authHelper} prevStep={prevStep} nextStep={nextStep} />
            </Stepper.Step>
            <Stepper.Step allowStepSelect={active > 2} label='Legal Entities' description='Add legal entities' >
                <BusinessLegalEntities onSkip={onComplete} onNextStep={nextStep} authHelper={authHelper} defaultLegalEntity={defaultLegalEntity} prevStep={prevStep} />
            </Stepper.Step>
            <Stepper.Step allowStepSelect={active > 3} label='Business Function' description='Add business function' >
                <BusinessFunctionForm onComplete={onComplete} authHelper={authHelper} prevStep={prevStep} />
            </Stepper.Step>
        </Stepper>
    </>;
};

export default BusinessProfileStepperForm;
