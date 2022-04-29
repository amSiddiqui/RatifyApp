import React from 'react';
import { Row } from 'reactstrap';
import IntlMessages from '../../helpers/IntlMessages';
import { Colxx, Separator } from '../../components/common/CustomBootstrap';
import Breadcrumb from '../../containers/navs/Breadcrumb';
import { useLocation } from 'react-router-dom';
import { Center, Grid, Stack } from '@mantine/core';
import { Card, CardBody } from 'reactstrap';
import DraggableInput from './contract-agreements/form-elements/DraggableInput';
import { PositionType, POSITION_OFFSET_X, POSITION_OFFSET_Y } from './contract-agreements/types';
import PdfFormInput, { PdfFormInputType } from './contract-agreements/form-elements/PdfFormInput';

const BlankPage = () => {
    const match = useLocation();

    const canvasRef = React.useRef<HTMLDivElement>(null);

    const [inputElements, setInputElements] = React.useState<PdfFormInputType[]>(
        [{ x: 260, y: 180, color: 'blue'}],
    );
    const [isDragging, setIsDragging] = React.useState<boolean | null>(null);
    const [mousePosition, setMousePosition] = React.useState<PositionType>({
        x: 0,
        y: 0,
    });
    
    const spawnInput = () => {
        setIsDragging(true);
    };

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || isDragging === null) {
            return;
        }
        if (!isDragging) {
            // check if mousePosition inside canvas
            const bounds = canvas.getBoundingClientRect();
            const x = mousePosition.x - bounds.left;
            const y = mousePosition.y - bounds.top;
            if (x < 0 || x > bounds.width || y < 0 || y > bounds.height) {
            } else {
                setInputElements(prev => [...prev, {x, y, color: 'red'}]);
            }
        }
    }, [isDragging, mousePosition]);

    React.useLayoutEffect(() => {
        const onmouseup = () => {
            setIsDragging(false);
        };

        const onmousemove = (event: MouseEvent) => {
            if (isDragging) {
                setMousePosition({ x: event.clientX, y: event.clientY });
            }
        };

        window.addEventListener('mouseup', onmouseup);
        window.addEventListener('mousemove', onmousemove);

        return () => {
            window.removeEventListener('mouseup', onmouseup);
            window.removeEventListener('mousemove', onmousemove);
        };
    }, [isDragging]);

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

            <Grid columns={20}>
                <Grid.Col span={3}>
                    <Card>
                        <CardBody
                            style={{
                                height: '800px',
                            }}
                        >
                            <Stack>
                                <Center>
                                    <div
                                        onMouseDown={spawnInput}
                                        style={{
                                            height: '65px',
                                            width: '65px',
                                        }}
                                        className="rounded-md shadow-md bg-blue-100"
                                    >
                                        <Center
                                            className="cursor-pointer"
                                            style={{
                                                height: '65px',
                                                color: 'black',
                                                fontSize: '2rem',
                                                userSelect: 'none',
                                            }}
                                        >
                                            T
                                        </Center>
                                    </div>
                                </Center>
                            </Stack>
                        </CardBody>
                    </Card>
                </Grid.Col>
                <Grid.Col span={17}>
                    <Center>
                        <div
                            style={{ height: '1080px', width: '825px' }}
                            className="relative"
                        >
                            <div
                                ref={canvasRef}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: '1080px',
                                    width: '825px',
                                }}
                            >
                                {inputElements.map((element, index) => {
                                    return (
                                        <PdfFormInput
                                            key={index}
                                            color={element.color}
                                            x={element.x - POSITION_OFFSET_X}
                                            y={element.y - POSITION_OFFSET_Y}                                            
                                        />   
                                    );
                                })}
                            </div>
                            <img
                                src="/static/img/sample_pdf.jpg"
                                alt="PDF"
                                style={{
                                    height: '1080px',
                                    width: '825px',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                }}
                            />
                        </div>
                    </Center>
                </Grid.Col>
            </Grid>    
            {isDragging && <DraggableInput color='red' placeholder='Full Name' pos={mousePosition} />}
        </>
    );
};

export default BlankPage;
