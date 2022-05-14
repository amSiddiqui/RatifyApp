import classNames from 'classnames';
import React from 'react';
import { getBgColorLight, getBorderColorBold, INPUT_HEIGHT, INPUT_WIDTH, SIGN_INPUT_HEIGHT } from '../types';
import { MdClear, MdDelete, MdSave } from 'react-icons/md';
import { AiOutlineDrag } from 'react-icons/ai';
import { DraggableCore } from 'react-draggable';
import { useId } from '@mantine/hooks';
import { Drawer, Checkbox, TextInput, Stack, Center } from '@mantine/core';
import { Button } from 'reactstrap';
import { BoundType, INPUT_TOP_OFFSET } from '../types';
import { DatePicker } from '@mantine/dates';
 

interface Props {
    onDelete: () => void;
    onReposition: (x:number, y:number) => void;
    placeholder: string;
    x: number;
    y: number;
    color: string;
    offsetParent: HTMLElement | undefined;
    bounds?: BoundType;
    type: string;
}

const PdfFormInput: React.FC<Props> = ({ x: initX, y: initY, color, onDelete, placeholder, onReposition, offsetParent, bounds, type }) => {
    const [[x, y], setPosition] = React.useState([initX, initY]);
    const [ph] = React.useState(placeholder);
    const [value, setValue] = React.useState<string>('');
    const [showSettings, setShowSettings] = React.useState<boolean>(false);
    const uuid = useId();
    const nodeRef = React.useRef(null);
    const [inputStyles, setInputStyles] = React.useState<any>({
        zIndex: 1,
        resize: 'horizontal',
        overflow: 'auto',
        width: INPUT_WIDTH,
        height: type === 'signature' ? SIGN_INPUT_HEIGHT : INPUT_HEIGHT,
        position: 'absolute',
        top: y - INPUT_TOP_OFFSET,
        left: x,
    });

    React.useEffect(() => {
        setInputStyles((prev:any) => ({
            ...prev,
            top: y - INPUT_TOP_OFFSET,
            left: x,
        }));
    }, [x, y]);

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
            <DraggableCore 
                handle={`#${uuid}`}
                onDrag={(e, data) => {
                    setPosition(prev => {
                        if (bounds) {
                            let newX = prev[0] + data.deltaX;
                            let newY = prev[1] + data.deltaY;
                            if (newX < bounds.left) {
                                newX = bounds.left;
                            }
                            if (newX > bounds.right) {
                                newX = bounds.right;
                            }
                            if (newY < bounds.top) {
                                newY = bounds.top;
                            }
                            if (newY > bounds.bottom) {
                                newY = bounds.bottom;
                            }
                            return [newX, newY];
                        } else {
                            return prev;
                        }
                    })
                }}
                onStop={() => {
                    onReposition(x, y);
                }}
                offsetParent={offsetParent}
                nodeRef={nodeRef}
            >
                <div
                    ref={nodeRef}
                    style={inputStyles}
                    className='flex flex-col pdf-form-input'
                >
                    <div className='flex items-center justify-between' style={{height: INPUT_TOP_OFFSET + 'px', fontSize: '1rem'}}>
                        <i id={uuid} className='flex justify-center items-center cursor-pointer'><AiOutlineDrag /></i>
                        <i onClick={onDelete} className='cursor-pointer text-danger'><MdClear /></i>
                    </div>
                    {type === 'name' && <input
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
                            getBgColorLight(color),
                            'focus:outline-none',
                            `focus:${getBorderColorBold(color)} focus:border-2`,
                        )}
                    />}
                    {type === 'signature' && <Center
                        className={classNames(
                            'w-full h-full text-gray-500',
                            getBgColorLight(color)
                        )}
                    >
                        <span>{ph}</span>
                    </Center>}
                    {type === 'date' && <DatePicker 
                        variant='unstyled'
                        placeholder={ph}
                        style={{height: INPUT_HEIGHT - INPUT_TOP_OFFSET, paddingLeft: 3}}
                        size='xs'
                        className={classNames(
                            'pdf-form-input-date',
                            getBgColorLight(color),
                        )}
                    />}
                </div>
            </DraggableCore>

        </>
    );
};

export default PdfFormInput;
