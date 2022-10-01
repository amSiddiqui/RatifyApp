import React from 'react';
import {
    Grid,
    Group,
    Radio,
    Stack,
    TextInput,
    RadioGroup,
    Collapse,
    Select,
} from '@mantine/core';
import { MdSend } from 'react-icons/md';
import { Button } from 'reactstrap';
import { BusinessFunction, LegalEntity, NewUserData } from '../../types/AuthTypes';
import { AuthHelper } from '../../helpers/AuthHelper';
import { validateEmail } from '../../helpers/Utils';
import { toast } from 'react-toastify';

type Props = {
    legalEntities: LegalEntity[];
    businessFunctions: BusinessFunction[];
    authHelper: AuthHelper;
    onClose: () => void;
};

const AddUserForm: React.FC<Props> = ({
    legalEntities,
    businessFunctions,
    authHelper,
    onClose,
}) => {
    const [additionalSettings, setAdditionalSettings] = React.useState(false);
    const [selectedLegalEntity, setSelectedLegalEntity] = React.useState('');
    const [selectedBusinessFunction, setSelectedBusinessFunction] =
        React.useState('');
    const [selectedRole, setSelectedRole] = React.useState('1');
    const [userType, setUserType] = React.useState('0');
    const [userIdReference, setUserIdReference] = React.useState('');
    const [jobTitle, setJobTitle] = React.useState('');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [emailError, setEmailError] = React.useState('');
    
    const resetForm = () => {
        setAdditionalSettings(false);
        setSelectedLegalEntity('');
        setSelectedBusinessFunction('');
        setSelectedRole('1');
        setUserType('0');
        setJobTitle('');
        setFirstName('');
        setLastName('');
        setEmail('');
        setUserIdReference('');
        setEmailError('');
    }

    const onSubmit = () => {
        if (email.length === 0 || !validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        setEmailError('');
        let data = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            role: selectedRole,
            user_id_reference: userIdReference,
            userType: userType,
            job_title: jobTitle,
            legalEntity: selectedLegalEntity,
            businessFunction: selectedBusinessFunction,
        } as NewUserData;

        authHelper.postOrganizationUser(data).then(res => {
            toast.success('Invitation sent successfully');
            resetForm();
            onClose();
        }).catch(err => {
            // handle all the errors
            // check if 401 error
            if (err.response) {
                if (err.response.status === 401 || err.response.status === 404) {
                    onClose();
                    resetForm();
                    toast.error('Your session has expired. Please login again.');
                }
                else {
                    if (err.response && err.response.data) {
                        toast.error(err.response.data.message);
                    }
                }
            } else {
                toast.error('Something went wrong. Try again Later!');
            }
        });
    };

    return (
        <Stack>
            <div>
                <h3>Add New User</h3>
                <p className="text-sm">
                    An invite will be sent to the user to complete their
                    profile. Once they have completed their profile this user
                    will be added to your organization.
                </p>
            </div>
            <TextInput
                error={emailError}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                label="Email"
                required
            />

            <Grid>
                <Grid.Col sm={6}>
                    <TextInput
                        label="First Name"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => {
                            setFirstName(e.target.value);
                        }}
                    />
                </Grid.Col>
                <Grid.Col sm={6}>
                    <TextInput
                        label="Last Name"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => {
                            setLastName(e.target.value);
                        }}
                    />
                </Grid.Col>
            </Grid>
            <Grid>
                <Grid.Col lg={6}>
                    <RadioGroup
                        value={selectedRole}
                        label="Select User Role"
                        onChange={(e) => {
                            setSelectedRole(e);
                        }}>
                        <Radio value="1" label="User" />
                        <Radio value="99" label="Admin" />
                    </RadioGroup>
                </Grid.Col>
                <Grid.Col lg={6}>
                    <RadioGroup
                        value={userType}
                        onChange={(e) => {
                            setUserType(e);
                        }}
                        label="Select User Type"
                        defaultValue="0">
                        <Radio value="0" label="Internal " />
                        <Radio value="1" label="External" />
                    </RadioGroup>
                </Grid.Col>
            </Grid>
            <Group
                spacing={12}
                className="cursor-pointer"
                onClick={() => {
                    setAdditionalSettings((prev) => !prev);
                }}>
                {!additionalSettings && (
                    <i className="simple-icon-arrow-right" />
                )}
                {additionalSettings && <i className="simple-icon-arrow-down" />}
                <p>Optional Settings</p>
            </Group>
            <Collapse in={additionalSettings}>
                <Stack>
                    <TextInput
                        value={userIdReference}
                        onChange={(e) => setUserIdReference(e.target.value)}
                        placeholder="User ID Reference"
                        label="User ID Reference"
                    />
                    <TextInput
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="Job Title"
                        label="Job Title"
                    />
                    <Grid>
                        {legalEntities && (
                            <Grid.Col sm={6}>
                                <Select
                                    onChange={(e) => {
                                        if (e) {
                                            const filter = legalEntities.filter(
                                                (le) => le.id.toString() === e,
                                            );
                                            if (filter.length > 0) {
                                                setSelectedLegalEntity(
                                                    filter[0].name,
                                                );
                                                setSelectedBusinessFunction('');
                                            }
                                        }
                                    }}
                                    data={legalEntities.map((le) => ({
                                        label: le.name,
                                        value: le.id.toString(),
                                    }))}
                                    placeholder="Legal Entity"
                                    label="Legal Entity"
                                />
                            </Grid.Col>
                        )}
                        {businessFunctions.filter(
                            (bf) => bf.entity === selectedLegalEntity,
                        ).length > 0 && (
                            <Grid.Col sm={6}>
                                <Select
                                    data={businessFunctions
                                        .filter(
                                            (bf) =>
                                                bf.entity === selectedLegalEntity,
                                        )
                                        .map((le) => ({
                                            label: le.label,
                                            value: le.id.toString(),
                                        }))}
                                    value={selectedBusinessFunction}
                                    onChange={(e) => {
                                        if (e) {
                                            setSelectedBusinessFunction(e);
                                        }
                                    }}
                                    placeholder="Business Function"
                                    label="Business Function"
                                />
                            </Grid.Col>
                        )}
                    </Grid>
                </Stack>
            </Collapse>

            <Group position="right">
                <span
                    onClick={() => {
                        onClose();
                    }}>
                    <Button color="light">Cancel</Button>
                </span>
                <span
                    onClick={() => {
                        onSubmit();
                    }}>
                    <Button color="success">
                        <Group spacing={8}>
                            <MdSend />
                            <span>Send Invite</span>
                        </Group>
                    </Button>
                </span>
            </Group>
        </Stack>
    );
};
export default AddUserForm;
