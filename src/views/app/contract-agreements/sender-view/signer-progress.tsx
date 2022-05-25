import { Group, Progress, Stack, Tooltip } from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import { getFormatDateFromIso } from '../../../../helpers/Utils';
import { Signer } from '../../../../types/ContractTypes';
import { getBgColorLight } from '../types';
import { Button } from 'reactstrap';

type Props = {
    signer: Signer;
};

const SignerProgress: React.FC<Props> = ({ signer }) => {
    return (
        <Tooltip
            placement="start"
            color={signer.color}
            opened={true}
            withArrow
            zIndex={1}
            position="left"
            label={
                signer.type.charAt(0).toUpperCase() +
                signer.type.substring(1) +
                ' ' +
                signer.step
            }>
            <div
                className={classNames(
                    'w-full px-3 py-3',
                    getBgColorLight(signer.color),
                )}>
                    <Stack spacing='xs'>
                        <p className='text-center'>{signer.name} <i className='simple-icon-check text-success ml-2 relative' style={{top: 1}} /></p>
                        <p>email: {signer.email}</p>
                        <p>Last seen: {signer.last_seen ? getFormatDateFromIso(signer.last_seen) : ''}</p>
                        <div className='w-full'>
                            <Progress className='w-full h-2' value={100} />
                            <Group position='apart' className='text-gray-600'>
                                <p className='text-xs'>Completed</p>
                                <p className='text-xs'> 3/3 </p>
                            </Group>
                        </div>
                        {signer.every_unit === '0' && (
                            <p>No Reminder</p>
                        )}
                        {signer.every_unit !== '0' && (
                            <p>Remind every {signer.every} {signer.every_unit}</p>
                        )}
                        <p>Last Reminder: not sent</p>
                        <span><Button size='xs' color='primary'>
                            Send Reminder    
                        </Button></span>
                    </Stack>
                </div>
        </Tooltip>
    );
};

export default SignerProgress;
