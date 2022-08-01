import { Autocomplete, Center, Divider, Grid, Group, List, Select, SimpleGrid, Stack, Textarea, TextInput, Tooltip } from '@mantine/core';
import { Button } from 'reactstrap';
import React from 'react';
import { MdAdd } from 'react-icons/md';
import { useMediaQuery } from '@mantine/hooks';
import { BusinessFunction, LegalEntity } from '../../types/AuthTypes';
import { AuthHelper } from '../../helpers/AuthHelper';
import { toast } from 'react-toastify';
import { BsTrash } from 'react-icons/bs';

export const AutoCompleteFunctionalData = [
    'Legal',
    'Human Resources',
    'Finance',
    'Technology',
    'Business Development',
    'Managers & Acquisition',
]

const BusinessLegalEntities:React.FC<{ prevStep: () => void, defaultLegalEntity?:LegalEntity, authHelper: AuthHelper, onComplete: () => void }> = ({ prevStep, defaultLegalEntity, authHelper, onComplete }) => {
    const [legalEntities, setLegalEntities] = React.useState<LegalEntity[]>(defaultLegalEntity ? [defaultLegalEntity] : []);
    const [businessFunctions, setBusinessFunctions] = React.useState<BusinessFunction[]>([]);

    const [showError, setShowError] = React.useState(false);

    const matches = useMediaQuery('(max-width:800px)');

    const onSubmit = () => {
        setShowError(true);
        authHelper.updateOrganizationLegalEntities({legalEntity: legalEntities, businessFunction: businessFunctions}).then(() => {
            toast.success('Legal entities saved');
            onComplete();
        }).catch(err => {
            toast.error('Something went wrong try again later!');
        });
    }

    React.useEffect(() => {
        let shouldUpdate = true;
        authHelper.getOrganizationLegalEntities().then((data) => {
            if (shouldUpdate) {
                if (data.legalEntity.length > 0) {
                    setLegalEntities(data.legalEntity);
                }
                setBusinessFunctions(data.businessFunction);
            }
        }).catch(err => {
            console.log(err);
        });
        return () => {shouldUpdate = false;}
    }, [authHelper]);

    return <>
        <div className='mt-4'>
            <Grid columns={12}>
                <Grid.Col md={4} xs={12}>
                    <Stack className='p-4'>
                        <h3 className='font-bold'>Legal Entities</h3>  
                        <List spacing={'xl'} icon={<i className='simple-icon-arrow-right' />}>
                            {legalEntities.map((legalEntity, index) => (
                                <List.Item key={legalEntity.id}>
                                    <Stack spacing={'sm'}>
                                        <Group position='apart'>
                                            <h4>Entity {index + 1}</h4>
                                            {index !== 0 && <Tooltip label={'Delete Entity ' + (index + 1)}><BsTrash onClick={() => {
                                                const les = [...legalEntities];
                                                les.splice(index, 1);
                                                setLegalEntities(les);
                                            }} className='text-danger cursor-pointer' /></Tooltip>}
                                        </Group>
                                        <TextInput error={
                                            showError && legalEntities[index].name === '' ? 'Please provide a name' : ''
                                        } label='Name' placeholder='Name' value={legalEntity.name} onChange={(event) => {
                                            const newLegalEntities = [...legalEntities];
                                            newLegalEntities[index].name = event.currentTarget.value;
                                            setLegalEntities(newLegalEntities);
                                        }} />
                                        <Textarea label='Description' onChange={(event) => {
                                            const newLegalEntities = [...legalEntities];
                                            newLegalEntities[index].description = event.currentTarget.value;
                                            setLegalEntities(newLegalEntities);
                                    }} placeholder='Description' value={legalEntity.description} />
                                        <Divider />
                                    </Stack>
                                </List.Item>
                            ))}
                        </List>
                        <Group position={ matches ? 'left':  'right'}>
                            <span onClick={() => {
                                // generate random id
                                const newLegalEntity = {id: Math.floor(Math.random() * 1000000), name: '', description: ''};
                                setLegalEntities([...legalEntities, newLegalEntity]);
                            }}><Button type='button' color='secondary'>
                                <Group spacing={'sm'} position='center'>
                                    <MdAdd className='text-lg' />
                                    <span>Add Legal Entity</span>
                                </Group>
                                </Button></span>
                        </Group>
                    </Stack>

                </Grid.Col>
                <Grid.Col md={8} xs={12}>
                    <Stack className='p-4' style={{width: '100%'}}>
                        <h4 className='font-bold'>Business Function / Unit</h4>
                        <p className='text-muted'>Add functional unit eg. Human Resources, Management etc.</p>
                        <List spacing={'lg'}>
                            {businessFunctions.map((func, index) => (
                                <List.Item key={func.id}>
                                    <SimpleGrid cols={2}>
                                        <Grid columns={12}>
                                            <Grid.Col span={11}>
                                                <Select error={
                                                    showError && (func.entity === '' || func.entity === null) ? 'Please provide a legal entity' : ''
                                                } value={func.entity} onChange={(value) => {
                                                    if (value !== null) {
                                                        const newBF = [...businessFunctions];
                                                        newBF[index].entity = value;
                                                        setBusinessFunctions(newBF);
                                                    }
                                                }} placeholder='Select an Entity' data={legalEntities.map(e => e.name)} />
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
                                        <Autocomplete error={
                                            showError && func.label === '' ? 'Please provide a business function' : ''
                                        } data={AutoCompleteFunctionalData} value={func.label} onChange={(value) => {
                                            const newBF = [...businessFunctions];
                                            newBF[index].label = value;
                                            setBusinessFunctions(newBF);
                                        }} placeholder='Add function type' />
                                    </SimpleGrid>
                                </List.Item>
                            ))}
                        </List>
                        <Group position={ matches ? 'left':  'right'}>
                            <span onClick={() => {
                                const newBusinessFunction = {id: Math.floor(Math.random() * 1000000), label: '', entity: ''};
                                setBusinessFunctions([...businessFunctions, newBusinessFunction]);
                            }}><Button color='secondary'>
                                <Group position='center' spacing='xs'>
                                    <MdAdd className='text-lg' />
                                    <span>Add Business Function</span>
                                </Group>
                            </Button></span>
                        </Group>
                    </Stack>
                </Grid.Col>
            </Grid>
            <Group position='right' className='mt-4'>
                <span onClick={prevStep}>
                    <Button type='button' color='light'>Back</Button>
                </span>
                <span onClick={onSubmit}>
                    <Button type='button' color='light'>Skip</Button>
                </span>
                <span onClick={onSubmit}>
                    <Button color='primary'>Submit</Button>
                </span>
            </Group>
        </div>
    </>;
}

export default BusinessLegalEntities;