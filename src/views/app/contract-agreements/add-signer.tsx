import React from 'react';

import {
    Center,
    TextInput,
    Divider,
    Stack,
    Select,
    Switch,
    Group,
    Checkbox,
    NumberInput
} from '@mantine/core';
import { AiOutlineDrag } from 'react-icons/ai';
import { Card, CardBody, Button } from 'reactstrap';
import classNames from 'classnames';
import { useSprings, animated } from 'react-spring';
import { useDrag } from '@use-gesture/react';
import { clamp } from 'lodash-es';
import { useMediaQuery } from '@mantine/hooks';
import { GoPlus } from 'react-icons/go';
import { colors, getBgColorLight as getColor } from './types';

interface SingerElementStyleProps {
    step: number;
    color: string;
    type: 'signer' | 'approver' | 'viewer';
}

interface SignerElementFormProps {
    name: string;
    email: string;
    job_title?: string;
    text_field?: boolean;
    every?: number;
    every_unit?: 'days' | 'weeks' | 'months' | 'years' | '0' | string;
}

export interface SignerElement extends SingerElementStyleProps, SignerElementFormProps {
    id: string;
}

interface SignerRowProps extends SingerElementStyleProps {
    onDragStart: () => void;
    onDragEnd: () => void;
    onDataChange: (index:number,  data: SignerElementFormProps) => void;
    confirm: boolean;
    index: number;
}

const SignerRow:React.FC<SignerRowProps> = ({ index, color, step, onDragEnd, onDragStart, type, onDataChange, confirm }) => {
    const [i] = React.useState(index);
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [job_title, setJobTitle] = React.useState('');
    const [text_field, setTextField] = React.useState(false);
    const [every, setEvery] = React.useState(1);
    const [every_unit, setEveryUnit] = React.useState<'days' | 'weeks' | 'months' | 'years' | '0' | string>('months');

    React.useEffect(() => {
        onDataChange(i, {
            name,
            email,
            job_title,
            text_field,
            every,
            every_unit
        });
    }, [name, email, job_title, text_field, every, every_unit, onDataChange, i]);
    

    return <>
        <Card>
            <CardBody className='p-3'>
                <Group position='apart'>
                    <Group>
                        <div className={ classNames('p-2 border-2 rounded-sm capitalize', getColor(color))}>{type} {step}</div>
                        <TextInput error={confirm && name.length === 0 ? 'Please enter full name' : ''} placeholder='Name' value={name} onChange={(event) => setName(event.currentTarget.value)}  />
                        <TextInput error={confirm && email.length === 0 ? 'Please enter email' : ''} placeholder='Email' value={email} onChange={(event) => setEmail(event.currentTarget.value)} />
                        <TextInput placeholder='Job Title' style={{width: 100}} value={job_title} onChange={(event) => setJobTitle(event.currentTarget.value)} />
                        { type === 'signer' && <div><Checkbox size='xs' label='Add Text field' defaultChecked={text_field} onChange={(event) => {setTextField(event.currentTarget.checked);}} /></div>}
                    </Group>
                    { type !== 'viewer' && <Group>
                        <p>Remind Every</p>
                        <NumberInput defaultValue={every} disabled={every_unit === '0'} onChange={val => {
                            if (val) {
                                setEvery(val);
                            } else {
                                setEvery(0);
                            }
                        }} placeholder='0' className='center-input' style={{width: 70}}  />
                        <Select value={every_unit} onChange={(val) => {
                            if (val === null) {
                                setEveryUnit('0');
                            } else {
                                setEveryUnit(val);
                            }
                        }} style={{width: 95}} data={[
                            { value: 'days', label: 'days' },
                            { value: 'weeks', label: 'weeks' },
                            { value: 'months', label: 'months' },
                            { value: 'years', label: 'years' },
                            { value: '0', label: 'Never' },
                        ]} defaultValue={'days'} />
                    </Group>}
                    <Center className='h-full' style={{width: 75}}>
                        <div onMouseDown={onDragStart} onMouseUp={onDragEnd} className='dragger cursor-pointer' style={{width: '70%'}}>
                            <Stack spacing={2}>
                                <p className='mb-0 text-center'>Step {step}</p>
                                <Center className='text-2xl'>
                                    <AiOutlineDrag />
                                </Center>
                            </Stack>
                        </div>
                    </Center>
                </Group>
            </CardBody>
        </Card>
    </>
}

const swap = (arr: number[], i: number, j:number)  => {
    if (i === j) return arr;
    if (i < 0 || i >= arr.length || j < 0 || j >= arr.length) return arr;
    // remove ith element
    let new_arr = [...arr];
    let ith = new_arr.splice(i, 1)[0];
    // insert at jth position
    new_arr.splice(j, 0, ith); 
    return new_arr;
}

const fn = (order: number[], elementHeight:number, active = false, originalIndex = 0, curIndex = 0, y = 0) => (index:number) => {
    if (active && index === originalIndex) {
        return {
            y: curIndex * elementHeight + y,
            scale: 1.05,
            zIndex: 1,
            shadow: 15,
            immediate: (key: string) => key === 'y' || key === 'zIndex',
        };
    } else {
        return {
            y: order.indexOf(index) * elementHeight,
            scale: 1,
            zIndex: 0,
            shadow: 1,
            immediate: false,
        };
    }
}

