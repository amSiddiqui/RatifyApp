import { Grid, Group, ThemeIcon } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import React from 'react';
import { BsEraserFill } from 'react-icons/bs';
import SignatureCanvas from 'react-signature-canvas'

interface Props {
    onCanvasReady: (sigCanvas: SignatureCanvas | null) => void;
}

const SignatureDrawing:React.FC<Props> = ({onCanvasReady}) =>{

    const [sigCanvas, setSigCanvas] = React.useState<SignatureCanvas | null>(null);
    const { width } = useViewportSize();

    return (<>
        <Grid columns={12} className='mb-2'>
            <Grid.Col span={3}></Grid.Col>
            <Grid.Col span={6}>
                <p className='text-center text-lg'>Draw Here</p>
            </Grid.Col>
            <Grid.Col span={3}>
                <Group position='right'>
                    <span onClick={() => {
                        if (sigCanvas) {
                            sigCanvas.clear();
                        }
                    }}>
                        <ThemeIcon radius={'xl'} color='gray'>
                            <BsEraserFill />
                        </ThemeIcon>
                    </span>
                </Group>
            </Grid.Col>
        </Grid>
        <SignatureCanvas
            ref={(ref) => {
                setSigCanvas(ref);
                onCanvasReady(ref);
            }}
            canvasProps={{width:  width > 590 ? 580 : width * 0.85 , height: 200, className: 'sigCanvas'}} />
    </>)
}

export default SignatureDrawing;