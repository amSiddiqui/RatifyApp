import React from 'react';
import { Center, Skeleton } from '@mantine/core';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
import { useHover } from '@mantine/hooks';
import classNames from 'classnames';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

type Props = {
    pdf: string;
    pageNumber: number;
    onDocLoadSuccess: (numPages: number) => void;
    children: React.ReactNode;
    showNextPage: boolean;
    showPrevPage: boolean;
    onNextPage: () => void;
    onPrevPage: () => void;
};

const BaseDocumentViewer = React.forwardRef<HTMLDivElement, Props>(
    ({ children, pdf, pageNumber, onDocLoadSuccess, showNextPage, showPrevPage, onNextPage, onPrevPage }, ref) => {
        const [pageDim, setPageDim] = React.useState<{
            width: number;
            height: number;
        }>({ width: 0, height: 0 });

        const { hovered, ref: containerRef } = useHover();

        const onDocumentLoadSuccess = React.useCallback(
            async (pdfObject: any) => {
                onDocLoadSuccess(pdfObject.numPages);
                const page = await pdfObject.getPage(pageNumber);
                const viewBox = page.getViewport().viewBox;
                const width = viewBox[2];
                const height = viewBox[3];
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

                setPageDim({ width: newWidth, height: newHeight });
            },
            [pageNumber, onDocLoadSuccess],
        );

        return (
            <div className="flex" ref={containerRef}>
                {showPrevPage && <Center
                    onClick={onPrevPage}
                    className={classNames("cursor-pointer transition-all", {'opacity-0': !hovered, 'opacity-90': hovered})}
                    style={{ width: 50, height: pageDim.height, backgroundImage: 'linear-gradient(270deg, rgba(255,255,255,1) 0%, rgba(226 243 255, 1) 100%)'}}>
                        <HiChevronLeft style={{ fontSize: '4rem' }} />    
                    </Center>}
                {!showPrevPage && <div style={{ width: 50, height: pageDim.height }}>
                        
                    </div>}
                    <div className='relative'>
                        <div
                            ref={ref}
                            style={{
                                height: pageDim.height,
                                width: pageDim.width,
                                position: 'absolute',
                                zIndex: 1,
                            }}
                            className="bg-transparent"
                            id="pdf-form-input-container">
                            {children}
                        </div>
                        <Document
                            loading={<Skeleton height={1080} />}
                            options={{
                                workerSrc: '/pdf.worker.js',
                            }}
                            file={'data:application/pdf;base64,' + pdf}
                            onLoadSuccess={onDocumentLoadSuccess}>
                            <Page
                                loading={<Skeleton height={1080} />}
                                pageNumber={pageNumber}
                                height={pageDim.height}
                                width={pageDim.width}
                            />
                        </Document>
                    </div>
                {!showNextPage && <div style={{ width: 50, height: pageDim.height }}></div>}
                {showNextPage && <Center
                    onClick={onNextPage}
                    className={classNames("bg-black cursor-pointer transition-all", {'opacity-0': !hovered, 'opacity-90': hovered})}
                    style={{ width: 50, height: pageDim.height, backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(226 243 255,1) 100%' }}>
                        <HiChevronRight style={{ fontSize: '4rem' }} /> 
                    </Center>}
            </div>
        );
    },
);

export default BaseDocumentViewer;
