import { Center } from '@mantine/core';
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
}

const SenderInputView: React.FC<Props> = ({ inputField }) => {
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
            <div
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
                                    className={classNames(
                                        getBorderColorBold(color),
                                        'border-2 px-2',
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
                                        'px-2 pt-1 text-muted ' +
                                        getBgColorLight(color)
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
                                        'text-muted ' + getBgColorLight(color)
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
                                <div
                                    className={
                                        getBorderColorBold(color) + ' border-2'
                                    }
                                    style={{
                                        height: height - INPUT_TOP_OFFSET,
                                        width: width,
                                    }}>
                                    <img
                                        src={value}
                                        style={{
                                            height: height - INPUT_TOP_OFFSET,
                                            width: 'auto',
                                        }}
                                        alt="Signature"
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default SenderInputView;
