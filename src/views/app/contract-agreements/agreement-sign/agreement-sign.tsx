import { Center, Modal, Loader, Stack, Group, Divider, Grid, Progress, Tooltip, Skeleton, ScrollArea, Textarea } from '@mantine/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { AppDispatch } from '../../../../redux';
import { useDisclosure } from '@mantine/hooks';
import { Button, Card, CardBody } from 'reactstrap';
import { Agreement, InputField, SignerErrorTypes } from '../../../../types/ContractTypes';
import { toast } from 'react-toastify';
import { DateTime } from 'luxon';
import {
    HiChevronLeft,
    HiChevronRight,
    HiChevronDoubleLeft,
    HiChevronDoubleRight,
} from 'react-icons/hi';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
import classNames from 'classnames';
import SignerInput from '../form-elements/SignerInput';
import SignerComments from './signer-comments';
import { getFormatDateFromIso } from '../../../../helpers/Utils';
import SenderInputView from '../form-elements/SenderInputView';
import { MdPendingActions } from 'react-icons/md';
import { IoWarningOutline } from 'react-icons/io5';
import AuditTrail from '../audit-trail';
import AuditTrailButton from '../audit-trail/audit-trail-button';


const GRID_TOTAL = 16;
const GRID_SIDE = 3;
const GRID_CENTER = GRID_TOTAL - GRID_SIDE * 2;

const getCompleteButtonLabel = (type: string) => {
    if (type === 'signer' || type === 'viewer') {
        return 'submit';
    }
    return 'approve';
}


const checkInputPageAllComplete = (pageNumber: number, inputFields: InputField[]) => {
    const reduced = inputFields.filter(inputField => inputField.page === pageNumber && inputField.completed === false && inputField.required);
    return reduced.length === 0;
}


const errorTypeToText = (errorType: SignerErrorTypes) => {
    switch (errorType) {
        case 'DELETED':
            return 'Looks like the document was removed by the sender.';
        case 'EXPIRED':
            return 'Looks like the document has expired.';
        case 'SEQUENCE':
            return 'Looks like the signer before you has not signed yet.';
        case 'UNAUTHORIZED':
            return 'Looks like you are not authorized to sign this document.';
        case 'SERVER':
            return 'Looks like something went wrong. Please try again later.';
        default:
            return 'Looks like something went wrong. Please try again later.';
    }
}

export const AgreementSignNav: React.FC = () => {
    return (
        <nav className="navbar">
            <div className="d-flex align-items-center navbar-left"></div>
            <NavLink className="navbar-logo" to="/">
                <span className="logo d-none d-xs-block" />
                <span className="logo-mobile d-block d-xs-none" />
            </NavLink>
            <div className="navbar-right"></div>
        </nav>
    );
};

