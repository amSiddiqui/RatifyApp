import axios from './axiosInstance';
import { AxiosResponse } from 'axios';
import { JWTType, TokenType } from '../types/AuthTypes';
import { AppDispatch } from '../redux/index'
import { authActions } from '../redux/auth-slice';
import jwtDecode from 'jwt-decode';
import { NoTokenError } from '../types/ErrorTypes';

export class ApiHelper {
    tokens: TokenType | null;
    dispatchFn: AppDispatch;

    constructor(dispatchFn: AppDispatch) {
        this.dispatchFn = dispatchFn;
        let tokenStr = localStorage.getItem('tokens');
        if (tokenStr) {
            this.tokens = JSON.parse(tokenStr) as TokenType;
        } else {
            this.tokens = null;
        }
    }

    async getToken(): Promise<string | null> {
        if (this.tokens) {
            let token = this.tokens.access;
            let decoded = jwtDecode<JWTType>(token);
            if (decoded.exp * 1000 < Date.now()) {
                await this.refreshTokenRequest();
            }
            token = this.tokens.access;
            if (token) {
                return token;
            }
            return null;
        } else {
            return null;
        }
    }

    async getTokenOrThrow(): Promise<string | null> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        return token;
    }

    getRefreshToken(): string | null {
        if (this.tokens) {
            return this.tokens.refresh;
        } else {
            return null;
        }
    }

    updateToken() {
        let tokenStr = localStorage.getItem('tokens');
        if (tokenStr) {
            this.tokens = JSON.parse(tokenStr) as TokenType;
        } else {
            this.tokens = null;
        }
    }

    async refreshTokenRequest() {
        this.dispatchFn(authActions.setLoading());
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            this.dispatchFn(authActions.setError('No refresh token'));
            return;
        }
        try {
            let response: AxiosResponse<TokenType> = await axios.post('/auth/token/refresh/', {refresh: this.getRefreshToken()});
            this.dispatchFn(authActions.accessTokenRefreshed(response.data.access));
            this.updateToken();
        } catch(err) {
            this.dispatchFn(authActions.setError('Token expired'));
        }
    }
}