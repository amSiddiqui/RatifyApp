import React from 'react';
import {
    Row,
    Card,
    CardTitle,
    Form,
    FormGroup,
    Label,
    Input,
    Button,
} from 'reactstrap';
import { NavLink } from 'react-router-dom';

import IntlMessages from '../../helpers/IntlMessages';
import { Colxx } from '../../components/common/CustomBootstrap';
import { AuthHelper } from '../../helpers/AuthHelper';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { useFormik } from 'formik';

const passwordValidation = (value) => {
    if (typeof value !== 'string') {
        return false;
    }
    if (value.length < 8) {
        return false;
    }
    if (!/[A-Z]/.test(value)) {
        return false;
    }
    if (!/[0-9]/.test(value)) {
        return false;
    }
    return true;
};

const Register = () => {
    const dispatchFn = useDispatch();
    const authHelper = React.useMemo(
        () => new AuthHelper(dispatchFn),
        [dispatchFn]
    );

    const onUserRegister = (data, actions) => {
        console.log({ data });
        setTimeout(() => {
            actions.setSubmitting(false);
        }, 3000);
    };

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            confirm_password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Please enter a valid email')
                .required('Please enter your email'),
            password: Yup.string()
                .min(8, 'Password must be at least 8 characters long')
                .required('Please enter a password')
                .test(
                    'password-validation',
                    'Password must contain at least one capital letter and one number',
                    passwordValidation
                ),
            confirm_password: Yup.string()
                .oneOf([Yup.ref('password')], 'Password does not match')
                .required('Please confirm your password'),
        }),
        onSubmit: onUserRegister,
    });

    return (
        <Row className="h-100">
            <Colxx xxs="12" md="10" className="mx-auto my-auto">
                <Card className="auth-card">
                    <div className="position-relative image-side ">
                        <p className="text-white h2">MAGIC IS IN THE DETAILS</p>
                        <p className="white mb-0">
                            Please use this form to register. <br />
                            If you are a member, please{' '}
                            <NavLink to="/user/login" className="white">
                                login
                            </NavLink>
                            .
                        </p>
                    </div>
                    <div className="form-side">
                        <NavLink to="/" className="white">
                            <span className="logo-single" />
                        </NavLink>
                        <CardTitle className="mb-4">
                            <IntlMessages id="user.register" />
                        </CardTitle>
                        <Form onSubmit={formik.handleSubmit}>
                            <FormGroup className="form-group has-float-label  mb-4">
                                <Label>
                                    <IntlMessages id="user.email" />
                                </Label>
                                <Input
                                    type="email"
                                    name="email"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.email}
                                />
                                {formik.touched.email && formik.errors.email ? (
                                    <div className="invalid-feedback d-block">
                                        {formik.errors.email}
                                    </div>
                                ) : null}
                            </FormGroup>

                            <FormGroup className="form-group has-float-label  mb-4">
                                <Label>
                                    <IntlMessages id="user.password" />
                                </Label>
                                <Input
                                    type="password"
                                    name="password"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.password}
                                />
                                {formik.touched.password &&
                                formik.errors.password ? (
                                    <div className="invalid-feedback d-block">
                                        {formik.errors.password}
                                    </div>
                                ) : null}
                            </FormGroup>

                            <FormGroup className="form-group has-float-label  mb-4">
                                <Label>
                                    <IntlMessages id="user.confirm-password" />
                                </Label>
                                <Input
                                    type="password"
                                    name="confirm_password"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.confirm_password}
                                />
                                {formik.touched.confirm_password &&
                                formik.errors.confirm_password ? (
                                    <div className="invalid-feedback d-block">
                                        {formik.errors.confirm_password}
                                    </div>
                                ) : null}
                            </FormGroup>

                            <div className="d-flex justify-content-end align-items-center">
                                <Button
                                    color="primary"
                                    className={`btn-shadow cursor-pointer btn-multiple-state ${
                                        formik.isSubmitting
                                            ? 'show-spinner'
                                            : ''
                                    }`}
                                    size="lg"
                                    type="submit"
                                    disabled={!formik.isValid}
                                >
                                    <span className="spinner d-inline-block">
                                        <span className="bounce1" />
                                        <span className="bounce2" />
                                        <span className="bounce3" />
                                    </span>
                                    <span className="label">
                                        <IntlMessages id="user.register-button" />
                                    </span>
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Card>
            </Colxx>
        </Row>
    );
};

export default Register;
