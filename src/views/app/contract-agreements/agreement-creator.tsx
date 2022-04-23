import React from 'react';
import { Row } from 'reactstrap';
import { useIntl } from 'react-intl';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Center, Input, Grid, Skeleton, Divider, Stack } from '@mantine/core';
import { Card, CardBody } from 'reactstrap'; 
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux';
import { ContractHelper } from '../../../helpers/ContractHelper';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

const AgreementCreator:React.FC = () => {
    const match = useLocation();
    const intl = useIntl();
    const [agreementName, setAgreementName] = React.useState('');
    const [numPages, setNumPages] = React.useState(null);
    const [pageNumber, setPageNumber] = React.useState(1);
    const { contractId } = useParams();
    const [pdf, setPdf] = React.useState('');
    const [pdfLoading, setPdfLoading] = React.useState(true);
    const [pdfThumbnails, setPdfThumbnails] = React.useState<{[id:string]: string}>({});
    const [thumbnailsLoading, setThumbnailsLoading] = React.useState(true);
    const dispatchFn = useDispatch<AppDispatch>();
    const contractHelper = React.useMemo(() => new ContractHelper(dispatchFn), [dispatchFn]);
    const navigate = useNavigate();

    function onDocumentLoadSuccess({ numPages }:any) {
        setNumPages(numPages);
    }

    React.useEffect(() => {
        if (contractId) {
            contractHelper.getPdfDocument(contractId).then(pdf => {
                setPdf(pdf);
            }).catch(error => {
                console.log(error);
                toast.error('Error loading pdf');
            }).finally(() => {
                setPdfLoading(false);
            });

            contractHelper.getPdfThumbnails(contractId).then(thumbnails => {
                setPdfThumbnails(thumbnails);
            }).catch(error => {
                console.log(error);
                toast.error('Error loading pdf thumbnails');
            }).finally(() => {
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
            <Center className='mb-14'>
                <Input className='center-input' style={{minWidth: '300px', width: '40%'}} size='xl' onChange={(event:React.FormEvent<HTMLInputElement>) => {
                    setAgreementName(event.currentTarget.value);
                }} value={agreementName} placeholder={intl.formatMessage({ id: 'agreement-creator.title-placeholder' })} />
            </Center>
            <Grid columns={12}>
                <Grid.Col span={3}>
                    <Card style={{height: '850px'}}>
                        <CardBody>
                            <p className='text-center'>Signing Workflow</p>
                            <Divider className='my-7' />
                        </CardBody>
                    </Card>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Card style={{height: '850px'}}>
                        <CardBody>
                            <Center>
                                {pdfLoading && <Skeleton height={750} />}
                                {!pdfLoading && <Document loading={
                                    <Skeleton height={750} />
                                } file={'data:application/pdf;base64,'+pdf} onLoadSuccess={onDocumentLoadSuccess}>
                                    <Page 
                                        loading={<Skeleton height={750}/>}
                                        pageNumber={pageNumber} />
                                </Document>}
                            </Center>
                        </CardBody>
                    </Card>
                </Grid.Col>
                <Grid.Col span={3}>
                    <Card style={{height: '850px'}}>
                        <CardBody>
                            <p className='text-center'>Page Navigation</p>
                            <Divider className='my-7' />
                            <div className='flex justify-center items-center'>
                                <p className='text-3xl'> <MdChevronLeft onClick={() => {
                                    setPageNumber(prev => {
                                        if (numPages === null) {
                                            return 1;
                                        }
                                        if (prev === 1) {
                                            return numPages;
                                        }
                                        return prev - 1;
                                    })
                                }} className='cursor-pointer' /> </p>
                                <p className='text-center mx-4'>Page: {pageNumber} / {numPages}</p>
                                <p className='text-3xl'> <MdChevronRight onClick={() => {
                                    setPageNumber(prev => {
                                        if (numPages === null) {
                                            return 1;
                                        }
                                        if (prev === numPages) {
                                            return 1;
                                        }
                                        return prev + 1;
                                    });
                                }} className='cursor-pointer' /> </p>
                            </div>
                            <Center>
                                {thumbnailsLoading && 
                                <Stack>
                                    <Skeleton height={150} width={120}/>
                                    <Skeleton height={10} width={120}/>
                                </Stack>
                                }
                                {!thumbnailsLoading &&
                                <PerfectScrollbar style={{height: 290, width: '70%'}} className='p-2 border-2 rounded-md'>
                                    <Stack spacing={2}>
                                        {Object.keys(pdfThumbnails).map(key => {
                                            return (
                                                <div className='flex flex-col justify-center items-center'>
                                                    <span className={classNames({'border-4 border-sky-500': pageNumber === parseInt(key) + 1}, 'cursor-pointer')}>
                                                        <img key={key} src={'data:image/jpeg;base64,' + pdfThumbnails[key]} style={{height: 100}} alt='Page' onClick={() => {
                                                            setPageNumber(parseInt(key) + 1);
                                                        }} />
                                                    </span>
                                                    <p className='text-center text-sm'>{parseInt(key) + 1}</p>
                                                </div>
                                            );
                                        })}
                                    </Stack>
                                </PerfectScrollbar>
                                }
                            </Center>
                            <Divider className='my-10' />
                            <p className='text-center mb-10'>Settings</p>
                        </CardBody> 
                    </Card>
                </Grid.Col>
            </Grid>
        </>
    )
}

export default AgreementCreator;