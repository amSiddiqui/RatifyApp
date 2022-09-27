import { Group, Stack } from '@mantine/core';
import React, { ReactElement } from 'react';

const UneditableInput: React.FC<{ value: string, icon?: ReactElement, label?: string }> = ({ value, icon, label }) => {
    return (
        <Stack spacing={6}>
            {label !== undefined && label.length > 0 && <p className='font-bold'>{label}</p>}
            <Group spacing={12} className='w-full p-2' style={{ border: '1px solid #ced4da', borderRadius: '4px' }}>
                {icon !== undefined && <div className='relative' style={{ top: '1px' }}>{icon}</div>}
                <p>{value}</p>
            </Group>
        </Stack>
    );
}

export default UneditableInput;
