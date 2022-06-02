import React from 'react';

const UserLayout:React.FC = ({ children }) => {
    return <div style={{backgroundColor: '#F8F8F8'}}>
        {children}
    </div>;
}

export default UserLayout;