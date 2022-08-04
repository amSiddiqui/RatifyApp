import { Stack, Image } from '@mantine/core';
import React from 'react';

const AuthMessage: React.FC = () => {
    return (
        <Stack spacing={24} style={{ maxWidth: '600px' }}>
            <Image
                className="mb-2 w-[140px] sm:w-[170px]"
                src="/static/logos/black.png"
                alt="Ratify"
            />
            <p className='lg:text-5xl text-4xl'>Digitalize document approvals and signing!</p>
            <p className="text-lg">
                Focus on growing your business.
                Manual or via email approval &amp; signing of documents
                takes ages to complete, Leading to poor document management,
                as well as potentially damaging few trees in the process.
                With Ratify this process takes seconds - literally for each
                user. Approvals, signing &amp; managing of contracts,
                agreement, non-disclosures is intuitive, efficient and
                environment friendly.
            </p>
        </Stack>
    
    );
};

export default AuthMessage;
