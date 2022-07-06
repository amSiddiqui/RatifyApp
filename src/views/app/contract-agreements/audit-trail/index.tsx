import React from 'react';
import { toast } from 'react-toastify';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { AuditTrailActionType, AuditTrailData } from '../../../../types/ContractTypes';
import { Center, Loader, Stack, Timeline } from '@mantine/core';
import { MdClear, MdCreate, MdErrorOutline, MdSearch, MdSend } from 'react-icons/md';
import { BsTrash } from 'react-icons/bs';
import { TbWritingSign } from 'react-icons/tb';
import { DateTime } from 'luxon';

type Props = {
    contractHelper: ContractHelper;
    contractId?: string;
    token?: string;
}


function timelineIconFromType(type: AuditTrailActionType) {
    switch (type) {
        case 'create':
            return <MdCreate />;
        case 'deleted':
            return <BsTrash />;
        case 'error':
            return <MdErrorOutline />;
        case 'sent':
            return <MdSend />;
        case 'submit':
            return <TbWritingSign />;
        case 'decline':
            return <MdClear />;
        default:
            return <MdSearch />;
    }
}

function timelineTitleFromType(type: AuditTrailActionType, signer_type: string | null) {
    switch (type) {
        case 'create':
            return 'Document Created';
        case 'deleted':
            return 'Document Deleted';
        case 'error':
            return 'Error Sending Document';
        case 'sent':
            return 'Document Sent';
        case 'submit':
            if (signer_type === 'signer') {
                return 'Document Signed';
            } else if (signer_type === 'viewer') {
                return 'Document Viewed';
            } else if (signer_type === 'approver') {
                return 'Document Approved';
            }
            return 'Document Submitted';
        case 'decline':
            return 'Document Declined';
        default:
            return 'Document Viewed';
    }
}

function timelineDescriptionFromType(data: AuditTrailData) {
    if (data.action_type === 'create') {
        if (data.user) {
            return `${data.user} created the document ${data.agreement}`;
        }
        return `Document ${data.agreement} was created`;
    }
    if (data.action_type === 'deleted') {
        if (data.user) {
            return `${data.user} deleted the document ${data.agreement}`;
        }
        return `Document ${data.agreement} was deleted`;
    }
    if (data.action_type === 'error') {
        if (data.user) {
            return `${data.user} had an error sending the document ${data.agreement} to ${data.signer}`;
        }
        return `Document ${data.agreement} had an error sending to ${data.signer}`;
    }
    if (data.action_type === 'sent') {
        if (data.user) {
            return `${data.user} send the document ${data.agreement} to ${data.signer}`;
        }
        return `Document ${data.agreement} was sent to ${data.signer}`;
    }
    if (data.action_type === 'submit') {
        if (data.signer_type === 'signer') {
            return `${data.signer} signed the document ${data.agreement}`;
        }
        if (data.signer_type === 'viewer') {
            return `${data.signer} viewed the document ${data.agreement}`;
        }
        if (data.signer_type === 'approver') {
            return `${data.signer} approved the document ${data.agreement}`;
        }
        return 'Document Submitted';
    }
    if (data.action_type === 'viewed') {
        return `${data.signer} viewed the document ${data.agreement}`;
    }
    if (data.action_type === 'decline') {
        return `${data.signer} declined the document ${data.agreement}`;
    }
}

function timelineDate(date: string) {
    return DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_FULL);
}

const AuditTrail:React.FC<Props> = ({ contractHelper, contractId, token }) => {

    const [auditTrail, setAuditTrail] = React.useState<AuditTrailData[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(false);


    React.useEffect(() => {
        setError(false);
        if (contractId) {
            if (!token) {
                contractHelper.getAuditTrail(contractId).then(data => {
                    setAuditTrail(data.data);
                    setLoading(false);
                }).catch(err => {
                    if (err) {
                        console.log(err);
                        toast.error('Error fetching audit trail. Try again later!');
                    }
                    setError(true);
                });
            } else {
                contractHelper.getSignerAuditTrail(token).then(data => {
                    setAuditTrail(data.data);
                    setLoading(false);
                }).catch(err => {
                    if (err) {
                        console.log(err);
                        toast.error('Error fetching audit trail. Try again later!');
                    }
                    setError(true);
                })
            }
        }
    }, [contractHelper, contractId, token]);

    return (<div>
        {loading && <Center className='w-full h-36'>
            <Loader size='lg' />    
        </Center>}
        {!loading && !error && <Stack>
            <Timeline active={auditTrail.length} bulletSize={24} lineWidth={2}>
                {auditTrail.map((item, index) => {
                    return (
                    <Timeline.Item 
                    key={item.id} 
                    bullet={timelineIconFromType(item.action_type)} 
                    title={<p className='capitalize font-bold text-md mb-0'>{timelineTitleFromType(item.action_type, item.signer_type)}</p>}>
                        <p>{timelineDescriptionFromType(item)}</p>
                        <p className='text-xs'>{timelineDate(item.date)}</p>
                    </Timeline.Item>)
                })}
            </Timeline>
        </Stack>}
        
        {!loading && error && <Center className='w-full h-36'>
            <p className='text-muted text-lg'>Audit Trail cannot be loaded at the moment. Try again later!</p>
        </Center>}
    </div>);
}

export default AuditTrail;