import React, { useState, forwardRef } from 'react';
import { MdCheck, MdClose } from 'react-icons/md';
import {
    PasswordInput,
    Progress,
    Text,
    Popover,
    Box,
    MantineSize,
} from '@mantine/core';
import { ChangeHandler } from 'react-hook-form';

export function PasswordRequirement({
    meets,
    label,
}: {
    meets: boolean;
    label: string;
}) {
    return (
        <Text
            color={meets ? 'teal' : 'red'}
            sx={{ display: 'flex', alignItems: 'center' }}
            mt={7}
            size="sm">
            {meets ? <MdCheck /> : <MdClose />} <Box ml={10}>{label}</Box>
        </Text>
    );
}

const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
];

function getStrength(password: string) {
    let multiplier = password.length > 7 ? 0 : 1;

    requirements.forEach((requirement) => {
        if (!requirement.re.test(password)) {
            multiplier += 1;
        }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

const PasswordStrength = forwardRef(({
    onChange,
    onBlur,
    name,
    label,
    error,
    size,
    placeholder,
}: {
    onChange: ChangeHandler;
    onBlur: ChangeHandler;
    name: string;
    error?: string;
    label: string;
    size: MantineSize;
    placeholder: string;
}, ref: React.Ref<any>) => {
    const [popoverOpened, setPopoverOpened] = useState(false);
    const [value, setValue] = useState('');
    const checks = requirements.map((requirement, index) => (
        <PasswordRequirement
            key={index}
            label={requirement.label}
            meets={requirement.re.test(value)}
        />
    ));

    const strength = getStrength(value);
    const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

    return (
        <Popover
            opened={popoverOpened}
            position="right"
            placement="center"
            withArrow
            styles={{ popover: { width: '100%' } }}
            trapFocus={false}
            transition="pop-top-left"
            onFocusCapture={() => setPopoverOpened(true)}
            onBlurCapture={() => setPopoverOpened(false)}
            target={
                <PasswordInput
                    icon={<i className='simple-icon-lock' />}
                    label={label}
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
                />
            }>
            <Progress
                color={color}
                value={strength}
                size={5}
                style={{ marginBottom: 10 }}
            />
            <PasswordRequirement
                label="Includes at least 8 characters"
                meets={value.length > 7}
            />
            {checks}
        </Popover>
    );
});

export default PasswordStrength;