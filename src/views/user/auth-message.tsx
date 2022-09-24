import { Stack, Image } from '@mantine/core';
import React from 'react';

const AuthMessage: React.FC = () => {
    return (
        <Stack spacing={24} style={{ maxWidth: '500px' }}>
            <Image
                className="mb-2 w-[140px] sm:w-[170px]"
                src="/static/logos/black.png"
                alt="Ratify"
            />
            <p className='lg:text-5xl text-4xl'>Digitalize document approvals and signing!</p>
            <p className='text-3xl'>Focus on growing your business.</p>
            <Stack className='relative' style={{ top: 6 }} >
                <p className="text-lg rounded-md bg-white p-4">
                    Manual or via email approval &amp; signing of documents
                    takes ages to complete, Leading to poor document management,
                    as well as potentially damaging few trees in the process.
                </p>
                <p className='text-lg rounded-md p-4'>
                    With Ratify this process takes seconds - literally for each
                    user. Approvals, signing &amp; managing of contracts,
                    agreement, non-disclosures is intuitive, efficient and
                    environment friendly.
                </p>
            </Stack>
        </Stack>
    
    );
};

export default AuthMessage;
