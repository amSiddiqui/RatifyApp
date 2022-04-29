import classNames from 'classnames';
import React from 'react';
import { getBgColorBold, getBorderColorBold, INPUT_HEIGHT, INPUT_WIDTH } from '../types';
import { MdEdit, MdDelete, MdSave } from 'react-icons/md';
import { AiOutlineDrag } from 'react-icons/ai';
import Draggable from 'react-draggable';
import { useId } from '@mantine/hooks';
import { Drawer, Checkbox, Input, Stack, InputWrapper } from '@mantine/core';
import { Button } from 'reactstrap';

export type PdfFormInputType = {
    x: number;
    y: number;
    color: string;
};

const INPUT_TOP_OFFSET = 17;

const PdfFormInput: React.FC<PdfFormInputType> = ({ x, y, color }) => {
    const [value, setValue] = React.useState<string>('');
    const [showSettings, setShowSettings] = React.useState<boolean>(false);
    const uuid = useId();

    return (
        <>
            <Drawer 
            opened={showSettings} 
            onClose={() => setShowSettings(false)}
            title={'Input Settings'}
            padding={'xl'}
            position='right'
            >
                <Stack>
                    <InputWrapper label='Placeholder text'>
                        <Input defaultValue={'Full Name'} placeholder='Placeholder Text' />
                    </InputWrapper>
                    <Checkbox label='Required' />
                    <Button className='flex justify-center items-center' color='success'>
                        <i className='mr-1 text-lg'> <MdSave /> </i>
                        <span>Save</span>
                    </Button>
                    <Button className='flex justify-center items-center' color='danger'>
                        <i className='mr-1 text-lg'> <MdDelete /></i>
                        <span>Delete</span>
                    </Button>
                </Stack>
            </Drawer>
            <Draggable handle={`#${uuid}`}>
                <div
                    style={{
                        zIndex: 1,
                        position: 'absolute',
                        top: y - INPUT_TOP_OFFSET,
                        left: x,
                        resize: 'horizontal',
                        overflow: 'auto',
                        width: INPUT_WIDTH,
                        height: INPUT_HEIGHT,
                    }}
                    className='flex flex-col'
                >
                    <div className='flex items-center justify-center' style={{height: INPUT_TOP_OFFSET + 'px', fontSize: '1rem'}}>
                        <i id={uuid} className='flex-1 flex justify-center items-center cursor-pointer'><AiOutlineDrag /></i>
                        <i onClick={() => setShowSettings(true)} className='cursor-pointer'><MdEdit /></i>
                    </div>
                    <input
                        placeholder="Full Name"
                        type="text"
                        value={value}
                        onChange={(e) => {
                            setValue(e.currentTarget.value);
                        }}
                        className={classNames(
                            'pdf-input-element',
                            {
                                'pdf-input-element-filled border-2 ': value.length > 0,
                                [getBorderColorBold(color)]: true,
                            },
                            getBgColorBold(color),
                            'focus:outline-none',
                            `focus:${getBorderColorBold(color)} focus:border-2`,
                        )}
                    />
                </div>
            </Draggable>

        </>
    );
};

export default PdfFormInput;
