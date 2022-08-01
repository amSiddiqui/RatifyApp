import React from 'react';

import TopNav from '../../containers/navs/Topnav';
import Sidebar from '../../containers/navs/Sidebar';
import Footer from '../../containers/navs/Footer';
import { useSelector, useDispatch } from 'react-redux';
import { menuActions } from '../../redux/menu-slice';
import { AuthHelper } from '../../helpers/AuthHelper';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const AppLayout = ({ children }) => {
    const dispatchFn = useDispatch();
    const [user, setUser] = React.useState(null);
    const authHelper = React.useMemo(
        () => new AuthHelper(dispatchFn),
        [dispatchFn]
    );
    const [loading, setLoading] = React.useState(true);
    const location = useLocation();

    const setContainerClassnames = (a, b, c) => {
        dispatchFn(
            menuActions.setContainerClassnames({
                clickIndex: a,
                strCurrentClasses: b,
                selectedMenuHasSubItems: c,
            })
        );
    };

    const changeSelectedMenuHasSubItems = (value) => {
        dispatchFn(menuActions.changeSelectedMenuHasSubItems(value));
    };

    const addContainerClassname = (classname, strCurrentClasses) => {
        dispatchFn(menuActions.addContainerClassname(classname));
    };

    const menu = useSelector((root) => root.menu);

    React.useEffect(() => {
        let shouldUpdate = true;
        authHelper
            .getUser()
            .then((user) => {
                setUser(user);
            })
            .catch(err => {
                if (shouldUpdate) {
                    if (err.response && err.response.status === 401) {
                        toast.error('Session expired, please login again');
                    }
                }
            })
            .finally(() => {
                if (shouldUpdate) {
                    setLoading(false);
                }
            });
        return () => {shouldUpdate = false};
    }, [authHelper]);

    if (loading) {
        return <div className="loading"></div>;
    }

    return (
        <div id="app-container" className={menu.containerClassName}>
            <TopNav />
            <Sidebar
                containerClassnames={menu.containerClassName}
                subHiddenBreakpoint={menu.subHiddenBreakpoint}
                menuHiddenBreakpoint={menu.menuHiddenBreakpoint}
                menuClickCount={menu.menuClickCount}
                selectedMenuHasSubItems={menu.selectedMenuHasSubItems}
                currentUser={user}
                setContainerClassnames={setContainerClassnames}
                addContainerClassname={addContainerClassname}
                changeSelectedMenuHasSubItems={changeSelectedMenuHasSubItems}
                location={location}
            />
            <main>
                <div className="container-fluid">{children}</div>
            </main>
            <Footer />
        </div>
    );
};

export default AppLayout;
