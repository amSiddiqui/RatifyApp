import React from 'react';

import TopNav from '../../containers/navs/Topnav';
import Sidebar from '../../containers/navs/Sidebar';
import Footer from '../../containers/navs/Footer';
import { useSelector, useDispatch } from 'react-redux';
import { menuActions } from '../../redux/menu-slice';
import { AuthHelper } from '../../helpers/AuthHelper';
import { useLocation } from 'react-router-dom';

const AppLayout = ({ children }) => {
  const dispatchFn = useDispatch();
  const [user, setUser] = React.useState(null);
  const authHelper = React.useMemo(() => new AuthHelper(dispatchFn), [dispatchFn]);
  const [loading, setLoading] = React.useState(true);
  const location = useLocation();
  
  const setContainerClassnames = (a, b, c) => {
    dispatchFn(menuActions.setContainerClassnames(a, b, c));
  }

  const changeSelectedMenuHasSubItems = (value) => {
    dispatchFn(menuActions.changeSelectedMenuHasSubItems(value));
  }

  const addContainerClassname = (classname, strCurrentClasses) => {
    dispatchFn(menuActions.addContainerClassname(classname));
  }

  const menu = useSelector(root => root.menu);

  React.useEffect(() => {
    authHelper.getUser().then(user => {
      setUser(user);
    }).finally(() => {
      setLoading(false);
    });
  }, [authHelper]);

  if (loading) {
    return <div className='loading'></div>
  }

  console.log({menu});
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