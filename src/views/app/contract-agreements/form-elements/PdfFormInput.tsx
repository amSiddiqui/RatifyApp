import classNames from 'classnames';
import React from 'react';
import { getBgColorBold, getBorderColorBold, INPUT_HEIGHT, INPUT_WIDTH } from '../types';
import { MdClear, MdDelete, MdSave } from 'react-icons/md';
import { AiOutlineDrag } from 'react-icons/ai';
import Draggable from 'react-draggable';
import { useId } from '@mantine/hooks';
import { Drawer, Checkbox, TextInput, Stack } from '@mantine/core';
import { Button } from 'reactstrap';

export type PdfFormInputType = {
    signerId: string;
    x: number;
    y: number;
    placeholder: string;
    color: string;
};

const INPUT_TOP_OFFSET = 17;

interface Props extends PdfFormInputType {
    onDelete: () => void;
}

const PdfFormInput: React.FC<Props> = ({ x, y, color, onDelete, placeholder }) => {
    const [ph] = React.useState(placeholder);
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
                    <TextInput label='Placeholder Text' defaultValue={'Full Name'} placeholder='Placeholder Text' />
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
                    <div className='flex items-center justify-between' style={{height: INPUT_TOP_OFFSET + 'px', fontSize: '1rem'}}>
                        <i id={uuid} className='flex justify-center items-center cursor-pointer'><AiOutlineDrag /></i>
                        <i onClick={onDelete} className='cursor-pointer text-danger'><MdClear /></i>
                    </div>
                    <input
                        placeholder={ph}
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
