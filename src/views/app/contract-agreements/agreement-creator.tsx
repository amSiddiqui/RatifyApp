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
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { Card, CardBody } from 'reactstrap';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux';
import { ContractHelper } from '../../../helpers/ContractHelper';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import { MdChevronLeft, MdChevronRight, MdCalendarToday} from 'react-icons/md';
import { DateTime } from 'luxon';

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
    const [pdfThumbnails, setPdfThumbnails] = React.useState<{
        [id: string]: string;
    }>({});
    const [thumbnailsLoading, setThumbnailsLoading] = React.useState(true);
    const [showEndDate, setShowEndDate] = React.useState(false);
    const [endDate, setEndDate] = React.useState<DateTime>(() => {
        // datetime get 1 month from today
        const endDate = today.plus({ months: 6 });
        return endDate;
    });
    const [templateDate, setTemplateDate] = React.useState<string>('6');
    const [signedBefore, setSignedBefore] = React.useState<Date | null>();

    const dispatchFn = useDispatch<AppDispatch>();
    const contractHelper = React.useMemo(
        () => new ContractHelper(dispatchFn),
        [dispatchFn]
    );
    const navigate = useNavigate();

    function onDocumentLoadSuccess({ numPages }: any) {
        setNumPages(numPages);
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
            <Grid columns={12}>
                <Grid.Col span={3}>
                    <Card style={{ height: '850px' }}>
                        <CardBody>
                            <p className="text-center text-lg">
                                Signing Workflow
                            </p>
                            <Divider className="my-7" />
                        </CardBody>
                    </Card>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Card style={{ height: '850px' }}>
                        <CardBody>
                            <Center>
                                {pdfLoading && <Skeleton height={750} />}
                                {!pdfLoading && (
                                    <Document
                                        loading={<Skeleton height={750} />}
                                        file={
                                            'data:application/pdf;base64,' + pdf
                                        }
                                        onLoadSuccess={onDocumentLoadSuccess}
                                    >
                                        <Page
                                            loading={<Skeleton height={750} />}
                                            pageNumber={pageNumber}
                                        />
                                    </Document>
                                )}
                            </Center>
                        </CardBody>
                    </Card>
                </Grid.Col>
                <Grid.Col span={3}>
                    <Card style={{ height: '850px' }}>
                        <CardBody>
                            <p className="text-center text-lg">
                                Page Navigation
                            </p>
                            <Divider className="my-7" />
                            <Center>
                                <p className="text-3xl">
                                    {' '}
                                    <MdChevronLeft
                                        onClick={() => {
                                            setPageNumber((prev) => {
                                                if (numPages === null) {
                                                    return 1;
                                                }
                                                if (prev === 1) {
                                                    return 1;
                                                }
                                                return prev - 1;
                                            });
                                        }}
                                        className="cursor-pointer"
                                    />{' '}
                                </p>
                                <p className="px-3">
                                    Page: {pageNumber} / {numPages}
                                </p>
                                <p className="text-3xl">
                                    {' '}
                                    <MdChevronRight
                                        onClick={() => {
                                            setPageNumber((prev) => {
                                                if (numPages === null) {
                                                    return 1;
                                                }
                                                if (prev === numPages) {
                                                    return numPages;
                                                }
                                                return prev + 1;
                                            });
                                        }}
                                        className="cursor-pointer"
                                    />{' '}
                                </p>
                            </Center>
                            <Center>
                                {thumbnailsLoading && (
                                    <Stack>
                                        <Skeleton height={150} width={120} />
                                        <Skeleton height={10} width={120} />
                                    </Stack>
                                )}
                                {!thumbnailsLoading && (
                                    <div
                                        style={{
                                            height: 290,
                                            overflowY: 'scroll',
                                            width: '70%',
                                        }}
                                        className="border-2 py-3 rounded-md"
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
                                                                    {
                                                                        'border-4 border-sky-500':
                                                                            pageNumber ===
                                                                            parseInt(
                                                                                key
                                                                            ) +
                                                                                1,
                                                                    },
                                                                    'cursor-pointer'
                                                                )}
                                                            >
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
                                                                    onClick={() => {
                                                                        setPageNumber(
                                                                            parseInt(
                                                                                key
                                                                            ) +
                                                                                1
                                                                        );
                                                                    }}
                                                                />
                                                            </span>
                                                            <p className="text-center text-sm">
                                                                {parseInt(key) +
                                                                    1}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </Stack>
                                    </div>
                                )}
                            </Center>
                            <Divider className="mt-10 mb-5" />
                            <p className="text-center text-lg mb-5">Settings</p>
                            <Stack spacing={'lg'}>
                                <Group position="apart">
                                    <div>Has end date?</div>
                                    <Switch checked={showEndDate} onChange={(checked) => { setShowEndDate(checked.target.checked) }} size="md"></Switch>
                                </Group>
                                {showEndDate && <div>End Date: <span className='text-lg'>{ endDate.toLocaleString(DateTime.DATE_HUGE) }</span></div>}
                                {showEndDate && <Group position="apart">
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
                                </Group>}
                            </Stack>
                            <div className='mt-4'>
                                <DatePicker
                                    label="Must be signed by"
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
        </>
    );
};

export default AgreementCreator;
