import { SimpleGrid, TextInput } from '@mantine/core';
import React from 'react';

type Props = {
    label: string;
}

const HorizontalInput: React.FC<Props> = ({ label }) => {
    return (
    <SimpleGrid cols={2}>
        <div className='flex items-center h-full'><p className='text-left'>{label}</p></div>
        <TextInput placeholder={label} />
    </SimpleGrid>)
}

export default HorizontalInput;