import { Card, Center, Stack } from '@mantine/core';
import React from 'react';
import { NavLink } from 'react-router-dom';
import IntlMessages from '../../helpers/IntlMessages';

const VerifyEmail:React.FC = () => {
    return (
    <Center className="px-10 sm:h-[78vh] mt-10 sm:mt-0">
        <Card className='shadow-md p-14'>
            <Stack>
                <NavLink to="/" className="white">
                    <span className="logo-single mb-3" />
                </NavLink>
                <h1 className='text-2xl font-bold'><IntlMessages id="user.verify-email-title" /></h1>
                <p><IntlMessages id="user.verify-email-message" /></p>
                <NavLink
                    to='/'
                    className="btn btn-primary btn-shadow btn-lg"
                >
                    <IntlMessages id="pages.go-home" />
                </NavLink>
            </Stack>
        </Card>
    </Center>);
}

export default VerifyEmail;