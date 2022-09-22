import { Avatar, Card, Group, Stack, Tooltip } from '@mantine/core';
import React from 'react';
import { MdEdit, MdOutlineAdminPanelSettings } from 'react-icons/md';
import { OrganizationUser } from '../../types/AuthTypes';

const OrganizationUserCard:React.FC<{user: OrganizationUser}> = ( {user} ) => {
    return <>
        <Card px='lg' py='xl' radius='md' shadow={'lg'} style={{ width: '100%' }}>
            <Group position='apart'>
                <Group spacing={24}>
                    {<Avatar src={ user.image.length === 0 ? '' : 'data:image/jpeg;base64,' + user.image} alt={user.first_name + " image"} radius='xl' size='lg' />}
                    <Stack spacing={4}>
                        <Group spacing={8}>
                            <h4 className='font-bold'>{user.first_name} {user.last_name}</h4>
                            {
                                <Tooltip label='Admin'><MdOutlineAdminPanelSettings className='text-xl text-success' /></Tooltip>
                            }
                        </Group>
                        <Group>
                            <Group spacing={8}>
                                <p>Status:</p>
                                <p className='font-bold text-success'>Active</p>
                            </Group>
                            <Group spacing={8}>
                                <p>Email: </p>
                                <p>{user.email}</p>
                            </Group>
                        </Group>
                    </Stack>
                </Group>
                {user.role === 1 && <MdEdit className='text-xl'></MdEdit>}
            </Group>
        </Card>
    </>;
}

export default OrganizationUserCard;