import { Group, List, Stack, Tooltip } from '@mantine/core';
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
                <h5>Send {title} to</h5>
                {signers.map((signer) => (
                    <Card key={signer.uid}>
                        <CardBody>
                            <Group position='apart'>
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
                                {signer.id in signerStatus &&
                                    signerStatus[signer.id].length > 0 && (
                                        <p>
                                            {signerStatus[signer.id] ===
                                            'sent' ? (
                                                <Group>
                                                    <i className="simple-icon-check text-xl text-success"></i>
                                                    <span>Sent</span>
                                                </Group>
                                            ) : (
                                                <Tooltip label='Error sending email to signer. Please check the email.'>
                                                    <Group>
                                                        <i className='simple-icon-close text-xl text-danger'></i>
                                                        <span>Error</span>
                                                    </Group>
                                                </Tooltip>
                                            )}
                                        </p>
                                )}
                                {!(signer.id in signerStatus) && (
                                    <p>
                                        <Group>
                                            <i className='simple-icon-close text-xl text-danger'></i>
                                            <span>Error</span>
                                        </Group>
                                    </p>
                                )}
                            </Group>
                        </CardBody>
                    </Card>
                ))}
                <List size="sm" spacing={'sm'} className="ml-2" center>
                    {sequence && (
                        <List.Item
                            icon={
                                <i className="text-success simple-icon-check"></i>
                            }>
                            <p>Signer Must Sign in sequence</p>
                        </List.Item>
                    )}
                    
                    <List.Item
                        icon={
                            <i className="text-primary simple-icon-calendar"></i>
                        }>
                        {signBefore !== null && <p>
                            Document must be signed before:{' '}
                            {signBefore.toLocaleString(DateTime.DATE_FULL)}
                        </p>}
                        {signBefore === null && <p>
                            Document does not have a sign before date.
                        </p>}
                    </List.Item>
                    
                    <List.Item
                        icon={
                            <i className="text-primary simple-icon-calendar"></i>
                        }>
                        {endDate!== null && <p>
                            Document end date:{' '}
                            {endDate.toLocaleString(DateTime.DATE_FULL)}
                        </p>}
                        {endDate === null && <p>
                            Document does not have an end date.
                        </p>}
                    </List.Item>
                
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
