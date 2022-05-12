import React from 'react';
import { Badge, Row } from 'reactstrap';
import { useIntl } from 'react-intl';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import './contract-agreements.css';
import CATopBar from './topbar';
import DocumentCarousel from './document_carousel';
import { Modal, Progress, Divider, Group, Center, Stack, Collapse } from '@mantine/core';
import { ContractHelper } from '../../../helpers/ContractHelper';
import { AppDispatch } from '../../../redux';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Agreement, AgreementTemplate } from '../../../types/ContractTypes';
import { useDisclosure } from '@mantine/hooks';

const ContractAgreements: React.FC = () => {
    const match = useLocation();
    const intl = useIntl();

    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();

    const [showPdfConfirm, setShowPdfConfirm] = React.useState(false);
    const dispatchFn = useDispatch<AppDispatch>();
    const contractHelper = React.useMemo(
        () => new ContractHelper(dispatchFn),
        [dispatchFn],
    );
    const [uploading, setUploading] = React.useState(false);
    const [uploadError, setUploadError] = React.useState('');
    const [progress, setProgress] = React.useState(0);
    const [newContractId, setNewContractId] = React.useState(-1);
    const [drafts, setDrafts] = React.useState<Agreement[]>([]);
    const [templates, setTemplates] = React.useState<AgreementTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = React.useState<AgreementTemplate | null>(null);
    const [openTemplateConfirm, templateConfirmHandlers] = useDisclosure(false);

    const [openedDrafts, handlersDrafts] = useDisclosure(true);
    const [openedTemplates, handlersTemplates] = useDisclosure(false);

    const uploadProgress = React.useCallback((progressEvent: any) => {
        setProgress(progressEvent.loaded / progressEvent.total);
    }, []);

    const onDocSelect = React.useCallback(
        (files: File[]) => {
            setUploading(true);
            setUploadError('');
            setShowPdfConfirm(true);
            contractHelper
                .uploadDocument(files[0], uploadProgress)
                .then((data) => {
                    toast.success('Document uploaded');
                    contractHelper
                        .createAgreement(data.id)
                        .then((resp) => {
                            setNewContractId(resp.id);
                        })
                        .catch((err) => {
                            toast.error('Failed to create agreement');
                            setUploadError('Failed to create agreement');
                        });
                })
                .catch((err) => {
                    toast.error('Error uploading document');
                    setUploadError('Error uploading document');
                })
                .finally(() => {
                    setUploading(false);
                    setProgress(0);
                });
        },
        [uploadProgress, contractHelper],
    );
    const onAgreementCreateFromTemplate = React.useCallback(() => {
        if (selectedTemplate) {
            contractHelper.createAgreement(selectedTemplate.documents[0], selectedTemplate.name).then((data) => {
                toast.success('Agreement created!');
                templateConfirmHandlers.close();
                navigate(`/documents/add-signers/${data.id}`);
            }).catch(err => {
                toast.error('Failed to create agreement. Try again Later!');
                console.log(err);
            })
        }
    }, [selectedTemplate, contractHelper, navigate, templateConfirmHandlers]);

    React.useEffect(() => {
        contractHelper
            .getDrafts()
            .then((data) => {
                setDrafts(data);
            })
            .catch((err) => {
                console.log(err);
                toast.error('Cannot fetch drafts. Try Again Later!');
            });

        contractHelper
            .getAgreementTemplates().then(data => {
                setTemplates(data);
            })
            .catch(err => {
                console.log(err);
                toast.error('Cannot fetch templates. Try Again Later!');
            });
    }, [contractHelper]);

    React.useEffect(() => {
        const error_code = params.get('error');
        if (error_code && error_code.length > 0) {
            toast.error(
                intl.formatMessage({ id: `contract.error.${error_code}` }),
            );
        }
        setParams({});
    }, [params, intl, setParams]);

    return (
        <>
            <Row>
                <Colxx xxs="12">
                    <Breadcrumb
                        heading="menu.contracts-agreements"
                        match={match}
                    />
                    <Separator className="mb-14" />
                </Colxx>
            </Row>
            <CATopBar intl={intl} onDocSelect={onDocSelect} />
            <Divider
                className="mb-10 mt-10"
                label={<p className="text-2xl">OR</p>}
                labelPosition="center"
            />
            <div onClick={() => {handlersDrafts.toggle()}} className="flex justify-between items-center mb-2 cursor-pointer">
                <div>
                    <span className='relative' style={{top: '-2px'}}> {!openedDrafts && <i className="simple-icon-arrow-right"></i>} {openedDrafts && <i className="simple-icon-arrow-down"></i>} </span>
                    <h1 className="text-2xl mb-0">Drafts</h1>
                    {drafts.length > 0 && <Badge className='ml-2 relative' style={{top: '-4px'}} pill>{drafts.length}</Badge>}
                </div>
                {drafts.length === 0 && (
                    <p>No drafts</p>
                )}
                {drafts.length > 0 && (
                    <p>
                        {drafts.length}{' '}
                        {drafts.length > 1
                            ? 'drafts'
                            : 'draft'}{' '}
                        found
                    </p>
                )}
            </div>
            <Collapse in={openedDrafts}>
                <DocumentCarousel docs={drafts.map(d => ({
                    id: d.id,
                    doc_id: d.documents[0],
                    name: d.title,
                }))} intl={intl} onClick={(id, blank) => {
                    if (blank) {
                        window.open(`/documents/add-signers/${id}`, '_blank');
                    } else {
                        navigate(`/documents/add-signers/${id}`);
                    }
                }} />
            </Collapse>

            <div onClick={() => {handlersTemplates.toggle()}} className="flex justify-between items-center mb-2 cursor-pointer">
                <div>
                    <span className='relative' style={{top: '-2px'}}> {!openedTemplates && <i className="simple-icon-arrow-right"></i>} {openedTemplates && <i className="simple-icon-arrow-down"></i>} </span>
                    <h1 className="text-2xl mb-0">Select from saved templates</h1>
                </div>
                {drafts.length === 0 && (
                    <p>No templates found</p>
                )}
                {drafts.length > 0 && (
                    <p>
                        {templates.length}{' '}
                        {templates.length > 1
                            ? 'templates'
                            : 'template'}{' '}
                        found
                    </p>
                )}
            </div>
            <Collapse in={openedTemplates}>
                <DocumentCarousel docs={templates.map(d => ({
                    id: d.id,
                    doc_id: d.documents[0],
                    name: d.name,
                }))} intl={intl} onClick={(id, blank) => {
                    // get template using id from templates
                    const ts = templates.filter(t => t.id === id);
                    if (ts.length > 0) {
                        const tp = ts[0];
                        setSelectedTemplate(tp);
                        templateConfirmHandlers.open();
                    }
                }} />
            </Collapse>
            
            <Modal
                closeOnEscape={false}
                closeOnClickOutside={false}
                centered
                opened={showPdfConfirm}
                onClose={() => setShowPdfConfirm(false)}>
                <div className="flex flex-col items-center justify-between">
                    <div className="w-full text-center">
                        <h5>Uploading Document</h5>
                    </div>
                    <div className="my-4 w-full">
                        <Center style={{ width: '100%', height: '5rem' }}>
                            {uploadError.length > 0 && (
                                <Stack>
                                    <span className="text-center text-3xl text-danger">
                                        <i className="simple-icon-exclamation"></i>
                                    </span>
                                    <p className="text-danger">{uploadError}</p>
                                </Stack>
                            )}

                            {uploadError.length === 0 && uploading && (
                                <Stack className="w-full">
                                    <p className="text-center">
                                        {progress < 0.9
                                            ? 'Uploading....'
                                            : 'Processing....'}
                                    </p>
                                    <Progress
                                        animate
                                        size={'lg'}
                                        value={progress * 100}
                                        style={{ width: '100%' }}
                                    />
                                </Stack>
                            )}

                            {uploadError.length === 0 && uploading === false && (
                                <Stack>
                                    <span className="text-success text-center text-3xl">
                                        <i className="simple-icon-check"></i>
                                    </span>
                                    <p>Document Ready!</p>
                                </Stack>
                            )}
                        </Center>
                    </div>
                    <div className="w-full">
                        <Group position="right">
                            <Button
                                color="light"
                                onClick={() => setShowPdfConfirm(false)}>
                                Cancel
                            </Button>
                            {uploadError.length === 0 && (
                                <Button
                                    onClick={() => {
                                        navigate(
                                            `/documents/add-signers/${newContractId}`,
                                        );
                                    }}
                                    disabled={uploading}
                                    color="primary">
                                    Continue
                                </Button>
                            )}
                            {uploadError.length > 0 && (
                                <Button
                                    color="primary"
                                    onClick={() => {
                                        setShowPdfConfirm(false);
                                    }}>
                                    Try Later!
                                </Button>
                            )}
                        </Group>
                    </div>
                </div>
            </Modal>
            <Modal
                opened={openTemplateConfirm}
                onClose={templateConfirmHandlers.close}
                centered
            >
                <Stack className='text-center' style={{marginBottom: (28 + 16)}}>
                    <h5 className='mb-0'>Create agreement from template</h5>
                    <div className='mb-3'>
                        <h5>{selectedTemplate && selectedTemplate.name}</h5>
                        <p className='mb-0 text-gray-600'>{selectedTemplate && selectedTemplate.description}</p>
                    </div>
                    <Group position='center'>
                        <Button onClick={templateConfirmHandlers.close} color='light'>Cancel</Button>
                        <span onClick={onAgreementCreateFromTemplate}><Button color='success'>Create</Button></span>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
};

export default ContractAgreements;
