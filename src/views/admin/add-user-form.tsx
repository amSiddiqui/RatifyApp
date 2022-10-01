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
import { MdSave, MdSend } from 'react-icons/md';
import { Button } from 'reactstrap';
import { BusinessFunction, LegalEntity, NewUserData, OrganizationUser } from '../../types/AuthTypes';
import { AuthHelper } from '../../helpers/AuthHelper';
import { validateEmail } from '../../helpers/Utils';
import { toast } from 'react-toastify';
import UneditableInput from '../../components/common/UneditableInput';

type Props = {
    legalEntities: LegalEntity[];
    businessFunctions: BusinessFunction[];
    authHelper: AuthHelper;
    onClose: () => void;
    onSuccess: () => void;
    editMode?: boolean;
    user?: OrganizationUser;
};

const AddUserForm: React.FC<Props> = ({
    legalEntities,
    businessFunctions,
    authHelper,
    onClose,
    onSuccess,
    editMode,
    user
}) => {
    const [additionalSettings, setAdditionalSettings] = React.useState(false);
    const [selectedLegalEntity, setSelectedLegalEntity] = React.useState<{ id: number, label: string }>();
    const [selectedBusinessFunction, setSelectedBusinessFunction] =
        React.useState(0);
    const [selectedRole, setSelectedRole] = React.useState( user ? user.role.toString() : '1');
    const [userType, setUserType] = React.useState(user ? user.user_type.toString() : '0');
    const [userIdReference, setUserIdReference] = React.useState(user ? user.user_id_reference ?? '' : '');
    const [jobTitle, setJobTitle] = React.useState(user ? user.job_title : '');
    const [firstName, setFirstName] = React.useState(user ? user.first_name : '');
    const [lastName, setLastName] = React.useState(user ? user.last_name : '');
    const [email, setEmail] = React.useState(user ? user.email : '');
    const [emailError, setEmailError] = React.useState('');
    
    const resetForm = () => {
        setAdditionalSettings(false);
        setSelectedLegalEntity({ id: 0, label: '' });
        setSelectedBusinessFunction(0);
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
            id: user ? user.id.toString() : '',
            first_name: firstName,
            last_name: lastName,
            email: email,
            role: selectedRole,
            user_id_reference: userIdReference,
            userType: userType,
            job_title: jobTitle,
            legalEntity: selectedLegalEntity ? selectedLegalEntity.id : 0,
            businessFunction: selectedBusinessFunction,
        } as NewUserData;
        
        if (!editMode) {
            authHelper.postOrganizationUser(data).then(res => {
                toast.success('Invitation sent successfully');
                resetForm();
                onClose();
                onSuccess();
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
        } else {
            authHelper.putOrganizationUser(data).then(res => {
                toast.success('User updated successfully');
                resetForm();
                onClose();
                onSuccess();
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
        }
    };

    return (
        <Stack>
            <div>
                {editMode && <h3>Edit User</h3>}
                {!editMode && <h3>Add New User</h3>}
                {!editMode && <p className="text-sm">
                    An invite will be sent to the user to complete their
                    profile. Once they have completed their profile this user
                    will be added to your organization.
                </p>}
            </div>
            {!editMode && <TextInput
                error={emailError}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                label="Email"
                required
            />}
            {editMode && <UneditableInput
                value={email}
                label='Email'
                icon={<i className='simple-icon-envelope' />}
            />}

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
                                                    {id: filter[0].id, label: filter[0].name}
                                                );
                                                setSelectedBusinessFunction(0);
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
                            (bf) => bf.entity === selectedLegalEntity?.label,
                        ).length > 0 && (
                            <Grid.Col sm={6}>
                                <Select
                                    data={businessFunctions
                                        .filter(
                                            (bf) =>
                                                bf.entity === selectedLegalEntity?.label,
                                        )
                                        .map((le) => ({
                                            label: le.label,
                                            value: le.id.toString(),
                                        }))}
                                    value={selectedBusinessFunction.toString()}
                                    onChange={(val) => {
                                        if (val) {
                                            setSelectedBusinessFunction(isNaN(parseInt(val)) ? 0: parseInt(val));
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
                            {!editMode && <MdSend />}
                            {!editMode && <span>Send Invite</span>}
                            {editMode && <MdSave />}
                            {editMode && <span>Save</span>}
                        </Group>
                    </Button>
                </span>
            </Group>
        </Stack>
    );
};
export default AddUserForm;
