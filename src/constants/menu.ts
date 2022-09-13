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
        to: `/billing`,
    },
    {
        id: 'business',
        icon: 'iconsminds-shop-2',
        label: 'menu.business-profile',
        to: `/business-profile`,
    },
    {
        id: 'administration',
        icon: 'iconsminds-gear',
        label: 'menu.administration',
        roles: [UserRole.Admin],
        to: `/administration`,
        subs: [
            {   
                icon: 'iconsminds-mens',
                label: 'menu.manage-users',
                to: `/administration/users`,
            },
            // {
            //     icon: 'iconsminds-mail-settings',
            //     label: 'menu.notification-settings',
            //     to: `/administration/notification-settings`,
            // }
        ]
    },
];
export default data;
