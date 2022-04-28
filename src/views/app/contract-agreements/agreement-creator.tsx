import React from 'react';
import { Row } from 'reactstrap';
import { useIntl } from 'react-intl';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
    Center,
    Input,
    Grid,
    Skeleton,
    Divider,
    Stack,
    Select,
    Switch,
    Group,
    ScrollArea,
    Modal,
    Tooltip
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { Card, CardBody } from 'reactstrap';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux';
import { ContractHelper } from '../../../helpers/ContractHelper';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import { MdCalendarToday} from 'react-icons/md';
import { HiChevronLeft, HiChevronRight, HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import { DateTime } from 'luxon';
import { Button } from 'reactstrap'; 
import { GoPlus } from 'react-icons/go';
import AddSigner, { SignerElement } from './add-signer';
import { AiOutlineDrag } from 'react-icons/ai';

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


// luxon today date
const today = DateTime.local();

const AgreementCreator: React.FC = () => {
    const match = useLocation();
    const intl = useIntl();
    const [agreementName, setAgreementName] = React.useState('');
    const [numPages, setNumPages] = React.useState(null);
    const [pageNumber, setPageNumber] = React.useState(1);
    const { contractId } = useParams();
    const [pdf, setPdf] = React.useState('');
    const [pdfLoading, setPdfLoading] = React.useState(true);
    const [pdfThumbnails, setPdfThumbnails] = React.useState<{[id: string]: string;}>({});
    const [thumbnailsLoading, setThumbnailsLoading] = React.useState(true);
    const [showEndDate, setShowEndDate] = React.useState(false);
    const [endDate, setEndDate] = React.useState<DateTime>(() => {const endDate = today.plus({ months: 6 }); return endDate;});
    const [templateDate, setTemplateDate] = React.useState<string>('6');
    const [, setSignedBefore] = React.useState<Date | null>();
    const [showSignerModal, setShowSignerModal] = React.useState(false);

    const canvasRef = React.useRef<HTMLDivElement>(null);

    const [inputElements, setInputElements] = React.useState<PositionType[]>(
        [{ x: 300, y: 170}],
    );
    const [isDragging, setIsDragging] = React.useState<boolean | null>(null);
    const [mousePosition, setMousePosition] = React.useState<PositionType>({
        x: 0,
        y: 0,
    });

    const dispatchFn = useDispatch<AppDispatch>();
    const contractHelper = React.useMemo(
        () => new ContractHelper(dispatchFn),
        [dispatchFn]
    );
    const navigate = useNavigate();

    const spawnInput = () => {
        setIsDragging(true);
    };

    const onAddSigner = (signers:SignerElement[]) => {
        console.log({signers});
        setShowSignerModal(false);
    }

    function onDocumentLoadSuccess({ numPages }: any) {
        setNumPages(numPages);
    }

    const onPreviousPage = () => {
        setPageNumber((prev) => {
            if (numPages === null) {
                return 1;
            }
            if (prev === 1) {
                return 1;
            }
            return prev - 1;
        });
    }

    const onNextPage = () => {
        setPageNumber((prev) => {
            if (numPages === null) {
                return 1;
            }
            if (prev === numPages) {
                return numPages;
            }
            return prev + 1;
        });
    }

    const onFirstPage = () => {
        setPageNumber(1);
    }

    const onLastPage = () => {
        if (numPages === null) {
            setPageNumber(1);   
        } else {
            setPageNumber(numPages);
        }
    }

    React.useEffect(() => {
        if (contractId) {
            contractHelper
                .getPdfDocument(contractId)
                .then((pdf) => {
                    setPdf(pdf);
                })
                .catch((error) => {
                    console.log(error);
                    toast.error('Error loading pdf');
                })
                .finally(() => {
                    setPdfLoading(false);
                });

            contractHelper
                .getPdfThumbnails(contractId)
                .then((thumbnails) => {
                    setPdfThumbnails(thumbnails);
                })
                .catch((error) => {
                    console.log(error);
                    toast.error('Error loading pdf thumbnails');
                })
                .finally(() => {
                    setThumbnailsLoading(false);
                });
        } else {
            toast.error('Cannot Find Document. Redirecting to Contract List');
            setTimeout(() => {
                navigate('/agreements');
            }, 4000);
        }
    }, [contractHelper, contractId, navigate]);

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
                    <Breadcrumb
                        heading="contract-agreement.agreement-creator"
                        match={match}
                    />
                    <Separator className="mb-14" />
                </Colxx>
            </Row>
            <Center className="mb-14">
                <Input
                    className="center-input"
                    style={{ minWidth: '300px', width: '40%' }}
                    size="xl"
                    onChange={(event: React.FormEvent<HTMLInputElement>) => {
                        setAgreementName(event.currentTarget.value);
                    }}
                    value={agreementName}
                    placeholder={intl.formatMessage({
                        id: 'agreement-creator.title-placeholder',
                    })}
                />
            </Center>
            <Grid columns={20}>
                <Grid.Col span={3}>
                    <div className='flex items-center justify-center mb-2'>
                        <Button
                            className="contract-agreements-create-new flex h-14 items-center justify-center"
                            color="primary"
                            onClick={() => {
                                setShowSignerModal(true);
                            }}
                            style={{width: '170px'}}
                        >
                            <i className='mr-2'>
                                <GoPlus />
                            </i>
                            <span>Add Signers</span>
                        </Button>
                    </div>
                </Grid.Col>
                <Grid.Col span={14}>
                </Grid.Col>
                <Grid.Col span={3}>
                    <div className='flex items-center justify-center mb-2'>
                        <Button
                            className="contract-agreements-create-new flex h-14 items-center justify-center"
                            color="secondary"
                            style={{width: '170px'}}
                        >
                            <i className='mr-2'>
                                <GoPlus />
                            </i>
                            <span>Save As Template</span>
                        </Button>
                    </div>
                </Grid.Col>
            </Grid>

            <Grid columns={20}>
                <Grid.Col span={3}>
                    <Card style={{ height: '1080px' }}>
                        <CardBody className='p-0'>
                            <div className="text-center text-lg py-4">
                                Signing Workflow
                            </div>
                            <Divider className="mb-4" />
                            <p className='text-xs px-3 text-slate-400 italic'>Drag and drop signers on document</p>
                            <Stack style={{ userSelect: 'none' }} className='px-3 my-4'>
                                <Tooltip color='red' position='left' placement='start' opened label='Signer 1' withArrow>
                                    <Stack className='p-3 bg-red-100'>
                                        <Group onMouseDown={spawnInput} position='apart' className='border-2 cursor-pointer border-slate-300 rounded-sm bg-white p-2 text-slate-400'>
                                            <span>Name Field</span>
                                            <i><AiOutlineDrag /></i>
                                        </Group>
                                        <Group position='apart' className='border-2 cursor-pointer border-slate-300 rounded-sm bg-white p-2 text-slate-400'>
                                            <span>Signature</span>
                                            <i><AiOutlineDrag /></i>
                                        </Group>
                                        <Group position='apart' className='border-2 cursor-pointer border-slate-300 rounded-sm bg-white p-2 text-slate-400'>
                                            <span>Date Field</span>
                                            <i><AiOutlineDrag /></i>
                                        </Group>
                                    </Stack>
                                </Tooltip>
                                <Tooltip color='blue' position='left' placement='start' opened label='Signer 2' withArrow>
                                    <Stack className='p-3 bg-blue-100'>
                                        <Group position='apart' className='border-2 cursor-pointer border-slate-300 rounded-sm bg-white p-2 text-slate-400'>
                                            <span>Name Field</span>
                                            <i><AiOutlineDrag /></i>
                                        </Group>
                                        <Group position='apart' className='border-2 cursor-pointer border-slate-300 rounded-sm bg-white p-2 text-slate-400'>
                                            <span>Signature</span>
                                            <i><AiOutlineDrag /></i>
                                        </Group>
                                        <Group position='apart' className='border-2 cursor-pointer border-slate-300 rounded-sm bg-white p-2 text-slate-400'>
                                            <span>Date Field</span>
                                            <i><AiOutlineDrag /></i>
                                        </Group>
                                    </Stack>
                                </Tooltip>
                            </Stack>
                        </CardBody>
                    </Card>
                </Grid.Col>
                <Grid.Col span={14}>
                    <Card style={{ height: '1080px' }}>
                        <CardBody>
                            <Center>
                                {pdfLoading && <Skeleton height={750} width={613} />}
                                {!pdfLoading && (
                                    <div>
                                        <Document
                                            loading={<Skeleton height={750} />}
                                            options={{ workerSrc: "/pdf.worker.js" }}
                                            file={
                                                'data:application/pdf;base64,' + pdf
                                            }
                                            onLoadSuccess={onDocumentLoadSuccess}
                                        >
                                            <Page
                                                loading={<Skeleton height={750} />}
                                                pageNumber={pageNumber}
                                                height={1024}
                                                
                                            />
                                        </Document>
                                    </div>
                                )}
                            </Center>
                        </CardBody>
                    </Card>
                </Grid.Col>
                <Grid.Col span={3}>
                    <Card style={{ height: '1080px' }}>
                        <CardBody className='p-0'>
                            <div className="text-center text-lg py-4">
                                Page Navigation
                            </div>
                            <Divider className='mb-4' />
                            <Center className='mb-4'>
                                <div className='text-2xl'>
                                    <HiChevronDoubleLeft 
                                        onClick={onFirstPage}
                                        className='cursor-pointer'
                                    />
                                </div>
                                <div className="text-2xl">
                                    <HiChevronLeft
                                        onClick={onPreviousPage}
                                        className="cursor-pointer"
                                    />
                                </div>
                                <div className="px-1">
                                    Page: {pageNumber} / {numPages}
                                </div>
                                <div className="text-2xl">
                                    <HiChevronRight
                                        onClick={onNextPage}
                                        className="cursor-pointer"
                                    />
                                </div>
                                <div className='text-2xl'>
                                    <HiChevronDoubleRight
                                        onClick={onLastPage}
                                        className='cursor-pointer'
                                    />
                                </div>
                            </Center>
                            <Center>
                                {thumbnailsLoading && (
                                    <Stack>
                                        <Skeleton height={150} width={120} />
                                        <Skeleton height={10} width={120} />
                                    </Stack>
                                )}
                                {!thumbnailsLoading && (
                                    <ScrollArea
                                        style={{
                                            height: 290,
                                            overflowY: 'scroll',
                                            width: '70%',
                                        }}
                                        className="rounded-md"
                                    >
                                        <Stack spacing={2}>
                                            {Object.keys(pdfThumbnails).map(
                                                (key) => {
                                                    return (
                                                        <div
                                                            key={key}
                                                            className="flex flex-col justify-center items-center"
                                                        >
                                                            <span
                                                                className={classNames('border-4',
                                                                    {'border-sky-500': pageNumber === parseInt(key) +1,},
                                                                    {'border-gray-300': pageNumber !== parseInt(key) +1,},
                                                                    'cursor-pointer'
                                                                )}
                                                            >
                                                                <img
                                                                    src={'data:image/jpeg;base64,' +pdfThumbnails[key]}
                                                                    style={{ height: 100, }} alt="Page" onClick={() => {setPageNumber(parseInt(key) + 1);}}
                                                                />
                                                            </span>
                                                            <p className="text-center text-sm">
                                                                {parseInt(key) +1}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </Stack>
                                    </ScrollArea>
                                )}
                            </Center>
                            <Divider className="my-4" />
                            <div className="text-center text-lg mb-5">Settings</div>
                            <Divider className="my-4" />
                            <Stack spacing={'lg'} className='px-4'>
                                <Group position="apart">
                                    <div>Has end date?</div>
                                    <Switch checked={showEndDate} onChange={(checked) => { setShowEndDate(checked.target.checked) }} size="md"></Switch>
                                </Group>
                                {showEndDate && <div>End Date<br /><span>{ endDate.toLocaleString(DateTime.DATE_HUGE) }</span></div>}
                                {showEndDate && <Stack spacing={1}>
                                    <Select
                                        style={{width: 120}}
                                        placeholder="Select End Date"
                                        defaultValue={templateDate}
                                        value={templateDate}
                                        onChange={(value) => {
                                            if (value !== null) {
                                                setTemplateDate(value);
                                                const months = parseInt(value);
                                                setEndDate(today.plus({ months }));
                                            }
                                        }}
                                        data={[
                                            { value: '1', label: '1 month' },
                                            { value: '6', label: '6 months' },
                                            { value: '12', label: '1 year' },
                                            { value: '24', label: '2 years' },
                                            { value: '36', label: '3 years' },
                                        ]}
                                    />
                                    <div>OR</div>
                                    <DatePicker 
                                        onChange={(value) => {
                                            if (value !== null) {
                                                setTemplateDate('');
                                                setEndDate(DateTime.fromJSDate(value));
                                            }
                                        }}
                                        value={endDate.toJSDate()}
                                        inputFormat="DD/MM/YYYY"
                                        defaultValue={endDate.toJSDate()} 
                                        excludeDate={(dt) => dt < today.toJSDate()} 
                                        icon={<MdCalendarToday />} 
                                        style={{width: 150}} 
                                        placeholder='Select Date' 
                                    />
                                </Stack>}
                            </Stack>
                            <div className='mt-4 px-4'>
                                <DatePicker
                                    label="Document must be signed by"
                                    onChange={(value) => {
                                        setSignedBefore(value);
                                    }}
                                    excludeDate={(dt) => dt < today.toJSDate()} 
                                    icon={<MdCalendarToday />} 
                                    placeholder='Select Date'
                                /> 
                            </div>
                        </CardBody>
                    </Card>
                </Grid.Col>
            </Grid>
            <Modal size='90%' centered title='Add Signers' opened={showSignerModal} onClose={() => setShowSignerModal(false)}>
                {showSignerModal && <AddSigner onConfirmAddSigner={onAddSigner} onCancelAddSigner={() => {setShowSignerModal(false)}} />}
            </Modal>
            {isDragging && <DraggableInput pos={mousePosition} />}
        </>
    );
};

export default AgreementCreator;
