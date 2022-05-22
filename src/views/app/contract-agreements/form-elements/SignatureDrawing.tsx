import { Grid, Group } from '@mantine/core';
import React from 'react';
import SignatureCanvas from 'react-signature-canvas'
import { Button } from 'reactstrap';

interface Props {
    onCanvasReady: (sigCanvas: SignatureCanvas | null) => void;
}

const SignatureDrawing:React.FC<Props> = ({onCanvasReady}) =>{

    const [sigCanvas, setSigCanvas] = React.useState<SignatureCanvas | null>(null);

    return (<>
        <Grid columns={12}>
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
                    }}><Button size='xs' color='light'>Clear</Button></span>
                </Group>
            </Grid.Col>
        </Grid>
        <SignatureCanvas
            ref={(ref) => {
                setSigCanvas(ref);
                onCanvasReady(ref);
            }}
            canvasProps={{width: 580, height: 200, className: 'sigCanvas'}} />
    </>)
}

export default SignatureDrawing;