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
    const [pageOriginalDim, setPageOriginalDim] = React.useState<{ width: number, height: number }>({ width: 0, height: 0 });
    const [pageDim, setPageDim] = React.useState<{ width: number, height: number }>({ width: 0, height: 0 });

    const onDocumentLoadSuccess = React.useCallback(async (pdfObject: any) => {
        onDocLoadSuccess(pdfObject.numPages);
        const page = await pdfObject.getPage(pageNumber);
        const viewBox = page.getViewport().viewBox;
        const width = viewBox[2];
        const height = viewBox[3];
        setPageOriginalDim({width, height});
        let aspect = width / height;
        let newWidth = 791;
        let newHeight = 791 / aspect;
        // round off newHeight
        newHeight = Math.floor(newHeight);

        // check if newHeight is greater than 1024
        if (newHeight > 1024) {
            aspect = width / height;
            newHeight = 1024;
            newWidth = 1024 * aspect;
            // round off newWidth
            newWidth = Math.floor(newWidth);
        }

        setPageDim({width: newWidth, height: newHeight});
    }, [pageNumber, onDocLoadSuccess]);
    
    React.useEffect(() => {
        console.log(pageOriginalDim, pageDim);
        // if page width greater than 791px then get the scale factor
    }, [pageOriginalDim, pageDim]);

    return <div>
        <div
            ref={ref}
            style={{
                height: pageDim.height,
                width: pageDim.width,
                position: 'absolute',
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
                height={pageDim.height}
                width={pageDim.width}
            />
        </Document>
    </div>;
});

export default BaseDocumentViewer;