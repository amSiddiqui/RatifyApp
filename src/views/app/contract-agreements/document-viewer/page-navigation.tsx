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
import { createPortal } from 'react-dom';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import PerfectScrollbar from 'react-perfect-scrollbar';

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
    showBottomNavigation?: boolean;
    hideBottomNavigation?: boolean;
};

const PageNavigation: React.FC<Props> = ({ token, doc_id, contractHelper, pageNumber, numPages, showBottomNavigation, onNextPage, onPrevPage, onFirstPage, onLastPage, onGotoPage, pageCompleted, height, hideBottomNavigation }) => {
    const [thumbnailsLoading, setThumbnailsLoading] = React.useState(true);
    const [pdfThumbnails, setThumbnails] = React.useState<{[id: string]: string}>({});

    const [drawBottomNavigation, setDrawBottomNavigation] = React.useState(true);
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


    const getPageIcon = (index: number) => {
        if (!!pageCompleted && pageCompleted.length > index && pageCompleted[index].hasFields) {
            if (pageCompleted[index].completed) {
                return <i className='simple-icon-check text-success text-xl' />;
            }
            if (!pageCompleted[index].completed) {
                return <Tooltip label='Required Fields'>
                            <i className='simple-icon-note text-primary text-xl'/>
                        </Tooltip>;
            }
        }
        return null;
    };

    const getPageThumbnail = (key: string, height: number, showNumber = false) => {
        const pg = parseInt(key) + 1;
        return <div className="flex flex-col justify-center items-center" >
                    <div className={classNames(
                            'border-4',{ 'border-sky-500': pageNumber === pg,},
                            { 'border-gray-300': pageNumber !== pg,},
                            'cursor-pointer',
                            )}>
                        <img
                            src={ 'data:image/jpeg;base64,' + pdfThumbnails[ key ] }
                            style={{
                                height,
                                objectFit: 'cover'
                            }}
                            alt="Page"
                            onClick={() =>  onGotoPage(pg) }
                        />
                    </div>
                    {showNumber && <p className="text-center text-sm">
                        {pg}
                    </p>}
                </div>;
    }

    const thumbnailElements = Object.keys(pdfThumbnails).map(
        (key, index) => {
            return (
                <div className={'relative'} key={key}>
                    <div className='absolute' style={{top: 0, left: 8}}>{getPageIcon(index)}</div>
                    {getPageThumbnail(key, 100, true)}
                </div>
            );
        },
    );
    
    if (hideBottomNavigation === true) {
        return <></>;
    }
    if (showBottomNavigation) {
        return (createPortal(
            <div className='transition-all' style={{ 
                position: 'fixed', 
                bottom: drawBottomNavigation ? 20 : -118, 
                left: '50%', 
                margin: '0 auto', 
                transform: 'translate(-50%, 0)', 
                backgroundColor: 'white', 
                zIndex: 12
            }}>
                <Center className='absolute bg-rose-400 cursor-pointer shadow-lg' onClick={() => {
                        setDrawBottomNavigation(prev => !prev);
                    }} style={{ width: 40, height: 30, right: 10, top: -30, borderTopLeftRadius: 200, borderTopRightRadius: 200 }}>
                    {!drawBottomNavigation && <MdKeyboardArrowUp className='text-xl relative text-white' style={{ top: 2 }}  />}
                    {drawBottomNavigation && <MdKeyboardArrowDown className='text-xl relative text-white' style={{ top: 2 }} />}
                </Center>
                <div className='shadow-lg rounded-md pt-2 px-2'>
                    <PerfectScrollbar style={{ width: '80vw', height: 110, maxWidth: 350 }} >
                        <div className='flex w-fit'>
                            {Object.keys(pdfThumbnails).map(
                                (key, index) => {
                                    return (
                                        <div className='relative' style={{ marginLeft: 8, marginRight: 8, minWidth: 65 }} key={key}>
                                            <div className='absolute' style={{ top: 0, right: 2 }}>{getPageIcon(index)}</div>
                                            {getPageThumbnail(key, 80)}
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </PerfectScrollbar>
                </div>
            </div>, 
            document.getElementById('page-navigation-portal')!));
    } else {
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
                        {thumbnailElements}
                    </Stack>
                </ScrollArea>
            )}
            </Center>
        </>;
    }
}

export default PageNavigation;