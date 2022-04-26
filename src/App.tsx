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
  import(/* webpackChunkName: "user-login" */ './views/user/login')
);

const Register = React.lazy(() =>
  import(/* webpackChunkName: "user-register" */ './views/user/register')
);

const VerifyEmail = React.lazy(() =>
  import(/* webpackChunkName: "user-register" */ './views/user/verify-email')
);

const BlankPage = React.lazy(() =>
  import(/* webpackChunkName: "user-register" */ './views/app/blank-page')
);

const ViewApp = React.lazy(() =>
  import(/* webpackChunkName: "views-app" */ './views/app')
);

const ContractsAgreements = React.lazy(() =>
  import(/* webpackChunkName: "views-app" */ './views/app/contract-agreements')
);

const AgreementCreator = React.lazy(() => 
    import(/* webpackChunkName: "views-app" */ './views/app/contract-agreements/agreement-creator')
);

const Reports = React.lazy(() =>
  import(/* webpackChunkName: "views-app" */ './views/app/reports')
);

const DashboardAnalytics = React.lazy(() =>
  import(/* webpackChunkName: "viwes-blank-page" */ './views/app/dashboards/analytics')
);
const ProfileSettings = React.lazy(() =>
  import(/* webpackChunkName: "viwes-blank-page" */ './views/accounts/profile-settings')
);

const UiSettings = React.lazy(() =>
  import(/* webpackChunkName: "viwes-blank-page" */ './views/accounts/ui-settings')
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
                                    <Route index element={<DashboardAnalytics />} />
                                    <Route path='documents' element={<><Outlet /></>}>
                                        <Route index element={<ContractsAgreements></ContractsAgreements>} />
                                        <Route path='add-signers/:contractId' element={<AgreementCreator />} />
                                    </Route>
                                    <Route path='reports' element={<Reports></Reports>}></Route>
                                    <Route path='account' element={<><Outlet /></>}>
                                        <Route index element={<Navigate to='/account/profile-settings' />} />
                                        <Route path='profile-settings' element={<ProfileSettings />} />
                                        <Route path='ui-settings' element={<UiSettings />} />
                                    </Route>
                                    <Route path='blank' element={<BlankPage />} />
                                </Route>
                                <Route path='error' element={<ViewError></ViewError>} />
                                <Route path='unauthorized' element={<ViewUnauthorized></ViewUnauthorized>} />
                                <Route path='user' element={<ViewUser />} >
                                    <Route index element={<Navigate to='/user/login' />} />
                                    <Route path='login' element={<Login />} />
                                    <Route path='register' element={<Register />} />
                                    <Route path='verify-email' element={<VerifyEmail />} />
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
