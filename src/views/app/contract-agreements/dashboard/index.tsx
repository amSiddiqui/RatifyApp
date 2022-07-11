import { Center, Grid, Loader, Badge } from '@mantine/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; 
import 'ag-grid-community/styles/ag-theme-material.css';
import { AgGridEvent, ColDef, ColGroupDef, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { DateTime } from 'luxon';

const getBadgeColorFromStatus = (status: string) => {
    switch(status) {
        case 'sent':
            return 'blue';
        case 'error':
            return 'red';
        case 'completed':
            return 'green';
        case 'withdraw':
            return 'orange';
        case 'decline':
            return 'red';
        default:
            return 'gray';
    }
}

const getStatusText = (status: string) => {
    switch (status) {
        case  'complete':
            return 'Completed';
        case 'sent':
            return 'In Progress';
        case 'error':
            return 'Error';
        case 'withdraw':
            return 'Withdrawn';
        case 'delete':
            return 'Deleted';
        case 'decline':
            return 'Declined';
        default:
            return 'draft';
    }
}

const AgreementDashboard: React.FC = () => {

    const match = useLocation();
    const navigate = useNavigate();

    const [agreements, setAgreements] = React.useState<AgreementRowData[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(false);
    
    const dispatchFn = useDispatch<AppDispatch>();
    const contractHelper = React.useMemo(
        () => new ContractHelper(dispatchFn),
        [dispatchFn],
    );

    const gridRef = React.useRef<AgGridReact>(null);
    
    const [columnDefs] = React.useState<(ColDef | ColGroupDef)[]>([
        { headerName: 'Agreement ID', field: 'id', width: 170, onCellClicked: (e) => {
            navigate( `/agreements/${e.data.id}`);
        }, cellClass: 'dashboard-title-cell' },
        { headerName: 'Agreement title', field: 'title', onCellClicked: (e) => {
            navigate( `/agreements/${e.data.id}`);
        }, cellClass: 'dashboard-title-cell' },
        { headerName: 'Sent On', field: 'sent_on', cellRenderer: (params: ICellRendererParams) => {
            return getFormatDateFromIso(params.value);
        }},
        { headerName: 'Signers / Approver', field: 'signers', cellRenderer: (params: ICellRendererParams) => {
            return <div className='w-full h-full flex items-center' style={{ maxWidth: 220 }}><p>{params.value.join(', ')}</p></div>
        }},
        { headerName: 'Sender', field: 'user_name' },
        { headerName: 'Status', field: 'status', cellRenderer: (params: ICellRendererParams) => {
            return <Badge color={getBadgeColorFromStatus(params.value)}>{getStatusText(params.value)} </Badge>
        }},
        { headerName: '', field: 'sent_on', cellRenderer: (params: ICellRendererParams) => {
            // 
            const dt = DateTime.fromISO(params.value);
            const today = DateTime.local();
            let diff = today.diff(dt, 'days');
            let lessThanADay = false;
            if (diff.days < 1) {
                lessThanADay = true;
                diff = today.diff(dt, 'hours');
            }
            if (params.data.status !== 'sent') {
                return '';
            } else {
                return <Center className='h-full'><div className='mt-[2px] flex flex-col justify-center items-center'>
                    <p className='m-0'>{lessThanADay ? diff.hours.toFixed(0) : diff.days.toFixed(0)}</p>
                    <p className='m-0'>{lessThanADay ? 'Hours' : 'Days'}</p>
                </div></Center>;
            }
        }}
    ]);

    const gridOptions = React.useMemo<GridOptions>(() => {
        return {
            suppressRowClickSelection: true,
            domLayout: 'autoHeight',  
        }
    }, []);

    const onGridReady = (e:AgGridEvent<AgreementRowData>) => {
        e.api.sizeColumnsToFit();
    }

    const defaultColDef = React.useMemo(() => ({
        sortable: true,
        filter: true,
        floatingFilter: true,
        resizable: true,
    }), []);

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
                            
                        </CardBody>
                    </Card>
                </Grid.Col>
                <Grid.Col span={10}>
                    {loading && <Center className='w-1/2 h-80'>
                        <Loader size='lg' />
                    </Center>}
                    {!loading && error && <p className='text-2xl text-muted text-center'>
                        Cannot fetch data right now. Please try again later.    
                    </p>}
                    {!loading && !error && agreements.length === 0 && <p className='text-2xl text-center text-muted'>
                        No agreements found. Please click on create new button to create a new agreement.
                    </p>}
                    {!loading && !error && agreements.length > 0 && <div>
                        <Card>
                            <CardBody>
                                <h5 className='mb-4'>Contracts & Agreements</h5>
                                <div className='ag-theme-material w-full'>
                                    <AgGridReact
                                        rowHeight={50}
                                        columnDefs={columnDefs}
                                        onGridReady={onGridReady}
                                        ref={gridRef}
                                        rowData={agreements}
                                        defaultColDef={defaultColDef}
                                        gridOptions={gridOptions}
                                    />
                                </div>
                            </CardBody>
                        </Card>
                    </div>}
                </Grid.Col>
            </Grid>
        </>
    );
};

export default AgreementDashboard;
