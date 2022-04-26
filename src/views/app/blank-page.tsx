import React from 'react';
import { Row } from 'reactstrap';
import IntlMessages from '../../helpers/IntlMessages';
import { Colxx, Separator } from '../../components/common/CustomBootstrap';
import Breadcrumb from '../../containers/navs/Breadcrumb';
import { useLocation } from 'react-router-dom';
import { clamp } from 'lodash-es';

import { useSprings, animated } from 'react-spring';
import { useDrag } from '@use-gesture/react';
import { Center, Grid } from '@mantine/core';
import { Card, CardBody } from 'reactstrap'; 
import { Button } from 'reactstrap'

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

const fn = (order: number[], active = false, originalIndex = 0, curIndex = 0, y = 0) => (index:number) =>
    active && index === originalIndex
        ? {
            y: curIndex * 100 + y,
            scale: 1.1,
            zIndex: 1,
            shadow: 15,
            immediate: (key: string) => key === 'y' || key === 'zIndex',
        }
        : {
            y: order.indexOf(index) * 100,
            scale: 1,
            zIndex: 0,
            shadow: 1,
            immediate: false,
        }

const BlankPage = () => {
    const match = useLocation();

    const [items, setItems] = React.useState<string[]>([]);
    const [order, setOrder] = React.useState(items.map((_, index) => index));
    const [springs, api] = useSprings(items.length, fn(order));
    const [shouldDrag, setShouldDrag] = React.useState(false);

    const bind = useDrag(({ args: [originalIndex], active, movement: [, y] }) => {
        const curIndex = order.indexOf(originalIndex);
        const curRow = clamp(Math.round((curIndex * 100 + y) / 100), 0, items.length - 1);
        const newOrder = swap(order, curIndex, curRow);
        api.start(fn(newOrder, active && shouldDrag, originalIndex, curIndex, y));
        if (!active) {
            setOrder(newOrder);
        }
    });

    const onRowAdd = () => {
        setItems(prev => [...prev, 'G']);
        setOrder(prev => [...prev, prev.length]);
    }


    return (
        <>
            <Row>
                <Colxx xxs="12">
                    <Breadcrumb heading="menu.blank-page" match={match} />
                    <Separator className="mb-5" />
                </Colxx>
            </Row>
            <Row>
                <Colxx xxs="12" className="mb-4">
                    <p>
                        <IntlMessages id="menu.blank-page" />
                    </p>
                </Colxx>
            </Row>
            <Center className='mb-10'>
                <Button onClick={onRowAdd}>Add Items</Button>
            </Center>
            <Center>
                <div style={{
                    position: 'relative',
                    width: '500px',
                    height: '800px',
                }}>
                    {springs.map(({zIndex, shadow, y, scale}, i) => (
                        <animated.div
                            {...bind(i)}
                            key={i}
                            style={{
                                zIndex,
                                boxShadow: shadow.to(s => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s} px 0px`),
                                y,
                                scale,
                                position: 'absolute',
                                width: '500px',
                                height: '70px',
                                transformOrigin: '50% 50% 0px',
                                borderRadius: '5px',
                                paddingLeft: '32px',
                                fontSize: '14.5px',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                touchAction: 'none',
                            }}
                        >
                            <Grid columns={12}>
                                <Grid.Col span={8}>
                                    <Card>
                                        <CardBody style={{height: '70px'}}>
                                            {items[i]}
                                        </CardBody>
                                    </Card>
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <Card>
                                        <CardBody onMouseDown={() => {
                                            setShouldDrag(true);
                                        }} 
                                        onMouseUp={() => {
                                            setShouldDrag(false);
                                        }}
                                        style={{height: '70px'}}
                                        className='cursor-pointer'
                                        >

                                        </CardBody>
                                    </Card>
                                </Grid.Col>
                            </Grid>
                        </animated.div>
                    ))}
                </div>
            </Center>
        </>
    );
};

export default BlankPage;
