import { Center } from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import { getFormatDateFromIso } from '../../../../helpers/Utils';
import { InputField } from '../../../../types/ContractTypes';
import {
    getBgColorLight,
    getBorderColorBold,
    INPUT_HEIGHT,
    INPUT_TOP_OFFSET,
    INPUT_WIDTH,
    SIGN_INPUT_HEIGHT,
} from '../types';

interface Props {
    inputField: InputField;
}

const SenderInputView: React.FC<Props> = ({ inputField }) => {
    const [initialHide, setInitialHide] = React.useState(true);
    const [{ x, y, type, placeholder, value, completed, color, required }] =
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
                    width: INPUT_WIDTH,
                    overflow: 'none',
                    zIndex: 1,
                    height:
                        type === 'signature' ? SIGN_INPUT_HEIGHT : INPUT_HEIGHT,
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
                                        width: INPUT_WIDTH,
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
                                        height: INPUT_HEIGHT - INPUT_TOP_OFFSET,
                                        width: INPUT_WIDTH,
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
                                        width: INPUT_WIDTH,
                                    }}></p>
                                <p
                                    style={{
                                        height: INPUT_HEIGHT - INPUT_TOP_OFFSET,
                                        width: INPUT_WIDTH,
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
                            <Center
                                className={
                                    'text-muted ' + getBgColorLight(color)
                                }
                                style={{
                                    height: SIGN_INPUT_HEIGHT,
                                    width: INPUT_WIDTH,
                                }}>
                                {placeholder}
                            </Center>
                        )}
                        {completed && (
                            <div
                                className={
                                    getBorderColorBold(color) + ' border-2'
                                }
                                style={{
                                    height: SIGN_INPUT_HEIGHT,
                                    width: INPUT_WIDTH,
                                }}>
                                <img
                                    src={value}
                                    style={{
                                        height: SIGN_INPUT_HEIGHT,
                                        width: 'auto',
                                    }}
                                    alt="Signature"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default SenderInputView;
