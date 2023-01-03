import React from 'react';
import {
    Center,
    Loader,
    Stack,
    Group,
    Divider,
    Grid,
    Tooltip,
    Skeleton,
    ScrollArea,
    Modal,
    Badge,
    Textarea,
} from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { AppDispatch, RootState } from '../../../../redux';
import { Agreement, AgreementProgressSectionType, InputField, Signer } from '../../../../types/ContractTypes';
import { Row } from 'reactstrap';
import {
    Colxx,
    Separator,
} from '../../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../../containers/navs/Breadcrumb';
import { Button, Card, CardBody } from 'reactstrap';
import { generateSignerLabels, getAgreementBadgeColorFromStatus, getAgreementStatusText, getFormatDateFromIso } from '../../../../helpers/Utils';
import { toast } from 'react-toastify';
import SenderInputView from '../form-elements/sender-input-view';
import { AuthHelper } from '../../../../helpers/AuthHelper';
import SignerComments from '../agreement-sign/signer-comments';
import SignerProgress from './signer-progress';
import AuditTrail from '../audit-trail';
import { IoWarningOutline } from 'react-icons/io5';
import AuditTrailButton from '../audit-trail/audit-trail-button';
import AgreementProgressBar from './agreement-progress-bar';
import BaseDocumentViewer from '../document-viewer/base-document-viewer';
import PageNavigation from '../document-viewer/page-navigation';

const GRID_TOTAL = 20;
const GRID_SIDE = 3;
const GRID_CENTER = 14;

