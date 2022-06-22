import { Center, Collapse, Group, Loader, Modal, Progress, Stack, TextInput, Tooltip } from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import { getFormatDateFromIso } from '../../../../helpers/Utils';
import { Signer } from '../../../../types/ContractTypes';
import { getBgColorLight } from '../types';
import { Button } from 'reactstrap';
import { useDisclosure } from '@mantine/hooks';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { toast } from 'react-toastify';

type Props = {
    signer: Signer;
    contractHelper: ContractHelper;
    onDocumentSent: (id: number) => void;
    signerProgress: {total: number, completed: number} | null;
};

const getSignerStatus = (status: string, completed: boolean, type: string) => {
    if (status === 'error') {
        return 'Error Sending';
    }
    if (status === 'completed') {
        return 'Completed';
    }   
    if (status === 'sent' && !completed) {
        return 'In Progress';
    }
    if (status === 'sent' && completed) {
        return 'Not submitted';
    }

}

const SignerProgress: React.FC<Props> = ({ signer, contractHelper, onDocumentSent, signerProgress }) => {
    const [sendAgainModal, sendAgainHandlers] = useDisclosure(false);
    const [sending, setSending] = React.useState(false);

    const sendAgainSchema = Yup.object().shape({
        name: Yup.string().required('Please provide the name of the recipient'),
        email: Yup.string().email('Please enter a correct email address.').required('Please provide the email of the recipient'),
    });

    const [collapsed, setCollapsed] = React.useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(sendAgainSchema),
        defaultValues: {
            name: signer.name,
            email: signer.email,
        }
    });

    const onSendAgain = (data: {name: string, email: string}) => {
        setSending(true);
        contractHelper.sendDocumentAgain(signer.id, data.name, data.email).then(() => {
            setSending(false);
            sendAgainHandlers.close();
            onDocumentSent(signer.id);
            toast.success('Document send successfully!');
        }).catch(err => {
            toast.error('Cannot send the document. Please contact support');
        });
    }

    return (
        <>
            <Tooltip
                placement="start"
                color={signer.color}
                opened={true}
                withArrow
                zIndex={4}
                position="left"
                label={
                    signer.type.charAt(0).toUpperCase() +
                    signer.type.substring(1) +
                    ' ' +
                    signer.step
                }>
                <div
                    style={{ width: 145 }}
                    className={classNames(
                        'px-3 py-3',
                        getBgColorLight(signer.color),
                    )}>
                        {!collapsed && (
                            <Stack spacing={'md'}>
                                <div className='text-center text-lg'>
                                    <span>{signer.name}</span>
                                    {signer.status === 'completed' && <Tooltip label='Email sent'><i className='simple-icon-check text-success ml-1 relative' style={{top: 1}} /></Tooltip>}
                                    {signer.status === 'error' && <Tooltip label='Cannot send email.n'><i className='simple-icon-exclamation text-danger ml-1 relative' style={{top: 1}} /></Tooltip>}
                                </div>
                                <Center className='cursor-pointer' onClick={() => setCollapsed(true)}>
                                    <i className='simple-icon-arrow-down' />
                                </Center>
                            </Stack>
                        )}
                        <Collapse in={collapsed}>
                            <Stack spacing='md'>
                                <div className='text-center text-lg'>
                                    <span>{signer.name}</span>
                                    {signer.status === 'completed' && <Tooltip label='Email sent'><i className='simple-icon-check text-success ml-1 relative' style={{top: 1}} /></Tooltip>}
                                    {signer.status === 'error' && <Tooltip label='Cannot send email.n'><i className='simple-icon-exclamation text-danger ml-1 relative' style={{top: 1}} /></Tooltip>}
                                </div>
                                {signer.status === 'error' && <p className='text-danger text-xs'>
                                    Cannot send the email. Please check the email address and try to send the document again.
                                </p>}
                                <div>
                                    <Group position='apart'>
                                        <p className='text-muted'>Email</p>
                                        {signer.status === 'error' && <p className='text-primary underline'>Edit</p>}
                                    </Group>
                                    <p>{signer.email}</p>
                                </div>
                                {signer.last_seen && <div>
                                    <p className='text-muted'>Last seen</p>
                                    <p>{getFormatDateFromIso(signer.last_seen)}</p>
                                </div>}
                                <div>
                                    <p className='text-muted'>Status</p>
                                    <p>{getSignerStatus(signer.status, !!signerProgress && signerProgress.total === signerProgress.completed, signer.type)}</p>
                                </div>
                                {signerProgress && <div className='w-full'>
                                    <Progress className='w-full h-2' value={signerProgress.total === 0 ? 100 : signerProgress.completed * 100 / signerProgress.total} />
                                    <Group position='apart' className='text-gray-600'>
                                        <p className='text-xs'>Completed</p>
                                        <p className='text-xs'> {signerProgress.completed}/{signerProgress.total} </p>
                                    </Group>
                                </div>}
                                {signer.every_unit === '0' && (
                                    <p>No Reminder</p>
                                )}
                                {signer.every_unit !== '0' && (
                                    <div>
                                        <p className='text-muted'>Remind every</p>
                                        <p>{signer.every} {signer.every_unit}</p>
                                    </div>
                                )}
                                <div>
                                    <p className='text-muted'>Last Reminder</p>
                                    <p>not sent</p>
                                </div>
                                {signer.status === 'sent' &&<span><Button size='xs' color='primary'>
                                    Send Reminder    
                                </Button></span>}
                                {signer.status === 'error' && <span onClick={() => {
                                    sendAgainHandlers.open();
                                }}>
                                    <Button disabled={sending}>Send Again</Button>    
                                </span>}
                                <Center className='cursor-pointer' onClick={() => setCollapsed(false)}>
                                    <i className='simple-icon-arrow-up' />
                                </Center>
                            </Stack>
                        </Collapse>
                    </div>
            </Tooltip>
            <Modal centered title='Send the document again' opened={sendAgainModal} onClose={sendAgainHandlers.close}>
                <form onSubmit={handleSubmit(onSendAgain)}>
                    <Stack>
                        <TextInput {...register('name')} error={errors.name ? errors.name.message : ''} required label='Name' placeholder='Name' defaultValue={signer.name} />
                        <TextInput {...register('email')} error={errors.email ? errors.email.message : ''} required label='Email' placeholder='Email' defaultValue={signer.email} />
                        <Group position='right'>
                            <span><Button type='button' onClick={sendAgainHandlers.close} color='light'>Cancel</Button></span>
                            <span><Button disabled={sending} color='success'>{sending ? <Loader variant='bars' size='xs' color='white' /> : 'Send'}</Button></span>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </>
    );
};

export default SignerProgress;
