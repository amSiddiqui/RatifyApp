import { Popover } from '@mantine/core';
import React, { ReactElement } from 'react';
import { getBgColorLight } from '../types';


const SignerPopover: React.FC<{target: ReactElement, color: string}> = ({children, target, color}) => {
    return (
        <Popover
            opened={true}
            zIndex={4}
            gutter={-10}
            spacing={0}
            position='left'
            placement='start'
            target={target}
            shadow='lg'
        >
            <div className={getBgColorLight(color) + ' rounded-lg px-2 text-xs py-1 relative'} style={{
                width: '105%',
                height: '27px',
                right: 1,
                top: 0,
                border: '1px solid #999',
            }}>
                {children}
            </div>
        </Popover>
    );
}

export default SignerPopover;