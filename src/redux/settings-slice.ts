import { getCurrentLanguage, setCurrentLanguage } from "../helpers/Utils";
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LocaleTypes } from "../lang";

const initialState = { locale: getCurrentLanguage() };

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        changeLocale: (state, action: PayloadAction<LocaleTypes>) => {
            setCurrentLanguage(action.payload);
            state.locale = action.payload;
        }
    }
});

export const settingsActions = settingsSlice.actions;

export default settingsSlice;