import React, { Suspense } from 'react';
import UserLayout from '../../components/layout/UserLayout_v2';
import { Outlet } from 'react-router-dom';


const User = () => {
  return (
    <UserLayout>
      <Suspense fallback={<div className='loading' />}>
        <Outlet /> 
      </Suspense>
    </UserLayout>
  );
};

export default User;
