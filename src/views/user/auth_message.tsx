import { Stack, Image } from '@mantine/core';
import React from 'react';

const AuthMessage:React.FC = () => {
    return (
    <Stack>
        <Image className='mb-4 w-[170px] sm:w-[200px]' src='/static/logos/black.svg' alt='Ratify' />
        <h2 style={{maxWidth: '600px'}}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam, illo dolorum itaque, necessitatibus ipsa nihil corporis nostrum, enim sapiente ea repellat autem veritatis quasi. Aperiam illo repudiandae ipsum ullam praesentium!</h2>
    </Stack>)
}

export default AuthMessage;