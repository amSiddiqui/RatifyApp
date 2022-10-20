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
    Textarea,
    Autocomplete,
    Space,
    Indicator,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { Card, CardBody } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../redux';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { toast } from 'react-toastify';
import { MdCalendarToday } from 'react-icons/md';
import { DateTime } from 'luxon';
import { Button } from 'reactstrap';
import { GoPlus } from 'react-icons/go';
import AddSigner from './add-signer';
import { SignerElement } from '../../../../types/ContractTypes';
import { AiOutlineDrag } from 'react-icons/ai';
import DraggableInput from '../form-elements/draggable-input';
import { getBgColorLight, PositionType, POSITION_OFFSET_X, POSITION_OFFSET_Y, PdfFormInputType, INPUT_WIDTH, INPUT_HEIGHT, SIGN_POSITION_OFFSET_Y, SIGN_INPUT_HEIGHT } from '../types';
import PdfFormInput from '../form-elements/pdf-form-input';
import { generateSignerLabels, getRandomStringID } from '../../../../helpers/Utils';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import PrepareSend from './prepare-send';
import SignerPopover from '../form-elements/signer-popover';
import BaseDocumentViewer from '../document-viewer/base-document-viewer';
import PageNavigation from '../document-viewer/page-navigation';

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
    
    const [numPages, setNumPages] = React.useState<number>(0);
    const [pageNumber, setPageNumber] = React.useState(1);
    const { contractId } = useParams();
    const [pdf, setPdf] = React.useState('');
    const [pdfLoading, setPdfLoading] = React.useState(true);
    
    const [showEndDate, setShowEndDate] = React.useState(false);
    const [showStartDate, setShowStartDate] = React.useState(false);
    const [endDate, setEndDate] = React.useState<DateTime>(() => {
        const endDate = today.plus({ months: 6 });
        return endDate;
    });
    const [startDate, setStartDate] = React.useState<DateTime>(() => {
        return today;
    });
    const [signSequence, setSignSequence] = React.useState<boolean>(false);
    
    const [templateDate, setTemplateDate] = React.useState<string>('6');
    const [signedBefore, setSignedBefore] = React.useState<Date | null>();
    const [showSignerModal, setShowSignerModal] = React.useState(false);
    const [{dragInputText, dragInputColor, dragInputId, dragInputType}, setDragInputProps] = React.useState({dragInputText: 'Full Name', dragInputColor: 'red', dragInputId: -1, dragInputType: 'name'},);
    const [signers, setSigners] = React.useState<SignerElement[]>([]);
    const [labels, setLabels] = React.useState<Array<{uid: string, label: string}>>([]);

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

    const [confirmDeleteModal, deleteModalHandlers] = useDisclosure(false);
    const [showNameHelper, setShowNameHelper] = React.useState(true);
    const [docId, setDocId] = React.useState('');

    const dispatchFn = useDispatch<AppDispatch>();
    const contractHelper = React.useMemo(
        () => new ContractHelper(dispatchFn),
        [dispatchFn],
    );
    const navigate = useNavigate();

    const onAddSigner = React.useCallback((ns: SignerElement[]) => {
        if (contractId) {
            const newSigners = [...ns];
            contractHelper.syncSigners(contractId, newSigners).then((data) => {
                const ids = data.ids;
                for (const signer of newSigners) {
                    signer.id = ids[signer.uid];
                }
                setSigners(newSigners);
                setLabels(generateSignerLabels([], newSigners.map((s) => ({uid: s.uid, type: s.type, step: s.step}) ), true));
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
        if (signers.length === 0) {
            toast.error('Please add at least one signer, viewer or approver!');
            return;
        }
        prepareSendHandler.open();
    }, [agreementName, prepareSendHandler, signers]);

    const onDocumentLoadSuccess = React.useCallback((val: number) => {
        setNumPages(val);
    }, []);

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
        if (numPages === undefined) {
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
        let shouldUpdate = true;
        if (contractId) {
            contractHelper.getAgreement(contractId).then((data) => {
                const agreement = data.agreement;
                if (agreement.sent) {
                    navigate('/agreements/'+contractId);
                    return;
                }
                if (shouldUpdate)  {
                    const agreement_signers = data.signers;
                    const agreement_input_fields = data.input_fields;
                    setAgreementName(agreement.title);
                    if (agreement.end_date !== null) {
                        setShowEndDate(true);
                        setEndDate(DateTime.fromISO(agreement.end_date));
                        setTemplateDate('');
                    }
                    if (agreement.start_date !== null) {
                        setShowStartDate(true);
                        setStartDate(DateTime.fromISO(agreement.start_date));
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
    
                    setLabels(generateSignerLabels([], agreement_signers.map((s) => ({uid: s.id.toString(), type: s.type, step: s.step}) ), true));
    
                    setInputElements(agreement_input_fields.map((i) => ({
                        id: i.id,
                        required: i.required,
                        signerId: i.signer,
                        placeholder: i.placeholder,
                        color: i.color,
                        x: i.x,
                        y: i.y,
                        width: i.width,
                        height: i.height,
                        uid: i.id.toString(),
                        type: i.type,
                        page: i.page
                    } as PdfFormInputType)));
    
                    const doc_id = data.agreement.documents[0];
                    setDocId(doc_id.toString());
                    contractHelper
                        .getPdfDocument(doc_id.toString())
                        .then((pdf) => {
                            if (shouldUpdate) {
                                setPdf(pdf);
                            }
                        })
                        .catch((error) => {
                            throw error;
                        })
                        .finally(() => {
                            if (shouldUpdate) {
                                setPdfLoading(false);
                            }
                        });
                }
            }).catch(err => {
                console.log(err);
                if (shouldUpdate) {
                    if (err.response && err.response.status === 404) {
                        navigate(`/agreements/?error=404`);
                    } else {
                        navigate(`/agreements/?error=500`);
                    }
                }
            });
        } else {
            toast.error('Cannot Find Document. Redirecting to Contract List');
            setTimeout(() => {
                navigate('/agreements');
            }, 4000);
        }

        return () => { shouldUpdate = false; }
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
                    width: INPUT_WIDTH,
                    height: dragInputType === 'signature' ? SIGN_INPUT_HEIGHT : INPUT_HEIGHT,
                    color: dragInputColor,
                    placeholder: dragInputText, 
                    required: dragInputType !== 'text',
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
        let shouldUpdate = true;

        if (!contractId || pdfLoading) {
            return;
        }
        if (!titleFirstCall.current) {
            contractHelper.updateAgreementTitle(contractId, dbAgreementName, '').catch(err => {
                if (shouldUpdate) {
                    toast.error('Error updating agreement title');
                }
            });
        } else {
            titleFirstCall.current = false;
        }

        return () => { shouldUpdate = false; }
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
        let sd: string | null = startDate.toISO();
        if (!showStartDate) {
            sd = null;
        }
        contractHelper.updateAgreementDateSequence(contractId, ed, signedBefore ? DateTime.fromJSDate(signedBefore).toISO() : null, signSequence, sd).catch(err => {
            toast.error('Error updating agreement');
        });
    }, [contractId, contractHelper, endDate, signedBefore, showEndDate, signSequence, pdfLoading, showStartDate, startDate]);

    React.useEffect(() => {
        let shouldUpdate = true;
        if (pdfLoading || !contractId) {
            return;
        }
        if (inputElementsFirstCall.current) {
            inputElementsFirstCall.current = false;
            return;
        }
        if (!inputElementsSynchronized.current) {
            contractHelper.syncInputField(contractId, inputElements).then(data => {
                if (shouldUpdate) {
                    const ids = data.ids;
                    setInputElements(prev => {
                        const newInputElements = [...prev];
                        for (const inputElement of newInputElements) {
                            inputElement.id = ids[inputElement.uid];
                        }
                        return newInputElements;
                    });
                }
            });
            inputElementsSynchronized.current = true;
        } else {
            inputElementsSynchronized.current = false;
        }

        return () => { shouldUpdate = false; }
    }, [inputElements, pdfLoading, contractId, contractHelper]);

    React.useEffect(() => {
        let shouldUpdate = true;
        contractHelper.getAgreementTemplateCategories().then(data => {
            if (shouldUpdate) {
                setTemplateCategories(data);
            }
        }).catch(err => {
            console.log(err);  
        });
        return () => { shouldUpdate = false; }
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
                    label={<p style={{fontSize: '1.1rem'}}>Document Name</p>}
                    description={showNameHelper ? <p className='text-muted'>Give your document a short name, e.g. Employment Contract</p> : undefined}
                    style={{ minWidth: '300px', width: '40%', fontSize: '1.1rem' }}
                    size="xl"
                    error={showAgreementErrors && agreementName.length === 0 }
                    onChange={(event: React.FormEvent<HTMLInputElement>) => {
                        setAgreementName(event.currentTarget.value);
                    }}
                    value={agreementName}
                    placeholder={intl.formatMessage({
                        id: 'agreement-creator.title-placeholder',
                    })}
                    onFocus={() => {
                        setShowNameHelper(false);
                    }}
                />
            </Center>
            <Grid columns={GRID_COLUMNS}>
                <Grid.Col span={GRID_SIDE}>
                    <div className="flex items-center justify-center mb-2">
                        <Button
                            className="contract-agreements-create-new flex agreement-button items-center justify-center"
                            color="primary"
                            onClick={() => {
                                setShowSignerModal(true);
                            }}
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
                        
                    </div>
                </Grid.Col>
            </Grid>

            <Grid columns={GRID_COLUMNS}>
                <Grid.Col span={GRID_SIDE}>
                    <Card style={{ height: '1080px' }}>
                        <CardBody className="p-0">
                            <h5 className="text-center bg-gray-50 py-4">
                                Signing Workflow
                            </h5>
                            <Divider className="mb-4" />
                            <p className="text-xs px-3 text-slate-400 italic">
                                Drag and drop signers on the document
                            </p>
                            <Space h='lg' />
                            {signers.length > 0 && (
                                <Group className='px-3' position='right'>
                                    <span onClick={() => setShowSignerModal(true)}><Button color='secondary' size='xs'>Edit Signers</Button></span>
                                </Group>
                            )}
                            <ScrollArea style={{height: '885px'}}>
                                <Stack
                                    style={{ userSelect: 'none' }}
                                    className="px-3 my-4"
                                    spacing='lg'
                                >
                                    {signers.map((signer, index) => {
                                        return (
                                            <SignerPopover
                                            color={signer.color}
                                            key={signer.id}
                                            target={(<>
                                                {signer.type === 'signer' && (
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
                                                            spacing='xs'
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
                                                        {signer.text_field && <Group
                                                            onMouseDown={() => {
                                                                setDragInputProps({
                                                                    dragInputColor: signer.color,
                                                                    dragInputId: signer.id,
                                                                    dragInputText: 'Extra Field',
                                                                    dragInputType: 'text'
                                                                });
                                                                setIsDragging(true);
                                                            }}
                                                            position="apart"
                                                            className="border-2 cursor-pointer border-slate-300 rounded-sm bg-white p-2 text-slate-400"
                                                        >
                                                            <span>Extra Field</span>
                                                            <i>
                                                                <AiOutlineDrag />
                                                            </i>
                                                        </Group>}
                                                    </Stack>
                                                )}
                                                {signer.type !== 'signer' && (
                                                    <Stack className={"p-3 "+getBgColorLight(signer.color)}>
                                                        <p className=' text-center'>{signer.name}</p>
                                                    </Stack>
                                                )}
                                            </>)}
                                            >
                                                {function() {
                                                    const label = labels.find(label => label.uid === signer.uid);
                                                    if (label) {
                                                        return label.label;
                                                    } else {
                                                        return ''
                                                    }
                                                }()}
                                            </SignerPopover>
                                        )
                                    })}
                                    
                                </Stack>
                            </ScrollArea>
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
                                    <BaseDocumentViewer 
                                        pdf={pdf}
                                        ref={canvasRef}
                                        pageNumber={pageNumber}
                                        onDocLoadSuccess={onDocumentLoadSuccess}
                                        showNextPage={!!numPages && pageNumber < numPages}
                                        showPrevPage={!!numPages && pageNumber > 1}
                                        onNextPage={onNextPage}
                                        onPrevPage={onPreviousPage}
                                    >
                                        <>
                                            {inputElements.map(
                                                (element, index) => {
                                                    if (element.page === pageNumber) {
                                                        return (
                                                            <PdfFormInput
                                                                inputElementId={element.id}
                                                                required={element.required}
                                                                contractHelper={contractHelper}
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
                                                                onResize={(width, height) => {
                                                                    setInputElements(prev => {
                                                                        const newInputElements = [...prev];
                                                                        newInputElements[index].width = width;
                                                                        newInputElements[index].height = height;
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
                                                                width={element.width}
                                                                height={element.height}
                                                                type={element.type}
                                                            />
                                                        );
                                                    } else {
                                                        return null;
                                                    }
                                                },
                                            )}   
                                        </> 
                                    </BaseDocumentViewer>
                                )}
                            </Center>
                        </CardBody>
                    </Card>
                </Grid.Col>
                <Grid.Col span={GRID_SIDE}>
                    <Card style={{ height: '1080px' }}>
                        <CardBody className="p-0">
                            <h5 className="text-center bg-gray-50 py-4">
                                Page Navigation
                            </h5>
                            <Divider className="mb-4" />
                            <PageNavigation
                                height={290}
                                pageNumber={pageNumber}
                                numPages={numPages}
                                onNextPage={onNextPage}
                                onPrevPage={onPreviousPage}
                                onFirstPage={onFirstPage}
                                onLastPage={onLastPage}
                                onGotoPage={(pg) => setPageNumber(pg)}
                                contractHelper={contractHelper}
                                doc_id={docId}
                            />
                            <Divider className="mt-4" />
                            <div className='py-4 bg-gray-50'>
                                <h5 className="text-center ">Settings</h5>
                                <p className='text-center text-muted text-xs'>Optional</p>
                            </div>
                            <Divider className="mb-4" />
                            <ScrollArea style={{
                                width: '100%',
                                height: 480
                            }}>
                                <Stack className='pl-2'>
                                    <Group position='apart'>
                                        <div>Does this document have a start date?</div>
                                        <Switch
                                            checked={showStartDate}
                                            onChange={(checked) => {
                                                setShowStartDate(checked.target.checked);
                                            }}
                                            size={'md'}
                                        />
                                    </Group>
                                    {showStartDate && (
                                        <DatePicker
                                            onChange={(value) => {
                                                if (value !== null) {
                                                    setStartDate(DateTime.fromJSDate(value));
                                                }
                                            }}
                                            value={startDate.toJSDate()}
                                            inputFormat="DD/MM/YYYY"
                                            defaultValue={startDate.toJSDate()}
                                            icon={<MdCalendarToday />}
                                            style={{ width: 150 }}
                                            placeholder="Select Date"
                                            renderDay={(date) => {
                                                return <Indicator size={6} color="blue" offset={8} disabled={date.toDateString() !== today.toJSDate().toDateString()}>
                                                    {date.getDate()}
                                                </Indicator>;
                                            }}
                                        />
                                    )}
                                </Stack>
                                <Divider className="my-4" />
                                <Stack spacing={'lg'} className="pl-2">
                                    <Group position="apart">
                                        <div>Does this document have an end date?</div>
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
                                            <div>Or pick a date</div>
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
                                                icon={<MdCalendarToday />}
                                                style={{ width: 150 }}
                                                placeholder="Select Date"
                                                renderDay={(date) => {
                                                    return <Indicator size={6} color="blue" offset={8} disabled={date.toDateString() !== today.toJSDate().toDateString()}>
                                                        {date.getDate()}
                                                    </Indicator>;
                                                }}
                                            />
                                        </Stack>
                                    )}
                                </Stack>
                                <Divider className='mt-6 mb-2' />
                                <Stack spacing='xs' className="pl-2 mt-4">
                                    <p>This document must be signed by:</p>
                                    <DatePicker
                                        inputFormat='DD/MM/YYYY'
                                        value={signedBefore}
                                        onChange={(value) => { setSignedBefore(value); }}
                                        error={showAgreementErrors && !signedBefore ? 'Please select a date': ''}
                                        excludeDate={(dt) => dt < today.minus({ days: 1 }).toJSDate()}
                                        icon={<MdCalendarToday />}
                                        style={{ width: 150 }}
                                        placeholder="Select Date"
                                        renderDay={(date) => {
                                            return <Indicator size={6} color="blue" offset={8} disabled={date.toDateString() !== today.toJSDate().toDateString()}>
                                                {date.getDate()}
                                            </Indicator>;
                                        }}
                                    />
                                </Stack>
                            </ScrollArea>
                        </CardBody>
                    </Card>
                </Grid.Col>
            </Grid>
            <Grid className='mt-12 mb-12' columns={GRID_COLUMNS}>
                <Grid.Col span={GRID_SIDE}></Grid.Col>
                <Grid.Col span={GRID_CENTER}>
                    <Group position='apart'>
                        <Group>
                            <span onClick={deleteModalHandlers.open}>
                                <p className='delete-button-underlined'>Delete</p>
                            </span>
                            <span onClick={() => {toast.success('Draft saved!')}}><Button color='secondary' className='agreement-button' >Save Draft</Button></span>
                            <span><Button
                                type='button'
                                onClick={() => {
                                    saveTemplateHandlers.open();
                                }}
                                className="contract-agreements-create-new flex agreement-button items-center justify-center"
                                color="secondary"
                            >
                                <span>Save As Template</span>
                            </Button></span>
                        </Group>
                        <Group position='right'>
                            <span onClick={() => {onPrepareSend()}}><Button color='success' className='agreement-button' >Review &amp; Send</Button></span>
                        </Group>
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
                {!templateSaved && <Stack spacing={'lg'}>
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
            size='xl'
            closeOnEscape={false}
            closeOnClickOutside={false}
            withCloseButton={false}
            opened = {prepareSend} onClose = {prepareSendHandler.close} centered
            >
                <PrepareSend 
                    startDate={showStartDate ? startDate : null}
                    onCancel={() => {
                        prepareSendHandler.close();
                    }} 
                    contractId={contractId} 
                    contractHelper={contractHelper} 
                    title={agreementName} 
                    sequence={signSequence} 
                    signBefore={!!signedBefore ? DateTime.fromJSDate(signedBefore) : null} 
                    endDate={showEndDate ? endDate : null} 
                    signers={signers} 
                />
            </Modal>

            <Modal
                opened={confirmDeleteModal}
                onClose={deleteModalHandlers.close}
                centered
                title='Confirm Delete'
            >
                <Center>
                    <Stack>
                        <span className="text-center text-5xl text-danger">
                            <i className="simple-icon-exclamation"></i>
                        </span>
                        <div>
                            <p className='text-lg'>Are you sure you want to delete this agreement?</p>
                            <p className='text-muted'>Note this will not delete the template, and keep the uploaded document.</p>
                        </div>
                        <Group position='right' className='mt-3'>
                            <span onClick={deleteModalHandlers.close}><Button color='light'>Cancel</Button></span>
                            <span onClick={() => {
                                if (contractId) {
                                    contractHelper.deleteAgreement(contractId).then(() => {
                                        deleteModalHandlers.close();
                                        if (agreementName) {
                                            toast.success(`${agreementName} deleted!`);
                                        } else {
                                            toast.success('Agreement deleted!');
                                        }
                                        navigate('/agreements');
                                    }).catch(err => {
                                        toast.error('Cannot delete agreement!');
                                        deleteModalHandlers.close();
                                        console.log(err);
                                    });
                                }
                            }}><Button color='danger'>Delete</Button></span>
                        </Group>
                    </Stack>
                </Center>
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
