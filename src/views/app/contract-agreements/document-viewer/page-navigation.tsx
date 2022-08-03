import React from 'react';
import { Center, Stack, Skeleton, ScrollArea, Tooltip } from '@mantine/core';
import classNames from 'classnames';
import {
    HiChevronLeft,
    HiChevronRight,
    HiChevronDoubleLeft,
    HiChevronDoubleRight,
} from 'react-icons/hi';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { toast } from 'react-toastify';

type Props = {
    pageNumber: number;
    numPages: number;
    height: number;
    onNextPage: () => void;
    onPrevPage: () => void;
    onFirstPage: () => void;
    onLastPage: () => void;
    onGotoPage: (pageNumber: number) => void;
    contractHelper: ContractHelper;
    token?:string;
    doc_id?: string;
    pageCompleted?: {hasFields: boolean, completed: boolean}[];
};

const PageNavigation: React.FC<Props> = ({ token, doc_id, contractHelper, pageNumber, numPages, onNextPage, onPrevPage, onFirstPage, onLastPage, onGotoPage, pageCompleted, height }) => {
    const [thumbnailsLoading, setThumbnailsLoading] = React.useState(true);
    const [pdfThumbnails, setThumbnails] = React.useState<{[id: string]: string}>({});

    React.useEffect(() => {
        let shouldUpdate = true;
        if (token) {
            contractHelper.getSignerPdfThumbnails(token).then(resp => {
                if (shouldUpdate) {
                    if (resp.valid) {
                        setThumbnails(resp.data);
                    }
                    setThumbnailsLoading(false);
                }
            }).catch(err => {
                if (shouldUpdate) {
                    setThumbnailsLoading(false);
                }
            });
        }
        if (doc_id) {
            contractHelper
            .getPdfThumbnails(doc_id.toString())
            .then((thumbnails) => {
                if (shouldUpdate) {
                    setThumbnails(thumbnails);
                }
            })
            .catch((error) => {
                if (shouldUpdate) {
                    console.log(error);
                    toast.error('Error loading pdf thumbnails');
                }
            })
            .finally(() => {
                if (shouldUpdate) {
                    setThumbnailsLoading(false);
                }
            });
        }
        return () => {shouldUpdate = false;}
    }, [contractHelper, token, doc_id]);


    return <>
        <Center className="mb-4">
            <div className="text-2xl">
                <HiChevronDoubleLeft
                    onClick={onFirstPage}
                    className="cursor-pointer"
                />
            </div>
            <div className="text-2xl">
                <HiChevronLeft
                    onClick={onPrevPage}
                    className="cursor-pointer"
                />
            </div>
            <div className="px-1">
                Page: {pageNumber} / {numPages}
            </div>
            <div className="text-2xl">
                <HiChevronRight
                    onClick={onNextPage}
                    className="cursor-pointer"
                />
            </div>
            <div className="text-2xl">
                <HiChevronDoubleRight
                    onClick={onLastPage}
                    className="cursor-pointer"
                />
            </div>
        </Center>
        <Center>
        {thumbnailsLoading && (
            <Stack>
                <Skeleton style={{zIndex: 1}} height={150} width={120} />
                <Skeleton style={{zIndex: 1}} height={10} width={120} />
            </Stack>
        )}
        {!thumbnailsLoading && (
            <ScrollArea
                style={{
                    height: height,
                    overflow: 'hidden',
                    width: '70%',
                }}
                className="rounded-md"
            >
                <Stack spacing={2}>
                    {Object.keys(pdfThumbnails).map(
                        (key, index) => {
                            const pg = parseInt(key) + 1;
                            return (
                                <div className='relative' key={key}>
                                    {!!pageCompleted && pageCompleted.length > index && pageCompleted[index].hasFields &&  pageCompleted[index].completed && <i className='simple-icon-check text-success absolute text-xl' style={{top: 0, left: 8}} />}
                                    {!!pageCompleted && pageCompleted.length > index && pageCompleted[index].hasFields && !pageCompleted[index].completed &&
                                    <Tooltip label='Required Fields'>
                                        <i className='simple-icon-note text-primary absolute text-xl' style={{top: 0, left: 8}} />
                                    </Tooltip>
                                    }
                                    <div
                                        className="flex flex-col justify-center items-center"
                                    >
                                        <div className={classNames(
                                                'border-4',{ 'border-sky-500': pageNumber === pg,},
                                                { 'border-gray-300': pageNumber !== pg,},
                                                'cursor-pointer',
                                                )}>
                                            <img
                                                src={ 'data:image/jpeg;base64,' + pdfThumbnails[ key ] }
                                                style={{
                                                    height: 100,
                                                }}
                                                alt="Page"
                                                onClick={() =>  onGotoPage(pg) }
                                            />
                                        </div>
                                        <p className="text-center text-sm">
                                            {pg}
                                        </p>
                                    </div>
                                </div>
                            );
                        },
                    )}
                </Stack>
            </ScrollArea>
        )}
        </Center>
    </>;
}

export default PageNavigation;