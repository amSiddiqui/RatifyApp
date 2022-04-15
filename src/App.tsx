import './App.css';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    isMultiColorActive,
    adminRoot,
    UserRole,
} from './constants/defaultValues';

import { IntlProvider } from 'react-intl';
import AppLocale from './lang/';
import { getDirection } from './helpers/Utils';
// @ts-ignore
import { NotificationContainer } from './theme/components/common/react-notifications';
import ColorSwitcher from './theme/components/common/ColorSwitcher';
import { authActions } from './redux/auth-slice';
import { AppDispatch, RootState } from './redux/';
import { AuthHelper } from "./helpers/AuthHelper";

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
        authenticationPath: '/login',
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
        authHelper.refreshTokenRequest().then(() => {
            authHelper.getUserInfo().then().catch(err => {});
        });
    }, [authHelper]);

    return (
        <div className="h-100">
            <IntlProvider
                locale={currentAppLocale.locale}
                messages={currentAppLocale.messages}
            >
                <>
                    <NotificationContainer />
                    <React.Suspense fallback={<div className="loading" />}>
                        <BrowserRouter>
                            <Routes>
                                <Route path="/" element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<div>Home</div>} />} />
                                <Route path="/error" element={<div>Error</div>} />
                                <Route path="/unauthorized" element={<div>Unauthorized</div>} />
                                <Route path="/login" element={<div>Login</div>} />
                            </Routes>
                        </BrowserRouter>
                    </React.Suspense>
                </>
            </IntlProvider>
        </div>
    );
}

export default App;
