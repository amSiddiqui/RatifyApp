import { Card, Center, Grid, Stack, TextInput } from '@mantine/core';
import React from 'react';
import { MdEdit } from 'react-icons/md';
import { AuthHelper } from '../../helpers/AuthHelper';
import { BusinessFunction, LegalEntity, Organization } from '../../types/AuthTypes';
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

const BusinessDetails: React.FC<{ authHelper: AuthHelper, organization: Organization }> = ({
    authHelper,
    organization: org
}) => {

    const [legalEntities, setLegalEntities] = React.useState<LegalEntity[]>([]);
    const [businessFunctions, setBusinessFunctions] = React.useState<BusinessFunction[]>([]);


    React.useEffect(() => {
        authHelper.getOrganizationLegalEntities().then(data => {
            setLegalEntities(data.legalEntity);
            setBusinessFunctions(data.businessFunction);
        }).catch(err => {
            console.log(err);
        })
    }, [authHelper]);

    return (
        <Stack className="w-full">
            <Grid columns={12}>
                <Grid.Col span={2}></Grid.Col>
                <Grid.Col span={8}>
                    <Center className="h-full">
                        <TextInput
                            size="xl"
                            defaultValue={org.name}
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
                                    <p>{org.website}</p>
                                </Grid.Col>
                            </Grid>
                            <Grid columns={12}>
                                <Grid.Col span={3}>
                                    <p className="text-muted">
                                        Registered Address
                                    </p>
                                </Grid.Col>
                                <Grid.Col span={9}>
                                    <p>{org.companyAddressSame ?  org.billingAddress?.address1 : org.companyAddress?.address1}</p>
                                    <p>{org.companyAddressSame ?  org.billingAddress?.address2 : org.companyAddress?.address2}</p>
                                    <p>{org.companyAddressSame ?  org.billingAddress?.city : org.companyAddress?.city}, {org.companyAddressSame ?  org.billingAddress?.state : org.companyAddress?.state}</p>
                                </Grid.Col>
                            </Grid>
                            <Grid columns={12}>
                                <Grid.Col span={3}>
                                    <p className="text-muted">
                                        Zipcode / Post Code
                                    </p>
                                </Grid.Col>
                                <Grid.Col span={9}>
                                    <p>{org.companyAddressSame ?  org.billingAddress?.zipcode : org.companyAddress?.zipcode}</p>
                                </Grid.Col>
                            </Grid>
                            <Grid columns={12}>
                                <Grid.Col span={3}>
                                    <p className="text-muted">Country</p>
                                </Grid.Col>
                                <Grid.Col span={9}>
                                    <p>{org.companyAddressSame ?  org.billingAddress?.country : org.companyAddress?.country}</p>
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
                                    <p>{org.billingAddress?.address1}</p>
                                    <p>{org.billingAddress?.address2}</p>
                                    <p>{org.billingAddress?.city}, {org.billingAddress?.state}</p>
                                </Grid.Col>
                            </Grid>
                            <Grid columns={12}>
                                <Grid.Col span={3}>
                                    <p className="text-muted">
                                        Zipcode / Post Code
                                    </p>
                                </Grid.Col>
                                <Grid.Col span={9}>
                                    <p>{org.billingAddress?.zipcode}</p>
                                </Grid.Col>
                            </Grid>
                            <Grid columns={12}>
                                <Grid.Col span={3}>
                                    <p className="text-muted">Country</p>
                                </Grid.Col>
                                <Grid.Col span={9}>
                                    <p>{org.billingAddress?.country}</p>
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
                            <p>{org.primaryContact?.name}</p>
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <p>
                                <span>
                                    <i
                                        className="simple-icon-envelope mr-1 relative"
                                        style={{ top: 2 }}
                                    />
                                </span>
                                {org.primaryContact?.email}
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
                                {org.primaryContact?.phone}
                            </p>
                        </Grid.Col>
                    </Grid>
                    {org.showSecondaryContact && (
                        <Grid columns={12}>
                            <Grid.Col span={2}>
                                <p className="text-muted">Secondary Contact</p>
                            </Grid.Col>
                            <Grid.Col span={2}>
                                <p>{org.secondaryContact?.name}</p>
                            </Grid.Col>
                            <Grid.Col span={2}>
                                <p>
                                    <span>
                                        <i
                                            className="simple-icon-envelope mr-1 relative"
                                            style={{ top: 2 }}
                                        />
                                    </span>
                                    {org.secondaryContact?.email}
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
                                    {org.secondaryContact?.phone}
                                </p>
                            </Grid.Col>
                        </Grid>
                    )}
                    <Grid columns={12}>
                        <Grid.Col span={2}>
                            <p className="text-muted">Billing Contact</p>
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <p>{org.sameBillingContact ? org.primaryContact?.name : org.billingContact?.name}</p>
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <p>
                                <span>
                                    <i
                                        className="simple-icon-envelope mr-1 relative"
                                        style={{ top: 2 }}
                                    />
                                </span>
                                {org.sameBillingContact ? org.primaryContact?.email : org.billingContact?.email}
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
                                {org.sameBillingContact ? org.primaryContact?.phone : org.billingContact?.phone}
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
                            {legalEntities.map((le) => (
                            <p key={le.id}>{le.name} {le.description.length > 0 ? ':' : ''} <span className='text-xs text-muted'>{le.description}</span></p>
                            ))}
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
                            {businessFunctions.map((bf) => (
                                <p key={bf.id}>{bf.label}</p>
                            ))}
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={8}>
                        <Stack>
                            {businessFunctions.map((bf) => (
                                <p key={bf.id}>{bf.entity}</p>
                            ))}
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Card>
        </Stack>
    );
};

export default BusinessDetails;
