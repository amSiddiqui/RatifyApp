import { getCurrentLanguage, setCurrentLanguage } from "../helpers/Utils";
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = { locale: getCurrentLanguage() };

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        changeLocale: (state, action: PayloadAction<string>) => {
            setCurrentLanguage(action.payload);
            state.locale = action.payload;
        }
    }
});

export const settingsActions = settingsSlice.actions;

export default settingsSlice;