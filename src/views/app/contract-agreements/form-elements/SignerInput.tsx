import { Group } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import React from 'react';
import { INPUT_HEIGHT, INPUT_TOP_OFFSET, INPUT_WIDTH, SIGN_INPUT_HEIGHT } from '../types';
import SignatureInput from './SignatureInput';
import { MdClear } from 'react-icons/md';

interface Props  {
    placeholder: string;
    x: number;
    y: number;
    type: string;
    onFilled: (value: string | Date | null) => void;
    initialValue: string;
}

const SignerInput:React.FC<Props> = ({x, y, type, placeholder, onFilled, initialValue}) => {

    const [initialHide, setInitialHide] = React.useState<boolean>(true);
    const [nameValue, setNameValue] = React.useState(initialValue);
    const [dateValue, setDateValue] = React.useState<Date | null>(() => {
        if (initialValue === '') {
            return null;
        } else {
            return DateTime.fromISO(initialValue).toJSDate();
        }
    });
    const [signValue, setSignValue] = React.useState(initialValue);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setInitialHide(false);
        }, 700);
        return () => clearTimeout(timeout);
    }, []);

    return (
    <div className='flex-col pdf-form-input' style={{
        display: initialHide ? 'none' : 'flex',
        width: INPUT_WIDTH,
        overflow: 'none',
        zIndex: 1,
        height: type === 'signature' ? SIGN_INPUT_HEIGHT : INPUT_HEIGHT,
        position: 'absolute',
        top: y - INPUT_TOP_OFFSET,
        left: x,
    }}>
        <div style={{height: INPUT_TOP_OFFSET + 'px'}}>
            {type !== 'date'  && type !== 'signature' && <Group position='right'>
                <i onClick={() => {
                    setNameValue('');
                    onFilled('');
                }} className='cursor-pointer relative' style={{top: '23px', right: '7px'}}><MdClear /></i>
            </Group>}
        </div>

        {(type === 'name' || type === 'text') && 
        <input
            placeholder={placeholder}
            type='text'
            value={nameValue}
            onChange={(e) => {
                setNameValue(e.currentTarget.value);
                onFilled(e.currentTarget.value);
            }}
            className={classNames(
                'pdf-input-element bg-blue-200',
                {
                    'pdf-input-element-filled border-2 ': nameValue.length > 0,
                    'border-blue-400': true,
                },
                'focus:outline-none focus:border-blue-400 focus:border-2'
            )}
        />}
        {type === 'date' && <DatePicker 
            variant='unstyled'
            value={dateValue}
            onChange={(date) => {
                setDateValue(date);
                onFilled(date);
            }}
            placeholder={placeholder}
            style={{height: INPUT_HEIGHT - INPUT_TOP_OFFSET, paddingLeft: 3}}
            size='xs'
            className={classNames(
                'pdf-form-input-date',
                {'bg-blue-200': dateValue === null, 'border-blue-400 border-2 pdf-form-input-date-filled': dateValue !== null},
            )}
        />}


        {type === 'signature' && 
        <SignatureInput initialValue={signValue} onSignComplete={(value) => {
            onFilled(value);
            setSignValue(value);
        }} placeholder={placeholder} />}
    </div>);
}

export default SignerInput;