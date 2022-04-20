import { adminRoot } from './defaultValues';
// import { UserRole } from 'helpers/authHelper'

const data = [
    {
        id: 'dashboard',
        icon: 'iconsminds-dashboard',
        label: 'menu.dashboards',
        to: `${adminRoot}`,
    },
    {
        id: 'account',
        icon: 'iconsminds-user',
        label: 'account.account',
        to: `/account`,
        subs: [
            {
                icon: 'simple-icon-user',
                label: 'account.settings.profile',
                to: '/account/profile-settings',
            },
            {
                icon: 'simple-icon-puzzle',
                label: 'account.settings.ui',
                to: '/account/ui-settings',
            },
        ]
    }
];
export default data;
