import { Grid, Group, List, Stack, Tooltip } from '@mantine/core';
import { DateTime } from 'luxon';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, CardBody, Button } from 'reactstrap';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { SignerElement } from '../../../../types/ContractTypes';

type Props = {
    title: string;
    sequence: boolean;
    signBefore: DateTime | null;
    endDate: DateTime | null;
    startDate: DateTime | null;
    signers: SignerElement[];
    contractHelper: ContractHelper;
    contractId: string | undefined;
    onCancel: () => void;
};

const PrepareSend: React.FC<Props> = ({
    title,
    sequence,
    signBefore,
    endDate,
    signers,
    contractHelper,
    contractId,
    onCancel,
    startDate,
}) => {
    const [signerStatus, setSignerStatus] = React.useState<{
        [id: number]: string;
    }>(() => {
        const result: { [id: number]: string } = {};
        signers.forEach((signer) => {
            result[signer.id] = '';
        });
        return result;
    });
    const [sendStatus, setSendStatus] = React.useState<'' | 'sending' | 'sent'>(
        '',
    );
    
    const navigate = useNavigate();

    const onSend = () => {
        if (contractHelper && contractId) {
            setSendStatus('sending');
            contractHelper
                .sendAgreement(contractId)
                .then((data) => {
                    setSendStatus('sent');
                    setSignerStatus(data.signer_status);
                })
                .catch((err) => {
                    toast.error('Error sending agreement');
                    console.log(err);
                    setSendStatus('');
                });
        }
    };

    return (
        <div>
            <Stack>
                <h5>Send <span className='text-rose-500 mb-4'>{title}</span> to</h5>
                {signers.map((signer) => (
                    <Card key={signer.uid}>
                        <CardBody>
                            <Grid columns={24}>
                                <Grid.Col span={20}>
                                    <Group>
                                        <p>
                                            {signer.type.charAt(0).toUpperCase()}
                                            {signer.type.substring(1)} {signer.step}
                                            {')'}
                                        </p>
                                        <p>{signer.name}</p>
                                        <p>{signer.email}</p>
                                        {signer.every_unit === '0' && (
                                            <p>No Reminder</p>
                                        )}
                                        {signer.every_unit !== '0' && (
                                            <p>
                                                Remind every {signer.every}{' '}
                                                {signer.every_unit}
                                            </p>
                                        )}
                                    </Group>
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <div className='flex justify-end w-full'>
                                    {signer.id in signerStatus &&
                                        signerStatus[signer.id].length > 0 && (
                                            <p>
                                                {signerStatus[signer.id] ===
                                                'sent' ? (
                                                    <Group spacing={8}>
                                                        <i className="simple-icon-check text-xl text-success"></i>
                                                        <span>Sent</span>
                                                    </Group>
                                                ) : (
                                                    <Tooltip label='Error sending email to signer. Please check the email.'>
                                                        <Group spacing={8}>
                                                            <i className='simple-icon-close text-xl text-danger'></i>
                                                            <span>Error</span>
                                                        </Group>
                                                    </Tooltip>
                                                )}
                                            </p>
                                    )}
                                    {!(signer.id in signerStatus) && (
                                        <p>
                                            <Group spacing={8}>
                                                <i className='simple-icon-close text-xl text-danger'></i>
                                                <span>Error</span>
                                            </Group>
                                        </p>
                                    )}

                                    </div>
                                </Grid.Col>
                            </Grid>
                        </CardBody>
                    </Card>
                ))}
                <List size="sm" spacing={'sm'} className="ml-2 mt-4" center>
                    {sequence && (
                        <List.Item
                            icon={
                                <i className="text-success simple-icon-check"></i>
                            }>
                            <p>Approval (where applicable) and signing will be completed in a sequence.</p>
                        </List.Item>
                    )}
                    
                    {signBefore !== null && <List.Item
                        icon={
                            <i className="text-primary simple-icon-calendar"></i>
                        }>
                        <p>
                            This document is required to be signed before{' '}
                            <span className='text-rose-500'>{signBefore.toLocaleString(DateTime.DATE_FULL)}</span>.
                        </p>
                        
                    </List.Item>}
                    
                    {startDate !== null &&<List.Item
                        icon={
                            <i className="text-primary simple-icon-calendar"></i>
                        }>
                        <p>
                            This document has a start date of{' '}
                            <span className='text-rose-500'>{startDate.toLocaleString(DateTime.DATE_FULL)}</span>.
                        </p>
                        
                    </List.Item>}
                    {endDate !== null &&<List.Item
                        icon={
                            <i className="text-primary simple-icon-calendar"></i>
                        }>
                        <p>
                            This document has an end date of{' '}
                            <span className='text-rose-500'>{endDate.toLocaleString(DateTime.DATE_FULL)}</span>.
                        </p>
                        
                    </List.Item>}
                
                    {Object.values(signerStatus).includes('error') && (
                        <List.Item icon={
                            <i className="simple-icon-close text-danger"></i>
                        }>
                            Looks like a problem with one or more signers. Continue to the next screen and send the email again.
                        </List.Item>
                    )}
                </List>
                <Group position="right">
                    {sendStatus === '' && <span onClick={onCancel}><Button color="light">Cancel</Button></span>}
                    {(sendStatus === '' || sendStatus === 'sending') && (
                        <span
                            onClick={onSend}
                        >
                            <Button
                                disabled={sendStatus === 'sending'}
                                color="success">
                                Send
                            </Button>
                        </span>
                    )}
                    {sendStatus === 'sent' && (
                        <span onClick={() => {
                            navigate(`/agreements/${contractId}`);
                        }}>
                            <Button color='primary'>Continue</Button>
                        </span>
                    )}
                </Group>
            </Stack>
        </div>
    );
};

export default PrepareSend;
