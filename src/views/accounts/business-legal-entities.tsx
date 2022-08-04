import {
    Divider,
    Group,
    List,
    Stack,
    Textarea,
    TextInput,
    Tooltip,
} from '@mantine/core';
import { Button } from 'reactstrap';
import React from 'react';
import { MdAdd } from 'react-icons/md';
import { useMediaQuery } from '@mantine/hooks';
import { LegalEntity } from '../../types/AuthTypes';
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
];

type Props = {
    prevStep: () => void;
    defaultLegalEntity?: LegalEntity;
    authHelper: AuthHelper;
    onNextStep: () => void;
    onSkip: () => void;
};

const BusinessLegalEntities: React.FC<Props> = ({
    prevStep,
    defaultLegalEntity,
    authHelper,
    onNextStep,
    onSkip,
}) => {
    const [legalEntities, setLegalEntities] = React.useState<LegalEntity[]>(
        defaultLegalEntity ? [defaultLegalEntity] : [],
    );

    const [showError, setShowError] = React.useState(false);

    const matches = useMediaQuery('(max-width:800px)');

    const onSubmit = (skip:boolean) => {
        setShowError(true);
        authHelper
            .updateOrganizationLegalEntities({ legalEntity: legalEntities, skip: skip })
            .then(() => {
                toast.success('Legal entities saved');
                if (skip) {
                    onSkip();
                } else {
                    onNextStep();
                }
            })
            .catch((err) => {
                toast.error('Something went wrong try again later!');
            });
    };

    React.useEffect(() => {
        let shouldUpdate = true;
        authHelper
            .getOrganizationLegalEntities()
            .then((data) => {
                if (shouldUpdate) {
                    if (data.legalEntity.length > 0) {
                        setLegalEntities(data.legalEntity);
                    }
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
        <>
            <div className="mt-4">
                <Stack className="p-4">
                    <h3 className="font-bold">Legal Entities</h3>
                    <List
                        spacing={'xl'}
                        className="w-full"
                        icon={<i className="simple-icon-arrow-right" />}>
                        {legalEntities.map((legalEntity, index) => (
                            <List.Item className='w-full' key={legalEntity.id}>
                                <Stack className='w-full' spacing={'sm'}>
                                    <Group position="apart">
                                        <h4>Entity {index + 1}</h4>
                                        {index !== 0 && (
                                            <Tooltip
                                                label={
                                                    'Delete Entity ' +
                                                    (index + 1)
                                                }>
                                                <BsTrash
                                                    onClick={() => {
                                                        const les = [
                                                            ...legalEntities,
                                                        ];
                                                        les.splice(index, 1);
                                                        setLegalEntities(les);
                                                    }}
                                                    className="text-danger cursor-pointer"
                                                />
                                            </Tooltip>
                                        )}
                                    </Group>
                                    <TextInput
                                        error={
                                            showError &&
                                            legalEntities[index].name === ''
                                                ? 'Please provide a name'
                                                : ''
                                        }
                                        label="Name"
                                        placeholder="Name"
                                        style={{ maxWidth: '500px', minWidth: '200px' }}
                                        value={legalEntity.name}
                                        onChange={(event) => {
                                            const newLegalEntities = [
                                                ...legalEntities,
                                            ];
                                            newLegalEntities[index].name =
                                                event.currentTarget.value;
                                            setLegalEntities(newLegalEntities);
                                        }}
                                    />
                                    <Textarea
                                        label="Description"
                                        style={{ maxWidth: '500px', minWidth: matches ? '250px' : "350px" }}
                                        onChange={(event) => {
                                            const newLegalEntities = [
                                                ...legalEntities,
                                            ];
                                            newLegalEntities[
                                                index
                                            ].description =
                                                event.currentTarget.value;
                                            setLegalEntities(newLegalEntities);
                                        }}
                                        placeholder="Description"
                                        value={legalEntity.description}
                                    />
                                    <Divider />
                                </Stack>
                            </List.Item>
                        ))}
                    </List>
                    <Group position={matches ? 'left' : 'right'}>
                        <span
                            onClick={() => {
                                // generate random id
                                const newLegalEntity = {
                                    id: Math.floor(Math.random() * 1000000),
                                    name: '',
                                    description: '',
                                };
                                setLegalEntities([
                                    ...legalEntities,
                                    newLegalEntity,
                                ]);
                            }}>
                            <Button type="button" color="secondary">
                                <Group spacing={'sm'} position="center">
                                    <MdAdd className="text-lg" />
                                    <span>Add Legal Entity</span>
                                </Group>
                            </Button>
                        </span>
                    </Group>
                </Stack>

                <Group position="right" className="mt-4">
                    <span onClick={prevStep}>
                        <Button type="button" color="light">
                            Back
                        </Button>
                    </span>
                    <span onClick={() => {
                        onSubmit(true);
                    }}>
                        <Button type="button" color="light">
                            Skip
                        </Button>
                    </span>
                    <span onClick={() => {
                        onSubmit(false);
                    }}>
                        <Button color="primary">Next</Button>
                    </span>
                </Group>
            </div>
        </>
    );
};

export default BusinessLegalEntities;
