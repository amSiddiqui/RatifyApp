/* eslint-disable react/no-array-index-key */
import React from 'react';
import { NavLink } from 'react-router-dom';
import IntlMessages from '../../helpers/IntlMessages';
import { adminRoot } from '../../constants/defaultValues';
import { Breadcrumbs as MBreadcrumb } from '@mantine/core';
import { MdHome, MdChevronRight } from 'react-icons/md';

const getMenuTitle = (sub) => {
    if (`/${sub}` === adminRoot) return <IntlMessages id="menu.home" />;
    return <span><IntlMessages id={`menu.${sub}`} /></span>;
};

const getUrl = (path, sub) => {
    return path.split(sub)[0] + sub;
};

const BreadcrumbContainer = ({ heading, match }) => {
    return (
        <>
            {heading && (
                <>
                    <h1 className="mb-4 pb-0">
                        <IntlMessages id={heading} />
                    </h1>
                    <br />
                </>
            )}
            {match.pathname !== '/' && <MantineBreadcrumbItems match={match} />}
        </>
    );
};

const MantineBreadcrumbItems = ({ match }) => {
    const path = match.pathname.substr(1);
    let paths = path.split('/');
    paths = paths.filter((x) => isNaN(x) && x.length > 0);

    return (
        <MBreadcrumb className='mb-4' separator={ <MdChevronRight style={{fontSize: '20px', position: 'relative', top: '-3px'}} /> }>
            <NavLink to={'/'}>
                <span style={{fontSize: '1rem', top: '-1px'}} className='relative text-link'><MdHome /></span>
            </NavLink>
            {paths.map((sub, index) => {
                return (
                    <NavLink key={index} to={`/${getUrl(path, sub)}`} >
                        {getMenuTitle(sub)}
                    </NavLink>
                );
            })}
        </MBreadcrumb>
    )

}

export default BreadcrumbContainer;
