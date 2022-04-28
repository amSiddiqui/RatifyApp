import React from 'react';
import { Row } from 'reactstrap';
import IntlMessages from '../../helpers/IntlMessages';
import { Colxx, Separator } from '../../components/common/CustomBootstrap';
import Breadcrumb from '../../containers/navs/Breadcrumb';
import { useLocation } from 'react-router-dom';
import { Center, Grid, Stack } from '@mantine/core';
import { Card, CardBody } from 'reactstrap';

const INPUT_WIDTH = 150;
const INPUT_HEIGHT = 20;

const POSITION_OFFSET_X = INPUT_WIDTH / 2;
const POSITION_OFFSET_Y = INPUT_HEIGHT / 2;

type PositionType = {
    x: number;
    y: number;
};

const DraggableInput: React.FC<{ pos: PositionType }> = ({ pos }) => {

    return (
        <div
            style={{
                position: 'fixed',
                top: pos.y - POSITION_OFFSET_Y,
                left: pos.x - POSITION_OFFSET_X,
                zIndex: 100,
                userSelect: 'none',
            }}
        >
            <div
                style={{
                    width: INPUT_WIDTH,
                    height: INPUT_HEIGHT,
                    backgroundColor: 'rgba(50,160,216, 0.9)',
                }}
                className="z-10 text-white flex justify-center items-center cursor-pointer"
            >
                Name
            </div>
        </div>
    );
};

const BlankPage = () => {
    const match = useLocation();

    const canvasRef = React.useRef<HTMLDivElement>(null);

    const [inputElements, setInputElements] = React.useState<PositionType[]>(
        [{ x: 300, y: 170}],
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
                setInputElements(prev => [...prev, {x, y}]);
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
                                        <input
                                            className='pdf-input-element'
                                            key={index}
                                            style={{                                           
                                                zIndex: 2,
                                                position: 'absolute',
                                                top:
                                                    element.y -
                                                    POSITION_OFFSET_Y,
                                                left:
                                                    element.x -
                                                    POSITION_OFFSET_X,
                                            }}
                                            placeholder="First Name"
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
            {isDragging && <DraggableInput pos={mousePosition} />}
        </>
    );
};

export default BlankPage;
