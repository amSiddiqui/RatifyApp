import {
    Autocomplete,
    Center,
    Grid,
    Group,
    List,
    Select,
    SimpleGrid,
    Stack,
} from '@mantine/core';
import { Button } from 'reactstrap';
import React from 'react';
import { MdAdd } from 'react-icons/md';
import { BusinessFunction, LegalEntity } from '../../types/AuthTypes';
import { AuthHelper } from '../../helpers/AuthHelper';
import { BsTrash } from 'react-icons/bs';
import { useMediaQuery } from '@mantine/hooks';
import { toast } from 'react-toastify';

export const AutoCompleteFunctionalData = [
    'Legal',
    'Human Resources',
    'Finance',
    'Technology',
    'Business Development',
    'Managers & Acquisition',
];

type Props = {
    prevStep: () => void;
    authHelper: AuthHelper;
    onComplete: () => void;
};

const BusinessFunctionForm: React.FC<Props> = ({
    prevStep,
    authHelper,
    onComplete,
}) => {
    const [legalEntities, setLegalEntities] = React.useState<LegalEntity[]>([]);
    const [businessFunctions, setBusinessFunctions] = React.useState<
        BusinessFunction[]
    >([]);
    const [showError, setShowError] = React.useState(false);
    const matches = useMediaQuery('(max-width:800px)');

    const onSubmit = (skip: boolean) => {
        setShowError(true);
        authHelper
            .updateOrganizationBusinessFunction({ businessFunction: businessFunctions, skip: skip })
            .then(() => {
                toast.success('Legal entities saved');
                onComplete();
            })
            .catch((err) => {
                toast.error('Something went wrong try again later!');
            });
    }

    React.useEffect(() => {
        let shouldUpdate = true;
        authHelper
            .getOrganizationLegalEntities()
            .then((data) => {
                if (shouldUpdate) {
                    if (data.legalEntity.length > 0) {
                        setLegalEntities(data.legalEntity);
                    }
                    setBusinessFunctions(data.businessFunction);
                }
            })
            .catch((err) => {
                console.log(err);
            });
        return () => {
            shouldUpdate = false;
        };
    }, [authHelper]);


    return (
        <div className="mt-4">
            <Stack className="p-4" style={{ width: '100%' }}>
                <h4 className="font-bold">Business Function / Unit</h4>
                <p className="text-muted">
                    Add functional unit eg. Human Resources, Management etc.
                </p>
                <List spacing={'lg'}>
                    {businessFunctions.map((func, index) => (
                        <List.Item key={func.id}>
                            <SimpleGrid cols={2}>
                                <Grid columns={12}>
                                    <Grid.Col span={11}>
                                        <Select
                                            error={
                                                showError &&
                                                (func.entity === '' ||
                                                    func.entity === null)
                                                    ? 'Please provide a legal entity'
                                                    : ''
                                            }
                                            value={func.entity}
                                            onChange={(value) => {
                                                if (value !== null) {
                                                    const newBF = [
                                                        ...businessFunctions,
                                                    ];
                                                    newBF[index].entity = value;
                                                    setBusinessFunctions(newBF);
                                                }
                                            }}
                                            placeholder="Select an Entity"
                                            data={legalEntities.map(
                                                (e) => e.name,
                                            )}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={1}>
                                        <Center className="h-full">
                                            <BsTrash
                                                onClick={() => {
                                                    const newBF = [
                                                        ...businessFunctions,
                                                    ];
                                                    newBF.splice(index, 1);
                                                    setBusinessFunctions(newBF);
                                                }}
                                                className="text-danger cursor-pointer"
                                            />
                                        </Center>
                                    </Grid.Col>
                                </Grid>
                                <Autocomplete
                                    error={
                                        showError && func.label === ''
                                            ? 'Please provide a business function'
                                            : ''
                                    }
                                    data={AutoCompleteFunctionalData}
                                    value={func.label}
                                    onChange={(value) => {
                                        const newBF = [...businessFunctions];
                                        newBF[index].label = value;
                                        setBusinessFunctions(newBF);
                                    }}
                                    placeholder="Add function type"
                                />
                            </SimpleGrid>
                        </List.Item>
                    ))}
                </List>
                <Group position={matches ? 'left' : 'right'}>
                    <span
                        onClick={() => {
                            const newBusinessFunction = {
                                id: Math.floor(Math.random() * 1000000),
                                label: '',
                                entity: '',
                            };
                            setBusinessFunctions([
                                ...businessFunctions,
                                newBusinessFunction,
                            ]);
                        }}>
                        <Button color="secondary">
                            <Group position="center" spacing="xs">
                                <MdAdd className="text-lg" />
                                <span>Add Business Function</span>
                            </Group>
                        </Button>
                    </span>
                </Group>
            </Stack>
            <Group position='right' className='mt-4'>
                <span onClick={prevStep}>
                    <Button type='button' color='light'>Back</Button>
                </span>
                <span onClick={() => {onSubmit(true)}}>
                    <Button type='button' color='light'>Skip</Button>
                </span>
                <span onClick={() => { onSubmit(false); }}>
                    <Button color='primary'>Submit</Button>
                </span>
            </Group>
        </div>
    );
};

export default BusinessFunctionForm;
