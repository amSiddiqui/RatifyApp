import React from 'react';
import { Row, Button } from 'reactstrap';
import { GoPlus } from 'react-icons/go';
import { Colxx } from '../../../components/common/CustomBootstrap';
import { IntlShape } from 'react-intl';
import { Dropzone, PDF_MIME_TYPE } from '@mantine/dropzone';
import { MdFileUpload } from 'react-icons/md';
import { Center, Grid } from '@mantine/core';

const CATopBar: React.FC<{
    intl: IntlShape;
    onDocSelect: (files: File[]) => void;
}> = ({ intl, onDocSelect }) => {

    return (
        <Row>
            <Colxx xxs="12">
                <Grid columns={12}>
                    <Grid.Col span={2}></Grid.Col>
                    <Grid.Col span={8}>
                        <Dropzone
                            className="w-full h-full"
                            onDrop={onDocSelect}
                            onReject={(files) =>
                                console.log('Rejected: ', {
                                    files,
                                })
                            }
                            accept={PDF_MIME_TYPE}>
                            {(status) => (
                                <Center className='h-36'>
                                    <div>
                                        <Button
                                            className="contract-agreements-create-new flex h-14 items-center justify-between"
                                            size="lg"
                                            color="secondary">
                                            <i className="mr-2">
                                                <MdFileUpload />
                                            </i>
                                            <span>Upload File</span>
                                        </Button>
                                        <p className='text-center mt-1'>Or drag and drop a file here</p>
                                    </div>
                                </Center>
                            )}
                        </Dropzone>
                    </Grid.Col>
                    <Grid.Col span={2}>
                        <Center className='h-36'>
                            <Button
                                className="contract-agreements-create-new flex h-14 items-center justify-between"
                                size="lg"
                                color="secondary">
                                <i className="mr-2">
                                    <GoPlus />
                                </i>
                                <span>Create New</span>
                            </Button>
                        </Center>
                    </Grid.Col>
                </Grid>
            </Colxx>
        </Row>
    );
};

export default CATopBar;
