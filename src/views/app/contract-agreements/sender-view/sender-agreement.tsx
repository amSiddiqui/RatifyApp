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
    Progress,
} from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { AppDispatch, RootState } from '../../../../redux';
import { Agreement, InputField, Signer, SignerProgressType } from '../../../../types/ContractTypes';
import { Row } from 'reactstrap';
import {
    Colxx,
    Separator,
} from '../../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../../containers/navs/Breadcrumb';
import { Button, Card, CardBody } from 'reactstrap';
import { generateSignerLabels, getFormatDateFromIso } from '../../../../helpers/Utils';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
import {
    HiChevronLeft,
    HiChevronRight,
    HiChevronDoubleLeft,
    HiChevronDoubleRight,
} from 'react-icons/hi';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import SenderInputView from '../form-elements/SenderInputView';
import { AuthHelper } from '../../../../helpers/AuthHelper';
import SignerComments from '../agreement-sign/signer-comments';
import SignerProgress from './signer-progress';
import AuditTrail from '../audit-trail';
import { IoWarningOutline } from 'react-icons/io5';
import AuditTrailButton from '../audit-trail/audit-trail-button';

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
    const [signerProgress, setSignerProgress] = React.useState<SignerProgressType>();
    const [inputElements, setInputElements] = React.useState<InputField[]>([]);

    const [pdf, setPdf] = React.useState('');
    const [pdfLoading, setPdfLoading] = React.useState(true);
    const [pdfThumbnails, setPdfThumbnails] = React.useState<{
        [id: string]: string;
    }>({});
    const [thumbnailsLoading, setThumbnailsLoading] = React.useState(true);
    const [numPages, setNumPages] = React.useState(null);
    const [pageNumber, setPageNumber] = React.useState(1);
    const canvasRef = React.useRef<HTMLDivElement>(null);
    const [organizationName, setOrganizationName] = React.useState<string>('');
    const [clientLogo, setClientLogo] = React.useState('');
    const [showConfirmWithdraw, setShowConfirmWithdraw] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [showAuditTrail, setShowAuditTrail] = React.useState(false);
    const [[overallProgress, overallTotalProgress], setOverallProgress] = React.useState<[number, number]>([0, 0]);
    const [progressSections, setProgressSections] = React.useState<{value: number, color: string}[]>([]);

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

    React.useEffect(() => {
        if (contractId) {
            contractHelper
                .getAgreement(contractId)
                .then((data) => {
                    const agreement = data.agreement;
                    if (!agreement.sent) {
                        navigate('/agreements/add-signers/' + contractId);
                        return;
                    }

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

                    contractHelper.getSignerSenderProgress(contractId).then((dt) => {
                        setSignerProgress(dt);
                        let tp = 0;
                        let p = 0;
                        let sections: {value: number, color: string}[] = [];
                        let total = data.signers.filter((s) => s.type !== 'signer').length;
                        total += Object.values(dt).reduce((acc, val) => acc + val.total, 0);
                        data.signers.forEach((s) => {                            
                            if (s.type === 'signer') {
                                if (s.declined) {
                                    sections.push({value: 100 * dt[s.id].total / total, color: 'red' });
                                } else {
                                    sections.push({value: 100 * dt[s.id].completed / total, color: s.color === 'green' ? 'teal' : 'green' });
                                }
                                return;
                            }
                            tp += 1;
                            if (s.type === 'viewer') {
                                if (s.last_seen) {
                                    p += 1;
                                    sections.push({ value: 100 / total, color: 'green' });
                                }
                                return;
                            }
                            if (s.type === 'approver') {
                                if (s.declined || s.approved) {
                                    p += 1;
                                }
                                if (s.declined) {
                                    sections.push({ value: 100 / total, color: 'red' });
                                }
                                if (s.approved) {
                                    sections.push({ value: 100 / total, color: 'green' });
                                }
                            }
                        });
                        Object.values(dt).forEach(val => {
                            tp += val.total;
                            p += val.completed;
                        });
                        setOverallProgress([p, tp]);
                        setProgressSections(sections);
                        
                    }).catch(err => {
                        console.log(err);
                    });
                })
                .catch((err) => {
                    // check if error is 404
                    if (err.response && err.response.status === 404) {
                        toast.error('Agreement not found');
                    } else {
                        toast.error(
                            'Error loading the agreement try again later',
                        );
                    }
                    navigate('/agreements');
                });
        }
    }, [contractHelper, contractId, navigate]);


    React.useEffect(() => {
        authHelper
            .getOrganizationName()
            .then((data) => {
                setOrganizationName(data.name);
            })
            .catch((err) => {
                console.log(err);
            });

        authHelper
            .getOrganizationLogo()
            .then((data) => {
                setClientLogo(data);
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    return;
                }
                console.log(err.response);
            });
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
                    <Grid.Col span={GRID_SIDE}></Grid.Col>
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
                                    {pdfLoading && <Loader size="xs" />}
                                    {!pdfLoading && (
                                        <Group spacing='xs'>    
                                        <Tooltip label='Download Document' className='cursor-pointer'>
                                            <a href={"data:application/pdf;base64,"+pdf} download={agreement ? agreement.title + '.pdf' : 'document.pdf'}>
                                                <i className='iconsminds-download-1 text-lg'/>
                                            </a>
                                        </Tooltip>
                                        <p>Download Document</p>
                                        </Group>
                                    )}
                                    
                                </Group>
                            </div>
                            <div>
                                <Stack>
                                    <Group position='right'>
                                        <div>
                                            <Progress style={{ width: 300 }} className='h-3' sections={progressSections}/>
                                            <Group style={{ width: 300 }} position='apart'>
                                                <p className='text-muted text-xs'>Actions completed:</p>
                                                <p className='text-muted text-xs'>{overallProgress}/{overallTotalProgress}</p>
                                            </Group>
                                        </div>

                                    </Group>
                                    {agreement && agreement.signed_before && <div className="flex items-center">
                                        <IoWarningOutline className='text-warning text-xl relative' style={{top: -1}} />
                                        <p className='ml-2'>
                                            Document is required to be signed before <span className='text-rose-400'>{getFormatDateFromIso(agreement.signed_before)}</span>
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
                                            return (
                                                <SignerProgress
                                                    label={function() {
                                                        const label = labels.find(label => label.uid === signer.id.toString());
                                                        if (label) {
                                                            return label.label;
                                                        } else {
                                                            return '';
                                                        }
                                                    }()}
                                                    signerProgress={signerProgress ? signerProgress[signer.id] : null}
                                                    onDocumentSent={setSignerDocumentSuccess}
                                                    contractHelper={contractHelper}
                                                    key={signer.id}
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
                                                id="pdf-form-input-container">
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
                                            </div>
                                            <Document
                                                loading={
                                                    <Skeleton height={1080} />
                                                }
                                                options={{
                                                    workerSrc: '/pdf.worker.js',
                                                }}
                                                file={
                                                    'data:application/pdf;base64,' +
                                                    pdf
                                                }
                                                onLoadSuccess={
                                                    onDocumentLoadSuccess
                                                }>
                                                <Page
                                                    loading={
                                                        <Skeleton
                                                            height={1080}
                                                        />
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
                                <h5 className="text-center bg-gray-50 py-4">
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
                                            <Skeleton
                                                style={{ zIndex: 1 }}
                                                height={150}
                                                width={120}
                                            />
                                            <Skeleton
                                                style={{ zIndex: 1 }}
                                                height={10}
                                                width={120}
                                            />
                                        </Stack>
                                    )}
                                    {!thumbnailsLoading && (
                                        <ScrollArea
                                            style={{
                                                height: 290,
                                                overflow: 'hidden',
                                                width: '70%',
                                            }}
                                            className="rounded-md">
                                            <Stack spacing={2}>
                                                {Object.keys(pdfThumbnails).map(
                                                    (key) => {
                                                        const pg =
                                                            parseInt(key) + 1;
                                                        return (
                                                            <div key={key}>
                                                                <div className="flex flex-col justify-center items-center">
                                                                    <span
                                                                        className={classNames(
                                                                            'border-4',
                                                                            { 'border-sky-500': pageNumber === parseInt( key, ) + 1 },
                                                                            { 'border-gray-300': pageNumber !== parseInt( key, ) + 1 },
                                                                            'cursor-pointer',
                                                                        )}>
                                                                        <img
                                                                            src={ 'data:image/jpeg;base64,' + pdfThumbnails[ key ] }
                                                                            style={{
                                                                                height: 100,
                                                                            }}
                                                                            alt="Page"
                                                                            onClick={() =>
                                                                                setPageNumber( pg )
                                                                            }
                                                                        />
                                                                    </span>
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
            <Grid className='mt-12 mb-12' columns={GRID_TOTAL}>
                <Grid.Col span={GRID_SIDE}></Grid.Col>
                <Grid.Col span={GRID_CENTER}>
                    <Group position='left'>
                        <span onClick={() => {
                            setShowConfirmWithdraw(true);
                        }}><Button color='danger'>Withdraw Document</Button></span>
                    </Group>
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
                            <p className='text-muted'>Note: Withdrawing the document will notify signer(s) and approver(s) and they will no longer be able to view this document.</p>
                        </div>
                        <Group position='right' className='mt-3'>
                            <span onClick={() => setShowConfirmWithdraw(false)}><Button color='light'>Cancel</Button></span>
                            <span onClick={() => {
                                if (contractId) {
                                    contractHelper.deleteAgreement(contractId).then(() => {
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
                            }}><Button color='danger'>Delete</Button></span>
                        </Group>
                    </Stack>
                </Center>
            </Modal>
        </>
    );
};

export default SenderAgreement;
