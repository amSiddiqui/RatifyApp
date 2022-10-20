import { Center, Loader } from '@mantine/core';
import React from 'react';
import { ContractHelper } from '../../../../helpers/ContractHelper';

type Props = {
    documentId: string;
    contractHelper: ContractHelper;
    docTitle: string;
}

const PdfViewer:React.FC<Props> = ({documentId, contractHelper, docTitle}) => {
    const [doc, setDoc] = React.useState('');
    const [error, setError] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let shouldUpdate = true;
        contractHelper.getPdfDocument(documentId).then(data => {
            if (shouldUpdate) {
                setDoc(data);
                setLoading(false);
            }
        }).catch(err => {
            if (shouldUpdate) {
                console.log(err);
                setLoading(false);
                setError(true);
            }
        });

        return () => { shouldUpdate = false; }
    }, [documentId, contractHelper]);


    return <div style={{ height: '100%', }}>
        {loading && <Center className='h-full w-full'>
            <Loader size={'xl'} />
        </Center>}
        {!loading && !error && <iframe title={docTitle} src={'data:application/pdf;base64,'+doc} style={{
            width: '100%',
            height: '100%',
        }}>
            <p>Alternative text - include a link <a href="http://africau.edu/images/default/sample.pdf">to the PDF!</a></p>
        </iframe>}
        {!loading && error && 
            <p className='text-xl text-muted'>Cannot load the document at the moment. Try again later.</p>
        }
    </div>
}

export default PdfViewer;