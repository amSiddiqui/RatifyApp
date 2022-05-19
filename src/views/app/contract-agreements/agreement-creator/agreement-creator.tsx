import React from 'react';
import { Row } from 'reactstrap';
import { useIntl } from 'react-intl';
import { Colxx, Separator } from '../../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../../containers/navs/Breadcrumb';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
    Center,
    TextInput,
    Grid,
    Skeleton,
    Divider,
    Stack,
    Select,
    Switch,
    Group,
    ScrollArea,
    Modal,
    Tooltip,
    Textarea,
    Autocomplete,
    Menu,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { Card, CardBody } from 'reactstrap';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../redux';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import { MdCalendarToday } from 'react-icons/md';
import {
    HiChevronLeft,
    HiChevronRight,
    HiChevronDoubleLeft,
    HiChevronDoubleRight,
} from 'react-icons/hi';
import { DateTime } from 'luxon';
import { Button } from 'reactstrap';
import { GoPlus } from 'react-icons/go';
import AddSigner from './add-signer';
import { SignerElement } from '../../../../types/ContractTypes';
import { AiOutlineDrag } from 'react-icons/ai';
import DraggableInput from '../form-elements/DraggableInput';
import { getBgColorLight, PositionType, POSITION_OFFSET_X, POSITION_OFFSET_Y, PdfFormInputType, INPUT_WIDTH, INPUT_HEIGHT, SIGN_POSITION_OFFSET_Y } from '../types';
import PdfFormInput from '../form-elements/PdfFormInput';
import { getRandomStringID } from '../../../../helpers/Utils';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import PrepareSend from './prepare-send';

// luxon today date
const today = DateTime.local();
const GRID_COLUMNS = 20;
const GRID_SIDE = 3;
const GRID_CENTER = 14;

const getBounds = (div: HTMLDivElement | null) => {
    if (div === null) {
        return null;
    }

    const rect = div.getBoundingClientRect();
    return {
        top: 0,
        left: 0,
        right: rect.width - INPUT_WIDTH, 
        bottom: rect.height - INPUT_HEIGHT,
    };
}

