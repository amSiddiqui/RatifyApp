import { Group, Popover, Stack } from '@mantine/core';
import React from 'react';
import { MdInfoOutline, MdTimeline } from 'react-icons/md';
import { getFormatDateFromIso } from '../../../../helpers/Utils';
import { Agreement } from '../../../../types/ContractTypes';

type Prop = {
    onAuditClick: () => void,
    agreement: Agreement | null | undefined, 
}

const AuditTrailButton:React.FC<Prop> = ({ onAuditClick, agreement }) => {
    const [showInfo, setShowInfo] = React.useState(false);

    return <Stack>
        <Group spacing={10} className='cursor-pointer' onClick={onAuditClick}>
            <MdTimeline className='text-lg' />
            <p className='underline text-blue-400'>Audit Trail</p>
        </Group>
        <Popover
            withArrow
            position='bottom'
            placement='center'
            withCloseButton
            opened={showInfo}
            onClose={() => setShowInfo(false)}
            target={
            <Group spacing={10} onClick={() => setShowInfo(true)} className='cursor-pointer'>
                <MdInfoOutline className='text-lg' />
                <p className='underline text-blue-400'>Other Information</p>
            </Group>
            }
        >
            <Stack className='p-2'>
                {agreement && agreement.start_date && <Group >
                    <i className='simple-icon-calendar text-lg text-blue-400' />
                    <p>Document start date: <span className='text-rose-400'>{getFormatDateFromIso(agreement.start_date)}</span></p>
                </Group>}
                {agreement && agreement.end_date && <Group >
                    <i className='simple-icon-calendar text-lg text-blue-400' />
                    <p>Document end date: <span className='text-rose-400'>{getFormatDateFromIso(agreement.end_date)}</span></p>
                </Group>}
                {agreement && !agreement.start_date && !agreement.end_date && <p className='italic text-muted'>No additional information associated with this document</p>}
            </Stack>
        </Popover>
    </Stack>;
}

export default AuditTrailButton;