import { Center, Grid, Loader, Badge, Stack, Group, Popover, Checkbox, Tooltip } from '@mantine/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation, NavigateFunction } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Card, CardBody, Row } from 'reactstrap';
import {
    Colxx,
    Separator,
} from '../../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../../containers/navs/Breadcrumb';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { getAgreementBadgeColorFromStatus, getAgreementStatusText, getFormatDateFromIso } from '../../../../helpers/Utils';
import { AppDispatch } from '../../../../redux';
import { AgreementRowData } from '../../../../types/ContractTypes';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; 
import 'ag-grid-community/styles/ag-theme-material.css';
import { AgGridEvent, ColDef, ColGroupDef, GridOptions, ICellRendererParams, RowNode } from 'ag-grid-community';
import { DateTime } from 'luxon';
import { useHover, useLocalStorage } from '@mantine/hooks';
import classNames from 'classnames';
import { MdClose } from 'react-icons/md';

const AllColumns = [
    'ID',
    'Document Title',
    'Sent On',
    'Signers / Approvers',
    'Sender',
    'Status',
    'Actions'
]

const columnBuilder = (columns: boolean[], navigate: NavigateFunction):(ColDef | ColGroupDef)[] => {
    const columnDefs:(ColDef | ColGroupDef)[] = [];
    if (columns.length > 0 && columns[0]) {
        columnDefs.push({ headerName: 'ID', field: 'id', width: 180, onCellClicked: (e) => {
            navigate( `/agreements/${e.data.id}`);
        }, cellClass: 'dashboard-title-cell', colId: 'agreement-id-col' });
    }

    if (columns.length > 1 && columns[1]) {
        columnDefs.push({ headerName: 'Document title', field: 'title', width: 280, onCellClicked: (e) => {
            navigate( `/agreements/${e.data.id}`);
        }, cellClass: 'dashboard-title-cell' , colId: 'agreement-title-col' });
    }

    if (columns.length > 2 && columns[2]) {
        columnDefs.push(
            { headerName: 'Sent On', field: 'sent_on', cellRenderer: (params: ICellRendererParams) => {
                return getFormatDateFromIso(params.value);
            }}
        );
    }

    if (columns.length > 3 && columns[3]) {
        columnDefs.push({ headerName: 'Signers / Approver', field: 'signers', cellRenderer: (params: ICellRendererParams) => {
            return <div style={{ maxWidth: 220, marginTop: 12 }}><p>{params.value.join(', ')}</p></div>
        }, colId: 'agreement-signers-col' });
    }

    if (columns.length > 4 && columns[4]) {
        columnDefs.push({ headerName: 'Sender', field: 'user_name', colId: 'agreement-sender-col' });
    }

    if (columns.length > 5 && columns[5]) {
        columnDefs.push({ headerName: 'Status', field: 'status', cellRenderer: (params: ICellRendererParams) => {
            return <Badge variant='outline' color={getAgreementBadgeColorFromStatus(params.value)}>{getAgreementStatusText(params.value)} </Badge>
        }, colId: 'agreement-status-col' });
    }

    if (columns.length > 6 && columns[6]) {
        columnDefs.push({ headerName: 'Actions', width: 200, field: 'sent_on', cellRenderer: (params: ICellRendererParams) => {
            const dt = DateTime.fromISO(params.value);
            const today = DateTime.local();
            let diff = today.diff(dt, 'days');
            let lessThanADay = false;
            if (diff.days < 1) {
                lessThanADay = true;
                diff = today.diff(dt, 'hours');
            }
            return <Center>
                    <Group position='apart' style={{ marginTop: 12, width: 130 }} className='mt-[12px]'>
                        <Center style={{ width: 20 }}>
                            {params.data.signed_before && params.data.status === 'sent' && <Tooltip
                                label={'Complete Before: ' + getFormatDateFromIso(params.data.signed_before)}
                            >
                                <Center>
                                    <i className='iconsminds-stopwatch text-xl' />
                                </Center>
                            </Tooltip>}
                        </Center>
                        <Center>{params.data.status === 'sent' && <div className={classNames('flex relative font-bold flex-col rounded-full justify-center items-center', { 
                            'text-success': lessThanADay || diff.days <= 7,
                            'text-warning': diff.days > 7 && diff.days <= 30,
                            'text-danger': diff.days > 30
                        })}>
                            <p className='m-0 text-sm'>{ lessThanADay ? diff.hours.toFixed(0) : diff.days.toFixed(0) }</p>
                            <p className='m-0 text-sm'>{ lessThanADay ? 'Hours' : 'Days' }</p>
                        </div>}</Center>
                        <Center><i className={classNames('text-xl cursor-pointer', 'iconsminds-arrow-inside')} /></Center>
                    </Group>
                </Center>
        
        }, colId: 'agreement-days-ago-col' });
    }

    return columnDefs;
} 

