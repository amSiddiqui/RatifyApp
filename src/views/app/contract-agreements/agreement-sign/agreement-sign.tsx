import { Center, Modal, Loader, Stack, Group, Divider, Grid, Progress, Tooltip, Skeleton, Textarea, Image } from '@mantine/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { AppDispatch } from '../../../../redux';
import { useDisclosure, useMediaQuery, useResizeObserver } from '@mantine/hooks';
import { Button, Card, CardBody } from 'reactstrap';
import { Agreement, InputField, SignerErrorTypes } from '../../../../types/ContractTypes';
import { toast } from 'react-toastify';
import { DateTime } from 'luxon';
import SignerInput from '../form-elements/signer-input';
import SignerComments from './signer-comments';
import { getFormatDateFromIso, documentViewerBreakpoint } from '../../../../helpers/Utils';
import SenderInputView from '../form-elements/sender-input-view';
import { MdPendingActions } from 'react-icons/md';
import { IoWarningOutline } from 'react-icons/io5';
import AuditTrail from '../audit-trail';
import AuditTrailButton from '../audit-trail/audit-trail-button';
import AgreementProgressBar from '../sender-view/agreement-progress-bar';
import BaseDocumentViewer from '../document-viewer/base-document-viewer';
import PageNavigation from '../document-viewer/page-navigation';
import classNames from 'classnames';

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
        case 'DECLINED':
            return 'Looks like the document was declined by one of the signers or approvers.';
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
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <Center className='w-full'>
                <Image onClick={() => {
                    navigate('/');
                }} className='w-[70px] cursor-pointer sm:w-[90px]' src='/static/logos/black.png' alt='Ratify' />
            </Center>
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
    const [pdfIpLoading, setPdfIpLoading] = React.useState(true);
    const [pdfOIpLoading, setPdfOIpLoading] = React.useState(true);
    const [numPages, setNumPages] = React.useState<number>(0);
    const [pageNumber, setPageNumber] = React.useState(1);
    const canvasRef = React.useRef<HTMLDivElement>(null);
    const [pageCompleted, setPageCompleted] = React.useState<{hasFields: boolean, completed: boolean}[]>([]);

    const [inputElements, setInputElements] = React.useState<InputField[]>([]);
    const [otherInputElements, setOtherInputElements] = React.useState<InputField[]>([]);
    const [totalFields, setTotalFields] = React.useState(0);
    const [completedFields, setCompletedFields] = React.useState(0);
    const [shouldUpdate, setShouldUpdate] = React.useState(false);
    const [showAuditTrail, setShowAuditTrail] = React.useState(false);
    const [showDecline, setShowDecline] = React.useState(false);
    const [inputFocus, setInputFocus] = React.useState(false);
    const [declineMessage, setDeclineMessage] = React.useState('');

    const firstBreakPoint = useMediaQuery('(max-width: 1370px)');
    const secondBreakPoint = useMediaQuery('(max-width: 1095px)');
    const thirdBreakPoint = useMediaQuery('(max-width: 1000px)');
    const mdBP = useMediaQuery('(max-width: 768px)');
    const [{ scale, topOffset }, setScaleTopOffset] = React.useState<{ scale: number | undefined, topOffset: number | undefined }>({ scale: undefined, topOffset: undefined });

    const [containerRef, rect] = useResizeObserver();
    
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

    
    const onDocumentLoadSuccess = React.useCallback((val:number) => {
        setNumPages(val);
    }, []);

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
        let shouldUpdate = true;
        const token = searchParams.get('token');
        if (!token) {
            navigate('/');
            return;
        }
        setToken(token);
        contractHelper
            .validateSignToken(token)
            .then((resp) => {
                if (shouldUpdate) {
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
                }
            })
            .catch((err) => {
                if (shouldUpdate) {
                    setLoading(false);
                    setTokenValid(false);
                    if (err.response && err.response.data) {
                        setTokenErrorType(err.response.data.errorType ? err.response.data.errorType : 'SERVER');
                    }
                }
            });
        
        return () => { shouldUpdate = false; } 
    }, [searchParams, navigate, contractHelper]);


    React.useEffect(() => {
        let shouldUpdate = true;
        if (token.length === 0 || !tokenValid ) {
            return;
        }

        contractHelper.getSignerData(token).then(resp => {
            if (shouldUpdate) {
                if (resp.valid) {
                    setAgreement(resp.data.agreement);
                    setClientName(resp.data.clientName);
                }
            }
        }).catch(err => {
            console.log(err);
        });

        contractHelper.getSignerPdf(token).then(resp => {
            if (shouldUpdate) {
                if (resp.valid) {
                    setPdf(resp.data);
                } else {
                    toast.error('Error Loading Document. Please contact support');
                }
                setPdfLoading(false);
            }
        }).catch(err => {
            if (shouldUpdate) {
                console.log(err);
                setPdfLoading(false);
                toast.error('Error Loading Document. Please contact support');
            }
        });

        contractHelper.getSignerInputElements(token).then(resp => {
            if (shouldUpdate) {
                if (resp.valid) {
                    let input_fields = resp.data;
                    setTotalFields(input_fields.length);
                    setCompletedFields(input_fields.filter(field => field.completed).length);
                    setInputElements(input_fields);
                    setPdfIpLoading(false);
                }
            }
        }).catch(err => {
            if (shouldUpdate) {
                setPdfIpLoading(false);
            }
            console.log(err);
        });

        contractHelper.getSignerOtherInputElements(token).then(resp => {
            if (shouldUpdate) {
                if (resp.valid) {
                    let input_fields = resp.data;
                    setOtherInputElements(input_fields);
                }
                setPdfOIpLoading(false);
            }
        }).catch(err => {
            console.log(err);
            if (shouldUpdate) {
                setPdfOIpLoading(false);
            }
        });

    }, [token, tokenValid, contractHelper]);

    React.useEffect(() => {
        const completed = inputElements.filter(field => field.completed).length;
        setCompletedFields(completed);
    }, [inputElements]);

    React.useEffect(() => {
        let shouldUpdate = true;
        
        if (token) {
            const data = inputElements.map(field => ({
                id: field.id,
                completed: field.completed,
                value: field.value,
            }));
            contractHelper.updateSignerResponse(token, data).then(resp => {
                if (shouldUpdate) {
                    if (!resp.valid) {
                        toast.error('Error saving data. Please contact support');
                    }
                }
            }).catch(err => {
                if (shouldUpdate) {
                    toast.error('Error saving responses. Please contact support');
                    console.log(err);
                }
            });
        }

        return () => { shouldUpdate = false; }
    
    }, [shouldUpdate, token, inputElements, contractHelper]);

    React.useEffect(() => {
        let pageCompleted = [];
        for (let i = 1; i <= numPages; i++) {
            let pc = { hasFields: inputElements.filter(ip => ip.page === i).length > 0, completed: checkInputPageAllComplete(i, inputElements) }
            pageCompleted.push(pc);
        }
        setPageCompleted(pageCompleted);
    }, [inputElements, numPages]);

    React.useEffect(() => {
        const width = rect.width;
        if (width > 700) {
            setScaleTopOffset({ scale: undefined, topOffset: undefined });
            return;
        }

        for (const docBP of documentViewerBreakpoint) {
            if (width > docBP.bp) {
                setScaleTopOffset({ scale: docBP.scale, topOffset: docBP.topOffset });
                return;
            }
        }
    }, [rect]);
    React.useEffect(() => {
        console.log({inputFocus});
    }, [inputFocus]);

    const pgNavigation = <PageNavigation
        pageNumber={pageNumber}
        numPages={numPages}
        onNextPage={onNextPage}
        onPrevPage={onPreviousPage}
        onFirstPage={onFirstPage}
        onLastPage={onLastPage}
        onGotoPage={(pg) => setPageNumber(pg)}
        token={token}
        contractHelper={contractHelper}
        pageCompleted={pageCompleted}
        height={600}
        showBottomNavigation={firstBreakPoint}
        hideBottomNavigation={inputFocus}
    />;
    const comments = basicInfo ? <SignerComments type='signer' token={token} signerId={basicInfo.signerId} contractHelper={contractHelper} /> : null ;

    const clientLogoElement = <Stack style={{height: '108px'}} spacing={'xs'}>
                {loadingLogo && <Center style={{height: 75, width: 75}}>
                    <Loader />
                </Center>}
                {!loadingLogo && clientLogo && <div style={{height: 75, width: 75}}>
                    <img src={clientLogo} alt={clientName} />
                </div>}
                {((loadingLogo) || (!loadingLogo && clientLogo)) && clientName && <p>{clientName}</p>}
                {(!loadingLogo && !clientLogo && clientName) && <p className='client-logo-text'>{clientName}</p>}
            </Stack>;

    const messageElement = <div className='flex text-primary'><span><MdPendingActions className='text-xl' /></span><p className='ml-2 text-lg'>Please <span>{!basicInfo ? 'sign':  (basicInfo.signerType === 'approver' ? 'approve' : basicInfo.signerType.substring(0, basicInfo.signerType.length - 2))}</span> the following document!</p></div>;
    const downloadElement = 
    <Group className='relative' spacing={'xl'}>
        {pdfLoading && <Loader size='xs' />}
        {!pdfLoading && <Group spacing='xs'>    
        <Tooltip label='Download Document' className='cursor-pointer'>
            <a href={"data:application/pdf;base64,"+pdf} download={agreement ? agreement.title + '.pdf' : 'document.pdf'}>
                <i className='iconsminds-download-1 text-lg'/>
            </a>
        </Tooltip>
        <p>Download Document</p>
        </Group>}
    </Group>;
    
    const signerInfo = basicInfo && basicInfo.signerType === 'signer' ?  
    <Group position={thirdBreakPoint ? 'left' : 'right'}>
        <div>
            <Progress style={{ width: thirdBreakPoint ? 180 : 300 }} className=' h-3' value={totalFields === 0 ? 0: completedFields * 100 / totalFields} color='green'/>
            <Group style={{ width: thirdBreakPoint ? 180 : 300 }} position='apart'>
                <p className='text-muted text-xs'>Actions completed:</p>
                <p className='text-muted text-xs'>{completedFields} of {totalFields}</p>
            </Group>
        </div>
    </Group> : null;
    
    const notSignerInfo = basicInfo && basicInfo.signerType !== 'signer' ? 
    <Group position={thirdBreakPoint ? 'left' : 'right'}>
        <AgreementProgressBar contractHelper={contractHelper} token={token} />
    </Group> : null;

    const signBefore = agreement && agreement.signed_before ?
    <div className={classNames('flex items-center relative', {'justify-center ' : !thirdBreakPoint, 'justify-start': thirdBreakPoint})}>     
        <IoWarningOutline className='text-warning text-xl relative' style={{ top: -1}} />
        <p className='ml-2'>Document is required to be signed before <span className='text-rose-400'>{agreement && agreement.signed_before ? getFormatDateFromIso(agreement.signed_before) : ''}</span></p>
    </div> : null;

    const auditTrailButtonElement = basicInfo && basicInfo.signerType !== 'signer' ?
    <AuditTrailButton agreement={agreement} onAuditClick={() => setShowAuditTrail(true)} /> : null;

    return (
        <>
            <AgreementSignNav />
            <div className={classNames('mt-5', { 'px-0': mdBP, 'px-16': !mdBP })}>
                {!thirdBreakPoint && <Grid columns={GRID_TOTAL}>
                    <Grid.Col span={GRID_SIDE}>
                        <Center>
                            {clientLogoElement}
                        </Center>
                    </Grid.Col>
                    <Grid.Col span={GRID_CENTER + (secondBreakPoint ? GRID_SIDE : 0)}>
                        <Center>
                            <h1>{!!agreement && agreement.title}</h1>
                        </Center>                        
                    </Grid.Col>
                    {!secondBreakPoint && <Grid.Col span={GRID_SIDE}></Grid.Col>}
                </Grid>}
                {thirdBreakPoint && <Center className={classNames({ 'px-4': mdBP})}>
                            <h1>{!!agreement && agreement.title}</h1>
                        </Center>}
                {thirdBreakPoint && <div className={classNames('mt-4', { 'px-4': mdBP})}>
                    {clientLogoElement}    
                </div>}

                {!thirdBreakPoint && <Grid className='mb-4' columns={GRID_TOTAL}>
                    {!firstBreakPoint && <Grid.Col span={GRID_SIDE}></Grid.Col>}
                    <Grid.Col span={GRID_CENTER + (firstBreakPoint ? GRID_SIDE : 0)}>
                        <Group position='apart'>
                            <Stack>
                                {messageElement}
                                {downloadElement}
                            </Stack>
                            <Stack>
                                {signerInfo}
                                {notSignerInfo}
                                {signBefore}
                            </Stack>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={GRID_SIDE}>
                        <Center>
                            {auditTrailButtonElement}
                        </Center>
                    </Grid.Col>
                </Grid>}
                
                {thirdBreakPoint && <Stack className={classNames({ 'px-4': mdBP })}>
                    {signerInfo}
                    {notSignerInfo}
                    {signBefore}
                    {messageElement}
                    {downloadElement}
                </Stack>}

                <Grid className='mt-2' columns={GRID_TOTAL}>
                    {!firstBreakPoint &&<Grid.Col span={GRID_SIDE}>
                        <Card style={{height: '1080px'}}>
                            <CardBody className='p-0'>
                                <h5 className='text-center bg-gray-50 py-4'>
                                    Page Navigation
                                </h5>
                                <Divider className='mb-4' />
                                {pgNavigation}
                            </CardBody>
                        </Card>
                    </Grid.Col>}
                    {firstBreakPoint && pgNavigation}
                    <Grid.Col span={GRID_CENTER + (firstBreakPoint ? GRID_SIDE : 0) + (secondBreakPoint ? GRID_SIDE : 0)}>
                        <Card style={{height: 1080 * (scale ? scale : 1) }}>
                            <CardBody style={{height: 1080 * (scale ? scale : 1), padding: !scale ? '1.25rem': 0}}>
                                <Center style={{height: 1080 * (scale ? scale : 1) }} ref={containerRef}>
                                    {(pdfLoading || pdfIpLoading || pdfOIpLoading) && (
                                        <Skeleton height={ scale ? 1024 * scale : 1024 } style={{zIndex: 0}} width={ scale ? 613 * scale : 613} />
                                    )}
                                    {!pdfLoading && !pdfIpLoading && !pdfOIpLoading && (
                                        <BaseDocumentViewer 
                                            ref={canvasRef} 
                                            onDocLoadSuccess={onDocumentLoadSuccess} 
                                            pdf={pdf} 
                                            pageNumber={pageNumber}
                                            showNextPage={!!numPages && pageNumber < numPages}
                                            showPrevPage={!!numPages && pageNumber > 1}
                                            onNextPage={onNextPage}
                                            onPrevPage={onPreviousPage}
                                            scale={scale} topOffset={topOffset}
                                        >
                                            <>
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
                                                                        onFocus={() => {
                                                                            setInputFocus(true);
                                                                        }}
                                                                        onBlur={() => {
                                                                            setInputFocus(false);
                                                                        }}
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
                                            </>
                                        </BaseDocumentViewer>
                                    )}
                                </Center>
                            </CardBody>
                        </Card>
                    </Grid.Col>
                    {!secondBreakPoint && <Grid.Col span={GRID_SIDE}>
                        <Card style={{height: '1080px'}}>
                            <CardBody className='p-0'>
                                <h5 className='text-center bg-gray-50 py-4'>
                                    Comments
                                </h5>
                                <Divider className='mb-4' />
                                <div style={{ height: '475px' }}>
                                    {comments}
                                </div>
                            </CardBody>
                        </Card>
                    </Grid.Col>}
                </Grid>

                {basicInfo?.signerType !== 'viewer' && <Grid className='mt-8' columns={GRID_TOTAL}>
                    {!firstBreakPoint && <Grid.Col span={GRID_SIDE}></Grid.Col>}
                    
                    <Grid.Col span={GRID_CENTER + (firstBreakPoint ? GRID_SIDE : 0) + (secondBreakPoint ? GRID_SIDE : 0)}>
                        <Group position='apart' className={classNames({ 'px-4': mdBP})}>
                            <span onClick={() => setShowDecline(true)}>
                                <p className='delete-button-underlined'>Decline</p>
                            </span>
                            <span onClick={onDocumentComplete}><Button className='items-center justify-center capitalize agreement-button' color='success'>{basicInfo ? getCompleteButtonLabel(basicInfo.signerType) : ''}</Button></span>
                        </Group>
                    </Grid.Col>
                    {!secondBreakPoint && <Grid.Col span={GRID_SIDE}>

                    </Grid.Col>}

                </Grid>}
                {secondBreakPoint && <div className={classNames('w-full mt-8', { 'px-8': mdBP})}>
                    <Divider className='my-4' />
                    <h3 className='bg-gray-50 py-4'>
                        Comments
                    </h3>
                    <div style={{ height: '600px' }}>
                        {comments}
                    </div>
                    
                </div>}
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
                            {basicInfo.signerType === 'approver' ? 'approve' :  basicInfo.signerType.substring(
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
