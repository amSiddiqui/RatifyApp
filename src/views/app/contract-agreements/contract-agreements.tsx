
import React from 'react';
import { Row } from 'reactstrap';
import { useIntl } from 'react-intl';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import './contract-agreements.css';
import CATopBar from './topbar';
import DocumentCarousel from './document_carousel';
import { Modal, Progress, Divider, Tooltip, Group, Center, Stack, Collapse, TextInput } from '@mantine/core';
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
    const [openedTemplates, handlersTemplates] = useDisclosure(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const auth = useSelector((root: RootState) => root.auth);
    const [organization, setOrganization] = React.useState<OrganizationNameResponse>();
    const [showUnverifiedModal, setShowUnverifiedModal] = React.useState(false);
    

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
            

            <Group position='apart' className="mb-2 cursor-pointer">
                <Group onClick={() => {handlersTemplates.toggle()}}  spacing={'xs'}>
                    <span className='relative' style={{top: '-3px'}}> {!openedTemplates && <i className="simple-icon-arrow-right"></i>} {openedTemplates && <i className="simple-icon-arrow-down"></i>} </span>
                    <h1 className="text-2xl mb-0">Select from saved templates</h1>
                </Group>
                <Group>
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
                    {openedTemplates && <TextInput value={searchTerm} onChange={(event) => {
                        setSearchTerm(event.target.value.trim());
                    }} placeholder='Search' radius={'xl'} style={{width: 200}} rightSection={searchTerm.length > 0 ? <span onClick={() => {
                        setSearchTerm('');
                    }} className='text-danger'><MdClose /></span> : ''} icon={<i className='simple-icon-magnifier' />}  />}
                </Group>
            </Group>
            <Collapse in={openedTemplates}>
                <Stack>
                    {templateCategories.map((category, index) => {
                        const cat = category === '' ? 'Default' : category;
                        console.log(cat);
                        console.log({templates});
                        return (<>
                        <Stack key={cat} spacing={'xs'}>
                            <Tooltip label='Template Category' className='w-fit'><h5 className='font-bold w-fit capitalize'>{index + 1}. {cat}</h5></Tooltip>
                            <DocumentCarousel docs={templates.filter(d => d.name.toLowerCase().search(searchTerm.toLocaleLowerCase()) !== -1 && d.category === category).map(d => ({
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
                        </Stack>
                    </>)})}
                </Stack>
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
        </>
    );
};

export default ContractAgreements;
