import {
    Autocomplete,
    Center,
    Grid,
    Group,
    Image,
    Menu,
    Modal,
    ScrollArea,
    Stack,
    Textarea,
    TextInput,
} from '@mantine/core';
import React from 'react';
import { IntlShape } from 'react-intl';
import { AgreementTemplate } from '../../../../types/ContractTypes';
import { Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { BsBook, BsTrash } from 'react-icons/bs';
import { MdAdd, MdEdit } from 'react-icons/md';
import DocumentCarouselLoading from './document-carousel-loading';

type TemplateImageType = {
    doc_id: number;
    id: number;
    name: string;
    image: string;
    error: boolean;
    category: string;
    description: string;
};

type Props = {
    intl: IntlShape;
    onTemplateUpdate: (
        id: number,
        name: string,
        category: string,
        description: string,
    ) => void;
    contractHelper: ContractHelper;
    templates: AgreementTemplate[];
    onViewClick: (id: number) => void;
    onCreateClick: (id: number) => void;
    categories: string[];
    onTemplateDelete: (id: number) => void;
};

const DocumentCarousel: React.FC<Props> = ({
    intl,
    templates,
    onViewClick,
    onCreateClick,
    categories,
    contractHelper,
    onTemplateUpdate,
    onTemplateDelete,
}) => {
    const [templateImages, setTemplateImages] = React.useState<
        TemplateImageType[]
    >([]);
    const [loading, setLoading] = React.useState(true);
    const [editMode, setEditMode] = React.useState(false);
    const [editingTemplate, setEditingTemplate] = React.useState<number | null>(
        null,
    );
    const [showError, setShowError] = React.useState(false);
    const [deletingTemplate, setDeletingTemplate] = React.useState<{
        id: number;
        name: string;
        description: string;
    } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

    const [templateData, setTemplateData] = React.useState<{
        name: string;
        category: string;
        description: string;
    }>({ name: '', category: '', description: '' });

    const onSubmit = () => {
        setShowError(true);
        if (!editingTemplate) {
            return;
        }
        if (templateData.name.length < 1) {
            return;
        }

        contractHelper
            .updateAgreementTemplate(editingTemplate, templateData)
            .then(() => {
                setEditMode(false);
                setEditingTemplate(null);
                setTemplateData({ name: '', category: '', description: '' });
                setShowError(false);
                setTemplateImages((prev) => {
                    const newImages = [...prev];
                    for (const ni of newImages) {
                        if (ni.id === editingTemplate) {
                            ni.name = templateData.name;
                            ni.category = templateData.category;
                            ni.description = templateData.description;
                        }
                    }
                    return newImages;
                });
                onTemplateUpdate(
                    editingTemplate,
                    templateData.name,
                    templateData.category,
                    templateData.description,
                );
                toast.success('Template updated successfully');
            })
            .catch((err) => {
                toast.error('Error updating template');
                console.log(err);
            });
    };

    React.useEffect(() => {
        let shouldUpdate = true;
        Promise.allSettled(
            templates.map((d) => {
                return contractHelper.getPdfCover(d.documents[0].toString());
            }),
        ).then((results) => {
            if (shouldUpdate) {
                const images = results.map((result, index) => {
                    return {
                        id: templates[index].id,
                        doc_id: templates[index].documents[0],
                        name: templates[index].name,
                        image: result.status === 'fulfilled' ? result.value : '',
                        error: result.status === 'rejected',
                        category: templates[index].category,
                        description: templates[index].description,
                    };
                });
                setTemplateImages(images);
                setLoading(false);
            }
        }).catch((err) => { console.log(err); });
        
        return () => { shouldUpdate = false; }
    }, [templates, contractHelper]);

    return (
        <>
            <ScrollArea offsetScrollbars>
                <div className="flex flex-row items-center mb-4">
                    {loading &&
                        <DocumentCarouselLoading />
                    }
                    {!loading &&
                        templateImages.length > 0 &&
                        templateImages.map((image, index) => {
                            return (
                                <Stack className="mr-5" key={image.id}>
                                    <div className="flex flex-col justify-centers items-center">
                                        <div className="flex justify-end w-full items-center">
                                            
                                        </div>
                                        <div>
                                            <div
                                                style={{
                                                    height: 150,
                                                    width: 116,
                                                }}>
                                                {(image.error || image.image.trim().length === 0) && (
                                                    <Center
                                                        style={{
                                                            height: 150,
                                                            width: 116,
                                                        }}
                                                        onClick={() => {
                                                            onViewClick(image.id);
                                                        }}
                                                        className="shadow-md cursor-pointer">
                                                        <div className="text-3xl">
                                                            <i className="simple-icon-doc"></i>
                                                        </div>
                                                    </Center>
                                                )}
                                                {!(image.error || image.image.trim().length === 0) && (
                                                    <Image
                                                        className="shadow-md cursor-pointer"
                                                        onClick={() => {
                                                            onViewClick(image.id,);
                                                        }}
                                                        src={
                                                            'data:image/jpeg;base64,' +
                                                            image.image
                                                        }
                                                        alt={image.name}
                                                        height={150}
                                                        fit="contain"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Grid columns={12} gutter={0}>
                                        <Grid.Col span={10} className='p-0'>
                                            <Center className='h-full'>
                                                <p
                                                    style={{ maxWidth: '8rem' }}
                                                    className="text-center text-xs">
                                                    {image.name.length > 20 ? image.name.substring(0, 20) + '...' : image.name}
                                                </p>
                                            </Center>
                                        </Grid.Col>
                                        
                                        <Grid.Col span={2} className='p-0'>
                                            <Group position='left'>
                                                <Menu size="lg" control={ <i className='simple-icon-options'></i> }>
                                                    <Menu.Item
                                                        onClick={() => {
                                                            onViewClick(image.id);
                                                        }}
                                                        icon={
                                                            <BsBook />
                                                        }>
                                                        Preview Document
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        onClick={() => {
                                                            onCreateClick(image.id);
                                                        }}
                                                        icon={
                                                            <MdAdd />
                                                        }>
                                                        Use Template
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        onClick={() => {
                                                            setShowError(false);
                                                            setEditingTemplate(
                                                                image.id,
                                                            );
                                                            setEditMode(true);
                                                            setTemplateData({
                                                                name: image.name,
                                                                category:
                                                                    image.category,
                                                                description:
                                                                    image.description,
                                                            });
                                                        }}
                                                        icon={
                                                            <MdEdit />
                                                        }>
                                                        Edit Properties
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        onClick={() => {
                                                            setDeletingTemplate({
                                                                id: image.id,
                                                                name: image.name,
                                                                description:
                                                                    image.description,
                                                            });
                                                            setShowDeleteConfirm(
                                                                true,
                                                            );
                                                        }}
                                                        color="red"
                                                        icon={<BsTrash />}>
                                                        Delete Template
                                                    </Menu.Item>
                                                </Menu>
                                            </Group>
                                        </Grid.Col>

                                    </Grid>
                                </Stack>
                            );
                        })}
                        {!loading && templateImages.length === 0 && <div style={{ height: 210 }}></div>}
                </div>
            </ScrollArea>
            <Modal
                title={<h5 className="font-bold text-lg">Edit Template</h5>}
                opened={editMode}
                onClose={() => {
                    setEditMode(false);
                }}
                centered>
                <Stack>
                    <TextInput
                        error={
                            showError && templateData.name.length === 0
                                ? 'Please enter a template name'
                                : ''
                        }
                        value={templateData.name}
                        onChange={(event) => {
                            setTemplateData({
                                ...templateData,
                                name: event.target.value,
                            });
                        }}
                        label="Template Name"
                        placeholder="Name"
                    />
                    <Autocomplete
                        value={templateData.category}
                        onChange={(value) => {
                            setTemplateData({
                                ...templateData,
                                category: value,
                            });
                        }}
                        data={categories}
                        label="Template Category"
                        placeholder="Category"
                    />
                    <Textarea
                        value={templateData.description}
                        onChange={(event) => {
                            setTemplateData({
                                ...templateData,
                                description: event.target.value,
                            });
                        }}
                        label="Description"
                        placeholder="Description"
                    />
                    <Group onClick={onSubmit} position="right">
                        <span>
                            <Button color="primary">Save</Button>
                        </span>
                    </Group>
                </Stack>
            </Modal>
            <Modal
                centered
                title={<h4 className="text-lg font-bold">Delete template?</h4>}
                opened={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                }}>
                {deletingTemplate !== null && (
                    <>
                        <Stack>
                            <p className="text-center text-xl">
                                {deletingTemplate.name}
                            </p>
                            <p className="text-muted text-center text-lg">
                                {deletingTemplate.description}
                            </p>
                            <Group position="center">
                                <span
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                    }}>
                                    <Button color="light">Cancel</Button>
                                </span>
                                <span
                                    onClick={() => {
                                        contractHelper
                                            .deleteAgreementTemplate(
                                                deletingTemplate.id,
                                            )
                                            .then(() => {
                                                toast.success(
                                                    'Template deleted successfully',
                                                );
                                                setDeletingTemplate(null);
                                                setTemplateImages((prev) => {
                                                    return prev.filter(
                                                        (t) =>
                                                            t.id !==
                                                            deletingTemplate.id,
                                                    );
                                                });
                                                onTemplateDelete(
                                                    deletingTemplate.id,
                                                );
                                                setShowDeleteConfirm(false);
                                            })
                                            .catch((err) => {
                                                toast.error(
                                                    'Error deleting template',
                                                );
                                                setShowDeleteConfirm(false);
                                            });
                                    }}>
                                    <Button color="danger">Delete</Button>
                                </span>
                            </Group>
                        </Stack>
                    </>
                )}
            </Modal>
        </>
    );
};

export default DocumentCarousel;
