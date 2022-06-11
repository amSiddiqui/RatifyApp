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
import { getFormatDateFromIso } from '../../../../helpers/Utils';
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
    const inputRef = React.useRef<HTMLInputElement>(null);

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
                        data.signers.sort((a, b) => {
                            return a.step - b.step;
                        }),
                    );
                    setInputElements(data.input_fields);

                    contractHelper.getSignerProgress(contractId).then((data) => {
                        setSignerProgress(data);
                        console.log({data});
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
                setOrganizationName(data);
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
                                        <Tooltip
                                            label="Download Document"
                                            className="cursor-pointer">
                                            <a
                                                href={
                                                    'data:application/pdf;base64,' +
                                                    pdf
                                                }
                                                download={
                                                    agreement
                                                        ? agreement.title +
                                                          '.pdf'
                                                        : 'document.pdf'
                                                }>
                                                <i className="iconsminds-data-download text-lg" />
                                            </a>
                                        </Tooltip>
                                    )}
                                    <div className="flex justify-center items-center">
                                        <i className="simple-icon-info text-lg text-warning" />
                                        <p className="ml-2">
                                            This document must be signed by{' '}
                                            {agreement && agreement.end_date
                                                ? getFormatDateFromIso(
                                                      agreement.end_date,
                                                  )
                                                : ''}
                                            .
                                        </p>
                                    </div>
                                </Group>
                            </div>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={GRID_SIDE}>
                        <Center>
                            <span>
                                <Button
                                    className="agreement-button"
                                    color="primary">
                                    Signer Chat
                                </Button>
                            </span>
                        </Center>
                    </Grid.Col>
                </Grid>
                <Grid className="mt-2" columns={GRID_TOTAL}>
                    <Grid.Col span={GRID_SIDE}>
                        <Card style={{ height: '1080px' }}>
                            <CardBody className="p-0">
                                <h5 className="text-center py-4">
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
                                                                    key={
                                                                        element.id
                                                                    }
                                                                    inputField={
                                                                        element
                                                                    }
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
                                                overflowY: 'scroll',
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
                                                                            {
                                                                                'border-sky-500':
                                                                                    pageNumber ===
                                                                                    parseInt(
                                                                                        key,
                                                                                    ) +
                                                                                        1,
                                                                            },
                                                                            {
                                                                                'border-gray-300':
                                                                                    pageNumber !==
                                                                                    parseInt(
                                                                                        key,
                                                                                    ) +
                                                                                        1,
                                                                            },
                                                                            'cursor-pointer',
                                                                        )}>
                                                                        <img
                                                                            src={
                                                                                'data:image/jpeg;base64,' +
                                                                                pdfThumbnails[
                                                                                    key
                                                                                ]
                                                                            }
                                                                            style={{
                                                                                height: 100,
                                                                            }}
                                                                            alt="Page"
                                                                            onClick={() =>
                                                                                setPageNumber(
                                                                                    pg,
                                                                                )
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
                                <Divider className="mb-4" />
                                <h5 className="text-center mb-5">Comments</h5>
                                <Divider className="my-4" />
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
        </>
    );
};

export default SenderAgreement;
