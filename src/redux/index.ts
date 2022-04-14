import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./auth-slice";
import menuSlice from "./menu-slice";
import settingsSlice from "./settings-slice";

const store = configureStore({
    reducer: {
        'auth': authSlice.reducer,
        'settings': settingsSlice.reducer,
        'menu': menuSlice.reducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;