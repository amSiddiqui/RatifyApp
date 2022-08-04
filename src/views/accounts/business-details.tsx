import {
    Autocomplete,
    Card,
    Center,
    Grid,
    Group,
    List,
    Select,
    SimpleGrid,
    Space,
    Stack,
    TextInput,
    Tooltip,
} from '@mantine/core';
import React from 'react';
import { BsTrash } from 'react-icons/bs';
import { MdAdd, MdEdit } from 'react-icons/md';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { AuthHelper } from '../../helpers/AuthHelper';
import {
    BusinessFunction,
    LegalEntity,
    Organization,
} from '../../types/AuthTypes';
import BusinessContactForm from './business-contact-form';
import BusinessDetailsForm from './business-details-form';
import { AutoCompleteFunctionalData } from './business-legal-entities';
import BusinessLogo from './business-logo';

const EditButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
    return (
        <span
            onClick={onClick}
            className="absolute p-1 rounded cursor-pointer text-blue-500 hover:scale-110 hover:text-white hover:bg-blue-500 hover:border-white transition-all"
            style={{
                top: 10,
                right: 10,
                border: '1px solid rgb(59, 130, 246)',
            }}>
            <MdEdit />
        </span>
    );
};

const CancelButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
    return (
        <span
            onClick={onClick}
            className="absolute p-1 underline cursor-pointer text-blue-500 hover:scale-110 transition-all"
            style={{
                top: 10,
                right: 10,
            }}>
            Cancel
        </span>
    );
};

