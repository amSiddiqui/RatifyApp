import React from 'react';

import {
    Center,
    Input,
    Grid,
    Divider,
    Stack,
    Select,
    Switch,
    Group,
    Checkbox
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

export type SignerElement = {
    step: number;
    color: string;
}

type SignerRowProps = {
    step: number;
    color: string;
    onDragStart: () => void;
    onDragEnd: () => void;
}

const SignerRow:React.FC<SignerRowProps> = ({ color, step, onDragEnd, onDragStart }) => {
    return <>
        <Card>
            <CardBody className='p-3'>
                <Grid columns={20}>
                    <Grid.Col span={13}> 
                        <Group>
                            <div className={ classNames('p-2 border-2 rounded-sm', getColor(color))}>Signer {step}</div>
                            <Input placeholder='Name' />
                            <Input placeholder='Email' />
                            <Input placeholder='Job Title' style={{width: 100}}/>
                            <div><Checkbox size='xs' label='Add Text field' /></div>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={5}>
                        <Group>
                            <p>Remind Every</p>
                            <Input type={'number'} placeholder='0' className='center-input' style={{width: 50}}/>
                            <Select style={{width: 95}} data={[
                                { value: 'days', label: 'days' },
                                { value: 'weeks', label: 'weeks' },
                                { value: 'months', label: 'months' },
                                { value: 'years', label: 'years' },
                                { value: '0', label: 'Never' },
                            ]} defaultValue={'days'} />
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={2}>
                        <Center className='h-full'>
                            <div onMouseDown={onDragStart} onMouseUp={onDragEnd} className='dragger cursor-pointer' style={{width: '70%'}}>
                                <Stack spacing={2}>
                                    <p className='mb-0 text-center'>Step {step}</p>
                                    <Center className='text-2xl'>
                                        <AiOutlineDrag />
                                    </Center>
                                </Stack>
                            </div>
                        </Center>
                    </Grid.Col>
                </Grid>
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
}

const AddSigner:React.FC<AddSignerProps> = ({ onConfirmAddSigner, onCancelAddSigner }) => {
    const [items, setItems] = React.useState<Array<SignerElement>>([]);
    const matches = useMediaQuery('(min-width: 1400px)');
    const [elementHeight, setElementHeight] = React.useState(() => matches ? 100 : 140);
    const [containerHeight, setContainerHeight] = React.useState( elementHeight * items.length);

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

    const onAddSigner = () => {
        setItems(prev => [...prev, { step: prev.length + 1, color: colors[prev.length % colors.length] }]);
        setOrder(prev => [...prev, prev.length]);
    }

    const onConfirm = () => {
        const copyOfItems = [...items];
        // sort copyOfItems according to order
        copyOfItems.sort((a, b) => order.indexOf(a.step) - order.indexOf(b.step));
        onConfirmAddSigner(copyOfItems);
    }

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
                    <SignerRow onDragStart={() => {setShouldDrag(true)}} onDragEnd={() => {setShouldDrag(false)}} color={items[i].color} step={order.indexOf(i) + 1} />
                </animated.div>
            ))}
        </div>
        <Divider className='my-3' />
        <p className='text-right text-xs italic'>Drag and drop to change the sequence of workflow steps</p>
        <Group>
            <Button onClick={onAddSigner} className='flex justify-center items-center' >
                <i className="mr-2">
                    <GoPlus />
                </i>
                Add Signer
            </Button>
            <Button className='flex justify-center items-center'>
                <i className="mr-2">
                    <GoPlus />
                </i>
                Add Viewer
            </Button>
            <Button className='flex justify-center items-center'>
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
                <Switch id='agreement-creator-sequence-switch' />
            </div>
        </Group>
        <Group position='right'>
            <Button onClick={onCancelAddSigner} color='light'>Cancel</Button>
            <Button onClick={onConfirm} >Confirm</Button>
        </Group>
    </>)
}

export default AddSigner;