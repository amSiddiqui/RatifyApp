import { Stack, Image, List } from '@mantine/core';
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
                <div className="text-lg rounded-md bg-rose-50 p-4 shadow-sm">
                    <List icon={<span>&bull;</span>} spacing={8}>
                        <List.Item>
                            Manual or via email approval &amp; signing of documents
                            takes ages to complete
                        </List.Item>
                        <List.Item>
                            Leading to poor document management       
                        </List.Item>
                        <List.Item>
                            As well as potentially damaging few trees in the process
                        </List.Item>
                    </List>
                </div>
                <div className='text-lg rounded-md bg-green-50 p-4 shadow-sm'>
                    <List icon={<span>&bull;</span>} spacing={8}>
                        <List.Item>
                            With Ratify this process takes seconds - literally for each user
                        </List.Item>
                        <List.Item>
                            Approvals, signing &amp; managing of contracts,
                            agreement, non-disclosures is intuitive, efficient and
                            environment friendly     
                        </List.Item>
                    </List>
                </div>
            </Stack>
        </Stack>
    
    );
};

export default AuthMessage;