const AgreementCreator: React.FC = () => {
    const match = useLocation();
    const intl = useIntl();
    const [agreementName, setAgreementName] = React.useState('');
    const [dbAgreementName] = useDebouncedValue(agreementName, 1000);
    
    const [numPages, setNumPages] = React.useState(null);
    const [pageNumber, setPageNumber] = React.useState(1);
    const { contractId } = useParams();
    const [pdf, setPdf] = React.useState('');
    const [pdfLoading, setPdfLoading] = React.useState(true);
    const [pdfThumbnails, setPdfThumbnails] = React.useState<{[id: string]: string;}>({});
    const [thumbnailsLoading, setThumbnailsLoading] = React.useState(true);
    
    const [showEndDate, setShowEndDate] = React.useState(false);
    const [endDate, setEndDate] = React.useState<DateTime>(() => {
        const endDate = today.plus({ months: 6 });
        return endDate;
    });
    const [signSequence, setSignSequence] = React.useState<boolean>(false);
    
    const [templateDate, setTemplateDate] = React.useState<string>('6');
    const [signedBefore, setSignedBefore] = React.useState<Date | null>();
    const [showSignerModal, setShowSignerModal] = React.useState(false);
    const [{dragInputText, dragInputColor, dragInputId, dragInputType}, setDragInputProps] = React.useState({dragInputText: 'Full Name', dragInputColor: 'red', dragInputId: -1, dragInputType: 'name'},);
    const [signers, setSigners] = React.useState<SignerElement[]>([]);

    const canvasRef = React.useRef<HTMLDivElement>(null);

    const inputElementsFirstCall = React.useRef(true);
    const titleFirstCall = React.useRef(true);
    const dateFirstCall = React.useRef(true);
    const inputElementsSynchronized = React.useRef(false);

    const [inputElements, setInputElements] = React.useState<PdfFormInputType[]>([]);

    const [isDragging, setIsDragging] = React.useState<boolean | null>(null);
    const [mousePosition, setMousePosition] = React.useState<PositionType>({
        x: 0,
        y: 0,
    });

    const [showSaveTemplate, saveTemplateHandlers] = useDisclosure(false);
    const [templateCategories, setTemplateCategories] = React.useState<string[]>([]);
    const [{templateCategory, templateName, templateDescription}, setTemplateProps] = React.useState({templateCategory: '', templateName: '', templateDescription: ''});
    const [templateSaved, setTemplateSaved] = React.useState(false);
    const [templateError, setTemplateError] = React.useState(false);

    const [prepareSend, prepareSendHandler] = useDisclosure(false);
    const [showAgreementErrors, setShowAgreementErrors] = React.useState(false);

    const dispatchFn = useDispatch<AppDispatch>();
    const contractHelper = React.useMemo(
        () => new ContractHelper(dispatchFn),
        [dispatchFn],
    );
    const navigate = useNavigate();

    const onAddSigner = React.useCallback((newSigners: SignerElement[]) => {
        if (contractId) {
            contractHelper.syncSigners(contractId, newSigners).then((data) => {
                const ids = data.ids;
                for (const signer of newSigners) {
                    signer.id = ids[signer.uid];
                }
                setSigners(newSigners);
            }).catch(err => {
                console.log(err);
                toast.error('Error adding signers');
            });
        }

        setShowSignerModal(false);
    }, [contractId, contractHelper]);

    const onSetSignerSequence = React.useCallback((signSequence: boolean) => {
        setSignSequence(signSequence);
    }, []);

    const onPrepareSend = React.useCallback(() => {
        if (agreementName.length === 0) {
            setShowAgreementErrors(true);
            toast.error('Please enter agreement title');
            return;
        }
        prepareSendHandler.open();
    }, [agreementName, prepareSendHandler]);

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
    };

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
    };

    const onFirstPage = () => {
        setPageNumber(1);
    };

    const onLastPage = () => {
        if (numPages === null) {
            setPageNumber(1);
        } else {
            setPageNumber(numPages);
        }
    };

    const onSaveTemplate = () => {
        if (templateName === '') {
            setTemplateError(true);
            return;
        }
        setTemplateError(false);
        if (!contractId) {
            return;
        }
        contractHelper.saveAgreementTemplate(contractId, templateName, templateDescription, templateCategory)
        .then(_ => {
            setTemplateSaved(true);
            setTemplateProps({templateCategory: '', templateName: '', templateDescription: ''});
            toast.success('Template created');
            saveTemplateHandlers.close();
        })
        .catch(err => {
            console.log(err);
            toast.error('Error creating template');
        });
    }

    React.useEffect(() => {
        if (contractId) {
            contractHelper.getAgreement(contractId).then((data) => {
                const agreement = data.agreement;
                const agreement_signers = data.signers;
                const agreement_input_fields = data.input_fields;
                setAgreementName(agreement.title);
                if (agreement.end_date !== null) {
                    setShowEndDate(true);
                    setEndDate(DateTime.fromISO(agreement.end_date));
                    setTemplateDate('');
                }
                if (agreement.signed_before !== null) {
                    setSignedBefore(new Date(agreement.signed_before));
                }
                setSignSequence(agreement.sequence);

                setSigners(agreement_signers.map((s) => ({
                    id: s.id,
                    uid: s.id.toString(),
                    step: s.step,
                    color: s.color,
                    type: s.type,
                    name: s.name,
                    email: s.email,
                    job_title: s.job_title,
                    text_field: s.text_field,
                    every: s.every,
                    every_unit: s.every_unit,
                } as SignerElement )));

                setInputElements(agreement_input_fields.map((i) => ({
                    id: i.id,
                    signerId: i.signer,
                    placeholder: i.placeholder,
                    color: i.color,
                    x: i.x,
                    y: i.y,
                    uid: i.id.toString(),
                    type: i.type,
                    page: i.page
                } as PdfFormInputType)));

                const doc_id = data.agreement.documents[0];
                contractHelper
                    .getPdfDocument(doc_id.toString())
                    .then((pdf) => {
                        setPdf(pdf);
                    })
                    .catch((error) => {
                        throw error;
                    })
                    .finally(() => {
                        setPdfLoading(false);
                    });
    
                contractHelper
                    .getPdfThumbnails(doc_id.toString())
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
            }).catch(err => {
                console.log(err);
                if (err.response && err.response.status === 404) {
                    navigate(`/documents/?error=404`);
                } else {
                    navigate(`/documents/?error=500`);
                }
            });

        } else {
            toast.error('Cannot Find Document. Redirecting to Contract List');
            setTimeout(() => {
                navigate('/documents');
            }, 4000);
        }
    }, [contractHelper, contractId, navigate]);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || isDragging === null || isDragging === true) {
            return;
        }
        if (!isDragging) {
            // check if mousePosition inside canvas
            setIsDragging(null);
            setMousePosition({x: 0, y: 0});
            const bounds = canvas.getBoundingClientRect();
            const x = mousePosition.x - bounds.left;
            const y = mousePosition.y - bounds.top;
            if (x < 0 || x > bounds.width || y < 0 || y > bounds.height) {
            } else {
                setInputElements((prev) => [...prev, { 
                    x: x - POSITION_OFFSET_X, y: dragInputType === 'signature' ? y - SIGN_POSITION_OFFSET_Y : y - POSITION_OFFSET_Y, 
                    color: dragInputColor, 
                    placeholder: dragInputText, 
                    signerId: dragInputId, 
                    page: pageNumber, 
                    uid: getRandomStringID(),
                    id: -1,
                    type: dragInputType
                }]);
            }
        }
    }, [isDragging, mousePosition, dragInputColor, dragInputId, dragInputText, pageNumber, dragInputType]);
    
    React.useEffect(() => {
        if (!contractId || pdfLoading) {
            return;
        }
        if (!titleFirstCall.current) {
            contractHelper.updateAgreementTitle(contractId, dbAgreementName, '').catch(err => {
                toast.error('Error updating agreement title');
            });
        } else {
            titleFirstCall.current = false;
        }
    }, [dbAgreementName, contractHelper, contractId, pdfLoading]);

    React.useEffect(() => {
        if (!contractId || pdfLoading) {
            return;
        }
        if (dateFirstCall.current) {
            dateFirstCall.current = false;
            return;
        }
        let ed:string | null = endDate.toISO();
        if (!showEndDate) {
            ed = null;
        }
        contractHelper.updateAgreementDateSequence(contractId, ed, signedBefore ? DateTime.fromJSDate(signedBefore).toISO() : null, signSequence).catch(err => {
            toast.error('Error updating agreement');
        });
    }, [contractId, contractHelper, endDate, signedBefore, showEndDate, signSequence, pdfLoading]);

    React.useEffect(() => {
        if (pdfLoading || !contractId) {
            return;
        }
        if (inputElementsFirstCall.current) {
            inputElementsFirstCall.current = false;
            return;
        }
        if (!inputElementsSynchronized.current) {
            contractHelper.syncInputField(contractId, inputElements).then(data => {
                const ids = data.ids;
                setInputElements(prev => {
                    const newInputElements = [...prev];
                    for (const inputElement of newInputElements) {
                        inputElement.id = ids[inputElement.uid];
                    }
                    return newInputElements;
                })
            });
            inputElementsSynchronized.current = true;
        } else {
            inputElementsSynchronized.current = false;
        }
    }, [inputElements, pdfLoading, contractId, contractHelper]);

    React.useEffect(() => {
        contractHelper.getAgreementTemplateCategories().then(data => {
            setTemplateCategories(data);
        }).catch(err => {
            console.log(err);  
        });
    }, [contractHelper]);

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
                <TextInput
                    className="center-input"
                    style={{ minWidth: '300px', width: '40%' }}
                    size="xl"
                    error={showAgreementErrors && agreementName.length === 0 }
                    onChange={(event: React.FormEvent<HTMLInputElement>) => {
                        setAgreementName(event.currentTarget.value);
                    }}
                    value={agreementName}
                    placeholder={intl.formatMessage({
                        id: 'agreement-creator.title-placeholder',
                    })}
                />
            </Center>
            <Grid columns={GRID_COLUMNS}>
                <Grid.Col span={GRID_SIDE}>
                    <div className="flex items-center justify-center mb-2">
                        <Button
                            className="contract-agreements-create-new flex h-14 items-center justify-center"
                            color="primary"
                            onClick={() => {
                                setShowSignerModal(true);
                            }}
                            style={{ width: '170px' }}
                        >
                            <i className="mr-2">
                                <GoPlus />
                            </i>
                            <span>Add Signers</span>
                        </Button>
                    </div>
                </Grid.Col>
                <Grid.Col span={GRID_CENTER}></Grid.Col>
                <Grid.Col span={GRID_SIDE}>
                    <div className="flex items-center justify-center mb-2">
                        <Button
                            onClick={() => {
                                saveTemplateHandlers.open();
                            }}
                            className="contract-agreements-create-new flex h-14 items-center justify-center"
                            color="secondary"
                            style={{ width: '170px' }}
                        >
                            <i className="mr-2">
                                <GoPlus />
                            </i>
                            <span>Save As Template</span>
                        </Button>
                    </div>
                </Grid.Col>
            </Grid>

            <Grid columns={GRID_COLUMNS}>
                <Grid.Col span={GRID_SIDE}>
                    <Card style={{ height: '1080px' }}>
                        <CardBody className="p-0">
                            <h5 className="text-center py-4">
                                Signing Workflow
                            </h5>
                            <Divider className="mb-4" />
                            <p className="text-xs px-3 text-slate-400 italic">
                                Drag and drop signers on document
                            </p>
                            <Stack
                                style={{ userSelect: 'none' }}
                                className="px-3 my-4"
                            >
                                {signers.map((signer, index) => {
                                    return (
                                        <Tooltip
                                            key={signer.id}
                                            zIndex={1}
                                            color={signer.color}
                                            position="left"
                                            placement="start"
                                            opened
                                            label={signer.type.charAt(0).toUpperCase() + signer.type.slice(1) + ' ' + (index + 1)}
                                            withArrow
                                        >
                                            <Stack className={"p-3 "+getBgColorLight(signer.color)}>
                                                <p className='mb-0 text-muted text-center'>{signer.name}</p>
                                                <Group
                                                    onMouseDown={() => {
                                                        setDragInputProps({
                                                            dragInputColor: signer.color,
                                                            dragInputId: signer.id,
                                                            dragInputText: 'Full Name',
                                                            dragInputType: 'name'
                                                        });
                                                        setIsDragging(true);
                                                    }}
                                                    position="apart"
                                                    className="border-2 cursor-pointer border-slate-300 rounded-sm bg-white p-2 text-slate-400"
                                                >
                                                    <span>Name Field</span>
                                                    <i>
                                                        <AiOutlineDrag />
                                                    </i>
                                                </Group>
                                                <Group
                                                    onMouseDown={() => {
                                                        setDragInputProps({
                                                            dragInputColor: signer.color,
                                                            dragInputId: signer.id,
                                                            dragInputText: 'Signature',
                                                            dragInputType: 'signature'
                                                        });
                                                        setIsDragging(true);
                                                    }}
                                                    position="apart"
                                                    className="border-2 cursor-pointer border-slate-300 rounded-sm bg-white p-2 text-slate-400"
                                                >
                                                    <span>Signature</span>
                                                    <i>
                                                        <AiOutlineDrag />
                                                    </i>
                                                </Group>
                                                <Group
                                                    onMouseDown={() => {
                                                        setDragInputProps({
                                                            dragInputColor: signer.color,
                                                            dragInputId: signer.id,
                                                            dragInputText: 'Date',
                                                            dragInputType: 'date',
                                                        });
                                                        setIsDragging(true);
                                                    }}
                                                    position="apart"
                                                    className="border-2 cursor-pointer border-slate-300 rounded-sm bg-white p-2 text-slate-400"
                                                >
                                                    <span>Date Field</span>
                                                    <i>
                                                        <AiOutlineDrag />
                                                    </i>
                                                </Group>
                                            </Stack>
                                        </Tooltip>
                                    )
                                })}
                                {signers.length > 0 && (
                                    <Group position='right'>
                                        <div className='px-3 py-1 transition cursor-pointer shadow-sm hover:scale-110' onClick={() => {setShowSignerModal(true);}}>
                                            <span className='relative' style={{top: '1px'}}><i className='simple-icon-pencil text-xs relative mr-1'></i></span>
                                            <span className='mr-1'>Edit</span>
                                        </div>
                                    </Group>
                                )}
                            </Stack>
                        </CardBody>
                    </Card>
                </Grid.Col>
                <Grid.Col span={GRID_CENTER}>
                    <Card style={{ height: '1080px' }}>
                        <CardBody>
                            <Center>
                                {pdfLoading && (
                                    <Skeleton height={1024} style={{zIndex: 0}} width={613} />
                                )}
                                {!pdfLoading && (
                                    <div>
                                        <div
                                            ref={canvasRef}
                                            style={{
                                                height: '1024px',
                                                width: '791px',
                                                position: 'absolute',
                                                top: '28px',
                                                zIndex: '1',
                                            }}
                                            className="bg-transparent"
                                            id='pdf-form-input-container'
                                        >
                                            {inputElements.map(
                                                (element, index) => {
                                                    if (element.page === pageNumber) {
                                                        return (
                                                            <PdfFormInput
                                                                bounds={getBounds(canvasRef.current)}
                                                                offsetParent={canvasRef.current ? canvasRef.current : undefined}
                                                                onReposition={(dx, dy) => {
                                                                    setInputElements(prev => {
                                                                        const newInputElements = [...prev];
                                                                        newInputElements[index].x = dx;
                                                                        newInputElements[index].y = dy;
                                                                        return newInputElements;
                                                                    })
                                                                }}
                                                                placeholder={element.placeholder}
                                                                key={element.uid}
                                                                onDelete={() => {
                                                                        setInputElements((prev) => {
                                                                            const newElements = prev.filter((e, i) => i !== index);
                                                                            return newElements;
                                                                        },
                                                                    );
                                                                }}
                                                                color={element.color}
                                                                x={element.x}
                                                                y={element.y}
                                                                type={element.type}
                                                            />
                                                        );
                                                    } else {
                                                        return null;
                                                    }
                                                },
                                            )}
                                        </div>
                                        <Document
                                            loading={<Skeleton height={1080} />}
                                            options={{
                                                workerSrc: '/pdf.worker.js',
                                            }}
                                            file={
                                                'data:application/pdf;base64,' +
                                                pdf
                                            }
                                            onLoadSuccess={
                                                onDocumentLoadSuccess
                                            }
                                        >
                                            <Page
                                                loading={
                                                    <Skeleton height={1080} />
                                                }
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
                <Grid.Col span={GRID_SIDE}>
                    <Card style={{ height: '1080px' }}>
                        <CardBody className="p-0">
                            <h5 className="text-center py-4">
                                Page Navigation
                            </h5>
                            <Divider className="mb-4" />
                            <Center className="mb-4">
                                <div className="text-2xl">
                                    <HiChevronDoubleLeft
                                        onClick={onFirstPage}
                                        className="cursor-pointer"
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
                                <div className="text-2xl">
                                    <HiChevronDoubleRight
                                        onClick={onLastPage}
                                        className="cursor-pointer"
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
                                                                className={classNames(
                                                                    'border-4',{ 'border-sky-500': pageNumber === parseInt( key, ) + 1,},
                                                                    { 'border-gray-300': pageNumber !== parseInt( key, ) +1,},
                                                                    'cursor-pointer',
                                                                )}
                                                            >
                                                                <img
                                                                    src={ 'data:image/jpeg;base64,' + pdfThumbnails[ key ] }
                                                                    style={{
                                                                        height: 100,
                                                                    }}
                                                                    alt="Page"
                                                                    onClick={() => { setPageNumber( parseInt( key, ) + 1, );
                                                                    }}
                                                                />
                                                            </span>
                                                            <p className="text-center text-sm">
                                                                {parseInt(key) + 1}
                                                            </p>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </Stack>
                                    </ScrollArea>
                                )}
                            </Center>
                            <Divider className="my-4" />
                            <h5 className="text-center mb-5">Settings</h5>
                            <Divider className="my-4" />
                            <Stack spacing={'lg'} className="px-4">
                                <Group position="apart">
                                    <div>Has end date?</div>
                                    <Switch
                                        checked={showEndDate}
                                        onChange={(checked) => {
                                            setShowEndDate(
                                                checked.target.checked,
                                            );
                                        }}
                                        size="md"
                                    ></Switch>
                                </Group>
                                {showEndDate && (
                                    <div>
                                        End Date
                                        <br />
                                        <span>
                                            {endDate.toLocaleString(
                                                DateTime.DATE_HUGE,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {showEndDate && (
                                    <Stack spacing={1}>
                                        <Select
                                            style={{ width: 120 }}
                                            placeholder="Select End Date"
                                            defaultValue={templateDate}
                                            value={templateDate}
                                            onChange={(value) => {
                                                if (value !== null) {
                                                    setTemplateDate(value);
                                                    const months =
                                                        parseInt(value);
                                                    setEndDate(
                                                        today.plus({ months }),
                                                    );
                                                }
                                            }}
                                            data={[
                                                {
                                                    value: '1', label: '1 month',
                                                },
                                                {
                                                    value: '6', label: '6 months',
                                                },
                                                {
                                                    value: '12', label: '1 year',
                                                },
                                                {
                                                    value: '24', label: '2 years',
                                                },
                                                {
                                                    value: '36', label: '3 years',
                                                },
                                            ]}
                                        />
                                        <div>OR</div>
                                        <DatePicker
                                            onChange={(value) => {
                                                if (value !== null) {
                                                    setTemplateDate('');
                                                    setEndDate( DateTime.fromJSDate( value, ), );
                                                }
                                            }}
                                            value={endDate.toJSDate()}
                                            inputFormat="DD/MM/YYYY"
                                            defaultValue={endDate.toJSDate()}
                                            excludeDate={(dt) => dt < today.toJSDate() }
                                            icon={<MdCalendarToday />}
                                            style={{ width: 150 }}
                                            placeholder="Select Date"
                                        />
                                    </Stack>
                                )}
                            </Stack>
                            <Stack spacing={'lg'} className="px-4 mt-4">
                                <DatePicker
                                    inputFormat='DD/MM/YYYY'
                                    label="Document must be signed by"
                                    value={signedBefore}
                                    onChange={(value) => { setSignedBefore(value); }}
                                    error={showAgreementErrors && !signedBefore ? 'Please select a date': ''}
                                    excludeDate={(dt) => dt < today.toJSDate()}
                                    icon={<MdCalendarToday />}
                                    style={{ width: 150 }}
                                    placeholder="Select Date"
                                />
                            </Stack>
                        </CardBody>
                    </Card>
                </Grid.Col>
            </Grid>
            <Grid className='mt-2' columns={GRID_COLUMNS}>
                <Grid.Col span={GRID_SIDE}></Grid.Col>
                <Grid.Col span={GRID_CENTER}>
                    <Group position='right'>
                        <Menu position='top' control={<div><Button color='primary' className='h-12' style={{width: '170px'}}>Actions</Button></div>}>
                            <Menu.Item onClick={() => {saveTemplateHandlers.open()}} icon={<GoPlus />}>Save as template</Menu.Item>
                            <Menu.Item onClick={() => {toast.success('Draft Saved!')}} icon={<GoPlus />}>Save as draft</Menu.Item>
                            <Divider />
                            <Menu.Item color='red' icon={<i className='simple-icon-trash' />}>Delete Template</Menu.Item>
                        </Menu>
                        <span onClick={() => {onPrepareSend()}}><Button color='success' className='h-12' style={{width: '170px'}}>Prepare to send</Button></span>
                    </Group>
                </Grid.Col>
                <Grid.Col span={GRID_SIDE}></Grid.Col>
            </Grid>

            <Modal
                size="90%"
                centered
                title="Add Signers"
                opened={showSignerModal}
                onClose={() => setShowSignerModal(false)}
            >
                {showSignerModal && (
                    <AddSigner
                        signerSequence={signSequence}
                        signers={signers}
                        onChangeSignerSequence={onSetSignerSequence}
                        onConfirmAddSigner={onAddSigner}
                        onCancelAddSigner={() => {
                            setShowSignerModal(false);
                        }}
                    />
                )}
            </Modal>
            <Modal
                centered
                title='Save As Template'
                opened={showSaveTemplate}
                onClose={saveTemplateHandlers.close}
            >
                {!templateSaved && <Stack>
                    <TextInput value={templateName} onChange={(e) => {setTemplateProps(prev => ({
                        ...prev,
                        templateName: e.currentTarget.value
                    }))}} error={templateError && templateName.length === 0 ? 'Please provide template name' : ''} label='Template Name' required placeholder='Template Name' />
                    <Textarea value={templateDescription} onChange={(e) => {setTemplateProps(prev => ({
                        ...prev,
                        templateDescription: e.currentTarget.value
                    }))}} label='Template Description' placeholder='Template Description' />
                    <Autocomplete value={templateCategory} onChange={(val) => {
                        setTemplateProps(prev => ({
                            ...prev,
                            templateCategory: val
                        }));
                    }} label='Template Category' placeholder='Template Category' data={templateCategories}/>
                    <Group position='right'>
                        <Button onClick={saveTemplateHandlers.close} color='light'>Cancel</Button>
                        <span onClick={onSaveTemplate}><Button color='success'>Save</Button></span>
                    </Group>
                </Stack>}
                {templateSaved && 
                <Stack>
                    <span className="text-success text-center text-3xl">
                        <i className="simple-icon-check"></i>
                    </span>
                    <p>Template Saved!</p>
                </Stack>}
            </Modal>

            <Modal 
            size='lg'
            closeOnEscape={false}
            closeOnClickOutside={false}
            withCloseButton={false}
            opened = {prepareSend} onClose = {prepareSendHandler.close} centered
            >
                <PrepareSend onCancel={() => {
                    prepareSendHandler.close();
                }} contractId={contractId} contractHelper={contractHelper} title={agreementName} sequence={signSequence} signBefore={!!signedBefore ? DateTime.fromJSDate(signedBefore) : null} endDate={showEndDate ? endDate : null} signers={signers} />
            </Modal>

            {isDragging && (
                <DraggableInput
                    type={dragInputType}
                    pos={mousePosition}
                    color={dragInputColor}
                    placeholder={dragInputText}
                />
            )}
        </>
    );
};

export default AgreementCreator;
