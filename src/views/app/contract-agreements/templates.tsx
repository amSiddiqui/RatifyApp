import React from 'react';
import { IntlShape } from 'react-intl';

const CATemplates:React.FC<{intl: IntlShape}> = ({ intl }) => {
    return (
        <div className='h-56 flex justify-center items-center'>
            <h3 className='text-2xl'>No Templates Found</h3>
        </div>
    );
}

export default CATemplates;