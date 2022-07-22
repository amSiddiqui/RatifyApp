import { Card, Center, Loader } from '@mantine/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Row } from 'reactstrap';
import { Colxx, Separator } from '../../components/common/CustomBootstrap';
import Breadcrumb from '../../containers/navs/Breadcrumb';
import { AuthHelper } from '../../helpers/AuthHelper';
import { AppDispatch } from '../../redux';
import { Organization } from '../../types/AuthTypes';
import BusinessDetails from './business-details';
import BusinessProfileStepperForm from './business-profile-stepper-form';

const BusinessProfile: React.FC = () => {
    const match = useLocation();
    const dispatchFn = useDispatch<AppDispatch>();
    const authHelper = React.useMemo(
        () => new AuthHelper(dispatchFn),
        [dispatchFn],
    );
    const [stepperForm, setStepperForm] = React.useState(true);
    const [businessProfile, setBusinessProfile] = React.useState<Organization>();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(false);
    const [showLoading, setShowLoading] = React.useState(false);

    const fetchData = React.useCallback(() => {
        authHelper.getOrganization().then(org => {
            setBusinessProfile(org);
            setLoading(false);
            setStepperForm(org.stepsCompleted < 3);
        }).catch(err => {
            setLoading(false);
            setError(true);
            console.error(err);    
        });
    }, [authHelper]);

    const refreshPage = React.useCallback(() => {
        window.location.reload();
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (showLoading) {
        return <>
            <Center className='w-full h-[300px]'>
                <Loader />
            </Center>
        </>
    } else {
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
                    {!!businessProfile && stepperForm && !error && !loading && <Card style={{width: '100%'}} shadow={'md'}>
                        <BusinessProfileStepperForm onComplete={() => {
                            setStepperForm(false);
                            setShowLoading(true);
                            refreshPage();
                        }} organization={businessProfile} authHelper={authHelper} />
                    </Card>}
                    {!!businessProfile && !stepperForm && !error && !loading && <BusinessDetails authHelper={authHelper} organization={businessProfile} />}
                    {loading && <Center style={{height: 300}}>
                        <Loader size={'lg'} />
                    </Center>}
                    {!loading && (error || !businessProfile) && <h3 className='text-muted text-center'>
                        Cannot fetch business profile at the moment try again later.
                    </h3>}
                </Center>
            </>
        );
    }
};

export default BusinessProfile;
