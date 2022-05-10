import React, { Suspense } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import AppLayout from '../../components/layout/AppLayout';

const App = () => {
    const [searchParams, setSearchParam] = useSearchParams();

    React.useEffect(() => {
        // check if params has expired and verified
        const expired = searchParams.get('expired');
        if (expired) {
            toast.error(
                'Verification link expired. Go to settings and send a new verification link.',
            );
        }
        const validate = searchParams.get('validate');
        if (validate === 'true') {
            toast.success('Email Verified.');
        } else if (validate === 'false') {
            toast.error('Email verification failed. Try again.');
        }
        if (expired || validate) {
            setSearchParam({});
        }
    }, [searchParams, setSearchParam]);

    return (
        <AppLayout>
            <div className="dashboard-wrapper">
                <Suspense fallback={<div className="loading" />}>
                    <Outlet />
                </Suspense>
            </div>
        </AppLayout>
    );
};

export default App;
