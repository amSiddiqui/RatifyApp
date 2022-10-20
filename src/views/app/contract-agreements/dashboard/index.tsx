import { Center, Grid, Loader, Badge, Stack, Group, Popover, Checkbox, Tooltip, Modal, List, TextInput, SimpleGrid, Select } from '@mantine/core';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, NavigateFunction } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Card, CardBody, Pagination, PaginationItem, PaginationLink, Row } from 'reactstrap';
import {
    Colxx,
    Separator,
} from '../../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../../containers/navs/Breadcrumb';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { getAgreementBadgeColorFromStatus, getAgreementStatusText, getFormatDateFromIso, getPaginationArray } from '../../../../helpers/Utils';
import { AppDispatch, RootState } from '../../../../redux';
import { AgreementRowData, Signer } from '../../../../types/ContractTypes';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; 
import 'ag-grid-community/styles/ag-theme-material.css';
import { AgGridEvent, ColDef, ColGroupDef, GridOptions, ICellRendererParams, RowNode } from 'ag-grid-community';
import { DateTime } from 'luxon';
import { useHover, useLocalStorage, useResizeObserver } from '@mantine/hooks';
import classNames from 'classnames';
import { MdClose } from 'react-icons/md';
import AuditTrail from '../audit-trail';
import { getSignerStatusAndIcon } from '../sender-view/signer-progress';
import AgreementProgressBar from '../sender-view/agreement-progress-bar';
import { AuthHelper } from '../../../../helpers/AuthHelper';
import { OrganizationNameResponse } from '../../../../types/AuthTypes';
import VerifyEmailMessage from '../agreement-upload/verify-email-message';

const AllColumns = [
    'ID',
    'Document Title',
    'Sent On',
    'Signers / Approvers',
    'Sender',
    'Status',
    'Actions'
]

