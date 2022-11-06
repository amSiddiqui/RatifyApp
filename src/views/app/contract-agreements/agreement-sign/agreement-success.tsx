import React from 'react';
import {
    Card,
    Center,
    Group,
    SimpleGrid,
    Stack,
    Image,
    Modal
} from '@mantine/core';
import { Button } from 'reactstrap';
import { useSearchParams } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import SignupForm from '../../../user/signup-form';
import { useDispatch } from 'react-redux';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { BrowserData, SignerMetaData } from '../../../../types/ContractTypes';
import ShowBrowserData from '../show-browser-data';
import confetti from 'canvas-confetti';

const typeToMessage = (type: string) => {
    if (type === 'many') {
        return 'Your request has been received. You will be notified when the document is ready.';
    }
    if (type === 'agreement' || type === 'email' || type === 'error') {
        return 'Looks like something went wrong. We cannot get the final copy of the document at the moment. Please contact the sender.'
    }
    if (type === 'sent') {
        return 'The final document has been emailed to you. Please check your inbox.';
    }
    if (type === 'request') {
        return 'The document is not ready yet. We will email you the final copy of the document once it is ready.';
    }
    return 'Your request has been received. You will be notified when the document is ready.';
};

const AgreementSuccess: React.FC = () => {
    const dispatchFn = useDispatch();
    const contractHelper = React.useMemo(
        () => new ContractHelper(dispatchFn),
        [dispatchFn],
    );
    const [searchParams] = useSearchParams();
    const [token, setToken] = React.useState('');
    const [signerType, setSignerType] = React.useState('');
    const [senderName, setSenderName] = React.useState('');
    const [organizationName, setOrganizationName] = React.useState('');
    const [showDocumentCopy, setShowDocumentCopy] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [respType, setRespType] = React.useState('');
    const [showSignerMeta, setShowSignerMeta] = React.useState(false);
    const [signerMeta, setSignerMeta] = React.useState<SignerMetaData>();
    const [browserData, setBrowserData] = React.useState<BrowserData>();


    const matches = useMediaQuery('(max-width: 800px)');

    
    const fire = React.useCallback(() => {
        confetti({
            particleCount: 200,
            angle: 60,
            spread: 60,
            origin: { x: 0, y: 0.8 }
          });
        // and launch a few from the right edge
        confetti({
            particleCount: 200,
            angle: 120,
            spread: 60,
            origin: { x: 1, y: 0.8 }
        });
    }, []);

    React.useEffect(() => {
        const confetti = searchParams.get('confetti');
        const tokenStr = searchParams.get('token');
        if (confetti) {
            fire();
        }
        if (tokenStr) {
            setToken(tokenStr);
        }
    }, [searchParams, fire]);

    React.useEffect(() => {
        let shouldUpdate = true;
        if (token) {
            contractHelper.getSignerSuccessInfo(token).then(data => {
                if (shouldUpdate) {
                    setSenderName(data.data.senderName);
                    setSignerType(data.data.signerType);
                    setOrganizationName(data.data.organizationName);
                }
            }).catch(err => {
                console.log(err);
            });

            contractHelper.getSignerSelfMetaData(token).then(res => {
                if (shouldUpdate) {
                    if (res.valid) {
                        const meta_json = res.meta_data.meta_json;
                        if (meta_json) {
                            const meta = JSON.parse(meta_json) as BrowserData;
                            setBrowserData(meta);
                        }
                        setSignerMeta(res.meta_data);
                    }
                }
            }).catch(err => {

            });
        }

        return () => { shouldUpdate = false; }
    }, [token, contractHelper]);

    const requestDocumentCopy = React.useCallback(() => {
        if (token) {
            setError(false);
            contractHelper.requestFinalDocument(token).then(resp => {
                setRespType(resp.type);
                setShowDocumentCopy(true);
            }).catch(err => {
                setError(true);
                console.log(err.response);
                if (err && err.response && err.response.data) {
                    setRespType(err.response.data.type);
                } else {
                    setRespType('error');
                }
                setShowDocumentCopy(true);
            });
        }
    }, [contractHelper, token]);

    return (
        <>
        <div style={{ backgroundColor: '#F8F8F8' }}>
            <SimpleGrid className='h-screen' cols={2} breakpoints={[{ maxWidth: 800, cols: 1 }]}>
                <Center style={{ height: matches ? '60vh' : '100%', marginTop: matches ? '20px' : '0px', marginBottom: matches ? '20px' : '0px'}}>
                    <Stack spacing='xl' className='px-4'>
                        <Center>
                            <Image className='mb-4 w-[120px] sm:w-[150px] relative' style={{ right: 15 }} src='/static/logos/black.svg' alt='Ratify' />
                        </Center>
                        <div>
                            <h4 className="text-2xl text-center font-bold">
                                {signerType.length > 0 ? `You have successfully ${signerType === 'signer' ? 'signed and sent' : 'approved'} the document.` : 'You have completed the document.'}
                            </h4>
                            <p className="text-center text-muted">
                                Sender {senderName === '' ? '' : ', '+senderName}{organizationName === '' ? '' : ', '+organizationName} will be notified and will receive the
                                {signerType === 'approver' ? ' approved' : ' signed'} document
                            </p>
                        </div>
                        <Group className='mt-3' position="center">
                            <span onClick={() => requestDocumentCopy()}>
                                <Button color="light">
                                    Get a Copy of Document
                                </Button>
                            </span>
                            <span onClick={() => {
                                setShowSignerMeta(true);
                            }}>
                                <Button color="primary">Show Meta Data</Button>
                            </span>
                        </Group>
                    </Stack>
                </Center>
                <Center className="w-full h-full">
                    <Card className="shadow-md w-full mx-4 sm:w-[500px] p-6 md:p-12">
                        <SignupForm title='Try Ratify for free' buttonTitle='Register' />
                    </Card>
                </Center>
            </SimpleGrid>
        </div>
        <Modal
            opened={showDocumentCopy}
            onClose={() => setShowDocumentCopy(false)}
            title={<p className='font-bold'>Document Copy</p>}
            centered
        >
            <Center>
                <div>
                    {error && <Center>
                        <i className='simple-icon-exclamation text-5xl mb-4 text-danger'></i>
                    </Center>}
                    {!error && <Center>
                        <i className='simple-icon-check text-5xl mb-4 text-success'></i>
                    </Center>}
                    <p className='text-lg'>
                        {typeToMessage(respType)}
                    </p>
                    <Group position='right'>
                        <span onClick={() => setShowDocumentCopy(false)}>
                            <Button>
                                Ok
                            </Button>
                        </span>
                    </Group>
                </div>
            </Center>
        </Modal>
        <Modal
            centered
            opened={showSignerMeta}
            onClose={() => setShowSignerMeta(false)}
            title={<p className='font-bold'>Meta Information</p>}
            withCloseButton
            size='lg'
        >
            <ShowBrowserData
                signerMeta={signerMeta}
                browserData={browserData}
            />
        </Modal>
        </>
    );
};
 
export default AgreementSuccess;
