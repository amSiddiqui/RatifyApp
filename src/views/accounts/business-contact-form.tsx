import { Checkbox, SimpleGrid, Stack, TextInput } from '@mantine/core';
import React from 'react';

const BusinessContactForm:React.FC = () => {
    return <>
        <form className='mt-4'>
            <Stack>
                <SimpleGrid cols={2} breakpoints={[
                    { maxWidth: 600, cols: 1 },
                ]}>
                    <Stack className='p-4'>
                        <h4 className='font-bold'>Primary Contact <span className='text-danger'>*</span></h4>
                        <TextInput label='Name' placeholder='Name' icon={<i className='simple-icon-user' />} />
                        <SimpleGrid cols={2} breakpoints={[
                            { maxWidth: 600, cols: 1 },
                        ]}>
                            <TextInput label='Email' placeholder='Email' icon={<i className='simple-icon-envelope' />} />
                            <TextInput label='Phone' placeholder='Phone' icon={<i className='simple-icon-phone' />} />
                        </SimpleGrid>
                        <h4 className='font-bold mt-4'>Billing Contact <span className='text-danger'>*</span></h4>
                        <Checkbox label='Same as primary contact' size='md' />
                        <TextInput label='Name' placeholder='Name' icon={<i className='simple-icon-user' />} />
                        <SimpleGrid cols={2} breakpoints={[
                            { maxWidth: 600, cols: 1 },
                        ]}>
                            <TextInput label='Email' placeholder='Email' icon={<i className='simple-icon-envelope' />} />
                            <TextInput label='Phone' placeholder='Phone' icon={<i className='simple-icon-phone' />} />
                        </SimpleGrid>
                    </Stack>
                    <Stack className='p-4'>
                        <h4 className='font-bold mt-2'>Secondary Contact</h4>
                        <TextInput label='Name' placeholder='Name' icon={<i className='simple-icon-user' />} />
                        <SimpleGrid cols={2} breakpoints={[
                            { maxWidth: 600, cols: 1 },
                        ]}>
                            <TextInput label='Email' placeholder='Email' icon={<i className='simple-icon-envelope' />} />
                            <TextInput label='Phone' placeholder='Phone' icon={<i className='simple-icon-phone' />} />
                        </SimpleGrid>
                    </Stack>
                </SimpleGrid>
            </Stack>
        </form>
    </>;
}

export default BusinessContactForm;