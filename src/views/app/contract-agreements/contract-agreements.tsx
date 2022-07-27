import React from 'react';
import { Row } from 'reactstrap';
import { useIntl } from 'react-intl';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import './contract-agreements.css';
import CATopBar from './ca-topbar';
import DocumentCarousel from './document-carousel';
import { Modal, Progress, Divider, Group, Center, Stack, TextInput, Select } from '@mantine/core';
import { ContractHelper } from '../../../helpers/ContractHelper';
import { AppDispatch, RootState } from '../../../redux';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { AgreementTemplate } from '../../../types/ContractTypes';
import { useDisclosure } from '@mantine/hooks';
import { MdClose } from 'react-icons/md';
import { OrganizationNameResponse } from '../../../types/AuthTypes';
import { AuthHelper } from '../../../helpers/AuthHelper';
import PdfViewer from './pdf-viewer';

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
    const authHelper = React.useMemo(
        () => new AuthHelper(dispatchFn),
        [dispatchFn],
    );
    const [uploading, setUploading] = React.useState(false);
    const [uploadError, setUploadError] = React.useState('');
    const [progress, setProgress] = React.useState(0);
    const [newContractId, setNewContractId] = React.useState(-1);
    const [templates, setTemplates] = React.useState<AgreementTemplate[]>([]);
    const [templateCategories, setTemplateCategories] = React.useState<string[]>([]);
    const [selectedTemplate, setSelectedTemplate] = React.useState<AgreementTemplate | null>(null);
    const [openTemplateConfirm, templateConfirmHandlers] = useDisclosure(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const auth = useSelector((root: RootState) => root.auth);
    const [organization, setOrganization] = React.useState<OrganizationNameResponse>();
    const [showUnverifiedModal, setShowUnverifiedModal] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState('');
    const [showPdfView, setShowPdfView] = React.useState(false);

    const uploadProgress = React.useCallback((progressEvent: any) => {
        setProgress(progressEvent.loaded / progressEvent.total);
    }, []);

    const onDocSelect = React.useCallback(
        (files: File[]) => {
            if (!organization || !auth.user) {
                toast.error('Something went wrong! Please try again later.');
                return;
            }
            if (!auth.user.verified || organization.stepsCompleted < 3) {
                setShowUnverifiedModal(true);
                return;
            }
            
            setUploading(true);
            setUploadError('');
            setShowPdfConfirm(true);
            contractHelper
                .uploadDocument(files[0], uploadProgress)
                .then((data) => {
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
        [uploadProgress, contractHelper, organization, auth],
    );
    const onAgreementCreateFromTemplate = React.useCallback(() => {
        if (selectedTemplate) {
            contractHelper.createAgreement(selectedTemplate.documents[0], selectedTemplate.name).then((data) => {
                toast.success('Agreement created!');
                templateConfirmHandlers.close();
                navigate(`/agreements/add-signers/${data.id}`);
            }).catch(err => {
                toast.error('Failed to create agreement. Try again Later!');
                console.log(err);
            })
        }
    }, [selectedTemplate, contractHelper, navigate, templateConfirmHandlers]);

    const onAgreementUpdate = React.useCallback((id: number, name: string, category: string, description: string) => {
        setTemplates(prev => {
            const newTemplates = [...prev];
            for (const template of newTemplates) {
                if (template.id === id) {
                    template.name = name;
                    template.category = category;
                    template.description = description;
                }
            }
            const categories = new Set(newTemplates.map(t => t.category));
            setTemplateCategories(Array.from(categories));
            return newTemplates;
        });
    }, []);

    React.useEffect(() => {
        contractHelper
            .getAgreementTemplates().then(data => {
                setTemplates(data);
                const categories = new Set(data.map(t => t.category));
                setTemplateCategories(Array.from(categories));
            })
            .catch(err => {
                console.log(err);
                toast.error('Cannot fetch templates. Try Again Later!');
            });
    }, [contractHelper]);

    React.useEffect(() => {
        authHelper
            .getOrganizationName().then(resp => {
                setOrganization(resp);
            }).catch(err => {
                console.log(err);
            });
    }, [authHelper]);

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
            
            <Stack>
                <Group position='apart' className="mb-2">
                    <Stack spacing={2}>
                        <h1 className="text-2xl mb-0 p-0">Select from saved templates</h1>
                        <div>
                            {templates.length === 0 && (
                                <p>No templates found</p>
                            )}
                            {templates.length > 0 && (
                                <p>
                                    {templates.filter(d => d.name.toLowerCase().search(searchTerm.toLocaleLowerCase()) !== -1).length}{' '}
                                    {templates.filter(d => d.name.toLowerCase().search(searchTerm.toLocaleLowerCase()) !== -1).length > 1
                                        ? 'templates'
                                        : 'template'}{' '}
                                    found
                                </p>
                            )}
                        </div>
                    </Stack>
                    <div className='text-lg w-fit py-1 px-3 border-2 border-gray-300 rounded-full'>
                        {searchTerm.length === 0 && <Group position='apart'>
                            <span className='capitalize text-primary'>{selectedCategory === '' ? 'All Templates' : selectedCategory}</span>
                            {selectedCategory !== '' && <MdClose className='cursor-pointer' onClick={() => setSelectedCategory('')} />}
                        </Group>}
                        {searchTerm.length > 0 && <Group position='apart'>
                            <span className='capitalize text-primary'>Search Result</span>
                            <MdClose onClick={() => setSearchTerm('')} className='cursor-pointer'></MdClose>
                        </Group>}
                    </div>
                    <Group>
                        <TextInput value={searchTerm} onChange={(event) => {
                            setSearchTerm(event.target.value.trim());
                        }} placeholder='Search' style={{width: 200}} rightSection={searchTerm.length > 0 ? <span onClick={() => {
                            setSearchTerm('');
                        }} className='text-danger'><MdClose /></span> : ''} icon={<i className='simple-icon-magnifier' />}  />
                        
                    </Group>
                </Group>
                <Stack spacing={'xs'}>
                    <Select style={{ maxWidth: 200, position: 'relative', top: -12 }} label='Select Category' placeholder='Category' data={[
                        { value: '', label: 'All' },
                        ...templateCategories.map(c => ({ value: c, label: c }))
                        ]} value={selectedCategory} onChange={val => setSelectedCategory(val ? val : '')} />
                    <DocumentCarousel 
                    onTemplateDelete={(id) => {
                        setTemplates(prev => {
                            const newTemplates = prev.filter(t => t.id !== id);
                            const categories = new Set(newTemplates.map(t => t.category));
                            setTemplateCategories(Array.from(categories));
                            return newTemplates;
                        });
                    }}
                    onTemplateUpdate={onAgreementUpdate} 
                    contractHelper={contractHelper}  
                    categories={templateCategories} 
                    templates={templates.filter(d => d.name.toLowerCase().search(searchTerm.toLocaleLowerCase()) !== -1 && (!selectedCategory || d.category === selectedCategory))}
                    intl={intl} 
                    onViewClick={(id) => {
                        // get template using id from templates
                        const ts = templates.filter(t => t.id === id);
                        if (ts.length > 0) {
                            const tp = ts[0];
                            setSelectedTemplate(tp);
                            setShowPdfView(true);
                        }
                    }}
                    onCreateClick={(id) => {
                        const ts = templates.filter(t => t.id === id);
                        if (ts.length > 0) {
                            const tp = ts[0];
                            setSelectedTemplate(tp);
                            templateConfirmHandlers.open();
                        }
                    }}
                    />
                </Stack>
            </Stack>
            
            <Modal
                closeOnEscape={false}
                closeOnClickOutside={false}
                centered
                opened={showPdfConfirm}
                onClose={() => setShowPdfConfirm(false)}>
                <div className="flex flex-col items-center justify-between">
                    <div className="w-full text-center">
                    {uploading && <h5>Uploading Document</h5>}
                    {!uploading && <h5>Document Uploaded</h5>}
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
                                    <p>Your document is uploaded and ready to use!</p>
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
                                            `/agreements/add-signers/${newContractId}`,
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
                    <h5 className='mb-0'>Create document from template</h5>
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
            <Modal
                opened={showUnverifiedModal}
                onClose={() => setShowUnverifiedModal(false)}
                centered
            >
                {(auth.user && organization) && 
                <>
                    {!auth.user.verified && <Stack className='text-center'>
                        <h5>Please verify your email first before creating a document.</h5>
                        <span onClick={() => {navigate(`/account/profile-settings`)}}><Button color='primary'>Profile Settings</Button></span>
                    </Stack>}
                    {auth.user.verified && organization.stepsCompleted < 3 && <Stack className='text-center'>
                        <h5>Please complete the business profile before continuing!</h5>
                        <span onClick={() => {navigate(`/account/business-profile`)}}><Button color='primary'>Business Profile</Button></span>
                    </Stack>}
                </>}
            </Modal>
            <Modal
                opened={showPdfView}
                onClose={() => {setShowPdfView(false)}}
                size='xl'
                overflow='inside'
                id='contract-agreements-pdf-viewer-modal'
                title={<Stack spacing={2}>
                    <Group>
                        <p><span>Document: </span><span className='font-bold'>{selectedTemplate && (selectedTemplate.name.length > 40 ? selectedTemplate.name.substring(0, 40) + '...' : selectedTemplate.name)}</span></p>
                        <p><span>Category: </span><span className='font-bold'>{selectedTemplate?.category}</span></p>
                    </Group>
                    {selectedTemplate && selectedTemplate.description && <p><span>Description: </span><span>{selectedTemplate && (selectedTemplate.description.length > 100) ? selectedTemplate.description.substring(0, 100) + '...' : selectedTemplate?.description}</span></p>}
                </Stack>}
            >
                {selectedTemplate && <PdfViewer contractHelper={contractHelper} documentId={selectedTemplate.documents[0].toString()} />}
            </Modal>
        </>
    );
};

export default ContractAgreements;
