import { Center, SimpleGrid, Stack, Image, Group, Card } from '@mantine/core';
import { Button } from 'reactstrap';
import React from 'react';
import SignupForm from '../../../user/signup-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ContractHelper } from '../../../../helpers/ContractHelper';


const AgreementDecline:React.FC = () => {
    const navigate = useNavigate();
    const [declineMessage, setDeclineMessage] = React.useState('');
    const dispatchFn = useDispatch();
    const contractHelper = React.useMemo(
        () => new ContractHelper(dispatchFn),
        [dispatchFn],
    );
    const [searchParams] = useSearchParams();
    const [token, setToken] = React.useState('');

    React.useEffect(() => {
        const tokenStr = searchParams.get('token');
        if (tokenStr) {
            setToken(tokenStr);
        }
    }, [searchParams]);

    React.useEffect(() => {
        if (token) {
            contractHelper.getSignerDeclineMessage(token).then(data => {
                setDeclineMessage(data.data.declineMessage);
            }).catch(err => {
                console.log(err);
            })
        }
    }, [contractHelper, token]);


    return <>
        <div style={{ backgroundColor: '#F8F8F8' }}>
            <SimpleGrid className='h-screen' cols={2} breakpoints={[{ maxWidth: 600, cols: 1 }]}>
                <Center className="px-10 mb-36 h-100 mt-10 sm:mt-0">
                    <Stack>
                        <Center>
                            <Image className='mb-4 w-[120px] sm:w-[150px] relative' style={{ right: 15 }} src='/static/logos/black.svg' alt='Ratify' />
                        </Center>
                        <h4 className="text-2xl text-center font-bold">
                            You've declined the document.
                        </h4>
                        {declineMessage && <div>
                            <p className='text-muted'>Reason for decline</p>
                            <p>{declineMessage}</p>
                        </div>}
                        <p className="text-center text-muted">
                            The sender has been notified and contact you shortly.
                        </p>
                        <Group position="center">
                            <span onClick={() => {
                                navigate(`/`);
                            }}>
                                <Button color="primary">Try Ratify</Button>
                            </span>
                        </Group>
                    </Stack>
                </Center>
                <Center className="w-full h-full p-3">
                    <Card className="shadow-md w-full sm:w-[500px] p-6 md:p-12">
                        <SignupForm title='Try Ratify for free' buttonTitle='Register' />
                    </Card>
                </Center>
            </SimpleGrid>
        </div>
    </>;
}

export default AgreementDecline;