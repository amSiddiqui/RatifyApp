import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import jwtDecode from 'jwt-decode';
import { AuthInitialStateType, TokenType, UserType } from '../types/AuthTypes'

const initialState = {isAuthenticated: false, user: null, error: false, loading: true, message: '', image: null} as AuthInitialStateType;

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action:PayloadAction<TokenType>) => {
            const { access, refresh } = action.payload as TokenType;
            
            localStorage.setItem('tokens', JSON.stringify({
                access,
                refresh,
            }));
            state.isAuthenticated = true;
            state.error = false;
            state.loading = false;
            state.message = '';
        },

        logout: (state) => {
            localStorage.removeItem('tokens');
            state.isAuthenticated = false;
            state.user = null;
            state.error = false;
            state.loading = false;
            state.message = '';
        },

        accessTokenRefreshed: (state, action:PayloadAction<string>) => {
            const accessToken = action.payload;
            let tokensStr = localStorage.getItem('tokens');
            if (tokensStr) {
                let tokens = JSON.parse(tokensStr) as TokenType;
                tokens.access = accessToken;
                localStorage.setItem('tokens', JSON.stringify(tokens));
                state.user = jwtDecode(accessToken);
            } else {
                state.isAuthenticated = false;
                state.user = null;
            }
            state.isAuthenticated = true;
            state.error = false;
            state.loading = false;
            state.message = '';
        },
        
        setLoading: (state) => {
            state.error = false;
            state.loading = true;
            state.message = '';
        },

        setError: (state, action:PayloadAction<string>) => {
            state.isAuthenticated = false;
            state.error = true;
            state.loading = false;
            state.message = action.payload;
            localStorage.removeItem('tokens');
        },

        setUser: (state, action:PayloadAction<UserType>) => {
            state.user = action.payload;
        },

        setUserName: (state, action:PayloadAction<{ first_name: string, last_name: string }>) => {
            if (state.user) {
                state.user.first_name = action.payload.first_name;
                state.user.last_name = action.payload.last_name;
            }
        },

        setUserVerified: (state, action:PayloadAction<boolean>) => {
            if (state.user) {
                state.user.verified = action.payload;
            }
        },

        setImage: (state, action:PayloadAction<string>) => {
            state.image = action.payload;
        }
    }
});



export const authActions = authSlice.actions;

export default authSlice;