const columnBuilder = (columns: boolean[], navigate: NavigateFunction, onMoreDetailsClicked: (id: number) => void):(ColDef | ColGroupDef)[] => {
    const columnDefs:(ColDef | ColGroupDef)[] = [];
    if (columns.length > 0 && columns[0]) {
        columnDefs.push({ headerName: 'ID', field: 'index', width: 120, onCellClicked: (e) => {
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
            { headerName: 'Sent On', field: 'sent_on', width: 200, cellRenderer: (params: ICellRendererParams) => {
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
        columnDefs.push({ headerName: 'Actions', width: 200, field: 'sent_on', filter: false, cellRenderer: (params: ICellRendererParams) => {
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
                            <Group spacing={8}>
                                {params.data.signed_before && params.data.status === 'sent' && <Tooltip
                                    label={'Complete Before: ' + getFormatDateFromIso(params.data.signed_before)}
                                >
                                    <Center>
                                        <i className='simple-icon-hourglass text-xl' />
                                    </Center>
                                </Tooltip>}
                                {params.data.end_date && params.data.status === 'sent' && <Tooltip
                                    label={'End Date: ' + getFormatDateFromIso(params.data.end_date)}
                                >
                                    <Center>
                                        <i className='iconsminds-stopwatch text-xl' />
                                    </Center>
                                </Tooltip>}
                            </Group>
                        </Center>
                        <Center>{params.data.status === 'sent' && <div className={classNames('flex relative font-bold flex-col rounded-full justify-center items-center', { 
                            'text-success': lessThanADay || diff.days <= 7,
                            'text-warning': diff.days > 7 && diff.days <= 30,
                            'text-danger': diff.days > 30
                        })}>
                            <p className='m-0 text-sm'>{ lessThanADay ? diff.hours.toFixed(0) : diff.days.toFixed(0) }</p>
                            <p className='m-0 text-sm'>{ lessThanADay ? 'Hours' : 'Days' }</p>
                        </div>}</Center>
                        {params.data.status !== 'draft' && <Center><Tooltip label='Details'><i onClick={() => onMoreDetailsClicked(params.data.id)} className={classNames('text-xl cursor-pointer', 'iconsminds-arrow-inside')} /></Tooltip></Center>}
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

    const authHelper = React.useMemo(
        () => new AuthHelper(dispatchFn),
        [dispatchFn],
    );

    const [showEnterDetails, setShowEnterDetails] = React.useState(false);

    const auth = useSelector((root: RootState) => root.auth);
    const [{firstName, lastName}, setUserName] = React.useState<{firstName: string, lastName: string}>({firstName: '', lastName: ''});
    const [showNameErrors, setShowNameErrors] = React.useState(false);

    const [showColumnSettings, setShowColumnSettings] = React.useState(false);
    const [moreDetailModal, setMoreDetailModal] = React.useState(false);
    const [moreDetailsAgreement, setMoreDetailsAgreement] = React.useState<AgreementRowData>();
    const [pageSize, setPageSize] = useLocalStorage<number>({key: 'agreement-dashboard-page-size', defaultValue: 10});
    const [page, setPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [organization, setOrganization] = React.useState<OrganizationNameResponse>();
    const [showUnverifiedModal, setShowUnverifiedModal] = React.useState(false);

    const { hovered: tile1Hovered, ref: tile1Ref } = useHover();
    const { hovered: tile2Hovered, ref: tile2Ref } = useHover();
    const { hovered: tile3Hovered, ref: tile3Ref } = useHover();

    const onShowDetailClick = React.useCallback((id: number) => {
        const ag = agreements.find(a => a.id === id);
        setMoreDetailsAgreement(ag);
        if (ag) {
            contractHelper.getSigners(ag.id.toString()).then(data => {
                setSigners(data.signers);
            }).catch(err => {
                toast.error('Error fetching document data. Please try again later.');
                setSigners([]);
            });
        }
        setMoreDetailModal(true);
    }, [agreements, contractHelper]);


    const gridRef = React.useRef<AgGridReact>(null);

    const [showColumns, setShowColumns] = useLocalStorage<boolean[]>({key: 'agreement-table-columns', defaultValue: Array(7).fill(true)});
    
    const [columnDefs, setColumnDef] = React.useState<(ColDef | ColGroupDef)[]>([]);

    const [signers, setSigners] = React.useState<Signer[]>([]);

    const [cardRef, rect] = useResizeObserver();

    const gridOptions = React.useMemo<GridOptions>(() => {
        return {
            domLayout: 'autoHeight', 
            suppressCellFocus: true 
        }
    }, []);

    const onGridReady = (e:AgGridEvent<AgreementRowData>) => {
        e.api.sizeColumnsToFit();
        e.api.paginationSetPageSize(pageSize);
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

    const onCreateNewClick = React.useCallback(() => {
        if (!organization || !auth.user) {
            toast.error('Something went wrong! Please try again later.');
            return;
        }
        if (!auth.user.verified || organization.stepsCompleted < 3) {
            setShowUnverifiedModal(true);
            return;
        }
        navigate('/agreements');
    }, [navigate, auth, organization]);

    const onSubmitProfileSettings = () => {
        setShowNameErrors(false);
        if (firstName && typeof(firstName) === 'string' && firstName.trim().length === 0) {
            setShowNameErrors(true);
            return;
        }
        authHelper.updateUserName(firstName, lastName).then(() => {
            setShowEnterDetails(false);
            setShowNameErrors(false);
            toast.success('Profile updated successfully.');

        }).catch(err => {
            setShowNameErrors(false);
            setShowEnterDetails(false);
            toast.error('Something went wrong. Please go to My Account page to complete profile.');
        });
    };

    const onFilterChange = () => {
        if (gridRef.current && gridRef.current.api) {
            let newTotal = 0;
            gridRef.current.api.forEachNodeAfterFilterAndSort(() => {
                newTotal++;
            });
            let newTotalPages = Math.ceil(newTotal / pageSize);
            setTotalPages(newTotalPages);
            if (page > newTotalPages) {
                setPage(newTotalPages);
            }
        }
    }

    React.useEffect(() => {
        let shouldUpdate = true;
        contractHelper.getAllAgreements().then(data => {
            if (shouldUpdate) {
                setAgreements(data);            
                setLoading(false);
            }
        }).catch(err => {
            if (shouldUpdate) {
                console.log(err);
                toast.error('Error fetching agreements. Try again later');
                setLoading(false);
                setError(true);
            }
        });
        return () => { shouldUpdate = false; }
    }, [contractHelper]);

    
    React.useEffect(() => {
        let shouldUpdate = true;
        authHelper
            .getOrganizationName().then(resp => {
                if (shouldUpdate) {
                    setOrganization(resp);
                }
            }).catch(err => {
                console.log(err);
            });
        return () => { shouldUpdate = false; } 
    }, [authHelper]);

    React.useEffect(() => {
        const totalAgreements = agreements.length;
        const totalPages = Math.ceil(totalAgreements / pageSize);
        setTotalPages(totalPages);
    }, [agreements, pageSize]);


    React.useEffect(() => {
        setColumnDef(columnBuilder(showColumns, navigate, onShowDetailClick));
    }, [showColumns, navigate, onShowDetailClick]);

    React.useEffect(() => {
        if (auth && auth.user && auth.user.email && auth.user.email.length > 0) {
            let first_name = auth.user.first_name || '';
            setUserName({firstName: first_name, lastName: auth.user.last_name || ''});
            if (first_name.length === 0) {
                setShowEnterDetails(true);
            }
        }
    }, [auth]);

    React.useLayoutEffect(() => {
        if (gridRef && gridRef.current && gridRef.current.api) {
            gridRef.current.api.sizeColumnsToFit();
        }
    }, [rect]); 

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
                        <span onClick={onCreateNewClick}>
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
                                    <Center className='cursor-pointer' onClick={() => {
                                            tileFilter = 1;
                                            setRenderTileFilter(tileFilter);
                                            gridRef.current!.api.onFilterChanged();
                                        }} ref={tile1Ref} style={{ minWidth: 210 }}>
                                        <Stack spacing={4} className='w-full'>
                                            <Group position='apart'>
                                                <span><i style={{ fontSize: 42 }} className={classNames('iconsminds-folder-edit text-primary transition-all')} /></span>
                                                <p style={{ padding: '12px 22px' }} 
                                                    className={classNames('text-5xl transition-all rounded-full border-2 border-gray-300', 
                                                    {'text-primary': renderTileFilter !== 1 && !tile1Hovered, 
                                                    'text-white bg-primary': renderTileFilter === 1 || tile1Hovered })}>{agreements.filter(a => a.status === 'draft').length}</p>
                                            </Group>
                                            <div style={{ height: 37 }}>
                                                <p style={{ marginLeft: 8 }}>Draft</p>
                                            </div>
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
                                        }} ref={tile2Ref} style={{ minWidth: 210 }}>
                                        <Stack spacing={4} className='w-full'>
                                            <Group position='apart'>
                                                <span><i style={{ fontSize: 42 }} className={classNames('iconsminds-box-with-folders text-primary transition-all')} /></span>
                                                <p style={{ padding: '12px 22px' }} 
                                                    className={classNames('text-5xl transition-all rounded-full border-2 border-gray-300', 
                                                    {'text-primary': renderTileFilter !== 2 && !tile2Hovered, 
                                                    'text-white bg-primary': renderTileFilter === 2 || tile2Hovered })}>{agreements.filter(a => a.status === 'complete').length}</p>
                                            </Group>
                                            <div style={{ height: 37 }}>
                                                <p style={{ marginLeft: 8 }}>Completed</p>
                                                <p style={{ marginLeft: 8 }} className='text-muted text-xs'>(last 30 days)</p>
                                            </div>
                                        </Stack>
                                    </Center>
                                </CardBody>
                            </Card>
                        </Center>

                        <Center className='m-3'>
                            <Card>
                                <CardBody className='p-4'>
                                    <Center className='cursor-pointer' onClick={() => {
                                            tileFilter = 3;
                                            setRenderTileFilter(tileFilter);
                                            gridRef.current!.api.onFilterChanged();
                                        }} ref={tile3Ref} style={{ minWidth: 210 }}>
                                        <Stack spacing={4} className='w-full'>
                                            <Group position='apart'>
                                                <span><i style={{ fontSize: 42 }} className={classNames('iconsminds-bird-delivering-letter text-primary transition-all')} /></span>
                                                <p style={{ padding: '12px 22px' }} 
                                                    className={classNames('text-5xl transition-all rounded-full border-2 border-gray-300', 
                                                    {'text-primary': renderTileFilter !== 3 && !tile3Hovered, 
                                                    'text-white bg-primary': renderTileFilter === 3 || tile3Hovered })}>{agreements.filter(a => a.status === 'sent').length}</p>
                                            </Group>
                                            <div style={{ height: 37 }}>
                                                <p style={{ marginLeft: 8 }}>In Progress</p>
                                            </div>
                                        </Stack>
                                    </Center>
                                </CardBody>
                            </Card>
                        </Center>
                    </div>
                </Grid.Col>
            </Grid>            
            <div ref={cardRef}>
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
                                    <p className='text-2xl'>Contracts &#38; Agreements</p>
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
                                    <Group>
                                        <p>Page Size</p>
                                        <Select style={{ width: 70 }} size='xs' data={[
                                            { value: '5', label: '5' },
                                            { value: '10', label: '10' },
                                            { value: '20', label: '20' },
                                            { value: '50', label: '50' },
                                            { value: '100', label: '100' },
                                        ]} value={pageSize.toString()} onChange={(e) => {
                                            if (e) {
                                                setPageSize(parseInt(e));
                                                if (gridRef && gridRef.current && gridRef.current.api) {
                                                    gridRef.current.api.paginationSetPageSize(parseInt(e));
                                                }
                                            }
                                        }} />
                                    </Group>
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
                                                    setColumnDef(columnBuilder(newCols, navigate, onShowDetailClick));                                                
                                                    gridRef.current!.api.redrawRows();
                                                    return newCols;
                                                })} label={col} />
                                            ))}
                                        </Stack>
                                    </Popover>
                                    
                                    
                                    <Group onClick={() => {
                                        if (gridRef && gridRef.current) {
                                            gridRef.current.api.exportDataAsExcel();
                                        }
                                    }} className='cursor-pointer hover:text-blue-500 hover:scale-110 transition-all' spacing={4}>
                                        <i className='simple-icon-share-alt'></i>
                                        <span>Export</span>
                                    </Group>

                                </Group>
                            </Group>
                            <div id='dashboard-main-table' className='ag-theme-material w-full h-full'>
                                <AgGridReact
                                    animateRows={true}
                                    columnDefs={columnDefs}
                                    rowHeight={70}
                                    onGridReady={onGridReady}
                                    ref={gridRef}
                                    pagination={true}
                                    rowData={agreements}
                                    isExternalFilterPresent={() => true}
                                    doesExternalFilterPass={doesExternalFilterPass}
                                    defaultColDef={defaultColDef}
                                    onFilterChanged={onFilterChange}
                                    gridOptions={gridOptions}
                                    overlayNoRowsTemplate={'Currently you do not have any documents. Please click on \'Create New\' button to proceed.'}
                                />
                            </div>
                            <Group position='right' className='mt-2'>
                                <Pagination
                                    className="d-inline-block"
                                    size="sm"
                                    listClassName="justify-content-center"
                                    aria-label="Page navigation example"                        
                                >
                                    <PaginationItem
                                        className={page === 1 ? 'disabled' : ''}
                                    >
                                        <PaginationLink className="prev" onClick={() => {
                                            if (gridRef.current && gridRef.current.api) {
                                                if (page > 1) {
                                                    setPage(page - 1);
                                                    gridRef.current.api.paginationGoToPage(page - 2);
                                                }
                                            }
                                        }}>
                                            <i className="simple-icon-arrow-left" />
                                        </PaginationLink>

                                    </PaginationItem>
                                    {getPaginationArray(totalPages, page, 8).map((p, index) => {
                                        if (p === -1) {
                                            return <PaginationItem>
                                                <Center className='h-full'>
                                                    <i className='simple-icon-options' />
                                                </Center>
                                            </PaginationItem>
                                        } else {
                                            return <PaginationItem active={p === page} key={index}>
                                                <PaginationLink onClick={() => {
                                                    if (gridRef.current && gridRef.current.api) {
                                                        setPage(p);
                                                        gridRef.current.api.paginationGoToPage(p - 1);
                                                    }
                                                }}>
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>
                                        }
                                    })}
                                    <PaginationItem className={page === totalPages ? 'disabled' : ''}>
                                        <PaginationLink className='next' onClick={() => {
                                            if (gridRef.current && gridRef.current.api) {
                                                if (page < totalPages) {
                                                    setPage(page + 1);
                                                    gridRef.current.api.paginationGoToPage(page);
                                                }
                                            }
                                        }}>
                                            <i className="simple-icon-arrow-right" />
                                        </PaginationLink>
                                    </PaginationItem>
                                </Pagination>
                            </Group>
                        </div>}
                    </CardBody>
                </Card>
            </div>
            <Modal
                opened={moreDetailModal}
                onClose={() => setMoreDetailModal(false)}
                centered
                size='xl'
                title={<p className='text-lg font-bold'>{!!moreDetailsAgreement ? moreDetailsAgreement.title : 'Details'}</p>}
            >
                <Grid style={{ height: '80vh' }}>
                    <Grid.Col sm={6} className='border-r-2 border-gray-200'>
                        <div className='px-2'>
                            {moreDetailsAgreement &&  <AuditTrail height={550} contractHelper={contractHelper} contractId={moreDetailsAgreement.id.toString()} />}
                        </div>
                    </Grid.Col>
                    <Grid.Col sm={6}>
                        <div className='px-2 flex flex-col h-full'>
                            <div className='flex-grow'>
                                {moreDetailsAgreement && <Stack spacing='xl'>
                                    <Group>
                                        <p style={{ width: 100 }} className='text-muted'>Status</p>
                                        <Badge variant='outline' color={getAgreementBadgeColorFromStatus(moreDetailsAgreement.status)}>{getAgreementStatusText(moreDetailsAgreement.status)} </Badge>
                                    </Group>
                                    {signers.filter(s => s.type === 'signer').length > 0 && <Group align={'start'}>
                                        <p style={{ width: 100 }} className='text-muted'>Signers</p>
                                        <div>
                                            <List>
                                                {signers.filter(s => s.type === 'signer').map((s) => {
                                                    const {status, icon} = getSignerStatusAndIcon(s, 'sm');
                                                    return <List.Item icon={
                                                    <Tooltip label={status}>
                                                        {icon}
                                                    </Tooltip>} key={s.id}>
                                                        <p>{s.name}</p>
                                                    </List.Item>
                                                })}
                                            </List>
                                        </div>
                                    </Group>}
                                    {signers.filter(s => s.type === 'approver').length > 0 && <Group align='start'>
                                        <p style={{ width: 100 }} className='text-muted'>Approvers</p>
                                        <div>
                                            <List>
                                                {signers.filter(s => s.type === 'approver').map((s) => {
                                                    const {status, icon} = getSignerStatusAndIcon(s, 'sm');
                                                    return <List.Item icon={
                                                    <Tooltip label={status}>
                                                        {icon}
                                                    </Tooltip>} key={s.id}>
                                                        <p>{s.name}</p>
                                                    </List.Item>
                                                })}
                                            </List>
                                        </div>
                                    </Group>}
                                    {signers.filter(s => s.type === 'viewer').length > 0 &&  <Group align={'start'}>
                                        <p style={{ width: 100 }} className='text-muted'>Viewers</p>
                                        <div>
                                            <List>
                                                {signers.filter(s => s.type === 'viewer').map((s) => {
                                                    const {status, icon} = getSignerStatusAndIcon(s, 'sm');
                                                    return <List.Item icon={
                                                    <Tooltip label={status}>
                                                        {icon}
                                                    </Tooltip>} key={s.id}>
                                                        <p>{s.name}</p>
                                                    </List.Item>
                                                })}
                                            </List>
                                        </div>
                                    </Group>}
                                    <AgreementProgressBar contractHelper={contractHelper} contractId={moreDetailsAgreement.id.toString()}  />
                                    {moreDetailsAgreement.sequence && <Group>
                                        <i className='text-success simple-icon-check' />
                                        <p>Approval (where applicable) and signing will be completed in a sequence.</p>
                                    </Group>}
                                    {moreDetailsAgreement.signed_before && <Group>
                                        <i className='text-primary simple-icon-calendar'></i>
                                        <p>Must be signed before: <span className='text-rose-500'>{getFormatDateFromIso(moreDetailsAgreement.signed_before)}</span></p>
                                    </Group>}
                                    {moreDetailsAgreement.start_date && <Group>
                                        <i className='text-primary simple-icon-calendar'></i>
                                        <p>Document start date: <span className='text-rose-500'>{getFormatDateFromIso(moreDetailsAgreement.start_date)}</span></p>
                                    </Group>}
                                    {moreDetailsAgreement.end_date && <Group>
                                        <i className='text-primary simple-icon-calendar'></i>
                                        <p>Document end date: <span className='text-rose-500'>{getFormatDateFromIso(moreDetailsAgreement.end_date)}</span></p>
                                    </Group>}
                                </Stack>}
                            </div>
                            <Group position='right'>
                                <span onClick={() => {
                                    setMoreDetailModal(false);
                                }}>
                                    <Button color='light'>Close</Button>
                                </span>
                                {moreDetailsAgreement && <span onClick={() => {
                                    navigate(`/agreements/${moreDetailsAgreement.id}`);
                                }}><Button color='primary'>Open</Button></span>}
                            </Group>
                        </div>
                    </Grid.Col>
                </Grid>
            </Modal>

            <Modal 
                centered
                opened={showEnterDetails}
                onClose={() => setShowEnterDetails(false)}
                title={<p className='text-lg font-bold'>Welcome to Ratify!</p>}
                size='md'
            >
                <Stack className='p-2' spacing={'xl'}>
                    <p>Please complete your profile before getting started.</p>
                    <SimpleGrid cols={2}>
                        <TextInput
                            required={true}
                            value={firstName}
                            onChange={(e) => {
                                setUserName(prev => ({ ...prev, firstName: e.target.value }));
                            }}
                            label='First Name'
                            placeholder='First Name'
                            error={ showNameErrors && !firstName && 'Please enter your name' }
                        />
                        <TextInput
                            value={lastName}
                            onChange={(e) => {
                                setUserName(prev => ({ ...prev, lastName: e.target.value }));
                            }}
                            label='Surname'
                            placeholder='Surname'
                            error={ showNameErrors && !firstName }
                        />
                    </SimpleGrid>
                    <Group position='right'>
                        <span onClick={() => setShowEnterDetails(false)}>
                            <Button color='light'>Later</Button>
                        </span>
                        <span onClick={onSubmitProfileSettings}>
                            <Button color='success'>Submit</Button>
                        </span>
                    </Group>
                </Stack>
            </Modal>
            
            <Modal
                opened={showUnverifiedModal}
                onClose={() => setShowUnverifiedModal(false)}
                centered
            >
                <VerifyEmailMessage navigate={navigate} auth={auth} organization={organization}  />
            </Modal>

        </>
    );
};

export default AgreementDashboard;
