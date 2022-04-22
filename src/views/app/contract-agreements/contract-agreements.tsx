import React from 'react';
import { Row } from 'reactstrap';
import { useIntl } from 'react-intl';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { useLocation } from 'react-router-dom';
import './contract-agreements.css';
import CATopBar from './topbar';
import CATemplates from './templates';

const ContractAgreements = () => {
    const match = useLocation();
    const intl = useIntl();
    return (
        <>
            <Row>
                <Colxx xxs="12">
                    <Breadcrumb
                        heading="menu.contracts-agreements"
                        match={match}
                    />
                    <Separator className="mb-5" />
                </Colxx>
            </Row>
            <CATopBar intl={intl} />
            <h1 className='text-2xl mt-4'>Select From Templates</h1>
            <CATemplates intl={intl} />
        </>
    );
};

export default ContractAgreements;
