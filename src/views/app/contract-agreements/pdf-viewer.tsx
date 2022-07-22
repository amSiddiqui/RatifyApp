import { Center, Loader } from '@mantine/core';
import React from 'react';
import { ContractHelper } from '../../../helpers/ContractHelper';

type Props = {
    documentId: string;
    contractHelper: ContractHelper;
}

const PdfViewer:React.FC<Props> = ({documentId, contractHelper}) => {
    const [doc, setDoc] = React.useState('');
    const [error, setError] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        contractHelper.getPdfDocument(documentId).then(data => {
            setDoc(data);
            setLoading(false);
        }).catch(err => {
            console.log(err);
            setLoading(false);
            setError(true);
        });
    }, [documentId, contractHelper]);


    return <div style={{ height: '550px', }}>
        {loading && <Center className='h-full w-full'>
            <Loader size={'xl'} />
        </Center>}
        {!loading && !error && <object data={'data:application/pdf;base64,'+doc} type="application/pdf" style={{
            width: '100%',
            height: '100%',
        }}>
            <p>Alternative text - include a link <a href="http://africau.edu/images/default/sample.pdf">to the PDF!</a></p>
        </object>}
        {!loading && error && 
            <p className='text-xl text-muted'>Cannot load the document at the moment. Try again later.</p>
        }
    </div>
}

export default PdfViewer;