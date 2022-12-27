import { UserRole } from "./defaultValues";

const data = [
    {
        id: 'dashboard',
        icon: 'iconsminds-dashboard',
        label: 'menu.dashboards',
        to: `/`,
        loggedIn: true,
    },
    {
        id: 'agreements',
        icon: 'iconsminds-box-with-folders',
        label: 'menu.agreements',
        to: `/agreements`,
        loggedIn: false,
    },
    {
        id: 'reports',
        icon: 'iconsminds-monitor-analytics',
        label: 'menu.reports',
        to: `/reports`,
        loggedIn: true,
    },
    {
        id: 'account',
        icon: 'iconsminds-profile',
        label: 'menu.account',
        to: `/profile-settings`,
        loggedIn: true,
    },
    {
        id: 'billing',
        icon: 'iconsminds-billing',
        label: 'menu.billing',
        roles: [UserRole.Admin],
        to: `/billing`,
        loggedIn: true,
    },
    {
        id: 'business',
        icon: 'iconsminds-shop-2',
        label: 'menu.business-profile',
        to: `/business-profile`,
        loggedIn: true,
    },
    {
        id: 'user-management',
        icon: 'iconsminds-mens',
        label: 'menu.manage-users',
        roles: [UserRole.Admin],
        to: `/administration/users`,
        loggedIn: true,
    },
];
export default data;