const SenderAgreement: React.FC = () => {
    const { contractId } = useParams();
    const user = useSelector((root: RootState) => root.auth.user);
    const navigate = useNavigate();
    const match = useLocation();

    const dispatchFn = useDispatch<AppDispatch>();
    const contractHelper = React.useMemo(
        () => new ContractHelper(dispatchFn),
        [dispatchFn],
    );
    const authHelper = React.useMemo(
        () => new AuthHelper(dispatchFn),
        [dispatchFn],
    );
    const [agreement, setAgreement] = React.useState<Agreement | null>(null);
    const [signers, setSigners] = React.useState<Signer[]>([]);
    const [labels, setLabels] = React.useState<{uid: string, label: string}[]>([]);
    const [inputElements, setInputElements] = React.useState<InputField[]>([]);

    const [pdf, setPdf] = React.useState('');
    const [pdfLoading, setPdfLoading] = React.useState(true);
    const [numPages, setNumPages] = React.useState<number>(0);
    const [pageNumber, setPageNumber] = React.useState(1);
    const canvasRef = React.useRef<HTMLDivElement>(null);
    const [organizationName, setOrganizationName] = React.useState<string>('');
    const [clientLogo, setClientLogo] = React.useState('');
    const [showConfirmWithdraw, setShowConfirmWithdraw] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [showAuditTrail, setShowAuditTrail] = React.useState(false);
    const [progressSections, setProgressSections] = React.useState<AgreementProgressSectionType[]>([]);
    const [withdrawMessage, setWithdrawMessage] = React.useState('');
    const [finalPdf, setFinalPdf] = React.useState('');
    const [finalPdfLoading, setFinalPdfLoading] = React.useState(false);
    const [docId, setDocId] = React.useState('');

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

    const onLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files && e.currentTarget.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                authHelper
                    .updateOrganizationLogo(reader.result as string)
                    .then(() => {
                        setClientLogo(reader.result as string);
                        toast.success('Updated organization logo');
                    })
                    .catch((err) => {
                        toast.error('Failed to update organization logo');
                    });
            };
            reader.readAsDataURL(file);
        }
    };

    const onRequestFinalPdf = React.useCallback(() => {
        if (contractId) {
            setFinalPdfLoading(true);
            contractHelper.getFinalPdf(contractId).then((pdf) => {
                setFinalPdf(pdf);

                const linkSource = 'data:application/pdf;base64,' + pdf;
                const downloadLink = document.createElement('a');
                const fileName = `${agreement ?  agreement.title : 'document'}.pdf`;
                downloadLink.href = linkSource;
                downloadLink.download = fileName;
                downloadLink.click();
                setFinalPdfLoading(false);
            }).catch(err => {
                console.log(err);
                toast.error('Failed to download PDF. Try again later!');
                setFinalPdfLoading(false);
            });
        }
    }, [contractHelper, contractId, agreement]);

    const setSignerDocumentSuccess = (id: number) => {
        setSigners((prev) => {
            const newSigners = [...prev];
            const index = newSigners.findIndex((s) => s.id === id);
            if (index !== -1) {
                newSigners[index].status = 'sent';
            }
            return newSigners;
        });
    }

    const getSections = React.useCallback((sections: AgreementProgressSectionType[]) => {
        setProgressSections(sections);
    }, []);

    React.useEffect(() => {
        let shouldUpdate = true;
        if (contractId) {
            contractHelper
                .getAgreement(contractId)
                .then((data) => {
                    if (shouldUpdate) {
                        const agreement = data.agreement;
                        if (!agreement.sent) {
                            navigate('/agreements/add-signers/' + contractId);
                            return;
                        }
    
                        const doc_id = data.agreement.documents[0];
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
                        
                        setDocId(doc_id.toString());
    
                        setAgreement(data.agreement);
                        setSigners(
                            data.signers.map((signer) => {
                                if (signer.type !== 'viewer') {
                                    return signer;
                                } else {
                                    if (signer.status === 'error') {
                                        return signer;
                                    } else {
                                        if (signer.last_seen !== null) {
                                            signer.status = 'completed';
                                        } else {
                                            signer.status = 'sent';
                                        }
                                        return signer;
                                    }
                                }
                            }).sort((a, b) => {
                                return a.step - b.step;
                            }),
                        );
                        setLabels(generateSignerLabels([], data.signers.map((s) => ({ uid: s.id.toString(), type: s.type, step: s.step })), true));
                        setInputElements(data.input_fields);
                    }
                })
                .catch((err) => {
                    if (shouldUpdate) {
                        if (err.response && err.response.status === 404) {
                            toast.error('Agreement not found');
                        } else {
                            toast.error(
                                'Error loading the agreement try again later',
                            );
                        }
                        navigate('/agreements');
                    }
                    // check if error is 404
                });
        }
        return () => { shouldUpdate = false; }
    }, [contractHelper, contractId, navigate]);


    React.useEffect(() => {
        let shouldUpdate = true;
        authHelper
            .getOrganizationName()
            .then((data) => {
                if (shouldUpdate) {
                    setOrganizationName(data.name);
                }
            })
            .catch((err) => {
                console.log(err);
            });

        authHelper
            .getOrganizationLogo()
            .then((data) => {
                if (shouldUpdate) {
                    setClientLogo(data);
                }
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    return;
                }
                console.log(err.response, err.response.status);
            });

        return () => { shouldUpdate = false; }
    }, [authHelper]);

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
            <div>
                <Grid columns={GRID_TOTAL}>
                    <Grid.Col span={GRID_SIDE}>
                        <Center>
                            <Stack style={{ height: '108px' }} spacing={'xs'}>
                                {organizationName.length > 0 && clientLogo && (
                                    <div style={{ height: 75, width: 75 }}>
                                        <img
                                            src={clientLogo}
                                            alt={organizationName}
                                        />
                                    </div>
                                )}
                                {!clientLogo && (
                                    <Center
                                        onClick={() => {
                                            if (inputRef.current) {
                                                inputRef.current.click();
                                            }
                                        }}
                                        style={{ height: 75, width: 75 }}
                                        className="bg-slate-200 shadow-sm text-lg cursor-pointer text-muted font-bold">
                                        Logo
                                    </Center>
                                )}
                                <input
                                    accept="image/*"
                                    onChange={onLogoUpload}
                                    ref={inputRef}
                                    type="file"
                                    className="hidden"
                                />
                                {organizationName.length > 0 && <p>{organizationName}</p>}
                            </Stack>
                        </Center>
                    </Grid.Col>
                    <Grid.Col span={GRID_CENTER}>
                        <Center>
                            <h1>{agreement && agreement.title}</h1>
                        </Center>
                    </Grid.Col>
                    <Grid.Col span={GRID_SIDE}>
                        <Center>
                            {agreement && <Stack spacing={5}>
                                <p className='text-xs text-muted'>Status</p>
                                <Badge variant='outline' size='lg' color={getAgreementBadgeColorFromStatus(agreement.status)}>{getAgreementStatusText(agreement.status)} </Badge>
                            </Stack>}
                        </Center>
                    </Grid.Col>
                </Grid>
                <Grid columns={GRID_TOTAL}>
                    <Grid.Col span={GRID_SIDE}></Grid.Col>
                    <Grid.Col span={GRID_CENTER}>
                        <Group position="apart">
                            <div>
                                <Group
                                    className="relative"
                                    style={{ top: '15px' }}
                                    spacing={'xl'}>
                                    {(pdfLoading || finalPdfLoading) && <Loader size="xs" />}
                                    {!pdfLoading && !finalPdfLoading && (
                                        <Group spacing='xs'>    
                                        <Tooltip label='Download Document' className='cursor-pointer'>
                                            {!finalPdf && (
                                                <i onClick={() => onRequestFinalPdf()} className='iconsminds-download-1 text-lg'/>
                                            )}
                                            {finalPdf && <a href={"data:application/pdf;base64,"+finalPdf} download={agreement ? agreement.title + '.pdf' : 'document.pdf'}>
                                                <i className='iconsminds-download-1 text-lg'/>
                                            </a>}
                                        </Tooltip>
                                        <p>Download Document</p>
                                        </Group>
                                    )}
                                    
                                </Group>
                            </div>
                            <div>
                                <Stack>
                                    <Group position='right'>
                                        <AgreementProgressBar contractHelper={contractHelper} contractId={contractId} getSections={getSections} />
                                    </Group>
                                    {agreement && agreement.signed_before && <div className="flex items-center">
                                        <IoWarningOutline className='text-warning text-xl relative' style={{top: -1}} />
                                        <p className='ml-2'>
                                            Must be completed before <span className='text-rose-400'>{getFormatDateFromIso(agreement.signed_before)}</span>
                                        </p>
                                    </div>}
                                </Stack>
                                
                            </div>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={GRID_SIDE}>
                        <Center>
                            <AuditTrailButton onAuditClick={() => setShowAuditTrail(true)} agreement={agreement} />
                        </Center>
                    </Grid.Col>
                </Grid>
                <Grid className="mt-2" columns={GRID_TOTAL}>
                    <Grid.Col span={GRID_SIDE}>
                        <Card style={{ height: '1080px' }}>
                            <CardBody className="p-0">
                                <h5 className="text-center bg-gray-50 py-4">
                                    Signing Workflow
                                </h5>
                                <Divider className="mb-4" />
                                {agreement && agreement.sequence && (
                                    <p className="mx-3 mb-4">
                                        Note: Signers must sign in the order of
                                        the sequence.
                                    </p>
                                )}
                                <ScrollArea style={{ height: 850 }}>
                                    <Stack spacing="xl" className="px-3">
                                        {signers.map((signer) => {
                                            let signerProgress = null;
                                            // find signer in sections
                                            let signerSection = progressSections.find(sec => sec.id === signer.id);
                                            if (signerSection) {
                                                signerProgress = { total: signerSection.total, completed: signerSection.completed };
                                            }
                                            return (
                                                <SignerProgress
                                                    agreementId={contractId}
                                                    label={function() {
                                                        const label = labels.find(label => label.uid === signer.id.toString());
                                                        if (label) {
                                                            return label.label;
                                                        } else {
                                                            return '';
                                                        }
                                                    }()}
                                                    signerProgress={signerProgress}
                                                    onDocumentSent={setSignerDocumentSuccess}
                                                    contractHelper={contractHelper}
                                                    key={signer.id}
                                                    agreementStatus={agreement === null ? '' : agreement.status}
                                                    signer={signer}
                                                />
                                            );
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
                                        <Skeleton
                                            height={1024}
                                            style={{ zIndex: 0 }}
                                            width={613}
                                        />
                                    )}
                                    {!pdfLoading && (
                                        <BaseDocumentViewer 
                                            ref={canvasRef} 
                                            pdf={pdf} 
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
                                                        if (
                                                            element.page ===
                                                            pageNumber
                                                        ) {
                                                            return (
                                                                <SenderInputView
                                                                    key={element.id}
                                                                    inputField={element}
                                                                    declined={element.declined}
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
                                <Divider />
                                <div className='py-4 bg-gray-50'>
                                    <h5 className="text-center ">Comments</h5>
                                </div>
                                <Divider className="mb-4" />
                                {contractId && user && (
                                    <SignerComments
                                        type="sender"
                                        token={contractId}
                                        userId={user.id}
                                        contractHelper={contractHelper}
                                    />
                                )}
                            </CardBody>
                        </Card>
                    </Grid.Col>
                </Grid>
            </div>
            <Grid className='mt-4 mb-12' columns={GRID_TOTAL}>
                <Grid.Col span={GRID_SIDE}></Grid.Col>
                <Grid.Col span={GRID_CENTER}>
                    {agreement?.status === 'sent' && <Group position='left'>
                        <span onClick={() => {
                            setShowConfirmWithdraw(true);
                        }}>
                            <p className='delete-button-underlined'>Withdraw Document</p>
                            
                        </span>
                    </Group>}
                </Grid.Col>
                <Grid.Col span={GRID_SIDE}></Grid.Col>
            </Grid>
            
            <Modal
                size='lg'
                style={{overflow: 'hidden'}}
                opened={showAuditTrail}
                onClose={() => setShowAuditTrail(false)}
                centered
                title={<p className='font-bold text-lg'>Audit Trail</p>}
            >   
            <Stack>
                <AuditTrail contractHelper={contractHelper} contractId={contractId} />
                <Group position='right'>
                    <span onClick={() => setShowAuditTrail(false)}>
                        <Button color='light'>Close</Button>
                    </span>
                </Group>
            </Stack>
            
            </Modal>

            <Modal
                opened={showConfirmWithdraw}
                onClose={() => setShowConfirmWithdraw(false)}
                centered
                title={<p className='font-bold text-lg'>Confirm Withdraw?</p>}
            >
                <Center>
                    <Stack>
                        <span className="text-center text-5xl text-danger">
                            <i className="simple-icon-exclamation"></i>
                        </span>
                        <div className='text-center'>
                            <p className='text-lg'>Are you sure you want to withdraw this document?</p>
                            <p className='text-muted'>Note: Withdrawing the document will notify signer(s) and approver(s). They will no longer be able to view this document.</p>
                            <Textarea className='mt-4' placeholder='Message' value={withdrawMessage} onChange={val => setWithdrawMessage(val.target.value)} autosize minRows={3} label='Add a message for Signers and Approvers' />
                        </div>
                        <Group position='right' className='mt-3'>
                            <span onClick={() => setShowConfirmWithdraw(false)}><Button color='light'>Cancel</Button></span>
                            <span onClick={() => {
                                if (contractId) {
                                    contractHelper.deleteAgreement(contractId, withdrawMessage).then(() => {
                                        setShowConfirmWithdraw(false);
                                        if (agreement) {
                                            toast.success(`${agreement.title} withdrawn!`);
                                        } else {
                                            toast.success('Agreement withdrawn!');
                                        }
                                        navigate('/');
                                    }).catch(err => {
                                        toast.error('Cannot withdraw agreement! Try again later!');
                                        setShowConfirmWithdraw(false);
                                        console.log(err);
                                    });   
                                }
                            }}><Button color='danger'>Withdraw</Button></span>
                        </Group>
                    </Stack>
                </Center>
            </Modal>
        </>
    );
};

export default SenderAgreement;
