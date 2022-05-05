import React from 'react';
import { Row } from 'reactstrap';
import { useIntl } from 'react-intl';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { useLocation } from 'react-router-dom';
import './contract-agreements.css';
import CATopBar from './topbar';
import CATemplates from './templates';
import { Modal, Divider } from '@mantine/core';

const ContractAgreements:React.FC = () => {
    const match = useLocation();
    const intl = useIntl();

    const [, setSelectedDoc] = React.useState<File|null>();
    const [showPdfConfirm, setShowPdfConfirm] = React.useState(false);

    const onDocSelect = (files:File[]) => {
        setSelectedDoc(files[0]);
        setShowPdfConfirm(true);
    }

    return (
        <>
            <Row>
                <Colxx xxs="12">
                    <Breadcrumb
                        heading="menu.contracts-agreements"
                        match={match}
                    />
                    <Separator className="mb-14" />
                </Colxx>
            </Row>
            <CATopBar intl={intl} onDocSelect={onDocSelect} />
            <Divider className="mb-10 mt-10" label={
                <p className='text-2xl'>OR</p>
            } labelPosition='center'/>
            <div className='flex justify-between items-center'>
                <h1 className='text-2xl'>Select from saved templates</h1>
                <p>Currently there are no saved templates</p>
            </div>
            <CATemplates intl={intl} />
            <Modal
                opened={showPdfConfirm}
                onClose={() => setShowPdfConfirm(false)}
                title='Uploading'
            >
                
            </Modal>
        </>
    );
};

export default ContractAgreements;
