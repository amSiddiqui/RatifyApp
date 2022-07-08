import React from 'react';
import {
    Card,
    Center,
    Group,
    SimpleGrid,
    Stack,
    Image
} from '@mantine/core';
import { Button } from 'reactstrap';
import {  useNavigate, useSearchParams } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useViewportSize } from '@mantine/hooks';
import SignupForm from '../../../user/signup-form';

const AgreementSuccess: React.FC = () => {
    const navigate = useNavigate();
    const { height, width } = useViewportSize();
    const [showConfetti, setShowConfetti] = React.useState(false);
    const [searchParams] = useSearchParams();

    React.useEffect(() => {
        const confetti = searchParams.get('confetti');
        let timeout: NodeJS.Timeout | null = null; 
        if (confetti) {
            setShowConfetti(true);
            timeout = setTimeout(() => {
                setShowConfetti(false);
            }, 1400);
        }
        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        }
    }, [searchParams]);

    return (
        <>
        <div style={{ backgroundColor: '#F8F8F8' }}>
            <SimpleGrid className='h-screen' cols={2} breakpoints={[{ maxWidth: 600, cols: 1 }]}>
                <Center className="px-10 mb-36 h-100 mt-10 sm:mt-0">
                    <Stack spacing='xl'>
                        <Center>
                            <Image className='mb-4 w-[120px] sm:w-[150px] relative' style={{ right: 15 }} src='/static/logos/black.svg' alt='Ratify' />
                        </Center>
                        <div>
                            <h4 className="text-2xl  font-bold">
                                You've filled and signed the document
                            </h4>
                            <p className=" text-muted">
                                The sender will be notified and will receive the
                                signed document
                            </p>
                        </div>
                        <Group className='mt-3' position="center">
                            <span>
                                <Button color="light">
                                    Get a Copy of Document
                                </Button>
                            </span>
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
        <Confetti gravity={0.1} width={width} numberOfPieces={showConfetti ? 200 : 0} height={height} />
        </>
    );
};
 
export default AgreementSuccess;
