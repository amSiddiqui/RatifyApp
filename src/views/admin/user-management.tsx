import { Group, Modal, Stack } from '@mantine/core';
import React from 'react';
import { MdAdd } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Row } from 'reactstrap';
import { Colxx, Separator } from '../../components/common/CustomBootstrap';
import Breadcrumb from '../../containers/navs/Breadcrumb';
import { AuthHelper } from '../../helpers/AuthHelper';
import { AppDispatch } from '../../redux';
import {
    BusinessFunction,
    LegalEntity,
    OrganizationUser,
} from '../../types/AuthTypes';
import AddUserForm from './add-user-form';
import UserManagementTable from './user-management-table';

const UserManagement: React.FC = () => {
    const match = useLocation();

    const [userModal, setUserModal] = React.useState(false);
    const [legalEntities, setLegalEntities] = React.useState<LegalEntity[]>([]);
    const [businessFunctions, setBusinessFunctions] = React.useState<
        BusinessFunction[]
    >([]);
    const dispatch = useDispatch<AppDispatch>();
    const authHelper = React.useMemo(
        () => new AuthHelper(dispatch),
        [dispatch],
    );
    const [users, setUsers] = React.useState<OrganizationUser[]>([]);

    React.useEffect(() => {
        authHelper
            .getOrganizationLegalEntities()
            .then((res) => {
                setLegalEntities(res.legalEntity);
                setBusinessFunctions(res.businessFunction);
            })
            .catch((err) => {
                console.log(err);
            });

        authHelper
            .getOrganizationUsers()
            .then(async (res) => {
                for (var i = 0; i < res.length; i++) {
                    try {
                        res[i].image =
                            await authHelper.getOrganizationUserImage(
                                res[i].id,
                            );
                    } catch (err) {}
                }
                setUsers(res);
            })
            .catch((err) => {
                console.log(err);
                toast.error('Error fetching users');
            });
    }, [authHelper]);

    return (
        <>
            <Row>
                <Colxx xxs="12">
                    <Breadcrumb heading="admin.user-management" match={match} />
                    <Separator className="mb-14" />
                </Colxx>
            </Row>
            <Stack>
                <Button
                    onClick={() => {
                        setUserModal(true);
                    }}
                    className="w-32 agreement-button"
                    color="primary">
                    <Group>
                        <MdAdd></MdAdd>
                        <span>Add User</span>
                    </Group>
                </Button>

                <UserManagementTable users={users} />
            </Stack>

            <Modal
                centered
                opened={userModal}
                onClose={() => setUserModal(false)}>
                <AddUserForm
                    onClose={() => {
                        setUserModal(false);
                    }}
                    authHelper={authHelper}
                    legalEntities={legalEntities}
                    businessFunctions={businessFunctions}
                />
            </Modal>
        </>
    );
};

export default UserManagement;
