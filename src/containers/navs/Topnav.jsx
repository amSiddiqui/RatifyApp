/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-use-before-define */
import React, { useState } from 'react';
import { injectIntl } from 'react-intl';

import {
    UncontrolledDropdown,
    DropdownItem,
    DropdownToggle,
    DropdownMenu,
    Input,
} from 'reactstrap';

import { NavLink, useNavigate } from 'react-router-dom';

import {
    menuHiddenBreakpoint,
    searchPath,
    localeOptions,
    isDarkSwitchActive,
    adminRoot,
} from '../../constants/defaultValues';

import { MobileMenuIcon, MenuIcon } from '../../components/svg';
import { getDirection, setDirection } from '../../helpers/Utils';
import TopnavEasyAccess from './Topnav.EasyAccess';
import TopnavNotifications from './Topnav.Notifications';
import TopnavDarkSwitch from './Topnav.DarkSwitch';
import { useDispatch, useSelector } from 'react-redux';
import { settingsActions } from '../../redux/settings-slice';
import { menuActions } from '../../redux/menu-slice';
import { authActions } from '../../redux/auth-slice';

const TopNav = ({ intl }) => {
    const [isInFullScreen, setIsInFullScreen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { menu, settings, auth } = useSelector((root) => root);
    const selectedMenuHasSubItems = menu.selectedMenuHasSubItems;

    const search = () => {
        navigate(`${searchPath}?key=${searchKeyword}`);
        setSearchKeyword('');
    };

    const handleChangeLocale = (_locale, direction) => {
        dispatch(settingsActions.changeLocale(_locale));

        const currentDirection = getDirection().direction;
        if (direction !== currentDirection) {
            setDirection(direction);
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    };

    const isInFullScreenFn = () => {
        return (
            (document.fullscreenElement &&
                document.fullscreenElement !== null) ||
            (document.webkitFullscreenElement &&
                document.webkitFullscreenElement !== null) ||
            (document.mozFullScreenElement &&
                document.mozFullScreenElement !== null) ||
            (document.msFullscreenElement &&
                document.msFullscreenElement !== null)
        );
    };

    const handleSearchIconClick = (e) => {
        if (window.innerWidth < menuHiddenBreakpoint) {
            let elem = e.target;
            if (!e.target.classList.contains('search')) {
                if (e.target.parentElement.classList.contains('search')) {
                    elem = e.target.parentElement;
                } else if (
                    e.target.parentElement.parentElement.classList.contains(
                        'search'
                    )
                ) {
                    elem = e.target.parentElement.parentElement;
                }
            }

            if (elem.classList.contains('mobile-view')) {
                search();
                elem.classList.remove('mobile-view');
                removeEventsSearch();
            } else {
                elem.classList.add('mobile-view');
                addEventsSearch();
            }
        } else {
            search();
        }
        e.stopPropagation();
    };

    const handleDocumentClickSearch = (e) => {
        let isSearchClick = false;
        if (
            e.target &&
            e.target.classList &&
            (e.target.classList.contains('navbar') ||
                e.target.classList.contains('simple-icon-magnifier'))
        ) {
            isSearchClick = true;
            if (e.target.classList.contains('simple-icon-magnifier')) {
                search();
            }
        } else if (
            e.target.parentElement &&
            e.target.parentElement.classList &&
            e.target.parentElement.classList.contains('search')
        ) {
            isSearchClick = true;
        }

        if (!isSearchClick) {
            const input = document.querySelector('.mobile-view');
            if (input && input.classList) input.classList.remove('mobile-view');
            removeEventsSearch();
            setSearchKeyword('');
        }
    };

    const removeEventsSearch = () => {
        document.removeEventListener('click', handleDocumentClickSearch, true);
    };

    const addEventsSearch = () => {
        document.addEventListener('click', handleDocumentClickSearch, true);
    };

    const handleSearchInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            search();
        }
    };

    const toggleFullScreen = () => {
        const isFS = isInFullScreenFn();

        const docElm = document.documentElement;
        if (!isFS) {
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            } else if (docElm.msRequestFullscreen) {
                docElm.msRequestFullscreen();
            }
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        setIsInFullScreen(!isFS);
    };

    const handleLogout = () => {
        dispatch(authActions.logout());
        navigate('/');
    };

    const menuButtonClick = (e, _clickCount, _conClassnames) => {
        e.preventDefault();

        setTimeout(() => {
            const event = document.createEvent('HTMLEvents');
            event.initEvent('resize', false, false);
            window.dispatchEvent(event);
        }, 350);
        dispatch(
            menuActions.setContainerClassnames({
                clickIndex: _clickCount + 1,
                strCurrentClasses: _conClassnames,
                selectedMenuHasSubItems: selectedMenuHasSubItems,
            })
        );
    };

    const mobileMenuButtonClick = (e, _containerClassnames) => {
        e.preventDefault();
        dispatch(menuActions.clickOnMobileMenu(_containerClassnames));
    };

    const { messages } = intl;
    return (
        <nav className="navbar fixed-top">
            <div className="d-flex align-items-center navbar-left">
                <NavLink
                    to="#"
                    className="menu-button d-none d-md-block"
                    onClick={(e) =>
                        menuButtonClick(
                            e,
                            menu.menuClickCount,
                            menu.containerClassName
                        )
                    }
                >
                    <MenuIcon />
                </NavLink>
                <NavLink
                    to="#"
                    className="menu-button-mobile d-xs-block d-sm-block d-md-none"
                    onClick={(e) =>
                        mobileMenuButtonClick(e, menu.containerClassName)
                    }
                >
                    <MobileMenuIcon />
                </NavLink>

                <div className="search">
                    <Input
                        name="searchKeyword"
                        id="searchKeyword"
                        placeholder={messages['menu.search']}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyPress={(e) => handleSearchInputKeyPress(e)}
                    />
                    <span
                        className="search-icon"
                        onClick={(e) => handleSearchIconClick(e)}
                    >
                        <i className="simple-icon-magnifier" />
                    </span>
                </div>

                <div className="d-inline-block">
                    <UncontrolledDropdown className="ml-2">
                        <DropdownToggle
                            caret
                            color="light"
                            size="sm"
                            className="language-button"
                        >
                            <span className="name">
                                {settings.locale.toUpperCase()}
                            </span>
                        </DropdownToggle>
                        <DropdownMenu className="mt-3" right>
                            {localeOptions.map((l) => {
                                return (
                                    <DropdownItem
                                        onClick={() =>
                                            handleChangeLocale(
                                                l.id,
                                                l.direction
                                            )
                                        }
                                        key={l.id}
                                    >
                                        {l.name}
                                    </DropdownItem>
                                );
                            })}
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </div>
            </div>
            <NavLink className="navbar-logo" to={adminRoot}>
                <span className="logo d-none d-xs-block" />
                <span className="logo-mobile d-block d-xs-none" />
            </NavLink>

            <div className="navbar-right">
                {isDarkSwitchActive && <TopnavDarkSwitch />}
                <div className="header-icons d-inline-block align-middle">
                    <TopnavEasyAccess />
                    <TopnavNotifications />
                    <button
                        className="header-icon btn btn-empty d-none d-sm-inline-block"
                        type="button"
                        id="fullScreenButton"
                        onClick={toggleFullScreen}
                    >
                        {isInFullScreen ? (
                            <i className="simple-icon-size-actual d-block" />
                        ) : (
                            <i className="simple-icon-size-fullscreen d-block" />
                        )}
                    </button>
                </div>
                <div className="user d-inline-block">
                    <UncontrolledDropdown className="dropdown-menu-right">
                        <DropdownToggle className="p-0 topnav-account-dropdown justify-center items-center" color="empty">
                            <span className="name mr-1 inline">
                                {auth.user.first_name} {auth.user.last_name}
                            </span>
                            <span className='inline'>
                                <img
                                    alt="Profile"
                                    src="/static/img/default.jpg"
                                />
                            </span>
                        </DropdownToggle>
                        <DropdownMenu className="mt-3" right>
                            <DropdownItem>Account</DropdownItem>
                            <DropdownItem>Features</DropdownItem>
                            <DropdownItem>History</DropdownItem>
                            <DropdownItem>Support</DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem onClick={() => handleLogout()}>
                                Sign out
                            </DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </div>
            </div>
        </nav>
    );
};

export default injectIntl(TopNav);
