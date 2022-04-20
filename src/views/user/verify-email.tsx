import React from 'react';
import { Row, Card, CardTitle } from 'reactstrap';
import IntlMessages from '../../helpers/IntlMessages';
import { Colxx } from '../../components/common/CustomBootstrap';
import { NavLink } from 'react-router-dom';

const VerifyEmail: React.FC = () => {
    return (
        <Row className="h-100">
            <Colxx xxs="12" md="10" className="mx-auto my-auto">
                <Card className="auth-card">
                    <div className="position-relative image-side ">
                    </div>
                    <div className="form-side">
                        <NavLink to="/" className="white">
                            <span className="logo-single" />
                        </NavLink>
                        <CardTitle style={{fontSize: '2rem'}} className="mb-4 display-1 font-weight-bold">
                            <IntlMessages id="user.verify-email-title" />
                        </CardTitle>
                        <p><IntlMessages id="user.verify-email-message" /></p>
                        <NavLink
                            to={'/'}
                            className="btn btn-primary btn-shadow btn-lg"
                        >
                            <IntlMessages id="pages.go-home" />
                        </NavLink>
                    </div>
                </Card>
            </Colxx>
        </Row>
    );
};

export default VerifyEmail;
