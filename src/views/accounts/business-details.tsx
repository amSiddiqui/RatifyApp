import { Card, Center, Grid, Stack, TextInput } from '@mantine/core';
import React from 'react';
import { MdEdit } from 'react-icons/md';
import { AuthHelper } from '../../helpers/AuthHelper';
import BusinessLogo from './business-logo';

const EditButton: React.FC = () => {
    return (
        <span
            className="absolute p-1 rounded cursor-pointer text-blue-500 hover:scale-110 hover:text-white hover:bg-blue-500 hover:border-white transition-all"
            style={{ top: 10, right: 10, border: '1px solid rgb(59, 130, 246)' }}>
            <MdEdit />
        </span>
    );
};

const BusinessDetails: React.FC<{ authHelper: AuthHelper }> = ({
    authHelper,
}) => {
    return (
        <Stack className="w-full">
            <Grid columns={12}>
                <Grid.Col span={2}></Grid.Col>
                <Grid.Col span={8}>
                    <Center className="h-full">
                        <TextInput
                            size="xl"
                            value={'Company Name Placeholder'}
                            variant="unstyled"
                        />
                    </Center>
                </Grid.Col>
                <Grid.Col span={2}>
                    <BusinessLogo authHelper={authHelper} />
                </Grid.Col>
            </Grid>
            <Grid columns={12}>
                <Grid.Col span={6}>
                    <Card shadow={'md'} className="p-4 w-full h-full">
                        <EditButton />
                        <Stack>
                            <Grid columns={12}>
                                <Grid.Col span={3}>
                                    <p className="text-muted">Website</p>
                                </Grid.Col>
                                <Grid.Col span={9}>
                                    <p>www.example.com</p>
                                </Grid.Col>
                            </Grid>
                            <Grid columns={12}>
                                <Grid.Col span={3}>
                                    <p className="text-muted">
                                        Registered Address
                                    </p>
                                </Grid.Col>
                                <Grid.Col span={9}>
                                    <p>Address line 1</p>
                                    <p>Address line 2</p>
                                </Grid.Col>
                            </Grid>
                            <Grid columns={12}>
                                <Grid.Col span={3}>
                                    <p className="text-muted">
                                        Zipcode / Post Code
                                    </p>
                                </Grid.Col>
                                <Grid.Col span={9}>
                                    <p>ABC 123</p>
                                </Grid.Col>
                            </Grid>
                            <Grid columns={12}>
                                <Grid.Col span={3}>
                                    <p className="text-muted">Country</p>
                                </Grid.Col>
                                <Grid.Col span={9}>
                                    <p>UK</p>
                                </Grid.Col>
                            </Grid>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Card shadow={'md'} className="p-4 w-full h-full">
                        <EditButton />
                        <Stack>
                            <Grid columns={12}>
                                <Grid.Col span={3}>
                                    <p className="text-muted">
                                        Billing Address
                                    </p>
                                </Grid.Col>
                                <Grid.Col span={9}>
                                    <p>Address line 1</p>
                                    <p>Address line 2</p>
                                </Grid.Col>
                            </Grid>
                            <Grid columns={12}>
                                <Grid.Col span={3}>
                                    <p className="text-muted">
                                        Zipcode / Post Code
                                    </p>
                                </Grid.Col>
                                <Grid.Col span={9}>
                                    <p>ABC 123</p>
                                </Grid.Col>
                            </Grid>
                            <Grid columns={12}>
                                <Grid.Col span={3}>
                                    <p className="text-muted">Country</p>
                                </Grid.Col>
                                <Grid.Col span={9}>
                                    <p>UK</p>
                                </Grid.Col>
                            </Grid>
                        </Stack>
                    </Card>
                </Grid.Col>
            </Grid>
            <Card shadow="md" className="p-4 w-full h-full">
                <EditButton />
                <Stack>
                    <Grid columns={12}>
                        <Grid.Col span={2}>
                            <p className="text-muted">Primary Contact</p>
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <p>John Smith</p>
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <p>
                                <span>
                                    <i
                                        className="simple-icon-envelope mr-1 relative"
                                        style={{ top: 2 }}
                                    />
                                </span>
                                email@example.com
                            </p>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <p>
                                <span>
                                    <i
                                        className="simple-icon-phone mr-1 relative"
                                        style={{ top: 1 }}
                                    />
                                </span>
                                +44 123 456 789
                            </p>
                        </Grid.Col>
                    </Grid>
                    <Grid columns={12}>
                        <Grid.Col span={2}>
                            <p className="text-muted">Secondary Contact</p>
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <p>John Smith</p>
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <p>
                                <span>
                                    <i
                                        className="simple-icon-envelope mr-1 relative"
                                        style={{ top: 2 }}
                                    />
                                </span>
                                email@example.com
                            </p>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <p>
                                <span>
                                    <i
                                        className="simple-icon-phone mr-1 relative"
                                        style={{ top: 1 }}
                                    />
                                </span>
                                +44 123 456 789
                            </p>
                        </Grid.Col>
                    </Grid>
                    <Grid columns={12}>
                        <Grid.Col span={2}>
                            <p className="text-muted">Billing Contact</p>
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <p>John Smith</p>
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <p>
                                <span>
                                    <i
                                        className="simple-icon-envelope mr-1 relative"
                                        style={{ top: 2 }}
                                    />
                                </span>
                                email@example.com
                            </p>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <p>
                                <span>
                                    <i
                                        className="simple-icon-phone mr-1 relative"
                                        style={{ top: 1 }}
                                    />
                                </span>
                                +44 123 456 789
                            </p>
                        </Grid.Col>
                    </Grid>
                </Stack>
            </Card>
            <Card shadow="md" className="p-4 w-full h-full">
                <EditButton />
                <Grid columns={12}>
                    <Grid.Col span={2}>
                        <p className="text-muted">Legal Entities: </p>
                    </Grid.Col>
                    <Grid.Col span={10}>
                        <Stack spacing="xs">
                            <p>Company Hotel</p>
                            <p>Company Credit Card PLC</p>
                            <p>Company Resorts PVT</p>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Card>
            <Card shadow="md" className="p-4 w-full h-full">
                <EditButton />
                <Grid columns={12}>
                    <Grid.Col span={2}>
                        <p className="text-muted">Business Function / Unit</p>
                    </Grid.Col>
                    <Grid.Col span={2}>
                        <Stack>
                            <p>Legal</p>
                            <p>Human Resources</p>
                            <p>Finance</p>
                            <p>Technology</p>
                            <p>Business Development</p>
                            <p>Managers & Acquisitions</p>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={8}>
                        <Stack>
                            <p>Company Group</p>
                            <p>Company Group</p>
                            <p>Company Group</p>
                            <p>Company Group</p>
                            <p>Company Group</p>
                            <p>Company Group</p>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Card>
        </Stack>
    );
};

export default BusinessDetails;
