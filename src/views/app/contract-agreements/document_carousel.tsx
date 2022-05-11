import { Center, Image, Menu, ScrollArea, Skeleton, Stack } from '@mantine/core';
import React from 'react';
import { IntlShape } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ContractHelper } from '../../../helpers/ContractHelper';
import { AppDispatch } from '../../../redux';

type TemplateImageType = {
    id: string;
    name: string;
    image: string;
    error: boolean;
    contractId: number;
}

type DocNameId = {
    name: string;
    id: number;
    contractId: number;
}

const DocumentCarousel:React.FC<{intl: IntlShape, docs: DocNameId[]}> = ({ intl, docs }) => {
    const [templateImages, setTemplateImages] = React.useState<TemplateImageType[]>([]);
    const [loading, setLoading] = React.useState(true);
    const dispatchFn = useDispatch<AppDispatch>();
    const contractHelper = React.useMemo(() => new ContractHelper(dispatchFn), [dispatchFn]);
    const navigate = useNavigate();

    React.useEffect(() => {
        Promise.allSettled(
            docs.map(d => {
                return contractHelper.getPdfCover(d.id.toString());
            })
        ).then(results => {
            const images = results.map((result, index) => {
                return {
                    id: docs[index].id.toString(),
                    name: docs[index].name,
                    image: result.status === 'fulfilled' ? result.value : '',
                    error: result.status === 'rejected',
                    contractId: docs[index].contractId,
                }
            });
            setTemplateImages(images);
            setLoading(false);
        });
    }, [docs, contractHelper]);

    return (
        <ScrollArea offsetScrollbars>
            <div className='flex flex-row items-center mb-4'>
                {loading && (
                    templateImages.map((t) => {
                        return (
                            <Stack className='mr-5' key={t.id}>
                                <Skeleton width={163} height={200} />
                                <Skeleton width={163} height={10} />
                            </Stack>
                        )
                    })
                )}
                {!loading && templateImages.length > 0 && (
                    templateImages.map((image, index) => {
                        return (
                            <Stack className='mr-5' key={image.id} >
                                <div className='flex flex-col justify-centers items-center'>
                                    <div className='flex justify-end w-full items-center'>
                                        <Menu size='sm'>
                                            <Menu.Item onClick={() => {
                                                // open in new tab
                                                window.open(`/documents/add-signers/${image.contractId}`, '_blank');
                                            }} icon={<i className='simple-icon-share-alt'></i>}>Open</Menu.Item>
                                            <Menu.Item color='red' icon={ <i className='simple-icon-trash'></i> }>Delete</Menu.Item>
                                        </Menu>
                                    </div>
                                    <div  style={{height: 150, width: 116}}>
                                        {image.error && (
                                            <Center style={{height: 150, width: 116}} onClick={() => navigate(`/documents/add-signers/${image.id}`)} className='shadow-md cursor-pointer'>
                                                <div className='text-3xl'>
                                                    <i className='simple-icon-doc'></i>
                                                </div>
                                            </Center>
                                        )}
                                        {!image.error && (
                                            <Image 
                                                className='shadow-md cursor-pointer' 
                                                onClick={() => navigate(`/documents/add-signers/${image.id}`)} 
                                                src={'data:image/jpeg;base64,' + image.image} 
                                                alt={image.name} 
                                                height={150} 
                                                fit='contain'
                                            />
                                        )}
                                    </div>
                                </div>
                                <p style={{maxWidth: '8rem'}} className='text-center text-xs'>{image.name}</p>
                            </Stack>
                        )
                    })
                )}
            </div>
        </ScrollArea>
    );
}

export default DocumentCarousel;