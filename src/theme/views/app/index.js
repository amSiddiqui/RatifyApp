import React, { Suspense } from 'react';

import AppLayout from '../../components/layout/AppLayout';
// import { ProtectedRoute, UserRole } from 'helpers/authHelper';

const App = () => {
  return (
    <AppLayout>
      <div className="dashboard-wrapper">
        <Suspense fallback={<div className="loading" />}>
          
        </Suspense>
      </div>
    </AppLayout>
  );
};

export default App;
