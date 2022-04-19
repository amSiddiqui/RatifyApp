import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import AppLayout from '../../components/layout/AppLayout';


const App = () => {
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
