import React from 'react';
import { Row } from 'reactstrap';
import { Colxx } from '../../components/common/CustomBootstrap';

const Footer = () => {
  return (
    <footer className="page-footer">
      <div className="footer-content">
        <div className="container-fluid">
          <Row>
            <Colxx xxs="12" sm="6">
              <p className="mb-0 text-muted">Ratify 2023</p>
            </Colxx>
            <Colxx className="col-sm-6 d-none d-sm-block">
            </Colxx>
          </Row>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
