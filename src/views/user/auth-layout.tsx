import { Card, Center, SimpleGrid } from '@mantine/core';
import React from 'react';
import AuthMessage from './auth-message';

const AuthLayout:React.FC = ({children}) => {
    return (<>
        <SimpleGrid cols={2} breakpoints={[{ maxWidth: 640, cols: 1 }]}>
            <Center className='h-screen px-4 md:px-8'>
                <Card className="shadow-md w-full sm:w-[500px] p-6 md:p-12">
                    {children}
                </Card>
            </Center>
            <Center className="h-screen bg-slate-200 px-8 md:px-8">
                <AuthMessage />
            </Center>
        </SimpleGrid>
    </>
    );
}

export default AuthLayout;