import React from 'react';
import { Skeleton } from '@mantine/core';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';

type Props = {
   pdf: string; 
   pageNumber: number;
   onDocLoadSuccess: (numPages: number) => void;
   children: React.ReactNode;
}; 

const BaseDocumentViewer = React.forwardRef<HTMLDivElement, Props>(({ children, pdf, pageNumber, onDocLoadSuccess }, ref) => {
    const [pageDim, setPageDim] = React.useState<{ width: number, height: number }>({ width: 0, height: 0 });

    const onDocumentLoadSuccess = React.useCallback(async (pdfObject: any) => {
        onDocLoadSuccess(pdfObject.numPages);
        const page = await pdfObject.getPage(pageNumber);
        const viewBox = page.getViewport().viewBox;
        
        setPageDim({width: viewBox[2], height: viewBox[3]});
        
    }, [pageNumber, onDocLoadSuccess]);
    
    React.useEffect(() => {
        console.log(pageDim);
        // if page width greater than 791px then get the scale factor
    }, [pageDim]);

    return <div>
        <div
            ref={ref}
            style={{
                height: pageDim.width,
                width: pageDim.height,
                position: 'absolute',
                top: '28px',
                zIndex: 1,
            }}
            className="bg-transparent"
            id='pdf-form-input-container'
        >
            {children}
        </div>
        <Document
            loading={<Skeleton height={1080} />}
            options={{
                workerSrc: '/pdf.worker.js',
            }}
            file={
                'data:application/pdf;base64,' +
                pdf
            }
            onLoadSuccess={
                onDocumentLoadSuccess
            }
        >
            <Page
                loading={
                    <Skeleton height={1080} />
                }
                pageNumber={pageNumber}
                height={1024}
            />
        </Document>
    </div>;
});

export default BaseDocumentViewer;