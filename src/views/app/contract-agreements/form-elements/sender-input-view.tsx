import { Center, Tooltip } from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import { getFormatDateFromIso } from '../../../../helpers/Utils';
import { InputField } from '../../../../types/ContractTypes';
import {
    getBgColorLight,
    getBorderColorBold,
    INPUT_TOP_OFFSET,
} from '../types';

interface Props {
    inputField: InputField;
    declined?: boolean;
}

const SenderInputView: React.FC<Props> = ({ inputField, declined }) => {
    const [initialHide, setInitialHide] = React.useState(true);
    const [{ x, y, type, placeholder, value, completed, color, required, width, height }] =
        React.useState(() => {
            return {
                x: inputField.x,
                y: inputField.y,
                type: inputField.type,
                placeholder: inputField.placeholder,
                value: inputField.value,
                completed: inputField.completed,
                color: inputField.color,
                required: inputField.required,
                height: inputField.height,
                width: inputField.width,
            };
        });

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setInitialHide(false);
        }, 700);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <>
            <Tooltip
                label={declined ? inputField.signerName + ' declined' : inputField.signerName + '\'s Input Field'}
                color={declined ? 'red' : 'blue'}
                position='bottom'
                className="flex-col pdf-form-input"
                style={{
                    display: initialHide ? 'none' : 'flex',
                    width: width,
                    overflow: 'none',
                    zIndex: 1,
                    height: height,
                    position: 'absolute',
                    top: y - INPUT_TOP_OFFSET,
                    left: x,
                }}>
                {(type === 'name' || type === 'text' || type === 'date') && (
                    <>
                        {completed && (
                            <div>
                                <p
                                    style={{
                                        width: width,
                                        height: INPUT_TOP_OFFSET,
                                    }}
                                    className="text-xs">
                                    {placeholder}{' '}
                                    {required && (
                                        <span className="text-danger">*</span>
                                    )}
                                </p>

                                <p
                                    style={{
                                        height: height - INPUT_TOP_OFFSET,
                                        width: width,
                                    }}
                                    className={declined ? 'border-2 px-2 font-bold border-red-500' : classNames(
                                        getBorderColorBold(color),
                                        'border-2 px-2 font-bold',
                                    )}>
                                    {type === 'date'
                                        ? getFormatDateFromIso(value)
                                        : value}
                                </p>
                            </div>
                        )}
                        {!completed && (
                            <>
                                <p
                                    style={{
                                        height: INPUT_TOP_OFFSET,
                                        width: width,
                                    }}></p>
                                <p
                                    style={{
                                        height: height - INPUT_TOP_OFFSET,
                                        width: width,
                                    }}
                                    className={
                                        'px-2  text-muted ' +
                                        getBgColorLight(color) + (declined ? ' border-red-500 border-2 ' : '')
                                    }>
                                    {placeholder}
                                </p>
                            </>
                        )}
                    </>
                )}
                {type === 'signature' && (
                    <>
                        {!completed && (
                            <>
                                <p style={{height: INPUT_TOP_OFFSET, width: width}}></p>
                                <Center
                                    className={
                                        'text-muted ' +getBgColorLight(color) + ( declined ? ' border-2 border-red-500 ' : '')
                                    }
                                    style={{
                                        height: height - INPUT_TOP_OFFSET,
                                        width: width,
                                    }}>
                                    {placeholder}
                                </Center>
                            </>
                        )}
                        {completed && (
                            <>
                                <p style={{height: INPUT_TOP_OFFSET, width: width}}></p>
                                <Center
                                    className={
                                        'w-full h-full border-2 cursor-pointer text-gray-600 ' + (declined ? ' border-red-500 ' : getBorderColorBold(color) )
                                    }
                                    style={{
                                        height: height - INPUT_TOP_OFFSET,
                                        width: width,
                                    }}>
                                    <img
                                        src={value}
                                        style={{
                                            height: height - INPUT_TOP_OFFSET - 4,
                                            width: 'auto',
                                        }}
                                        alt="Signature"
                                    />
                                </Center>
                            </>
                        )}
                    </>
                )}
            </Tooltip>
        </>
    );
};

export default SenderInputView;
