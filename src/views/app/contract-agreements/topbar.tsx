import React from 'react';
import { Row, Button, Card, CardBody } from 'reactstrap';
import { GoPlus } from 'react-icons/go';
import { Colxx } from '../../../components/common/CustomBootstrap';
import { IntlShape } from 'react-intl';
import { Dropzone, PDF_MIME_TYPE } from '@mantine/dropzone';

const CATopBar: React.FC<{intl: IntlShape}> = ( { intl }) => {
    return (
        <Row>
            <Colxx xxs="12" className="mb-4">
                <div className="d-flex align-items-stretch">
                    <div className="contract-agreement-header-main">
                        <Card className="upload-contract-card">
                            <CardBody className='p-3'>
                                <Dropzone
                                    onDrop={(files) => console.log('Accepted: ',{files})}
                                    onReject={(files) => console.log('Rejected: ', {files})}
                                    accept={PDF_MIME_TYPE}
                                >
                                    {(status) => (
                                    <div className='flex px-5 h-12 items-center justify-center'>
                                        <i className='iconsminds-upload text-3xl mr-2' />
                                        <div className='mt-3'>
                                            <p>Drag Files here or Click to select Files</p>
                                        </div>
                                    </div>)}
                                </Dropzone>
                            </CardBody>
                        </Card>
                    </div>
                    <div className="d-flex align-items-center">
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
            </Colxx>
        </Row>
    );
};

export default CATopBar;
