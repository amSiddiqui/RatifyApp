import { Center, Checkbox, Grid, Loader, Stack, Table } from '@mantine/core';
import React from 'react';
import { MdOpenInNew } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Card, CardBody, Row } from 'reactstrap';
import {
    Colxx,
    Separator,
} from '../../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../../containers/navs/Breadcrumb';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { getFormatDateFromIso } from '../../../../helpers/Utils';
import { AppDispatch } from '../../../../redux';
import { Agreement } from '../../../../types/ContractTypes';

const AgreementDashboard: React.FC = () => {

    const match = useLocation();
    const navigate = useNavigate();

    const [agreements, setAgreements] = React.useState<Agreement[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(false);
    
    const dispatchFn = useDispatch<AppDispatch>();
    const contractHelper = React.useMemo(
        () => new ContractHelper(dispatchFn),
        [dispatchFn],
    );

    React.useEffect(() => {
        contractHelper.getAllAgreements().then(data => {
            setAgreements(data);
            setLoading(false);
        }).catch(err => {
            console.log(err);
            toast.error('Error fetching agreements. Try again later');
            setLoading(false);
            setError(true);
        });
    }, [contractHelper]);


    return (
        <>
            <Row>
                <Colxx xxs="12">
                    <Breadcrumb
                        heading="contract-agreement.agreement-dashboard"
                        match={match}
                    />
                    <Separator className="mb-14" />
                </Colxx>
            </Row>
            
            <Grid columns={12}>
                <Grid.Col span={2}>
                    <Center className='h-full m-3'>
                        <span>
                            <Button className='w-32' color="primary">
                                Create New
                            </Button>
                        </span>
                    </Center>
                </Grid.Col>
                <Grid.Col span={10}>
                    <div className='flex flex-wrap items-center md:justify-between md:px-10 lg:justify-center'>
                        <Center className='m-3'>
                            <Card>
                                <CardBody>
                                    <Center
                                        className='w-24 lg:w-56'
                                        style={{
                                            height: '64px',
                                        }}><p></p></Center>
                                </CardBody>
                            </Card>
                        </Center>
                        <Center className='m-3'>
                            <Card>
                                <CardBody>
                                    <Center
                                        className='w-24 lg:w-56'
                                        style={{
                                            height: '64px',
                                        }}><p></p></Center>
                                </CardBody>
                            </Card>
                        </Center>
                        
                        <Center className='m-3'>
                            <Card>
                                <CardBody>
                                    <Center
                                        className='w-24 lg:w-56'
                                        style={{
                                            height: '64px',
                                        }}><p></p></Center>
                                </CardBody>
                            </Card>
                        </Center>
                    </div>
                </Grid.Col>
            </Grid>
            
            <Grid columns={12} className='mt-10'>
                <Grid.Col span={2}>
                    <Card className=''>
                        <CardBody>
                            <Stack spacing={'lg'}>
                                <Checkbox label='Agreement ID' />
                                <Checkbox label='Agreement title' />
                                <Checkbox label='Sent on' />
                                <Checkbox label='Sent to' />
                                <Checkbox label='Sender' />
                                <Checkbox label='Status' />
                            </Stack>
                        </CardBody>
                    </Card>
                </Grid.Col>
                <Grid.Col span={10}>
                    {loading && <Center className='w-1/2 h-80'>
                        <Loader size='lg' />
                    </Center>}
                    {!loading && error && <p className='text-2xl text-muted'>
                        Cannot fetch data right now. Please try again later.    
                    </p>}
                    {!loading && !error && <div>

                        <Card>
                            <CardBody>
                                <Table verticalSpacing={'lg'}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Title</th>
                                            <th>Sent On</th>
                                            <th>Signer / Approver</th>
                                            <th>Sender</th>
                                            <th>Status</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {agreements.map(agreement => (
                                            <tr key={agreement.id}>
                                                <th scope='row'>{agreement.id}</th>
                                                <td>
                                                    <Link to={agreement.sent ? `/agreements/${agreement.id}` : `/agreements/add-signers/${agreement.id}`}>
                                                        {agreement.title}    
                                                    </Link>
                                                </td>
                                                <td>{getFormatDateFromIso(agreement.sent_on)}</td>
                                                <td>Signer</td>
                                                <td>Sender</td>
                                                <td>{agreement.sent ? 'Sent' : 'Draft'}</td>
                                                <td>
                                                    <MdOpenInNew className='text-lg cursor-pointer' onClick={() => navigate(agreement.sent ? `/agreements/${agreement.id}` : `/agreements/add-signers/${agreement.id}`)} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </div>}
                </Grid.Col>
            </Grid>
        </>
    );
};

export default AgreementDashboard;
