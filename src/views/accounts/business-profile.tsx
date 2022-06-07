import { Card, Center } from '@mantine/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Row } from 'reactstrap';
import { Colxx, Separator } from '../../components/common/CustomBootstrap';
import Breadcrumb from '../../containers/navs/Breadcrumb';
import { AuthHelper } from '../../helpers/AuthHelper';
import { AppDispatch } from '../../redux';
import BusinessDetails from './business-details';
import BusinessProfileStepperForm from './business-profile-stepper-form';

const BusinessProfile: React.FC = () => {
    const match = useLocation();
    const dispatchFn = useDispatch<AppDispatch>();
    const authHelper = React.useMemo(
        () => new AuthHelper(dispatchFn),
        [dispatchFn],
    );
    const [stepperForm] = React.useState(true);

    return (
        <>
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
                {stepperForm && <Card style={{width: '100%'}} shadow={'md'}>
                    <BusinessProfileStepperForm authHelper={authHelper} />
                </Card>}
                {!stepperForm && <BusinessDetails authHelper={authHelper} />}
            </Center>
        </>
    );
};

export default BusinessProfile;
