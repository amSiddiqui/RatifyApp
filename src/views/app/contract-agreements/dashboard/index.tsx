import { Center, Checkbox, Grid, Loader, Stack, Table, Badge } from '@mantine/core';
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
import { AgreementRowData } from '../../../../types/ContractTypes';

const getBadgeColorFromStatus = (status: string) => {
    switch(status) {
        case 'in progress':
            return 'blue';
        case 'error':
            return 'red';
        case 'completed':
            return 'green';
        default:
            return 'gray';
    }
}

const columns = ['Agreement ID',
'Agreement title',
'Sent on',
'Sent to',
'Sender',
'Status']

const AgreementDashboard: React.FC = () => {

    const match = useLocation();
    const navigate = useNavigate();

    const [agreements, setAgreements] = React.useState<AgreementRowData[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(false);
    const [showColumns, setShowColumns] = React.useState<boolean[]>(new Array(columns.length).fill(true));
    
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
                        <span onClick={() => navigate(`agreements`)}>
                            <Button className='w-32 agreement-button' color="primary">
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
                            <h5 className='mb-4'>Select Columns</h5>
                            <Stack spacing={'lg'}>
                                {columns.map((column, index) => (
                                    <Checkbox checked={showColumns[index]} onChange={(ckd) => {
                                        const newShowColumns = [...showColumns];
                                        newShowColumns[index] = ckd.currentTarget.checked;
                                        setShowColumns(newShowColumns);
                                    }} key={index} label={column} />
                                ))}
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
                    {!loading && !error && agreements.length === 0 && <p className='text-2xl text-muted'>
                        No agreements found. Please click on create new button to create a new agreement.
                    </p>}
                    {!loading && !error && agreements.length > 0 && <div>

                        <Card>
                            <CardBody>
                                <h5 className='mb-4'>Contracts & Agreements</h5>
                                <Table verticalSpacing={'lg'}>
                                    <thead>
                                        <tr>
                                            {showColumns[0] && <th>ID</th>}
                                            {showColumns[1] && <th>Title</th>}
                                            {showColumns[2] && <th>Sent On</th>}
                                            {showColumns[3] && <th>Signer / Approver</th>}
                                            {showColumns[4] && <th>Sender</th>}
                                            {showColumns[5] && <th>Status</th>}
                                            {showColumns[5] && <th></th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {agreements.map(agreement => (
                                            <tr key={agreement.id}>
                                                {showColumns[0] && <th scope='row'>{agreement.id}</th>}
                                                {showColumns[1] && <td>
                                                    <Link to={agreement.sent ? `/agreements/${agreement.id}` : `/agreements/add-signers/${agreement.id}`}>
                                                        {agreement.title}    
                                                    </Link>
                                                </td>}
                                                {showColumns[2] && <td>{getFormatDateFromIso(agreement.sent_on)}</td>}
                                                {showColumns[3] && <td className='w-44'>
                                                    <p className='w-full'>{agreement.signers.join(', ')}</p>
                                                </td>}
                                                {showColumns[4] && <td>{agreement.user_name}</td>}
                                                {showColumns[5] && <td>
                                                    <Badge color={
                                                        getBadgeColorFromStatus(agreement.status)
                                                    }>
                                                        {agreement.status}
                                                    </Badge>
                                                </td>}
                                                {showColumns[5] && <td>
                                                    <MdOpenInNew className='text-lg cursor-pointer' onClick={() => navigate(agreement.sent ? `/agreements/${agreement.id}` : `/agreements/add-signers/${agreement.id}`)} />
                                                </td>}
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
