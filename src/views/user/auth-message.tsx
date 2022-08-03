import { Stack, Image } from '@mantine/core';
import React from 'react';

const AuthMessage:React.FC = () => {
    return (
    <Stack>
        <Image className='mb-4 w-[170px] sm:w-[200px]' src='/static/logos/black.png' alt='Ratify' />
        <Stack spacing={12} style={{maxWidth: '600px'}}>
            <h2>Focus on growing your business</h2>
            <p className='text-lg'>Digitalize  document approvals and signing!</p>
            <p className='text-lg'>
                Manual or via email approval &amp; signing of documents takes ages to complete, Leading to poor document management, as well as potentially damaging few trees in the process. 
            </p>
            <p className='text-lg'>
                With Ratify this process takes seconds - literally for each user. Approvals, signing &amp; managing of contracts, agreement, non-disclosures is intuitive, efficient and environment friendly. 
            </p>
        </Stack>
    </Stack>)
}

export default AuthMessage;