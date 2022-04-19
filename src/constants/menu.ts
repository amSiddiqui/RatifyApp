import { adminRoot } from "./defaultValues";
// import { UserRole } from "helpers/authHelper"

const data = [
    // {
    //     id: "gogo",
    //     icon: "iconsminds-air-balloon-1",
    //     label: "menu.gogo",
    //     to: `${adminRoot}/gogo`,
    //     // roles: [UserRole.Admin, UserRole.Editor],
    //     subs: [
    //         {
    //             icon: "simple-icon-paper-plane",
    //             label: "menu.start",
    //             to: `${adminRoot}/gogo/start`,
    //         },
    //     ],
    // },
    {
        id: "dashboard",
        icon: "iconsminds-dashboard",
        label: "menu.dashboards",
        to: `${adminRoot}`,
    },
];
export default data;
