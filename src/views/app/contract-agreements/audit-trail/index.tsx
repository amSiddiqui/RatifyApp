import React from 'react';
import { toast } from 'react-toastify';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { AuditTrailActionType, AuditTrailData } from '../../../../types/ContractTypes';
import { Center, Loader, ScrollArea, Timeline } from '@mantine/core';
import { MdAlarm, MdClear, MdCreate, MdErrorOutline, MdSearch, MdSend } from 'react-icons/md';
import { BiUndo } from 'react-icons/bi';
import { TbWritingSign } from 'react-icons/tb';
import { DateTime } from 'luxon';

function timelineColorFromType(type: AuditTrailActionType) {
    switch (type) {
        case 'create':
            return 'blue';
        case 'deleted':
            return 'orange';
        case 'error':
            return 'red';
        case 'sent':
            return 'blue';
        case 'submit':
            return 'green';
        case 'decline':
            return 'red';
        default:
            return 'blue';
    }
}


function timelineIconFromType(type: AuditTrailActionType) {
    switch (type) {
        case 'create':
            return <MdCreate />;
        case 'deleted':
            return <BiUndo />;
        case 'error':
            return <MdErrorOutline />;
        case 'sent':
            return <MdSend />;
        case 'submit':
            return <TbWritingSign />;
        case 'decline':
            return <MdClear />;
        case 'reminder':
            return <MdAlarm />;
        default:
            return <MdSearch />;
    }
}

function timelineTitleFromType(type: AuditTrailActionType, signer_type: string | null) {
    switch (type) {
        case 'create':
            return 'Document Created';
        case 'deleted':
            return 'Document Withdrawn';
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
        case 'reminder':
            return 'Reminder Sent';
        default:
            return 'Document Viewed';
    }
}

function timelineDescriptionFromType(data: AuditTrailData) {
    if (data.action_type === 'create') {
        if (data.user && data.user.trim()) {
            return <p><span className='text-rose-400'>{data.user}</span> created the document '<span>{data.agreement}</span>'</p>;
        }
        return <p>Document '<span>{data.agreement}</span>' was created</p>;
    }
    if (data.action_type === 'deleted') {
        if (data.user && data.user.trim()) {
            return <p><span className='text-rose-400'>{data.user}</span> withdrew the document '<span>{data.agreement}</span>'</p>;
        }
        return <p>Document '<span>{data.agreement}</span>' was deleted</p>;
    }
    if (data.action_type === 'error') {
        if (data.user && data.user.trim()) {
            return <p><span className='text-rose-400'>{data.user}</span> had an error sending the document '<span>{data.agreement}</span>' to {data.signer} {!!data.signer_email ? <span className='text-muted'>{`[${data.signer_email}]`}</span> : ``}</p>;
        }
        return <p>Document '<span>{data.agreement}</span>' had an error sending to {data.signer}</p>;
    }
    if (data.action_type === 'sent') {
        if (data.user && data.user.trim()) {
            return <p><span className='text-rose-400'>{data.user}</span> sent the document '<span>{data.agreement}</span>' to {data.signer} {!!data.signer_email ? <span className='text-muted'>{`[${data.signer_email}]`}</span> : ``}</p>;
        }
        return <p>Document '<span>{data.agreement}</span>' was sent to {data.signer}</p>;
    }
    
    if (data.action_type === 'reminder') {
        if (data.user && data.user.trim()) {
            return <p><span className='text-rose-400'>{data.user}</span> sent a reminder to {data.signer} {!!data.signer_email ? <span className='text-muted'>{`[${data.signer_email}]`}</span> : ``}</p>;
        }
        return <p>Reminder for '<span>{data.agreement}</span>' was sent to {data.signer}</p>;
    }
    
    if (data.action_type === 'submit') {
        if (data.signer_type === 'signer') {
            return <p><span className='text-rose-400'>{data.signer}</span> signed the document '<span>{data.agreement}</span>'</p>;
        }
        if (data.signer_type === 'viewer') {
            return <p><span className='text-rose-400'>{data.signer}</span> viewed the document '<span>{data.agreement}</span>'</p>;
        }
        if (data.signer_type === 'approver') {
            return <p><span className='text-rose-400'>{data.signer}</span> approved the document '<span>{data.agreement}</span>'</p>;
        }
        return 'Document Submitted';
    }
    if (data.action_type === 'viewed') {
        return <p><span className='text-rose-400'>{data.signer}</span> viewed the document '<span>{data.agreement}</span>'</p>;
    }
    if (data.action_type === 'decline') {
        return <p><span className='text-rose-400'>{data.signer}</span> declined the document '<span>{data.agreement}</span>'</p>;
    }
}

function timelineDate(date: string) {
    return DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_FULL);
}

type Props = {
    contractHelper: ContractHelper;
    contractId?: string;
    token?: string;
    height?: number;
}

const AuditTrail:React.FC<Props> = ({ contractHelper, contractId, token, height:h }) => {

    const [auditTrail, setAuditTrail] = React.useState<AuditTrailData[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(false);
    const [height] = React.useState(h ? h: 500); 

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
        {!loading && !error && <ScrollArea offsetScrollbars style={ auditTrail.length > 5 ? { height: height } : { maxHeight: height } }>    
            <Timeline active={auditTrail.length} bulletSize={24} lineWidth={2}>
                {auditTrail.map((item, index) => {
                    return (
                        <Timeline.Item 
                    color={timelineColorFromType(item.action_type)}
                    key={item.id} 
                    bullet={timelineIconFromType(item.action_type)} 
                    title={<p className='capitalize font-bold text-md mb-0'>{timelineTitleFromType(item.action_type, item.signer_type)}</p>}>
                        {timelineDescriptionFromType(item)}
                        <p className='text-xs'>{timelineDate(item.date)}</p>
                    </Timeline.Item>)
                })}
            </Timeline>
        </ScrollArea>}
        
        {!loading && error && <Center className='w-full h-36'>
            <p className='text-muted text-lg'>Audit Trail cannot be loaded at the moment. Try again later!</p>
        </Center>}
    </div>);
}

export default AuditTrail;