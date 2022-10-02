import { UserRole } from "./defaultValues";

const data = [
    {
        id: 'dashboard',
        icon: 'iconsminds-dashboard',
        label: 'menu.dashboards',
        to: `/`,
    },
    {
        id: 'agreements',
        icon: 'iconsminds-box-with-folders',
        label: 'menu.agreements',
        to: `/agreements`,
    },
    {
        id: 'reports',
        icon: 'iconsminds-monitor-analytics',
        label: 'menu.reports',
        to: `/reports`,
    },
    {
        id: 'account',
        icon: 'iconsminds-profile',
        label: 'menu.account',
        to: `/profile-settings`,
    },
    {
        id: 'billing',
        icon: 'iconsminds-billing',
        label: 'menu.billing',
        roles: [UserRole.Admin],
        to: `/billing`,
    },
    {
        id: 'business',
        icon: 'iconsminds-shop-2',
        label: 'menu.business-profile',
        to: `/business-profile`,
    },
    {
        id: 'user-management',
        icon: 'iconsminds-mens',
        label: 'menu.manage-users',
        roles: [UserRole.Admin],
        to: `/administration/users`,
    },
];
export default data;
