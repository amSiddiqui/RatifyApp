import React from 'react';
import { Row } from 'reactstrap';
import { useIntl } from 'react-intl';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import './contract-agreements.css';
import CATopBar from './topbar';
import CATemplates from './templates';
import { Modal, Progress, Divider, Group, Center, Stack } from '@mantine/core';
import { ContractHelper } from '../../../helpers/ContractHelper';
import { AppDispatch } from '../../../redux';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { DocumentsResponseType } from '../../../types/ContractTypes';

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
    const [templateDocuments, setTemplateDocuments] = React.useState<
        DocumentsResponseType[]
    >([]);

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

    React.useEffect(() => {
        contractHelper
            .getAllDocuments()
            .then((data) => {
                setTemplateDocuments(data);
            })
            .catch((err) => {
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
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl">Select from saved templates</h1>
                {templateDocuments.length === 0 && (
                    <p>Currently there are no saved templates</p>
                )}
                {templateDocuments.length > 0 && (
                    <p>
                        {templateDocuments.length}{' '}
                        {templateDocuments.length > 1
                            ? 'templates'
                            : 'template'}{' '}
                        found
                    </p>
                )}
            </div>
            <CATemplates templates={templateDocuments} intl={intl} />
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
        </>
    );
};

export default ContractAgreements;