type AddSignerProps = {
    onConfirmAddSigner: (singers:SignerElement[]) => void;
    onCancelAddSigner: () => void;
    onChangeSignerSequence: (val:boolean) => void;
}

const AddSigner:React.FC<AddSignerProps> = ({ onConfirmAddSigner, onCancelAddSigner, onChangeSignerSequence }) => {
    const [items, setItems] = React.useState<Array<SingerElementStyleProps>>([]);
    const [signerData, setSignerData] = React.useState<Array<SignerElementFormProps>>([]);
    const matches = useMediaQuery('(min-width: 1400px)');
    const [elementHeight, setElementHeight] = React.useState(() => matches ? 100 : 140);
    const [containerHeight, setContainerHeight] = React.useState( elementHeight * items.length);
    const [confirming, setConfirming] = React.useState(false);

    const [order, setOrder] = React.useState<number[]>(items.map((_, index) => index));

    const [springs, api] =  useSprings(items.length, fn(order, elementHeight));
    const [shouldDrag, setShouldDrag] = React.useState(false);

    const bind = useDrag(({ args: [originalIndex, eH], active, movement: [, y] }) => {
        const curIndex = order.indexOf(originalIndex);
        const curRow = clamp(Math.round((curIndex * 100 + y) / 100), 0, items.length - 1);
        const newOrder = swap(order, curIndex, curRow);
        api.start(fn(newOrder, eH, active && shouldDrag, originalIndex, curIndex, y));
        if (!active) {
            setOrder(newOrder);
        }
    });

    const onAddSigner = (type: 'signer' | 'approver' | 'viewer') => {
        let color = 'slate';
        if (type === 'signer') {
            color = colors[items.length % colors.length];
        }
        if (type === 'approver') {
            color = 'gray';
        }
        setItems(prev => [...prev, { step: prev.length + 1, color, type, name: '', email: '' }]);
        setSignerData(prev => [...prev, { name: '', email: ''}]);
        setOrder(prev => [...prev, prev.length]);
    }

    const onConfirm = () => {
        setConfirming(true);
        const signers = items.map((item, index) => {
            const { name, email, job_title, text_field } = signerData[index];
            return {
                ...item,
                name,
                email,
                job_title,
                text_field,
                // generate random id
                id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
            }
        });
        // check if name and email is filled for each items
        let error = false;
        signerData.forEach(d => {
            if (d.name.length === 0 || d.email.length === 0) {
                error = true;
            }
        });
        if (error) {
            return;
        }
        signers.sort((a, b) => order.indexOf(a.step) - order.indexOf(b.step));
        onConfirmAddSigner(signers as SignerElement[]);
    }

    const updateItems = React.useCallback((index:number, data:SignerElementFormProps) => {
        setSignerData(prev => {
            const d = [...prev];
            d[index] = data;
            return d;
        });
    }, []);

    React.useEffect(() => {
        setContainerHeight( elementHeight * items.length);
    }, [items, elementHeight]);

    React.useEffect(() => {
        if (!matches) {
            setElementHeight(140);
        } else {
            setElementHeight(100);
        }
    }, [matches]);

    return (<>
        <div className='relative' style={{height: containerHeight}}>
            {springs.map(({zIndex, shadow, y, scale}, i) => (
                <animated.div
                    {...bind(i, elementHeight)}
                    key={i}
                    style={{
                        zIndex,
                        boxShadow: shadow.to(s => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s} px 0px`),
                        y,
                        scale,
                        width: '100%',
                        position: 'absolute',
                        transformOrigin: '50% 50% 0px',
                        touchAction: 'none',
                    }}
                >
                    <SignerRow index={i} confirm={confirming} onDataChange={updateItems} type={items[i].type} onDragStart={() => {setShouldDrag(true)}} onDragEnd={() => {setShouldDrag(false)}} color={items[i].color} step={order.indexOf(i) + 1} />
                </animated.div>
            ))}
        </div>
        <Divider className='my-3' />
        <p className='text-right text-xs italic'>Drag and drop to change the sequence of workflow steps</p>
        <Group>
            <Button onClick={() => onAddSigner('signer')} className='flex justify-center items-center' >
                <i className="mr-2">
                    <GoPlus />
                </i>
                Add Signer
            </Button>
            <Button onClick={() => onAddSigner('viewer')} className='flex justify-center items-center'>
                <i className="mr-2">
                    <GoPlus />
                </i>
                Add Viewer
            </Button>
            <Button onClick={() => onAddSigner('approver')} className='flex justify-center items-center'>
                <i className="mr-2">
                    <GoPlus />
                </i>
                Add Approver
            </Button>
        </Group>
        <Divider className='my-3' />
        <Group position='right'>
            <div className='flex mb-3 justify-center items-center'>
                <label className='mr-1 mb-0' htmlFor='agreement-creator-sequence-switch'>Signing and approvals must be completed in sequence</label>
                <Switch onChange={(e) => onChangeSignerSequence(e.currentTarget.checked)} id='agreement-creator-sequence-switch' />
            </div>
        </Group>
        <Group position='right'>
            <Button onClick={onCancelAddSigner} color='light'>Cancel</Button>
            <Button onClick={onConfirm} >Confirm</Button>
        </Group>
    </>)
}

export default AddSigner;