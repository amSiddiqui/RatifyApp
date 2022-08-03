import { Center, Divider, Grid, Group, Modal, SimpleGrid, Stack, TextInput } from '@mantine/core';
import { useDisclosure, useInputState } from '@mantine/hooks';
import React from 'react';
import { Button } from 'reactstrap';
import  { FcSignature } from 'react-icons/fc';
import { MdClear, MdDraw, MdTextFormat } from 'react-icons/md';
import SignatureDrawing from './signature-drawing';
import SignatureCanvas from 'react-signature-canvas'
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import { INPUT_TOP_OFFSET, getBgColorLight, getBorderColorBold} from '../types';

interface Props  {
    placeholder: string;
    onSignComplete: (sig: string) => void;
    initialValue?: string;
    color: string;
    height: number;
}

const SignatureInput:React.FC<Props> = ({placeholder, onSignComplete, initialValue, color, height}) => {
    
    const [showSignModal, signModalHandlers] = useDisclosure(false);
    const [lastName, setLastName] = useInputState('');
    const [firstName, setFirstName] = useInputState('');
    const [drawing, setDrawing] = React.useState(false);
    const [sigCanvas, setSigCanvas] = React.useState<SignatureCanvas | null>(null);
    const [finalImage, setFinalImage] = React.useState(initialValue || '');
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [imageUploaded, setImageUploaded] = React.useState(false);
    const writtenSignRef = React.useRef<HTMLDivElement>(null);
    const [signed, setSigned] = React.useState(() => {
        if (initialValue) {
            return true;
        }
        return false;
    });

    const onFileSelect = () => {
        if (fileInputRef.current === null || fileInputRef.current.files === null) {
            return;
        }   
        const file = fileInputRef.current.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setFinalImage(reader.result as string);
            setImageUploaded(true);
        }
    }

    const onSign = () => {
        let image = finalImage;
        if (!drawing && !imageUploaded) {
            if (!lastName && !firstName) {
                toast.error('Please add a signature');
                return;
            }

            if (writtenSignRef.current) {
                html2canvas(writtenSignRef.current).then(canvas => {
                    image = canvas.toDataURL();
                    setFinalImage(image);
                    setSigned(true);
                    setDrawing(false);
                    setImageUploaded(false);
                    onSignComplete(image);
                    signModalHandlers.close();
                });
                return;
            }
        }
        if (drawing) {
            if (!sigCanvas) {
                toast.error('Please draw a signature');
                return;
            }
            if (sigCanvas.isEmpty()) {
                toast.error('Please draw a signature');
                return;
            }
            image = sigCanvas.toDataURL();
            setFinalImage(image);
        }
        if (imageUploaded) {
            if (!finalImage) {
                toast.error('Please add a signature');
                return;
            }
        }
        setSigned(true);
        setDrawing(false);
        setImageUploaded(false);
        onSignComplete(image);
        signModalHandlers.close();
    }

    return (
    <>
        <Group position='right'><i onClick={
            () => {
                setSigned(false);
                setDrawing(false);
                setImageUploaded(false);
                setFinalImage('');
                onSignComplete('');
            }
        } className='cursor-pointer text-black font-bold'><MdClear></MdClear></i></Group>
        {!signed && <Center onClick={() => {signModalHandlers.open(); setSigned(false); }} className={'w-full h-full cursor-pointer text-gray-600 ' + getBgColorLight(color)} >
            {placeholder}
        </Center>}
        {signed && 
        <Center onClick={() => {signModalHandlers.open(); setSigned(false);}} className={'w-full h-full border-2 cursor-pointer text-gray-600 ' + getBorderColorBold(color)}>
            <img style={{height: height - INPUT_TOP_OFFSET, width: 'auto'}} src={finalImage} alt="Signature" />
        </Center>}

        <Modal size={'lg'} title='Add your signature' centered opened={showSignModal} onClose={signModalHandlers.close}>
            <Stack>
                {(!drawing && !imageUploaded) && <>
                <SimpleGrid breakpoints={[
                    { minWidth: 640, cols: 2 },
                    { maxWidth: 640, cols: 1 },

                ]} className='w-full'>
                    <Center onClick={() => setDrawing(true)} className='bg-gray-100 px-3 cursor-pointer py-4'>
                        <div className='flex items-center justify-between'>
                            <MdDraw className='text-5xl' />
                            <div className='ml-3'>
                                <p className='text-lg'>Draw your signature</p>
                                <p className='text-muted'>Draw your signature here using your touchscreen.</p>
                            </div>
                        </div>
                    </Center>
                    <Center onClick={() => {
                        if (fileInputRef.current) {
                            fileInputRef.current.click();
                        }
                    }} className='bg-gray-100 cursor-pointer px-3 py-4'>
                        <div className='flex items-center justify-between'>
                            <FcSignature className='text-6xl' />
                            <div className='ml-3'>
                                <p className='text-lg'>Upload your signature</p>
                                <p className='text-muted'>Upload an image of your handwritten signature here.</p>
                            </div>
                        </div>
                    </Center>
                </SimpleGrid>
                <input onChange={onFileSelect} ref={fileInputRef} type="file" className='hidden' accept='image/*' />            
                <Divider label='OR' labelPosition='center'/>
                <Stack>
                    <Group>
                        <MdTextFormat className='text-5xl' />
                        <div>
                            <p className='text-lg'>Type your full name</p>
                            <p className='text-muted'>Enter your full name to generate your signature.</p>
                        </div>
                    </Group>
                    <Grid columns={12}>
                        <Grid.Col md={6}>
                            <TextInput placeholder='First Name' value={lastName} onChange={setLastName} />
                        </Grid.Col>
                        <Grid.Col md={6}>
                            <TextInput placeholder='Surname' value={firstName} onChange={setFirstName} />
                        </Grid.Col>
                    </Grid>
                    <Center style={{height: 120}} className='w-full bg-gray-100'>
                        <div className='bg-transparent px-1 flex items-center justify-center' style={{height: 72}} ref={writtenSignRef}>
                            <p style={{top: '-18px'}} className='text-3xl relative font-bold signature-font-scriptin'>{lastName}</p>
                            <p style={{top: '-18px'}} className='text-3xl ml-3 relative font-bold signature-font-scriptin'>{firstName}</p>
                        </div>
                    </Center>
                </Stack>
                </>}
                <div>
                    {drawing && <SignatureDrawing onCanvasReady={(canvas) => setSigCanvas(canvas)} />}
                    {imageUploaded && <Center className='w-full h-full'><img src={finalImage} style={{width: '400px', height: 'auto'}}  alt='Signature' /></Center>}
                </div>
                <Group position='right'>
                    {!drawing && <span onClick={() => {
                        setFinalImage('');
                        setImageUploaded(false);
                        setDrawing(false);
                        setFirstName('');
                        setLastName('');
                        signModalHandlers.close();
                    }}><Button color='light'>Cancel</Button></span>}
                    {drawing && <span onClick={() => setDrawing(false)}><Button color='light'>Back</Button></span>}
                    <span onClick={() => onSign()}><Button color='primary'>Sign</Button></span>
                </Group>
            </Stack>
        </Modal>
    </>
    );
};

export default SignatureInput;