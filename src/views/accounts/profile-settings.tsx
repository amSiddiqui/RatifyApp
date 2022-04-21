import React from 'react';
import { Row, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import IntlMessages from '../../helpers/IntlMessages';
import { Colxx, Separator } from '../../components/common/CustomBootstrap';
import Breadcrumb from '../../containers/navs/Breadcrumb';
import { useLocation } from 'react-router-dom';
import { useIntl } from 'react-intl';

const ProfileSettings: React.FC = () => {
    const match = useLocation();
    const intl = useIntl();

    return (
        <>
            <Row>
                <Colxx xxs="12">
                    <Breadcrumb
                        heading="account.settings.profile"
                        match={match}
                    />
                    <Separator className="mb-5" />
                </Colxx>
            </Row>
            <Row>
                <Colxx xxs="12" className="mb-4">
                    <div className="profile-picture-container">
                        <img
                            src="/static/img/default.jpg"
                            className="profile-picture-img shadow "
                            alt="Profile"
                        />
                    </div>
                    <Form>
                        <FormGroup row>
                            <Colxx sm={6}>
                                <FormGroup>
                                    <Label for="profile-settings-first-name">
                                        <IntlMessages id="profile-settings.first-name" />
                                    </Label>
                                    <Input
                                        type="text"
                                        name="first_name"
                                        id="profile-settings-first-name"
                                        placeholder={intl.formatMessage({id: 'profile-settings.first-name'})}
                                    />
                                </FormGroup>
                            </Colxx>

                            <Colxx sm={6}>
                                <FormGroup>
                                    <Label for="profile-settings-last-name">
                                        <IntlMessages id="profile-settings.last-name" />
                                    </Label>
                                    <Input
                                        type="text"
                                        name="last_name"
                                        id="profile-settings-last-name"
                                        placeholder={ intl.formatMessage({id: 'profile-settings.last-name'})}
                                    />
                                </FormGroup>
                            </Colxx>

                            <Colxx sm={12}>
                                <FormGroup>
                                    <Label for="profile-settings-email">
                                        <IntlMessages id="profile-settings.email" />
                                    </Label>
                                    <Input
                                        type="email"
                                        name="email"
                                        id="profile-settings-email"
                                        placeholder={intl.formatMessage({id: 'profile-settings.email'})}
                                    />
                                </FormGroup>
                            </Colxx>

                            <Colxx sm={12} className='items-end'>
                                <Button color="primary">
                                    <IntlMessages id="profile-settings.save" />
                                </Button>
                            </Colxx>
                        </FormGroup>
                    </Form>
                </Colxx>
            </Row>
        </>
    );
};

export default ProfileSettings;
