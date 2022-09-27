import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import { OrganizationUser } from '../../types/AuthTypes';
import {
    AgGridEvent,
    ColDef,
    ColGroupDef,
    GridOptions,
    ICellRendererParams,
    ValueGetterParams,
} from 'ag-grid-community';
import { Avatar, Center, Group } from '@mantine/core';
import { MdOutlineAdminPanelSettings, MdPersonOutline } from 'react-icons/md';
import { useResizeObserver } from '@mantine/hooks';

const UserManagementTable: React.FC<{ users: OrganizationUser[] }> = ({
    users,
}) => {

    const [cardRef, rect] = useResizeObserver();
    
    const gridRef = React.useRef<AgGridReact>(null);

    const columnDefs: (ColDef | ColGroupDef)[] = [
        { headerName: '', field: 'image', resizable: false, suppressMovable: true, filter: false,  sortable: false, width: 50, cellRenderer: (params: ICellRendererParams) => {
            return <Center className='w-full h-full'><Avatar size='sm' radius={'xl'} src={'data:image/jpeg;base64,' + params.value} alt="Avatar" /></Center>
        }},
        { headerName: 'First Name', field: 'first_name' },
        { headerName: 'Last Name', field: 'last_name' },
        { headerName: 'Email', field: 'email' },
        {
            headerName: 'Role',
            field: 'role',
            width: 150,
            filterValueGetter: (params: ValueGetterParams<OrganizationUser>) => {
                return params.data?.role === 99 ? 'Admin' : 'User';
            },
            cellRenderer: (params: ICellRendererParams) => {
                return (
                    <Center className="h-full w-full">
                        <Group spacing={4} position='left' className={ params.value === 99 ? 'text-success': '' }>
                            {params.value === 99 ? <MdOutlineAdminPanelSettings className='relative text-lg' style={{ top: '-1px' }} /> : <MdPersonOutline className='relative text-lg' style={{ top: '-1px' }} />}
                            <p>{params.value === 99 ? 'Admin' : 'User'}</p>
                        </Group>
                    </Center>
                );
            },
            
        },
        { headerName: 'Job Title', field: 'job_title' },
        {
            headerName: 'Status',
            field: 'status',
            width: 150,
            filterValueGetter: (params: ValueGetterParams<OrganizationUser>) => {
                return params.data?.status ? 'Active' : 'Pending';
            },
            cellRenderer: (params: ICellRendererParams) => {
                return (
                    <Center className="h-full w-full text-left">
                        <p className={params.value ? 'text-success' : ''}>
                            {params.value ? 'Active' : 'Pending'}
                        </p>
                    </Center>
                );
            },
        },
    ];

    const gridOptions = React.useMemo<GridOptions>(() => {
        return {
            domLayout: 'autoHeight',
            suppressCellFocus: true,
        };
    }, []);

    const onGridReady = (e: AgGridEvent<OrganizationUser>) => {
        e.api.sizeColumnsToFit();
    };

    const defaultColDef = React.useMemo(
        () => ({
            sortable: true,
            filter: true,
            floatingFilter: true,
            resizable: true,
        }),
        [],
    );

    React.useLayoutEffect(() => {
        if (gridRef && gridRef.current && gridRef.current.api) {
            gridRef.current.api.sizeColumnsToFit();
        }
    }, [rect]); 


    return (
        <div
            ref={cardRef}
            id="dashboard-main-table"
            className="ag-theme-material w-full h-full mt-4">
            <AgGridReact
                animateRows={true}
                columnDefs={columnDefs}
                onGridReady={onGridReady}
                ref={gridRef}
                rowData={users}
                defaultColDef={defaultColDef}
                gridOptions={gridOptions}
                overlayNoRowsTemplate={
                    "Currently you do not have any Users. Please click on 'Add User' button to proceed."
                }
            />
        </div>
    );
};

export default UserManagementTable;