const AgreementSign: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const dispatchFn = useDispatch<AppDispatch>();
    const contractHelper = React.useMemo(
        () => new ContractHelper(dispatchFn),
        [dispatchFn],
    );

    const [tokenValid, setTokenValid] = React.useState(false);
    const [tokenErrorType, setTokenErrorType] = React.useState<SignerErrorTypes | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [startingModal, startingModalHandlers] = useDisclosure(true);

    const [confirmationModal, confirmationModalHandlers] = useDisclosure(false);

    const [token, setToken] = React.useState<string>('');
    const [agreement, setAgreement] = React.useState<Agreement | null>(null);
    const [clientLogo, setClientLogo] = React.useState('');
    const [loadingLogo, setLoadingLogo] = React.useState(true);
    const [clientName, setClientName] = React.useState('');

    const [pdf, setPdf] = React.useState('');
    const [pdfLoading, setPdfLoading] = React.useState(true);
    const [pdfThumbnails, setThumbnails] = React.useState<{[id: string]: string}>({});
    const [thumbnailsLoading, setThumbnailsLoading] = React.useState(true);
    const [numPages, setNumPages] = React.useState(null);
    const [pageNumber, setPageNumber] = React.useState(1);
    const canvasRef = React.useRef<HTMLDivElement>(null);

    const [inputElements, setInputElements] = React.useState<InputField[]>([]);
    const [otherInputElements, setOtherInputElements] = React.useState<InputField[]>([]);
    const [totalFields, setTotalFields] = React.useState(0);
    const [completedFields, setCompletedFields] = React.useState(0);
    const [shouldUpdate, setShouldUpdate] = React.useState(false);
    const [showAuditTrail, setShowAuditTrail] = React.useState(false);
    const [{ totalProgress, completedProgress }, setProgress] = React.useState({ totalProgress: 0, completedProgress: 0 });
    const [showDecline, setShowDecline] = React.useState(false);
    const [declineMessage, setDeclineMessage] = React.useState('');

    const [basicInfo, setBasicInfo] = React.useState<{
        signerEmail: string;
        signerName: string;
        organizationName: string;
        signerId: number;
        signerType: string;
        agreementId: number;
        senderEmail: string;
        fieldsCount: number;
        declined: boolean;
    }>();

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

    
    function onDocumentLoadSuccess({ numPages }: any) {
        setNumPages(numPages);
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

    const onDocumentComplete = () => {
        if (inputElements.filter(i => !i.completed).length > 0) {
            toast.error('Please complete all the fields before submitting');
            return;
        }
        confirmationModalHandlers.open();
    }

    const onDocumentSubmit = () => {
        contractHelper.completeSigningProcess(token).then(() => {
            confirmationModalHandlers.close();
            navigate(`/agreements/success?token=${token}&confetti=true`);
        }).catch(err => {
            console.log(err);
            confirmationModalHandlers.close();
            toast.error('Something went wrong. Try again later!');
        })
    }

    const onFilled = React.useCallback((value, id) => {
        setInputElements(prev => {
            const newElements = [...prev];
            for (let element of newElements) {
                if (element.id === id) {
                    if ((element.type === 'name' || element.type === 'signature' || element.type === 'text') && typeof value === 'string') {
                        element.value = value;
                        element.completed = value.trim().length > 0;
                    }
                    if (element.type === 'date' && (value instanceof Date || value === null)) {
                        if (value === null) {
                            element.value = '';
                            element.completed = false;
                        } else {
                            let dtStr = DateTime.fromJSDate(value).toISO();
                            element.value = dtStr;
                            element.completed = true;
                        }
                    }
                } 
            }
            return newElements;
        });
        setShouldUpdate(true);
    }, []);

    React.useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            navigate('/');
            return;
        }
        setToken(token);
        contractHelper
            .validateSignToken(token)
            .then((resp) => {
                if (resp.status === 'completed') {
                    navigate(`/agreements/success?token=${token}`);
                    return;
                }
                if (resp.data.declined) {
                    navigate('/agreements/decline?token=' + token);
                    return;
                }
                if (resp.valid) {
                    setTokenValid(true);
                    setBasicInfo(resp.data);
                    contractHelper.getSignerClientLogo(token).then(data => {
                        setClientLogo(data.data);
                        setLoadingLogo(false);
                    }).catch(err => {
                        setLoadingLogo(false);
                        console.log(err);
                    });
                } else {
                    setTokenValid(false);
                    setTokenErrorType(resp.errorType);
                }
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                setTokenValid(false);
                if (err.response && err.response.data) {
                    setTokenErrorType(err.response.data.errorType ? err.response.data.errorType : 'SERVER');
                }
            });
    }, [searchParams, navigate, contractHelper]);


    React.useEffect(() => {
        if (token.length === 0 || !tokenValid ) {
            return;
        }

        contractHelper.getSignerData(token).then(resp => {
            if (resp.valid) {
                setAgreement(resp.data.agreement);
                setClientName(resp.data.clientName);
            }
        }).catch(err => {
            console.log(err);
        });

        contractHelper.getSignerPdf(token).then(resp => {
            if (resp.valid) {
                setPdf(resp.data);
            } else {
                toast.error('Error Loading Document. Please contact support');
            }
            setPdfLoading(false);
        }).catch(err => {
            console.log(err);
            setPdfLoading(false);
            toast.error('Error Loading Document. Please contact support');
        });

        contractHelper.getSignerPdfThumbnails(token).then(resp => {
            if (resp.valid) {
                setThumbnails(resp.data);
            }
            setThumbnailsLoading(false);
        }).catch(err => {
            setThumbnailsLoading(false);
        });

        contractHelper.getSignerInputElements(token).then(resp => {
            if (resp.valid) {
                let input_fields = resp.data;
                setTotalFields(input_fields.length);
                setCompletedFields(input_fields.filter(field => field.completed).length);
                setInputElements(input_fields);
            }
        }).catch(err => {
            console.log(err);
        });

        contractHelper.getSignerOtherInputElements(token).then(resp => {
            if (resp.valid) {
                let input_fields = resp.data;
                setOtherInputElements(input_fields);
            }
        }).catch(err => {
            console.log(err);
        });

        contractHelper.getSignerProgress(token).then(data => {
            if (data.valid) {
                setProgress({ totalProgress: data.data.totalProgress, completedProgress: data.data.completedProgress });
            }
        }).catch(err => {
            console.log(err);
        });

    }, [token, tokenValid, contractHelper]);

    React.useEffect(() => {
        const completed = inputElements.filter(field => field.completed).length;
        setCompletedFields(completed);
    }, [inputElements]);

    React.useEffect(() => {
        if (shouldUpdate) {
            const data = inputElements.map(field => ({
                id: field.id,
                completed: field.completed,
                value: field.value,
            }));
            console.log({data});
            contractHelper.updateSignerResponse(token, data).then(resp => {
                if (!resp.valid) {
                    toast.error('Error saving data. Please contact support');
                }
            }).catch(err => {
                toast.error('Error saving responses. Please contact support');
                console.log(err);
            });
        }
    }, [shouldUpdate, token, inputElements, contractHelper]);

    return (
        <>
            <AgreementSignNav />
            <div className='mt-5 px-16'>
                <Grid columns={GRID_TOTAL}>
                    <Grid.Col span={GRID_SIDE}>
                        <Center>
                            <Stack style={{height: '108px'}} spacing={'xs'}>
                                {loadingLogo && <Center style={{height: 75, width: 75}}>
                                    <Loader />
                                </Center>}
                                {!loadingLogo && clientLogo && <div style={{height: 75, width: 75}}>
                                    <img src={clientLogo} alt={clientName} />
                                </div>}
                                {((loadingLogo) || (!loadingLogo && clientLogo)) && clientName && <p>{clientName}</p>}
                                {(!loadingLogo && !clientLogo && clientName) && <p className='client-logo-text'>{clientName}</p>}
                            </Stack>
                        </Center>
                    </Grid.Col>
                    <Grid.Col span={GRID_CENTER}>
                        <Center>
                            <h1>{!!agreement && agreement.title}</h1>
                        </Center>                        
                    </Grid.Col>
                    <Grid.Col span={GRID_SIDE}></Grid.Col>
                </Grid>


                <Grid className='mb-4' columns={GRID_TOTAL}>
                    <Grid.Col span={GRID_SIDE}></Grid.Col>
                    <Grid.Col span={GRID_CENTER}>
                        <Group position='apart'>
                            <div>
                                <Group spacing={'xs'} className='text-primary'><span><MdPendingActions className='text-xl' /></span><p className=' text-lg'>Please <span>{!basicInfo ? 'sign': basicInfo.signerType.substring(0, basicInfo.signerType.length - 2)}</span> the following document!</p></Group>
                                <Group className='relative' style={{top: '15px'}} spacing={'xl'}>
                                    {pdfLoading && <Loader size='xs' />}
                                    {!pdfLoading && <Group spacing='xs'>    
                                    <Tooltip label='Download Document' className='cursor-pointer'>
                                        <a href={"data:application/pdf;base64,"+pdf} download={agreement ? agreement.title + '.pdf' : 'document.pdf'}>
                                            <i className='iconsminds-download-1 text-lg'/>
                                        </a>
                                    </Tooltip>
                                    <p>Download Document</p>
                                    </Group>}
                                </Group>
                            </div>
                            
                            <div>
                            {basicInfo && basicInfo.signerType === 'signer' && 
                            <Group position='right'>
                                <div>
                                    <Progress style={{ width: 300 }} className=' h-3' value={totalFields === 0 ? 0: completedFields * 100 / totalFields} color='green'/>
                                    <Group style={{ width: 300 }} position='apart'>
                                        <p className='text-muted text-xs'>Actions completed:</p>
                                        <p className='text-muted text-xs'>{completedFields} of {totalFields}</p>
                                    </Group>
                                </div>
                            </Group>
                            }
                            {basicInfo && basicInfo.signerType !== 'signer' && 
                            <Group position='right'>
                                <div>
                                    <Progress style={{ width: 300 }} className='h-3' value={totalProgress === 0 ? 0: completedProgress * 100 / totalProgress} color='green'/>
                                    <Group style={{ width: 300 }} position='apart'>
                                        <p className='text-muted text-xs'>Actions completed:</p>
                                        <p className='text-muted text-xs'>{completedProgress} of {totalProgress}</p>
                                    </Group>
                                </div>
                            </Group>
                            }
                            {agreement && agreement.signed_before && 
                                <div style={{top: '15px'}} className='flex justify-center items-center relative'>     
                                    <IoWarningOutline className='text-warning text-xl relative' style={{ top: -1}} />
                                    <p className='ml-2'>Document is required to be signed before <span className='text-rose-400'>{agreement && agreement.signed_before ? getFormatDateFromIso(agreement.signed_before) : ''}</span></p>
                                </div>
                            }
                            </div>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={GRID_SIDE}>
                        <Center>
                            {basicInfo && basicInfo.signerType !== 'signer' && 
                                <AuditTrailButton agreement={agreement} onAuditClick={() => setShowAuditTrail(true)} />
                            }
                        </Center>
                    </Grid.Col>
                </Grid>

                <Grid className='mt-2' columns={GRID_TOTAL}>
                    <Grid.Col span={GRID_SIDE}>
                        <Card style={{height: '1080px'}}>
                            <CardBody className='p-0'>
                                <h5 className='text-center bg-gray-50 py-4'>
                                    Page Navigation
                                </h5>
                                <Divider className='mb-4' />
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
                                        <Skeleton style={{zIndex: 1}} height={150} width={120} />
                                        <Skeleton style={{zIndex: 1}} height={10} width={120} />
                                    </Stack>
                                )}
                                {!thumbnailsLoading && (
                                    <ScrollArea
                                        style={{
                                            height: 290,
                                            overflow: 'hidden',
                                            width: '70%',
                                        }}
                                        className="rounded-md"
                                    >
                                        <Stack spacing={2}>
                                            {Object.keys(pdfThumbnails).map(
                                                (key) => {
                                                    const pg = parseInt(key) + 1;
                                                    const pageCompleted = checkInputPageAllComplete(pg, inputElements);
                                                    return (
                                                        <div key={key}>
                                                            {pageCompleted && <i className='simple-icon-check text-success absolute text-xl' style={{top: 0, left: 8}} />}
                                                            <div
                                                                className="flex flex-col justify-center items-center"
                                                            >
                                                                <Tooltip
                                                                    label='Required'
                                                                    position='left'
                                                                    withArrow
                                                                    zIndex={1}
                                                                    placement='start'
                                                                    opened={!pageCompleted}
                                                                    color='blue'
                                                                    className={classNames(
                                                                        'border-4',{ 'border-sky-500': pageNumber === pg,},
                                                                        { 'border-gray-300': pageNumber !== pg,},
                                                                        'cursor-pointer',
                                                                        )}
                                                                >
                                                                    <img
                                                                        src={ 'data:image/jpeg;base64,' + pdfThumbnails[ key ] }
                                                                        style={{
                                                                            height: 100,
                                                                        }}
                                                                        alt="Page"
                                                                        onClick={() =>  setPageNumber( pg ) }
                                                                    />
                                                                </Tooltip>
                                                                <p className="text-center text-sm">
                                                                    {pg}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </Stack>
                                    </ScrollArea>
                                )}
                                </Center>
                            </CardBody>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={GRID_CENTER}>
                        <Card style={{height: '1080px'}}>
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
                                                    zIndex: 1,
                                                }}
                                                className="bg-transparent"
                                                id='pdf-form-input-container'
                                            >
                                                {inputElements.map(
                                                    (element, index) => {
                                                        if (element.page === pageNumber) {
                                                            return (
                                                                <SignerInput
                                                                    id={element.id}
                                                                    width={element.width}
                                                                    height={element.height}
                                                                    initialValue={element.value}
                                                                    onFilled={onFilled}
                                                                    key={element.id}
                                                                    placeholder={element.placeholder}
                                                                    x={element.x}
                                                                    y={element.y}
                                                                    color={element.color}
                                                                    type={element.type} 
                                                                />
                                                            )
                                                        }
                                                        return null;
                                                    }
                                                )}
                                                {otherInputElements.map(
                                                    (element, index) => {
                                                        if (element.page  === pageNumber) {
                                                            return <SenderInputView key={element.id} inputField={element} declined={element.declined} />
                                                        }
                                                        else {
                                                            return null;
                                                        }
                                                    }
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
                        <Card style={{height: '1080px'}}>
                            <CardBody className='p-0'>
                                <h5 className='text-center bg-gray-50 py-4'>
                                    Comments
                                </h5>
                                <Divider className='mb-4' />
                                <div style={{ height: '475px' }}>
                                    {!!basicInfo && <SignerComments type='signer' token={token} signerId={basicInfo.signerId} contractHelper={contractHelper} />}
                                </div>
                            </CardBody>
                        </Card>
                    </Grid.Col>
                </Grid>

                {basicInfo?.signerType !== 'viewer' && <Grid className='mt-8' columns={GRID_TOTAL}>
                    <Grid.Col span={GRID_SIDE}>

                    </Grid.Col>
                    
                    <Grid.Col span={GRID_CENTER}>
                        <Group position='apart'>
                            <span onClick={() => setShowDecline(true)}><Button color='danger' className='agreement-button' >Decline</Button></span>
                            <span onClick={onDocumentComplete}><Button className='items-center justify-center capitalize agreement-button' color='success'>{basicInfo ? getCompleteButtonLabel(basicInfo.signerType) : ''}</Button></span>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={GRID_SIDE}>

                    </Grid.Col>

                </Grid>}

            </div>

            <Modal
                centered
                closeOnClickOutside={false}
                withCloseButton={false}
                closeOnEscape={false}
                opened={startingModal}
                onClose={startingModalHandlers.close}
                size={'xl'}>
                {loading && (
                    <Center className="h-36">
                        <Loader size={'lg'} />
                    </Center>
                )}
                {!loading && (!tokenValid || !basicInfo) && (
                    <Center className="h-56 px-8">
                        <Stack>
                            <Stack spacing={'xs'} className="text-center">
                                <i
                                    className="simple-icon-exclamation text-danger"
                                    style={{ fontSize: '3rem' }}
                                />
                                <p className="text-lg">
                                    {!!tokenErrorType && errorTypeToText(tokenErrorType)}
                                </p>
                                <p className="text-muted text-lg">
                                    Please contact the sender using the contact
                                    details provided in the email for further
                                    query.
                                </p>
                            </Stack>
                            <Group position="right">
                                <span
                                    onClick={() => {
                                        navigate('/');
                                    }}>
                                    <Button color="primary">Ok</Button>
                                </span>
                            </Group>
                        </Stack>
                    </Center>
                )}
                {!loading && tokenValid && !!basicInfo && (
                    <Stack> 
                        <p className="text-lg">Hi {basicInfo.signerName} <span className='text-muted'>({basicInfo.signerEmail})</span></p>
                        <Divider />
                        <p>
                            {basicInfo.organizationName} has invited you to{' '}
                            {basicInfo.signerType.substring(
                                0,
                                basicInfo.signerType.length - 2,
                            )}{' '}
                            this document.
                        </p>
                        {basicInfo.signerType === 'signer' && (
                            <p>
                                There are {basicInfo.fieldsCount} required
                                fields in this document
                            </p>
                        )}
                        <Divider></Divider>
                        <Group position="right">
                            <span onClick={startingModalHandlers.close}>
                                <Button color="primary">Get Started</Button>
                            </span>
                        </Group>
                    </Stack>
                )}
            </Modal>

            <Modal centered opened={confirmationModal} onClose={() => {
                confirmationModalHandlers.close();
            }}>
                <Center>
                    <div className='text-center'>
                        <p className='text-lg font-bold'>{basicInfo?.signerType === 'signer' ? 'Submit' : 'Approve'} this document?</p>
                        <p className='text-muted'>{basicInfo?.signerType === 'signer' ?  'You can click back to make any changes.' : 'You can click back to review again.'}</p>
                    </div>
                </Center>
                
                <Group position='right' className='mt-5'>
                    <span onClick={() => { confirmationModalHandlers.close(); }}><Button color='light'>Back</Button></span>
                    <span onClick={() => onDocumentSubmit()}><Button color='success'>{basicInfo?.signerType === 'signer' ? 'Submit' : 'Approve'}</Button></span>
                </Group>
            </Modal>
            <Modal
                size='lg'
                overflow='inside'
                opened={showAuditTrail}
                onClose={() => setShowAuditTrail(false)}
                centered
                title={<p className='font-bold text-lg'>Audit Trail</p>}
            >
                <Stack>
                    <AuditTrail contractHelper={contractHelper} token={token} contractId={basicInfo ? basicInfo.agreementId.toString() : undefined} />
                    <Group position='right'>
                        <span onClick={() => setShowAuditTrail(false)}>
                            <Button color='light'>Close</Button>
                        </span>
                    </Group>
                </Stack>
            </Modal>
            <Modal
                size='lg'
                opened={showDecline}
                onClose={() => setShowDecline(false)}
                centered
            >
                <Stack>
                    <p className='text-lg font-bold'>Are you sure you want to decline {basicInfo && basicInfo.signerType === 'approver' ? 'approval of this document?' : 'signing of this document?'}</p>
                    <Center className='w-full'>
                        <Textarea className='w-full' autosize minRows={3} value={declineMessage} onChange={(event) => setDeclineMessage(event.target.value)} label='Reason for decline:' />
                    </Center>
                    <Group position='right'>
                        <span onClick={() => setShowDecline(false)}><Button color='light'>Close</Button></span>
                        <span onClick={() => {
                            setShowDecline(false);
                            contractHelper.signerDecline(token, declineMessage).then(() => {
                                navigate('/agreements/decline?token='+token);
                            }).catch(err => {
                                console.log(err);
                                toast.error('Something went wrong. Please try again later.');
                            });
                        }}><Button color='danger'>Decline</Button></span>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
};

export default AgreementSign;
