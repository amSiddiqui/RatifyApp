import { Group } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import React from 'react';
import { getBgColorLight, getBorderColorBold, INPUT_TOP_OFFSET } from '../types';
import SignatureInput from './SignatureInput';
import { MdClear } from 'react-icons/md';
import { useDebouncedValue } from '@mantine/hooks';

interface Props  {
    placeholder: string;
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
    onFilled: (value: string | Date | null, id: number) => void;
    initialValue: string;
    color: string;
}

const SignerInput:React.FC<Props> = ({id, x, y, type, placeholder, onFilled, initialValue, width, height, color}) => {

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
    const [debounced] = useDebouncedValue(signValue, 1000);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setInitialHide(false);
        }, 700);
        return () => clearTimeout(timeout);
    }, []);

    React.useEffect(() => {
        if (type === 'name' || type === 'text') {
            
        }
    }, [debounced, type]);

    return (
    <div className='flex-col pdf-form-input' style={{
        display: initialHide ? 'none' : 'flex',
        width: width,
        overflow: 'none',
        zIndex: 1,
        height: height,
        position: 'absolute',
        top: y - INPUT_TOP_OFFSET,
        left: x,
    }}>
        <div style={{height: INPUT_TOP_OFFSET + 'px'}}>
            {type !== 'date'  && type !== 'signature' && <Group position='right'>
                <i onClick={() => {
                    setNameValue('');
                    onFilled('', id);
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
            }}
            onBlur={(e) => {
                onFilled(e.currentTarget.value, id);
            }}
            className={classNames(
                'pdf-input-element', getBgColorLight(color),
                {
                    'pdf-input-element-filled border-2 ': nameValue.length > 0,                    
                },
                getBorderColorBold(color),
                'focus:outline-none focus:'+getBorderColorBold(color)+' focus:border-2'
            )}
        />}
        {type === 'date' && <DatePicker 
            variant='unstyled'
            value={dateValue}
            onChange={(date) => {
                setDateValue(date);
                onFilled(date, id);
            }}
            placeholder={placeholder}
            style={{height: height - INPUT_TOP_OFFSET, paddingLeft: 3}}
            size='xs'
            className={classNames(
                'pdf-form-input-date',
                {'border-2 pdf-form-input-date-filled': dateValue !== null},
                dateValue === null ? getBgColorLight(color) : getBorderColorBold(color),
            )}
        />}


        {type === 'signature' && 
        <SignatureInput height={height} initialValue={signValue} onSignComplete={(value) => {
            onFilled(value, id);
            setSignValue(value);
        }} placeholder={placeholder} color={color} />}
    </div>);
}

export default SignerInput;