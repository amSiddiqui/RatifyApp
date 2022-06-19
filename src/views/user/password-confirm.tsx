import { MantineSize, PasswordInput, Popover, Progress } from '@mantine/core';
import React from 'react';
import { ChangeHandler } from 'react-hook-form';
import { PasswordRequirement } from './password-strength';

const PasswordConfirm = React.forwardRef(({
    onChange,
    onBlur,
    error,
    name,
    label,
    size,
    placeholder,
    password,
}: {
    onChange: ChangeHandler;
    onBlur: ChangeHandler;
    error?: string;
    name: string;
    label: string;
    size: MantineSize;
    placeholder: string;
    password: string;
}, ref: React.Ref<any>) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [value, setValue] = React.useState('');
    
    const color = password === value && value !== '' ? 'green' : 'red';
    const strength = password === value && value !== '' ? 100 : 0;
    const requirementConfirm = password !== value || value === '' ? 'Password doest not match' : 'Password confirmed';
    
    return (<Popover
        opened={isOpen}
        position='bottom'
        placement='start'
        withArrow
        styles={{ popover: { width: '100%' } }}
        trapFocus={false}
        transition='pop-top-left'
        onFocusCapture={() => setIsOpen(true)}
        onBlurCapture={() => setIsOpen(false)}
        target={<PasswordInput
            required
            icon={<i className='simple-icon-lock' />}
            label={label}
            error={error}
            placeholder={placeholder}
            value={value}
            onChange={(event) => {
                setValue(event.currentTarget.value);
                onChange(event);
            }}
            onBlur={onBlur}
            name={name}
            size={size}
            ref={ref}
        />}>
            <Progress color={color} value={strength} size={5} style={{ marginBottom: 10 }} />
            <PasswordRequirement meets={strength === 100} label={requirementConfirm} />
    </Popover>)
});

export default PasswordConfirm;