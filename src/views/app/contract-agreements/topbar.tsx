import React from 'react';
import { Row, Button, Card, CardBody } from 'reactstrap';
import { GoPlus } from 'react-icons/go';
import { Colxx } from '../../../components/common/CustomBootstrap';
import { IntlShape } from 'react-intl';
import { Dropzone, PDF_MIME_TYPE } from '@mantine/dropzone';
import { RiUploadCloud2Fill } from 'react-icons/ri';
import { MdFileUpload } from 'react-icons/md';

const CATopBar: React.FC<{
    intl: IntlShape;
    onDocSelect: (files: File[]) => void;
}> = ({ intl, onDocSelect }) => {
    return (
        <Row>
            <Colxx xxs="12">
                <div className="d-flex align-items-stretch">
                    <div className="contract-agreement-header-main">
                        <div>
                            <Button
                                className="contract-agreements-create-new flex h-14 items-center justify-between"
                                size="lg"
                                color="secondary"
                            >
                                <i className='mr-2'>
                                    <MdFileUpload />
                                </i>
                                <span>Upload File</span>
                            </Button>
                        </div>
                        <Card style={{ width: '50%', height: '8rem'}}>
                            <CardBody className="p-1">
                                <div className="w-full h-full">
                                    <Dropzone
                                        className='w-full h-full'
                                        onDrop={onDocSelect}
                                        onReject={(files) =>
                                            console.log('Rejected: ', {
                                                files,
                                            })
                                        }
                                        accept={PDF_MIME_TYPE}
                                    >
                                        {(status) => (
                                            <div className="flex px-5 h-full items-center justify-center">
                                                <span className="text-5xl">
                                                    <RiUploadCloud2Fill />
                                                </span>
                                                <p className='mt-3 ml-3'>
                                                    Drag and Drop Files here
                                                </p>
                                            </div>
                                        )}
                                    </Dropzone>
                                </div>
                            </CardBody>
                        </Card>
                        <div className='flex justify-center items-center'>
                            <Button
                                className="contract-agreements-create-new flex h-14 items-center justify-between"
                                size="lg"
                                color="secondary"
                            >
                                <i className="mr-2">
                                    <GoPlus />
                                </i>
                                <span>Create New</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </Colxx>
        </Row>
    );
};

export default CATopBar;