const BusinessDetails: React.FC<{
    authHelper: AuthHelper;
    organization: Organization;
}> = ({ authHelper, organization }) => {
    const [org, setOrg] = React.useState(organization);
    const [legalEntities, setLegalEntities] = React.useState<LegalEntity[]>([]);
    const [businessFunctions, setBusinessFunctions] = React.useState<
        BusinessFunction[]
    >([]);
    const [nameEditMode, setNameEditMode] = React.useState(false);
    const [addressEditMode, setAddressEditMode] = React.useState(false);
    const [contactEditMode, setContactEditMode] = React.useState(false);
    const [leEditMode, setLeEditMode] = React.useState(false);
    const [bfEditMode, setBfEditMode] = React.useState(false);
    const [showLeError, setShowLeError] = React.useState(false);

    React.useEffect(() => {
        let shouldUpdate = true;
        authHelper
            .getOrganizationLegalEntities()
            .then((data) => {
                if (shouldUpdate) {
                    setLegalEntities(data.legalEntity);
                    setBusinessFunctions(data.businessFunction);
                }
            })
            .catch((err) => {
                console.log(err);
            });
        return () => {shouldUpdate = false};
    }, [authHelper]);

    const onSubmit = () => {
        setShowLeError(true);
        // check if legalEntities are filled
        if (legalEntities.filter((le) => le.name === '').length > 0)
        return;
        // check if businessFunctions are filled
        if (businessFunctions.filter((bf) => bf.entity === '' || bf.label === '').length > 0)
        return;
        setLeEditMode(false);
        setBfEditMode(false);
        authHelper.updateOrganizationLegalEntitiesAndBusinessFunction({legalEntity: legalEntities, businessFunction: businessFunctions}).then(() => {
            toast.success('Business details saved!');
        }).catch(err => {
            toast.error('Error saving business details!');
        });
    }

    return (
        <Stack className="w-full" spacing={'xl'}>
            <Grid columns={12}>
                <Grid.Col xs={2}></Grid.Col>
                <Grid.Col xs={8}>
                    <Center className="h-full relative">
                        <Stack
                            className="text-center"
                            style={{ minWidth: 250 }}
                            spacing={'xs'}>
                            {!nameEditMode && (
                                <>
                                    <h2>{org.name}</h2>
                                    <p className="text-muted">
                                        {org.description}
                                    </p>
                                </>
                            )}
                            {nameEditMode && (
                                <>
                                    <TextInput
                                        size="lg"
                                        placeholder="Business Name"
                                        value={org.name}
                                        onChange={(event) => {
                                            setOrg((prev) => {
                                                return {
                                                    ...prev,
                                                    name: event.target.value,
                                                };
                                            });
                                        }}
                                    />
                                    <TextInput
                                        placeholder="Business Description"
                                        value={org.description}
                                        onChange={(event) => {
                                            setOrg((prev) => {
                                                console.log(
                                                    event.currentTarget,
                                                );
                                                return {
                                                    ...prev,
                                                    description:
                                                        event.target.value,
                                                };
                                            });
                                        }}
                                        size="xs"
                                    />
                                </>
                            )}
                        </Stack>

                        {!nameEditMode && (
                            <span
                                onClick={() => {
                                    setNameEditMode(true);
                                }}
                                className="relative p-1 rounded cursor-pointer text-blue-500 hover:scale-110 hover:text-white hover:bg-blue-500 hover:border-white transition-all"
                                style={{
                                    top: -18,
                                    right: 0,
                                    border: '1px solid rgb(59, 130, 246)',
                                }}>
                                <MdEdit />
                            </span>
                        )}
                        {nameEditMode && (
                            <span
                                onClick={() => {
                                    setNameEditMode(false);
                                    authHelper
                                        .updateOrganizationName({
                                            name: org.name,
                                            description: org.description,
                                        })
                                        .then(() => {
                                            toast.success(
                                                'Business name updated',
                                            );
                                        })
                                        .catch((err) => {
                                            toast.error(
                                                'Something went wrong, try again later!',
                                            );
                                            console.log(err);
                                        });
                                }}
                                className="relative p-1 underline cursor-pointer text-success hover:scale-100 transition-all"
                                style={{
                                    top: -18,
                                    right: 0,
                                }}>
                                Save
                            </span>
                        )}
                    </Center>
                </Grid.Col>
                <Grid.Col xs={2}>
                    <BusinessLogo authHelper={authHelper} />
                </Grid.Col>
            </Grid>
            <Card shadow={'md'} className="p-4 w-full h-full">
                {!addressEditMode && (
                    <EditButton
                        onClick={() => {
                            setAddressEditMode(true);
                        }}
                    />
                )}
                {addressEditMode && (
                    <CancelButton
                        onClick={() => {
                            setAddressEditMode(false);
                        }}
                    />
                )}
                {!addressEditMode && (
                    <SimpleGrid
                        cols={2}
                        breakpoints={[{ cols: 1, maxWidth: 600 }]}>
                        <Stack className="pr-12">
                            <Grid columns={12}>
                                <Grid.Col xs={3}>
                                    <p className="text-muted">Website</p>
                                </Grid.Col>
                                <Grid.Col xs={9}>
                                    <p>{org.website}</p>
                                </Grid.Col>
                            </Grid>

                            <Grid columns={12}>
                                <Grid.Col xs={3}>
                                    <p className="text-muted">
                                        Billing Address
                                    </p>
                                </Grid.Col>
                                <Grid.Col xs={9}>
                                    <p>{org.billingAddress?.address1}</p>
                                    <p>{org.billingAddress?.address2}</p>
                                    <p>
                                        {org.billingAddress?.city},{' '}
                                        {org.billingAddress?.state}
                                    </p>
                                </Grid.Col>
                            </Grid>
                            <Grid columns={12}>
                                <Grid.Col xs={3}>
                                    <p className="text-muted">
                                        Zip Code / Post Code
                                    </p>
                                </Grid.Col>
                                <Grid.Col xs={9}>
                                    <p>{org.billingAddress?.zipcode}</p>
                                </Grid.Col>
                            </Grid>
                            <Grid columns={12}>
                                <Grid.Col xs={3}>
                                    <p className="text-muted">Country</p>
                                </Grid.Col>
                                <Grid.Col xs={9}>
                                    <p>{org.billingAddress?.country}</p>
                                </Grid.Col>
                            </Grid>
                        </Stack>
                        <Stack className="pr-12">
                            <Grid columns={12}>
                                <Grid.Col xs={3}>
                                    <p className="text-muted">
                                        Registered Address
                                    </p>
                                </Grid.Col>
                                <Grid.Col xs={9}>
                                    <p>
                                        {org.companyAddressSame
                                            ? org.billingAddress?.address1
                                            : org.companyAddress?.address1}
                                    </p>
                                    <p>
                                        {org.companyAddressSame
                                            ? org.billingAddress?.address2
                                            : org.companyAddress?.address2}
                                    </p>
                                    <p>
                                        {org.companyAddressSame
                                            ? org.billingAddress?.city
                                            : org.companyAddress?.city}
                                        ,
                                        {org.companyAddressSame
                                            ? org.billingAddress?.state
                                            : org.companyAddress?.state}
                                    </p>
                                </Grid.Col>
                            </Grid>

                            <Grid columns={12}>
                                <Grid.Col xs={3}>
                                    <p className="text-muted">
                                        Zip Code / Postcode
                                    </p>
                                </Grid.Col>
                                <Grid.Col xs={9}>
                                    <p>
                                        {org.companyAddressSame
                                            ? org.billingAddress?.zipcode
                                            : org.companyAddress?.zipcode}
                                    </p>
                                </Grid.Col>
                            </Grid>
                            <Grid columns={12}>
                                <Grid.Col xs={3}>
                                    <p className="text-muted">Country</p>
                                </Grid.Col>
                                <Grid.Col xs={9}>
                                    <p>
                                        {org.companyAddressSame
                                            ? org.billingAddress?.country
                                            : org.companyAddress?.country}
                                    </p>
                                </Grid.Col>
                            </Grid>
                        </Stack>
                    </SimpleGrid>
                )}
                {addressEditMode && (
                    <>
                        <BusinessDetailsForm
                            size="xs"
                            onNextStep={(orgBasicInfo) => {
                                if (orgBasicInfo) {
                                    setOrg((prev) => {
                                        const newOrg = { ...prev };
                                        newOrg.name = orgBasicInfo.name;
                                        newOrg.website = orgBasicInfo.website;
                                        newOrg.description =
                                            orgBasicInfo.description;
                                        newOrg.billingAddress =
                                            orgBasicInfo.billingAddress;
                                        newOrg.companyAddress =
                                            orgBasicInfo.companyAddress ===
                                            undefined
                                                ? null
                                                : orgBasicInfo.companyAddress;
                                        newOrg.companyAddressSame =
                                            orgBasicInfo.companyAddressSame;
                                        return newOrg;
                                    });
                                }
                                setAddressEditMode(false);
                            }}
                            organization={org}
                            authHelper={authHelper}
                        />
                    </>
                )}
            </Card>
            <Card shadow="md" className="p-4 w-full h-full">
                {!contactEditMode && (
                    <EditButton
                        onClick={() => {
                            setContactEditMode(true);
                        }}
                    />
                )}
                {contactEditMode && (
                    <CancelButton
                        onClick={() => {
                            setContactEditMode(false);
                        }}
                    />
                )}
                <Stack spacing={'xl'}>
                    {!contactEditMode && (
                        <>
                            <Grid columns={12}>
                                <Grid.Col xs={3} md={2}>
                                    <p className="text-muted mr-2">
                                        Primary Contact
                                    </p>
                                </Grid.Col>
                                <Grid.Col xs={9} md={10}>
                                    <Group spacing='xl'>
                                        <p>{org.primaryContact?.name}</p>
                                        <p>
                                            <span>
                                                <i
                                                    className="simple-icon-envelope mr-1 relative"
                                                    style={{ top: 2 }}
                                                />
                                            </span>
                                            {org.primaryContact?.email}
                                        </p>
                                        <p>
                                            <span>
                                                <i
                                                    className="simple-icon-phone mr-1 relative"
                                                    style={{ top: 1 }}
                                                />
                                            </span>
                                            {org.primaryContact?.phone}
                                        </p>
                                    </Group>
                                </Grid.Col>
                            </Grid>
                            {org.showSecondaryContact && (
                                <Grid columns={12}>
                                    <Grid.Col xs={3} md={2}>
                                        <p className="text-muted mr-2">
                                            Secondary Contact
                                        </p>
                                    </Grid.Col>
                                    <Grid.Col xs={9} md={10}>
                                        <Group spacing={'xl'}>
                                            <p>{org.secondaryContact?.name}</p>
                                            <p>
                                                <span>
                                                    <i
                                                        className="simple-icon-envelope mr-1 relative"
                                                        style={{ top: 2 }}
                                                    />
                                                </span>
                                                {org.secondaryContact?.email}
                                            </p>
                                            <p>
                                                <span>
                                                    <i
                                                        className="simple-icon-phone mr-1 relative"
                                                        style={{ top: 1 }}
                                                    />
                                                </span>
                                                {org.secondaryContact?.phone}
                                            </p>
                                        </Group>
                                    </Grid.Col>
                                </Grid>
                            )}
                            <Grid columns={12}>
                                <Grid.Col xs={3} md={2}>
                                    <p className="text-muted mr-2">
                                        Billing Contact
                                    </p>
                                </Grid.Col>
                                <Grid.Col xs={9} md={10}>
                                    {!org.sameBillingContact && <Group spacing={'xl'}>
                                        <p>
                                            {org.sameBillingContact
                                                ? org.primaryContact?.name
                                                : org.billingContact?.name}
                                        </p>
                                        <p>
                                            <span>
                                                <i
                                                    className="simple-icon-envelope mr-1 relative"
                                                    style={{ top: 2 }}
                                                />
                                            </span>
                                            {org.sameBillingContact
                                                ? org.primaryContact?.email
                                                : org.billingContact?.email}
                                        </p>
                                        <p>
                                            <span>
                                                <i
                                                    className="simple-icon-phone mr-1 relative"
                                                    style={{ top: 1 }}
                                                />
                                            </span>
                                            {org.sameBillingContact
                                                ? org.primaryContact?.phone
                                                : org.billingContact?.phone}
                                        </p>
                                    </Group>}
                                    {org.sameBillingContact && <p>
                                        Same as Primary Contact
                                    </p>
                                    }
                                </Grid.Col>
                            </Grid>
                        </>
                    )}
                    {contactEditMode && (
                        <>
                            <BusinessContactForm
                                authHelper={authHelper}
                                organization={org}
                                size="xs"
                                nextStep={(contactInfo) => {
                                    setContactEditMode(false);
                                    if (contactInfo) {
                                        setOrg((prev) => {
                                            const newOrg = { ...prev };
                                            newOrg.primaryContact =
                                                contactInfo.primaryContact;
                                            newOrg.secondaryContact =
                                                contactInfo.secondaryContact ===
                                                undefined
                                                    ? null
                                                    : contactInfo.secondaryContact;
                                            newOrg.sameBillingContact =
                                                contactInfo.sameBillingContact;
                                            newOrg.showSecondaryContact =
                                                contactInfo.showSecondaryContact;
                                            newOrg.billingContact =
                                                contactInfo.billingContact ===
                                                undefined
                                                    ? null
                                                    : contactInfo.billingContact;
                                            return newOrg;
                                        });
                                    }
                                }}
                            />
                        </>
                    )}
                </Stack>
            </Card>
            <Grid gutter={'xl'}>
                <Grid.Col md={6}>
                    <Card shadow="md" className="p-4 w-full h-full">
                        {!leEditMode && (
                            <EditButton
                                onClick={() => {
                                    setLeEditMode(true);
                                }}
                            />
                        )}
                        {leEditMode && (
                            <CancelButton
                                onClick={() => {
                                    setLeEditMode(false);
                                    setShowLeError(false);
                                }}
                            />
                        )}
                        {!leEditMode && (
                            <Grid columns={12}>
                                <Grid.Col xs={3}>
                                    <p className="text-muted">
                                        Legal Entities:{' '}
                                    </p>
                                </Grid.Col>
                                <Grid.Col xs={9}>
                                    <List spacing={'lg'}>
                                        {legalEntities.map((le, index) => (
                                            <List.Item
                                                key={le.id}
                                                icon={
                                                    <span
                                                        className="relative"
                                                        style={{ top: -4 }}>
                                                        {index + 1}.
                                                    </span>
                                                }>
                                                <p>{le.name}</p>
                                                <p className="text-muted">
                                                    {le.description}
                                                </p>
                                            </List.Item>
                                        ))}
                                    </List>
                                </Grid.Col>
                            </Grid>
                        )}
                        {leEditMode && (
                            <>
                                <List
                                    icon={
                                        <i
                                            className="simple-icon-arrow-right text-xs relative"
                                            style={{ top: -3 }}
                                        />
                                    }
                                    spacing="lg">
                                    {legalEntities.map((le, index) => (
                                        <List.Item key={le.id}>
                                            <Stack spacing={'sm'}>
                                                <Group position="apart">
                                                    <p className="font-bold">
                                                        Entity {index + 1}{' '}
                                                    </p>
                                                    {index !== 0 &&
                                                        businessFunctions.filter(
                                                            (bf) =>
                                                                bf.entity ===
                                                                le.name,
                                                        ).length === 0 && (
                                                            <Tooltip
                                                                label={
                                                                    'Delete Entity ' +
                                                                    (index + 1)
                                                                }>
                                                                <BsTrash
                                                                    onClick={() => {
                                                                        const les =
                                                                            [
                                                                                ...legalEntities,
                                                                            ];
                                                                        les.splice(
                                                                            index,
                                                                            1,
                                                                        );
                                                                        setLegalEntities(
                                                                            les,
                                                                        );
                                                                    }}
                                                                    className="text-danger text-sm cursor-pointer hover:scale-110 transition-all"
                                                                />
                                                            </Tooltip>
                                                        )}
                                                </Group>
                                                <TextInput
                                                    error={
                                                        showLeError &&
                                                        le.name === ''
                                                            ? 'Please provide a name'
                                                            : ''
                                                    }
                                                    value={le.name}
                                                    onChange={(event) => {
                                                        const newLe = [
                                                            ...legalEntities,
                                                        ];
                                                        newLe[index].name =
                                                            event.currentTarget.value;
                                                        setLegalEntities(newLe);
                                                    }}
                                                    placeholder="Name"
                                                />
                                                <TextInput
                                                    size="xs"
                                                    onChange={(event) => {
                                                        const newLe = [
                                                            ...legalEntities,
                                                        ];
                                                        newLe[
                                                            index
                                                        ].description =
                                                            event.currentTarget.value;
                                                        setLegalEntities(newLe);
                                                    }}
                                                    value={le.description}
                                                    placeholder="Description"
                                                />
                                            </Stack>
                                        </List.Item>
                                    ))}
                                </List>
                                <Space h={'lg'} />
                                <Group position="apart" className="w-full">
                                    <span
                                        onClick={() => {
                                            const newLe = {
                                                id: Math.floor(
                                                    Math.random() * 1000000,
                                                ),
                                                name: '',
                                                description: '',
                                            };
                                            setLegalEntities([
                                                ...legalEntities,
                                                newLe,
                                            ]);
                                        }}>
                                        <Button
                                            type="button"
                                            size={'xs'}
                                            color="secondary">
                                            <Group
                                                spacing={'xs'}
                                                position="center">
                                                <MdAdd
                                                    className="relative"
                                                    style={{ top: -1 }}
                                                />
                                                <span>Add Legal Entity</span>
                                            </Group>
                                        </Button>
                                    </span>
                                    <span onClick={() => {
                                        onSubmit();
                                    }}>
                                        <Button size="xs" color="primary">
                                            Save
                                        </Button>
                                    </span>
                                </Group>
                            </>
                        )}
                    </Card>
                </Grid.Col>
                <Grid.Col md={6}>
                    <Card shadow="md" className="p-4 w-full h-full">
                        {!bfEditMode && (
                            <EditButton
                                onClick={() => {
                                    setBfEditMode(true);
                                }}
                            />
                        )}
                        {bfEditMode && (
                            <CancelButton
                                onClick={() => {
                                    setBfEditMode(false);
                                    setShowLeError(false);
                                }}
                            />
                        )}
                        {!bfEditMode && <Grid columns={12}>
                            <Grid.Col xs={3}>
                                <p className="text-muted">
                                    Business Function / Unit
                                </p>
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <Stack>
                                    {businessFunctions.map((bf) => (
                                        <p key={bf.id}>{bf.label}</p>
                                    ))}
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Stack>
                                    {businessFunctions.map((bf) => (
                                        <p key={bf.id}>{bf.entity}</p>
                                    ))}
                                </Stack>
                            </Grid.Col>
                        </Grid>}
                        {bfEditMode && (
                            <Stack>
                                <div>
                                    <p className='font-bold'>Business Function / Unit</p>
                                    <p className='text-muted'>Add functional unit eg. Human Resources, Management etc.</p>
                                </div>
                                <List spacing={'lg'}>
                                    {businessFunctions.map((func, index) => (
                                        <List.Item key={func.id}>
                                            <SimpleGrid cols={2}>
                                                <Autocomplete error={
                                                    showLeError && func.label === '' ? 'Please provide a business function' : ''
                                                } data={AutoCompleteFunctionalData} value={func.label} onChange={(value) => {
                                                    const newBf = [...businessFunctions];
                                                    newBf[index].label = value;
                                                    setBusinessFunctions(newBf);
                                                }} placeholder='Functional type' />
                                                <Grid>
                                                    <Grid.Col span={11}>
                                                    <Select error={
                                                        showLeError && (func.entity === '' || func.entity === null) ? 'Please provide a legal entity' : ''
                                                    } value={func.entity} onChange={(value) => {
                                                        if (value !== null) {
                                                            const newBF = [...businessFunctions];
                                                            newBF[index].entity = value;
                                                            setBusinessFunctions(newBF);
                                                        }
                                                    }} placeholder='Entity' data={legalEntities.map(e => e.name)} />
                                                    </Grid.Col>
                                                    <Grid.Col span={1}>
                                                        <Center className='h-full'>
                                                            <BsTrash onClick={() => {
                                                                const newBF = [...businessFunctions];
                                                                newBF.splice(index, 1);
                                                                setBusinessFunctions(newBF);
                                                            }} className='text-danger cursor-pointer' />
                                                        </Center>
                                                    </Grid.Col>
                                                </Grid>
                                            </SimpleGrid>
                                        </List.Item>
                                    ))}
                                </List>
                                
                                <Group position={'apart'}>
                                    <span onClick={() => {
                                        const newBusinessFunction = {id: Math.floor(Math.random() * 1000000), label: '', entity: ''};
                                        setBusinessFunctions([...businessFunctions, newBusinessFunction]);
                                    }}><Button size='xs' color='secondary'>
                                        <Group position='center' spacing='xs'>
                                            <MdAdd />
                                            <span>Add Business Function</span>
                                        </Group>
                                    </Button></span>
                                    <span onClick={onSubmit}>
                                        <Button size='xs' color='primary' >Save</Button>
                                    </span>
                                </Group>
                            </Stack>
                        )}
                    </Card>
                </Grid.Col>
            </Grid>
        </Stack>
    );
};

export default BusinessDetails;
