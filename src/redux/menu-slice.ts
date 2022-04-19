import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  defaultMenuType,
  subHiddenBreakpoint,
  menuHiddenBreakpoint,
} from '../constants/defaultValues';

const initialState = {
  containerClassName: defaultMenuType,
  subHiddenBreakpoint: subHiddenBreakpoint,
  menuHiddenBreakpoint: menuHiddenBreakpoint,
  menuClickCount: 0,
  selectedMenuHasSubItems: false,
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    changeSelectedMenuHasSubItems: (state, action: PayloadAction<boolean>) => {
      state.selectedMenuHasSubItems = action.payload;
    },
    changeDefaultClassnames: (state, action: PayloadAction<string>) => {
      state.containerClassName = action.payload;
    },
    addContainerClassname: (state, action: PayloadAction<string>) => {
      state.containerClassName =
        state.containerClassName.indexOf(action.payload) === -1
          ? state.containerClassName + ' ' + action.payload
          : state.containerClassName;
    },
    clickOnMobileMenu: (state, action:PayloadAction<string>) => {
      const strCurrentClasses = action.payload;
      const currentClasses = strCurrentClasses
        ? strCurrentClasses
            .split(' ')
            .filter((x) => x !== '' && x !== 'sub-show-temporary')
        : '';
      let nextClasses = '';
      if (
        currentClasses !== '' &&
        currentClasses.includes('main-show-temporary')
      ) {
        nextClasses = currentClasses
          .filter((x) => x !== 'main-show-temporary')
          .join(' ');
      } else {
        nextClasses = `${
          currentClasses !== '' ? currentClasses.join(' ') : ''
        } main-show-temporary`;
      }

      state.containerClassName = nextClasses;
      state.menuClickCount = 0;
    },
    setContainerClassnames: (state, action:PayloadAction<{clickIndex: number, strCurrentClasses: string, selectedMenuHasSubItems: boolean}>) => {
      let clickIndex = action.payload.clickIndex;
      let strCurrentClasses = action.payload.strCurrentClasses;
      let selectedMenuHasSubItems = action.payload.selectedMenuHasSubItems;
      const currentClasses = strCurrentClasses
        ? strCurrentClasses.split(' ').filter((x) => x !== '')
        : '';
      let nextClasses = '';
      if (!selectedMenuHasSubItems) {
        if (
          currentClasses.includes('menu-default') &&
          (clickIndex % 4 === 0 || clickIndex % 4 === 3)
        ) {
          clickIndex = 1;
        }
        if (
          currentClasses.includes('menu-sub-hidden') &&
          clickIndex % 4 === 2
        ) {
          clickIndex = 0;
        }
        if (
          currentClasses.includes('menu-hidden') &&
          (clickIndex % 4 === 2 || clickIndex % 4 === 3)
        ) {
          clickIndex = 0;
        }
      }

      if (clickIndex % 4 === 0) {
        if (
          currentClasses.includes('menu-default') &&
          currentClasses.includes('menu-sub-hidden')
        ) {
          nextClasses = 'menu-default menu-sub-hidden';
        } else if (currentClasses.includes('menu-default')) {
          nextClasses = 'menu-default';
        } else if (currentClasses.includes('menu-sub-hidden')) {
          nextClasses = 'menu-sub-hidden';
        } else if (currentClasses.includes('menu-hidden')) {
          nextClasses = 'menu-hidden';
        }
        clickIndex = 0;
      } else if (clickIndex % 4 === 1) {
        if (
          currentClasses.includes('menu-default') &&
          currentClasses.includes('menu-sub-hidden')
        ) {
          nextClasses = 'menu-default menu-sub-hidden main-hidden sub-hidden';
        } else if (currentClasses.includes('menu-default')) {
          nextClasses = 'menu-default sub-hidden';
        } else if (currentClasses.includes('menu-sub-hidden')) {
          nextClasses = 'menu-sub-hidden main-hidden sub-hidden';
        } else if (currentClasses.includes('menu-hidden')) {
          nextClasses = 'menu-hidden main-show-temporary';
        }
      } else if (clickIndex % 4 === 2) {
        if (
          currentClasses.includes('menu-default') &&
          currentClasses.includes('menu-sub-hidden')
        ) {
          nextClasses = 'menu-default menu-sub-hidden sub-hidden';
        } else if (currentClasses.includes('menu-default')) {
          nextClasses = 'menu-default main-hidden sub-hidden';
        } else if (currentClasses.includes('menu-sub-hidden')) {
          nextClasses = 'menu-sub-hidden sub-hidden';
        } else if (currentClasses.includes('menu-hidden')) {
          nextClasses = 'menu-hidden main-show-temporary sub-show-temporary';
        }
      } else if (clickIndex % 4 === 3) {
        if (
          currentClasses.includes('menu-default') &&
          currentClasses.includes('menu-sub-hidden')
        ) {
          nextClasses = 'menu-default menu-sub-hidden sub-show-temporary';
        } else if (currentClasses.includes('menu-default')) {
          nextClasses = 'menu-default sub-hidden';
        } else if (currentClasses.includes('menu-sub-hidden')) {
          nextClasses = 'menu-sub-hidden sub-show-temporary';
        } else if (currentClasses.includes('menu-hidden')) {
          nextClasses = 'menu-hidden main-show-temporary';
        }
      }
      if (currentClasses.includes('menu-mobile')) {
        nextClasses += ' menu-mobile';
      }
        state.containerClassName = nextClasses;
        state.menuClickCount = clickIndex;
    },
  },
});

export const menuActions = menuSlice.actions;

export default menuSlice;
