import React from 'react';
import { Row } from 'reactstrap';
import { Colxx, Separator } from '../../components/common/CustomBootstrap';
import Breadcrumb from '../../containers/navs/Breadcrumb';
import { useLocation } from 'react-router-dom';
import UnderConstruction from './construction';

const BlankPage = () => {
  const match = useLocation();

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.reports" match={match}/>
          <Separator className="mb-5" />
        </Colxx>
      </Row>
      <UnderConstruction />
    </>
  );
};

export default BlankPage;