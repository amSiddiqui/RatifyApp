import { Divider } from '@mantine/core';
import React from 'react';
import UnderConstruction from '../app/construction';

const Billing:React.FC = () => {
    return (<>
        <h1 className='mb-6'>Billing</h1>
        <Divider className='mb-6' />
        <UnderConstruction />
    </>)
}

export default Billing;