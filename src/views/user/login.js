import React, { useEffect } from 'react';
import { Row, Card, CardTitle, Label, FormGroup, Button } from 'reactstrap';
import { NavLink } from 'react-router-dom';

import { Formik, Form, Field } from 'formik';
import { useNavigate } from 'react-router-dom';

import { Colxx } from '../../components/common/CustomBootstrap';
import IntlMessages from '../../helpers/IntlMessages';
import { AuthHelper } from '../../helpers/AuthHelper';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const validatePassword = (value) => {
    let error;
    // check if password is at least 8 characters long containing at least one number and one letter
    if (value.length < 8) {
        error = 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(value)) {
        error = 'Password must contain at least one capital letter';
    }
    if (!/[0-9]/.test(value)) {
        error = 'Password must contain at least one number';
    }
    return error;
};

const validateEmail = (value) => {
    let error;
    if (!value) {
        error = 'Please enter your email address';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,10}$/i.test(value)) {
        error = 'Invalid email address';
    }
    return error;
};

const Login = () => {
    const loading = useSelector((root) => root.auth.loading);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const authHelper = React.useMemo(
        () => new AuthHelper(dispatch),
        [dispatch]
    );
    const [error, setError] = React.useState(false);

    const [email] = React.useState('');
    const [password] = React.useState('');

    const onUserLogin = (data) => {
        console.log(data);
        authHelper
            .loginRequest(data)
            .then(() => {
                setError(false);
                navigate('/');
            })
            .catch(() => {
                setError(true);
            });
    };

    useEffect(() => {
        if (error) {
            toast.error('Invalid Username or Password');
        }
    }, [error]);

    return (
        <Row className="h-100">
            <Colxx xxs="12" md="10" className="mx-auto my-auto">
                <Card className="auth-card">
                    <div className="position-relative image-side ">
                        <p className="text-white h2">MAGIC IS IN THE DETAILS</p>
                        <p className="white mb-0">
                            Please use your credentials to login.
                            <br />
                            If you are not a member, please{' '}
                            <NavLink to="/user/register" className="white">
                                register
                            </NavLink>
                            .
                        </p>
                    </div>
                    <div className="form-side">
                        <NavLink to="/" className="white">
                            <span className="logo-single" />
                        </NavLink>
                        <CardTitle className="mb-4">
                            <IntlMessages id="user.login-title" />
                        </CardTitle>

                        <Formik
                            onSubmit={onUserLogin}
                            initialValues={{ email, password }}
                        >
                            {({ errors, touched }) => (
                                <Form className="av-tooltip tooltip-label-bottom">
                                    <FormGroup className="form-group has-float-label">
                                        <Label>
                                            <IntlMessages id="user.email" />
                                        </Label>
                                        <Field
                                            className="form-control"
                                            name="email"
                                            validate={validateEmail}
                                        />
                                        {errors.email && touched.email && (
                                            <div className="invalid-feedback d-block">
                                                {errors.email}
                                            </div>
                                        )}
                                    </FormGroup>
                                    <FormGroup className="form-group has-float-label">
                                        <Label>
                                            <IntlMessages id="user.password" />
                                        </Label>
                                        <Field
                                            className="form-control"
                                            type="password"
                                            name="password"
                                            validate={validatePassword}
                                        />
                                        {errors.password &&
                                            touched.password && (
                                                <div className="invalid-feedback d-block">
                                                    {errors.password}
                                                </div>
                                            )}
                                    </FormGroup>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <NavLink to="/user/forgot-password">
                                            <IntlMessages id="user.forgot-password-question" />
                                        </NavLink>
                                        <Button
                                            color="primary"
                                            className={`btn-shadow btn-multiple-state ${
                                                loading ? 'show-spinner' : ''
                                            }`}
                                            size="lg"
                                            type='submit'
                                        >
                                            <span className="spinner d-inline-block">
                                                <span className="bounce1" />
                                                <span className="bounce2" />
                                                <span className="bounce3" />
                                            </span>
                                            <span className="label">
                                                <IntlMessages id="user.login-button" />
                                            </span>
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </Card>
            </Colxx>
        </Row>
    );
};

export default Login;