var tileFilter = 0;

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

    const [showColumnSettings, setShowColumnSettings] = React.useState(false);

    const { hovered: tile1Hovered, ref: tile1Ref } = useHover();
    const { hovered: tile2Hovered, ref: tile2Ref } = useHover();
    const { hovered: tile3Hovered, ref: tile3Ref } = useHover();


    const gridRef = React.useRef<AgGridReact>(null);

    const [showColumns, setShowColumns] = useLocalStorage<boolean[]>({key: 'agreement-table-columns', defaultValue: Array(7).fill(true)});
    
    const [columnDefs, setColumnDef] = React.useState<(ColDef | ColGroupDef)[]>(columnBuilder(showColumns, navigate));

    const gridOptions = React.useMemo<GridOptions>(() => {
        return {
            domLayout: 'autoHeight',  
        }
    }, []);

    const onGridReady = (e:AgGridEvent<AgreementRowData>) => {
        e.api.sizeColumnsToFit();
    }

    const [renderTileFilter, setRenderTileFilter] = React.useState(tileFilter);

    const doesExternalFilterPass = (node: RowNode<AgreementRowData>): boolean => {
        if (!node.data) return true;
        if (tileFilter === 0) {
            return true;
        }
        if (tileFilter === 1) {
            return node.data.status === 'draft';
        }
        if (tileFilter === 2) {
            return node.data.status === 'complete';
        }
        if (tileFilter === 3) {
            return node.data.status === 'sent';
        }
        return true;
    };


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
                    <div className='flex flex-wrap items-center md:justify-around md:px-10'>
                        <Center className='m-3'>
                            <Card>
                                <CardBody className='p-4'>
                                    <Center ref={tile1Ref} onClick={() => {
                                        tileFilter = 1;
                                        setRenderTileFilter(tileFilter);
                                        gridRef.current!.api.onFilterChanged();
                                    }} className='cursor-pointer' style={{ minWidth: 200 }}>
                                        <Stack className='w-full'>
                                            <p className='font-bold'>Drafts</p>
                                            <Group position='apart'>
                                                <div className={classNames('text-primary transition-all text-5xl', { 'scale-125': tile1Hovered })}>
                                                    {agreements.filter(a => a.status === 'draft').length}
                                                </div>
                                                <span><i className={classNames('iconsminds-folder-edit text-4xl text-primary transition-all', { 'text-5xl': tile1Hovered })} /></span>
                                            </Group>
                                        </Stack>
                                    </Center>
                                </CardBody>
                            </Card>
                        </Center>

                        <Center className='m-3'>
                            <Card>
                                <CardBody className='p-4'>
                                    <Center className='cursor-pointer' onClick={() => {
                                        tileFilter = 2;
                                        setRenderTileFilter(tileFilter);
                                        gridRef.current!.api.onFilterChanged();
                                    }} ref={tile2Ref} style={{ minWidth: 200 }}>
                                        <Stack className='w-full'>
                                            <p className='font-bold'>Completed in last 30 days</p>
                                            <Group position='apart'>
                                                <div className={classNames('text-primary transition-all text-5xl', { 'scale-125': tile2Hovered })}>
                                                    {agreements.filter(a => a.status === 'complete').length}
                                                </div>
                                                <span><i className={classNames('iconsminds-box-with-folders text-4xl text-primary transition-all', { 'text-5xl': tile2Hovered })} /></span>
                                            </Group>
                                        </Stack>
                                    </Center>
                                </CardBody>
                            </Card>
                        </Center>
                        
                        <Center className='m-3'>
                            <Card>
                                <CardBody className='py-4'>
                                    <Center className='cursor-pointer' onClick={() => {
                                        tileFilter = 3;
                                        setRenderTileFilter(tileFilter);
                                        gridRef.current!.api.onFilterChanged();
                                    }} ref={tile3Ref} style={{ minWidth: 200 }}>
                                        <Stack className='w-full'>
                                            <p className='font-bold'>In Progress</p>
                                            <Group position='apart'>
                                                <div className={classNames('text-primary transition-all text-5xl', { 'scale-125': tile3Hovered })}>
                                                    {agreements.filter(a => a.status === 'sent').length}
                                                </div>
                                                <span><i className={classNames('iconsminds-bird-delivering-letter text-4xl text-primary transition-all', { 'text-5xl': tile3Hovered })} /></span>
                                            </Group>
                                        </Stack>
                                    </Center>
                                </CardBody>
                            </Card>
                        </Center>
                        
                    </div>
                </Grid.Col>
            </Grid>            
            
            <Card className='mt-4'>
                <CardBody>
                    {loading && <Center className='w-full h-40'>
                        <Loader size='lg' />
                    </Center>}
                
                    {!loading && error && <p className='text-2xl text-muted text-center'>
                        Cannot fetch data right now. Please try again later.    
                    </p>}
                    {!loading && !error && <div>
                        <Group position='apart' className='mb-4'>
                            <Center>
                                <p className='text-2xl'>Contracts & Agreements</p>
                            </Center>
                            {renderTileFilter !== 0 && <div className='text-xl py-1 px-3 border-2 border-gray-300 rounded-full'>
                                <Group position='apart'>
                                    {renderTileFilter === 1 && <span className='text-primary'>Drafts</span>}
                                    {renderTileFilter === 2 && <span className='text-primary'>Completed</span>}
                                    {renderTileFilter === 3 && <span className='text-primary'>In Progress</span>}
                                    <MdClose onClick={() => {
                                        tileFilter = 0;
                                        setRenderTileFilter(tileFilter);
                                        gridRef.current!.api.onFilterChanged();
                                    }} className='cursor-pointer' />
                                </Group>
                            </div>}
                            <Group spacing={'lg'}>
                                <Popover
                                    position='bottom'
                                    placement='center'
                                    opened={showColumnSettings}
                                    onClose={() => setShowColumnSettings(false)}
                                    withArrow
                                    withCloseButton
                                    target={<Group onClick={() => setShowColumnSettings(true)} className='cursor-pointer hover:text-blue-500 hover:scale-110 transition-all' spacing={4}>
                                    <i className='simple-icon-settings'></i>
                                    <span>Select Columns</span>
                                </Group>}

                                >
                                    <p className='font-bold mb-4'>Select Columns</p>
                                    <Stack>
                                        {AllColumns.map((col, index) => (
                                            <Checkbox key={index} size='sm' checked={showColumns[index]} disabled={index === 6} onChange={index  === 6 ? undefined : (event) => setShowColumns(prev => {
                                                const newCols = [...prev];
                                                newCols[index] = event.currentTarget.checked;
                                                setColumnDef(columnBuilder(newCols, navigate));                                                
                                                gridRef.current!.api.redrawRows();
                                                return newCols;
                                            })} label={col} />
                                        ))}
                                    </Stack>
                                </Popover>
                                
                                
                                <Group className='cursor-pointer hover:text-blue-500 hover:scale-110 transition-all' spacing={4}>
                                    <i className='simple-icon-share-alt'></i>
                                    <span>Export</span>
                                </Group>

                            </Group>
                        </Group>
                        <div className='ag-theme-material w-full h-full'>
                            <AgGridReact
                                animateRows={true}
                                columnDefs={columnDefs}
                                rowHeight={70}
                                onGridReady={onGridReady}
                                ref={gridRef}
                                rowData={agreements}
                                isExternalFilterPresent={() => true}
                                doesExternalFilterPass={doesExternalFilterPass}
                                defaultColDef={defaultColDef}
                                gridOptions={gridOptions}
                                overlayNoRowsTemplate={'Currently you do not have any documents. Please click on \'Create New\' button to proceed.'}
                            />
                        </div>
                    </div>}
                </CardBody>
            </Card>
        </>
    );
};

export default AgreementDashboard;
