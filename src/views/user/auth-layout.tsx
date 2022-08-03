import { Card, Center, SimpleGrid } from '@mantine/core';
import React from 'react';
import AuthMessage from './auth-message';

const AuthLayout:React.FC = ({children}) => {
    return (<>
        <SimpleGrid className='py-10' cols={2} breakpoints={[{ maxWidth: 600, cols: 1 }]}>
            <Center className='h-full w-full p-3'>
                <Card className="shadow-md w-full sm:w-[500px] p-6 md:p-12">
                    {children}
                </Card>
            </Center>    
            <Center className="px-10 sm:h-[78vh] mt-10 sm:mt-0">
                <AuthMessage />
            </Center>
        </SimpleGrid>
    </>
    );
}

export default AuthLayout;