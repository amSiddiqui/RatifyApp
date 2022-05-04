import React from 'react';
import { Button, Row } from 'reactstrap';
import IntlMessages from '../../helpers/IntlMessages';
import { Colxx, Separator } from '../../components/common/CustomBootstrap';
import Breadcrumb from '../../containers/navs/Breadcrumb';
import { useLocation } from 'react-router-dom';
import { Center, Group, List, Stack } from '@mantine/core';

const BlankPage = () => {
    const match = useLocation();
    const [items, setItems] = React.useState<string[]>([]);

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
            <Center style={{width: '100%', height: '600px'}}>
                <Stack>
                    <Button onClick={() => {
                        setItems(prev => [...prev, 'item ' + prev.length]);
                    }} color='primary'>Add Items</Button>
                        <List>
                            { items.map((item, index) => (
                                <List.Item key={index}>
                                    <Group position='apart'>
                                        <div>{item}</div>
                                        <div className='cursor-pointer text-danger' onClick={() => {
                                            setItems(prev => prev.filter((_, i) => i !== index));
                                        }}>x</div>
                                    </Group>
                                </List.Item>
                            ))
                            }
                        </List>
                    <Button color='danger'>Remove Items</Button>
                </Stack>
            </Center>
        </>
    );
};

export default BlankPage;
