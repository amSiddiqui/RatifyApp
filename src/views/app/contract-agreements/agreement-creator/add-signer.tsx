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
import { MdClear } from 'react-icons/md';
import { Card, CardBody, Button } from 'reactstrap';
import classNames from 'classnames';
import { useSprings, animated } from 'react-spring';
import { useDrag } from '@use-gesture/react';
import { clamp } from 'lodash-es';
import { useMediaQuery } from '@mantine/hooks';
import { GoPlus } from 'react-icons/go';
import { colors, getBgColorLight as getColor } from '../types';
import { getRandomStringID } from '../../../../helpers/Utils';
import { SingerElementStyleProps, SignerElementFormProps, SignerElement } from '../../../../types/ContractTypes';

interface SignerRowProps extends SingerElementStyleProps {
    onDragStart: () => void;
    onDragEnd: () => void;
    onDataChange: (index:number,  data: SignerElementFormProps) => void;
    confirm: boolean;
    index: number;
    onDelete: () => void;
    signerData: SignerElementFormProps;
}

const SignerRow:React.FC<SignerRowProps> = ({ index, color, step, onDragEnd, onDragStart, type, onDataChange, confirm, onDelete, uid, signerData }) => {
    const [i] = React.useState(index);
    const [name, setName] = React.useState(signerData.name);
    const [email, setEmail] = React.useState(signerData.email);
    const [job_title, setJobTitle] = React.useState(signerData.job_title);
    const [text_field, setTextField] = React.useState(signerData.text_field ? signerData.text_field : false);
    const [every, setEvery] = React.useState(signerData.every ? signerData.every : 1);
    const [every_unit, setEveryUnit] = React.useState<'days' | 'weeks' | 'months' | 'years' | '0' | string>(signerData.every_unit ? signerData.every_unit : 'months');

    React.useEffect(() => {
        onDataChange(i, {
            uid,
            name,
            email,
            job_title,
            text_field,
            every,
            every_unit
        });
    }, [name, uid, email, job_title, text_field, every, every_unit, onDataChange, i]);
    

    return <>
        <Card>
            <CardBody className='p-3'>
                <p onClick={onDelete} className='absolute text-danger text-xl hover:scale-110 cursor-pointer' style={{top: '-8px', right: '-8px'}}>
                    <MdClear />
                </p>
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
    signers: SignerElement[];
    signerSequence: boolean;
}

const AddSigner:React.FC<AddSignerProps> = ({ onConfirmAddSigner, onCancelAddSigner, onChangeSignerSequence, signers, signerSequence }) => {
    const [seq, setSequence] = React.useState<boolean>(signerSequence);
    const [items, setItems] = React.useState<Array<SingerElementStyleProps>>(() => signers.map(s => ({
        step: s.step,
        color: s.color,
        type: s.type,
        uid: s.uid,
    })));
    const [lastColorIndex, setLastColorIndex] = React.useState(signers.length);
    const [signerData, setSignerData] = React.useState<Array<SignerElementFormProps>>(() => signers.map(s => ({
        uid: s.uid,
        name: s.name,
        email: s.email,
        job_title: s.job_title,
        text_field: s.text_field,
        every: s.every,
        every_unit: s.every_unit,
    })));
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
            color = colors[lastColorIndex % colors.length];
        }
        if (type === 'approver') {
            color = 'gray';
        }
        const id = getRandomStringID();
        setLastColorIndex((prev) => prev + 1);
        setItems((prev) => [...prev, { step: prev.length + 1, color, type, name: '', email: '', uid: id }]);
        setSignerData((prev) => [...prev, { name: '', email: '', uid: id, job_title: '', text_field: false, every: 1, every_unit: 'months' }]);
        setOrder((prev) => [...prev, prev.length]);
    }

    const onConfirm = () => {
        setConfirming(true);
        const signers = items.map((item, index) => {
            const { name, email, job_title, text_field, every, every_unit } = signerData[index];
            return {
                ...item,
                name,
                email,
                job_title,
                text_field,
                id: -1,
                every,
                every_unit
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
        signers.sort((a, b) => order.indexOf(a.step - 1) - order.indexOf(b.step - 1));
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
                    key={items[i].uid}
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
                    <SignerRow 
                        uid={items[i].uid} 
                        onDelete={() => {
                            setItems(prev => {
                                console.log('deleting at index: ', i, ' Item: ', items[i], ' Signer Data: ', signerData[i]);
                                const dup:SingerElementStyleProps[] = [];
                                for (let j = 0; j < prev.length; j++) {
                                    const item = prev[j];
                                    if (j === i) {
                                        continue;
                                    }
                                    if (j < i) {
                                        dup.push({...item, step: item.step});
                                    } 
                                    if (j > i) {
                                        dup.push({...item, step: item.step - 1});
                                    }

                                }
                                return dup;
                            });
                            setSignerData(prev => prev.filter((_, index) => i !== index));
                            setOrder(prev => {
                                const newOrder:number[] =  [];
                                for (let j = 0; j < prev.length; j++) {
                                    let pos = prev[j];
                                    if (pos === i) {
                                        continue;
                                    }
                                    if (pos < i) {
                                        newOrder.push(pos);
                                    }
                                    if (pos > i) {
                                        newOrder.push(pos - 1);
                                    }
                                }
                                return newOrder;
                            });
                        }} 
                        index={i} 
                        confirm={confirming} 
                        onDataChange={updateItems} 
                        type={items[i].type} 
                        onDragStart={() => {setShouldDrag(true)}} 
                        onDragEnd={() => {setShouldDrag(false)}} 
                        color={items[i].color} 
                        step={order.indexOf(i) + 1}
                        signerData={signerData[i]}
                    />
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
                <Switch checked={seq} onChange={(e) => {
                    onChangeSignerSequence(e.currentTarget.checked);
                    setSequence(e.currentTarget.checked);
                }} id='agreement-creator-sequence-switch' />
            </div>
        </Group>
        <Group position='right'>
            <Button onClick={onCancelAddSigner} color='light'>Cancel</Button>
            <Button onClick={onConfirm} >Confirm</Button>
        </Group>
    </>)
}

export default AddSigner;