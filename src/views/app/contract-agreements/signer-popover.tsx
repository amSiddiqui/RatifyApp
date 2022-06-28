import { Popover } from '@mantine/core';
import React, { ReactElement } from 'react';
import { getBgColorLight } from './types';


const SignerPopover: React.FC<{target: ReactElement, color: string}> = ({children, target, color}) => {
    return (
        <Popover
            opened={true}
            zIndex={4}
            gutter={5}
            spacing={0}
            position='left'
            placement='start'
            target={target}
        >
            <div className={getBgColorLight(color) + ' px-2 text-xs py-1 relative'} style={{
                width: '105%',
                height: '105%',
                right: 1,
                top: 0
            }}>
                {children}
            </div>
        </Popover>
    );
}

export default SignerPopover;