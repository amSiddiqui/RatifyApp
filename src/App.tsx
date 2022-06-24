import './App.css';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { IntlProvider } from 'react-intl';
import AppLocale from './lang/';
import { getDirection } from './helpers/Utils';
// @ts-ignore
import { AppDispatch, RootState } from './redux/';
import { AuthHelper } from './helpers/AuthHelper';

const ViewError = React.lazy(() =>
  import(/* webpackChunkName: "views-error" */ './views/error')
);

const ViewUnauthorized = React.lazy(() =>
  import(/* webpackChunkName: "views-error" */ './views/unauthorized')
);

const ViewUser = React.lazy(() =>
  import(/* webpackChunkName: "views-user" */ './views/user')
);

const Login = React.lazy(() =>
  import(/* webpackChunkName: "user-login" */ './views/user/login_v2')
);

const ResetPassword = React.lazy(() =>
  import(/* webpackChunkName: "user-reset-password" */ './views/user/reset-password')
);

const ForgotPassword = React.lazy(() =>
  import(/* webpackChunkName: "user-forgot-password" */ './views/user/forgot-password')
);

const Register = React.lazy(() =>
  import(/* webpackChunkName: "user-register" */ './views/user/register_v2')
);

const VerifyEmail = React.lazy(() =>
  import(/* webpackChunkName: "user-verify-email" */ './views/user/verify-email_v2')
);

const BlankPage = React.lazy(() =>
  import(/* webpackChunkName: "views-blank-page" */ './views/app/blank-page')
);

const ViewApp = React.lazy(() =>
  import(/* webpackChunkName: "views-app" */ './views/app')
);

const ContractsAgreements = React.lazy(() =>
  import(/* webpackChunkName: "views-contracts-agreements" */ './views/app/contract-agreements')
);

const AgreementCreator = React.lazy(() => 
    import(/* webpackChunkName: "views-agreement-creator" */ './views/app/contract-agreements/agreement-creator')
);

const Reports = React.lazy(() =>
  import(/* webpackChunkName: "views-reports" */ './views/app/reports')
);

const ProfileSettings = React.lazy(() =>
  import(/* webpackChunkName: "views-profile-settings" */ './views/accounts/profile-settings')
);

const UiSettings = React.lazy(() =>
  import(/* webpackChunkName: "views-ui-settings" */ './views/accounts/ui-settings')
);

const BusinessProfile = React.lazy(() =>
    import(/* webpackChunkName: "views-business-profile" */ './views/accounts/business-profile')
);

const Billing = React.lazy(() =>
  import(/* webpackChunkName: "views-billing" */ './views/billing')
);

const Administration = React.lazy(() =>
  import(/* webpackChunkName: "views-admin" */ './views/admin')
);

const AgreementSign = React.lazy(() =>
  import(/* webpackChunkName: "views-agreement-sign" */ './views/app/contract-agreements/agreement-sign')
);

const AgreementGreetings = React.lazy(() =>
  import(/* webpackChunkName: "views-agreement-greetings" */ './views/app/contract-agreements/agreement-sign/agreement-greetings')
);

const SenderAgreement = React.lazy(() =>
  import(/* webpackChunkName: "views-sender-agreement" */ './views/app/contract-agreements/sender-view/sender-agreement')
);

const AgreementDashboard = React.lazy(() =>
  import(/* webpackChunkName: "views-agreement-dashboard" */'./views/app/contract-agreements/dashboard')
);

const AgreementSuccess = React.lazy(() =>
  import(/* webpackChunkName: "views-agreement-success" */ './views/app/contract-agreements/agreement-sign/agreement-success')
);

type ProtectedRouteProps = {
    isAuthenticated: boolean;
    authenticationPath: string;
    outlet: JSX.Element;
};

function ProtectedRoute({
    isAuthenticated,
    authenticationPath,
    outlet,
}: ProtectedRouteProps) {
    if (isAuthenticated) {
        return outlet;
    } else {
        return <Navigate to={{ pathname: authenticationPath }} />;
    }
}

function App() {
    const auth = useSelector((root: RootState) => root.auth);
    const direction = React.useCallback(getDirection, [])();
    const settings = useSelector((root: RootState) => root.settings);
    const currentAppLocale = AppLocale[settings.locale];
    const dispatchFn = useDispatch<AppDispatch>();
    const authHelper = React.useMemo(() => new AuthHelper(dispatchFn), [dispatchFn]);

    const defaultProtectedRouteProps: Omit<ProtectedRouteProps, 'outlet'> = {
        isAuthenticated: auth.isAuthenticated || auth.loading,
        authenticationPath: '/user',
    };

    React.useEffect(() => {
        if (direction.isRtl) {
            document.body.classList.add('rtl');
            document.body.classList.remove('ltr');
        } else {
            document.body.classList.add('ltr');
            document.body.classList.remove('rtl');
        }
    }, [direction]);

    React.useEffect(() => {
        authHelper.refreshTokenRequest();
    }, [authHelper]);

    return (
        <div className="h-100">
            <IntlProvider
                locale={currentAppLocale.locale}
                messages={currentAppLocale.messages}
            >
                <>
                    <React.Suspense fallback={<div className="loading" />}>
                        <BrowserRouter>
                            <Routes>
                                <Route path='/' element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<ViewApp />} />}>
                                    <Route index element={<AgreementDashboard />} />
                                    <Route path='agreements' element={<><Outlet /></>}>
                                        <Route index element={<ContractsAgreements></ContractsAgreements>} />
                                        <Route path='dashboard' element={<AgreementDashboard />} />
                                        <Route path='add-signers/:contractId' element={<AgreementCreator />} />
                                        <Route path=':contractId' element={ <SenderAgreement /> } />
                                    </Route>
                                    <Route path='reports' element={<Reports></Reports>}></Route>
                                    <Route path='account' element={<><Outlet /></>}>
                                        <Route index element={<Navigate to='/account/profile-settings' />} />
                                        <Route path='profile-settings' element={<ProfileSettings />} />
                                        <Route path='ui-settings' element={<UiSettings />} />
                                        <Route path='business-profile' element={<BusinessProfile />} />
                                    </Route>
                                    <Route path='blank' element={<BlankPage />} />
                                    <Route path='billing' element={<Billing />}></Route>
                                    <Route path='administration' element={<Administration />}></Route>
                                </Route>
                                <Route path='error' element={<ViewError></ViewError>} />
                                <Route path='unauthorized' element={<ViewUnauthorized></ViewUnauthorized>} />
                                <Route path='user' element={<ViewUser />} >
                                    <Route index element={<Navigate to='/user/login' />} />
                                    <Route path='login' element={<Login />} />
                                    <Route path='register' element={<Register />} />
                                    <Route path='verify-email' element={<VerifyEmail />} />
                                    <Route path='forgot-password' element={<ForgotPassword />} />
                                    <Route path='reset-password' element={<ResetPassword />} />
                                </Route>
                                <Route path='agreements' element={<><Outlet /></>}>
                                    <Route path='sign' element={<AgreementSign />} />
                                    <Route path='greeting' element={<AgreementGreetings />} />
                                    <Route path='success' element={<AgreementSuccess />} />
                                </Route>
                                <Route path="*" element={<Navigate to='/error' />} />
                            </Routes>
                        </BrowserRouter>
                    </React.Suspense>
                </>
            </IntlProvider>
        </div>
    );
}

export default App;
