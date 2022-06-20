import classNames from 'classnames';
import React from 'react';
import { getBgColorLight, getBorderColorBold } from '../types';
import { MdClear, MdSettings } from 'react-icons/md';
import { AiOutlineDrag } from 'react-icons/ai';
import { DraggableCore } from 'react-draggable';
import { useId } from '@mantine/hooks';
import { Center, Checkbox, Grid, Group, Popover, Stack, TextInput } from '@mantine/core';
import { BoundType, INPUT_TOP_OFFSET } from '../types';
import { DatePicker } from '@mantine/dates';
import { Button } from 'reactstrap';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { toast } from 'react-toastify';
 

interface Props {
    inputElementId: number;
    onDelete: () => void;
    onReposition: (x:number, y:number) => void;
    onResize: (width:number, height:number) => void;
    placeholder: string;
    x: number;
    y: number;
    color: string;
    offsetParent: HTMLElement | undefined;
    bounds?: BoundType;
    type: string;
    contractHelper: ContractHelper;
    required: boolean;
    width: number;
    height: number;
}

const PdfFormInput: React.FC<Props> = ({ x: initX, y: initY, color, onDelete, placeholder, onReposition, offsetParent, bounds, type, contractHelper, required, inputElementId, width, height, onResize }) => {
    const [[x, y], setPosition] = React.useState([initX, initY]);
    const [ph, setPh] = React.useState(placeholder);
    const [req, setReq] = React.useState(required);
    const [value, setValue] = React.useState<string>('');
    const [showSettings, setShowSettings] = React.useState(false);
    const uuid = useId();
    const nodeRef = React.useRef(null);
    const [inputStyles, setInputStyles] = React.useState<any>({
        zIndex: 1,
        resize: type === 'signature' ? 'both': 'horizontal',
        overflow: 'auto',
        width: width,
        height: height,
        position: 'absolute',
        top: y - INPUT_TOP_OFFSET,
        left: x,
    });

    const handleResize = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) => {
        const { width: newWidth, height: newHeight } = event.currentTarget.getBoundingClientRect();
        if (width === newWidth && height === newHeight) {
            return;
        }
        onResize(newWidth, newHeight);
    }

    React.useEffect(() => {
        setInputStyles((prev:any) => ({
            ...prev,
            top: y - INPUT_TOP_OFFSET,
            left: x,
        }));
    }, [x, y]);

    const PdfInput = <input
            placeholder={ph}
            type="text"
            value={value}
            onChange={(e) => {
                setValue(e.currentTarget.value);
            }}
            style={{height: height - INPUT_TOP_OFFSET}}
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
        />

    return (
        <>
            <DraggableCore 
                handle={`#${uuid}`}
                onDrag={(e, data) => {
                    setShowSettings(false);
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
                    onMouseUpCapture={handleResize}
                    onTouchEndCapture={handleResize}
                    
                    className={classNames('flex-col pdf-form-input flex')}
                >
                    <div className='flex items-center justify-between' style={{height: INPUT_TOP_OFFSET + 'px', fontSize: '1rem'}}>
                        <i id={uuid} className='flex text-black text-xl justify-center items-center cursor-pointer'><AiOutlineDrag /></i>
                        <div className='flex'>
                            {type === 'text' && <i className='mr-2 cursor-pointer' onClick={() => setShowSettings(true)}><MdSettings></MdSettings></i>}
                            <i onClick={onDelete} className='cursor-pointer text-danger'><MdClear /></i>
                        </div>
                    </div>
                    {type === 'name' && PdfInput }
                    {type === 'text' && <>
                        <Popover
                            opened={showSettings}
                            onClose={() => setShowSettings(false)}
                            style={{height: height}}
                            target={PdfInput}
                            width={260}
                            position="right"
                            withArrow
                        >
                            <div>
                                <Stack>
                                    <p>Settings</p>
                                    <Grid columns={12}>
                                        <Grid.Col span={8}>
                                                <TextInput
                                                    label="Placeholder Text"
                                                    value={ph}
                                                    onChange={(e) => {
                                                        setPh(e.currentTarget.value);
                                                    }}
                                                    size='xs'
                                                    
                                                />
                                        </Grid.Col>
                                        <Grid.Col className='flex-grow' span={4}>
                                            <Center className='h-full'>
                                                <Checkbox checked={req} onChange={(val) => {
                                                    setReq(val.currentTarget.checked);
                                                }} size='xs' label='Required' />
                                            </Center>
                                        </Grid.Col>
                                    </Grid>
                                    <Group position='right'>
                                        <span onClick={() => setShowSettings(false)}><Button size='xs' color='light'>Close</Button></span>
                                        <span onClick={() => {
                                            setShowSettings(false)
                                            contractHelper.updateInputFieldSettings(inputElementId, ph, req).then(() => {
                                                toast.success('Saved');
                                            }).catch(() => {
                                                toast.error('Cannot Save at the moment, Try again later');
                                            });    
                                        }}><Button size='xs' color='success'>Save</Button></span>
                                    </Group>
                                </Stack>
                            </div>
                        </Popover>

                    </>}

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
                        style={{height: height - INPUT_TOP_OFFSET, paddingLeft: 3}}
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
