import { Stack } from '@mantine/core';
import { Button } from 'reactstrap';
import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import { AuthInitialStateType, OrganizationNameResponse } from '../../../../types/AuthTypes';

const VerifyEmailMessage:React.FC<{ navigate: NavigateFunction, auth: AuthInitialStateType, organization?: OrganizationNameResponse }> = ({
    navigate, auth, organization,
}) => {
    return <>
    {(auth.user && organization) && 
    <>
        {!auth.user.verified && <Stack className='text-center'>
            <h5>Please verify your email first before creating a document.</h5>
            <span onClick={() => {navigate(`/profile-settings`)}}><Button color='primary'>Profile Settings</Button></span>
        </Stack>}
        {auth.user.verified && organization.stepsCompleted < 3 && <Stack className='text-center'>
            <h5>Please complete the business profile before continuing!</h5>
            <span onClick={() => {navigate(`/business-profile`)}}><Button color='primary'>Business Profile</Button></span>
        </Stack>}
    </>}
    </>;
}

export default VerifyEmailMessage;