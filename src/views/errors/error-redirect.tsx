import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorRedirect:React.FC = () => {
    const navigate = useNavigate();
    React.useEffect(() => {
        navigate('/error');
    })

    return<></>;
}

export default ErrorRedirect;