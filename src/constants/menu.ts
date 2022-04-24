const data = [
    {
        id: 'dashboard',
        icon: 'iconsminds-dashboard',
        label: 'menu.dashboards',
        to: `/`,
    },
    {
        id: 'documents',
        icon: 'iconsminds-notepad',
        label: 'menu.agreements',
        to: `/documents`,
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
    },
    {
        id: 'reports',
        icon: 'iconsminds-monitor-analytics',
        label: 'menu.reports',
        to: `/reports`,
    },
];
export default data;
