import React from 'react';
import { Row, Button } from 'reactstrap';
import { Colxx } from '../../../../components/common/CustomBootstrap';
import { IntlShape } from 'react-intl';
import { Dropzone, PDF_MIME_TYPE } from '@mantine/dropzone';
import { MdFileUpload } from 'react-icons/md';
import { Center, Grid, Loader, Stack } from '@mantine/core';
import { AuthInitialStateType, OrganizationNameResponse } from '../../../../types/AuthTypes';
import { NavigateFunction } from 'react-router-dom';

const CATopBar: React.FC<{
    intl: IntlShape;
    onDocSelect: (files: File[]) => void;
    onUploadButtonClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    organization?: OrganizationNameResponse;
    auth: AuthInitialStateType;
    organizationLoading: boolean;
    navigate: NavigateFunction;
}> = ({ intl, onDocSelect, onUploadButtonClick, organization, auth, organizationLoading, navigate }) => {

    return (
        <Row>
            <Colxx xxs="12">
                <Grid columns={12}>
                    <Grid.Col span={2}></Grid.Col>
                    <Grid.Col span={8}>
                        {(!auth || !organization) && <Center>
                            <Center style={{ height: 180, width: '100%', maxWidth: '842px', border: '2px dashed #ced4da' }} className='rounded-sm bg-white '>
                                {(organizationLoading || auth.loading) && <Loader size='lg' variant='bars'></Loader>}
                                {!(organizationLoading || auth.loading) && (auth && !organization) && <Stack className='text-center'>
                                    <h5 className='text-rose-500'>Please complete the business profile before continuing!</h5>
                                    <span onClick={() => {navigate(`/business-profile`)}}><Button color='primary'>Business Profile</Button></span>
                                </Stack>}
                                {!(organizationLoading || auth.loading) && (!auth.user) && <Stack className='text-center'>
                                    <h5 className='text-rose-500'>Please verify your email address before continuing!</h5>
                                    <span onClick={() => {navigate(`/profile-settings`)}}><Button color='primary'>My Account</Button></span>
                                </Stack>}
                            </Center>
                        </Center>}
                        {auth && organization && !organizationLoading && !auth.loading && <Dropzone
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
                                            onClick={onUploadButtonClick}
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
                        </Dropzone>}
                    </Grid.Col>
                    <Grid.Col span={2}>
                        {/* TODO: Add document creator */}
                        {/* <Center className='h-36'>
                            <Button
                                className="contract-agreements-create-new flex h-14 items-center justify-between"
                                size="lg"
                                color="secondary">
                                <i className="mr-2">
                                    <GoPlus />
                                </i>
                                <span>Create New</span>
                            </Button>
                        </Center> */}
                    </Grid.Col>
                </Grid>
            </Colxx>
        </Row>
    );
};

export default CATopBar;
