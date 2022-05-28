import axios from './axiosInstance';
import { AxiosResponse } from 'axios';
import {
    TokenType,
    SignUpDataType,
    UserType,
    Organization,
    UserSettingsWithImage,
} from '../types/AuthTypes';
import { authActions } from '../redux/auth-slice';
import { LoginDataType } from '../types/AuthTypes';
import { ApiHelper } from './ApiHelper';
import { NoTokenError } from '../types/ErrorTypes';

export class AuthHelper extends ApiHelper {
    async loginRequest({ email, password }: LoginDataType) {
        this.dispatchFn(authActions.setLoading());
        try {
            let response: AxiosResponse<TokenType> = await axios.post(
                '/auth/token/',
                { email, password },
            );
            this.dispatchFn(authActions.login(response.data));
            this.updateToken();
        } catch (err: any) {
            // check status code
            this.dispatchFn(authActions.setError('Wrong email or password.'));
            throw err;
        }
    }

    async registerRequest(data: SignUpDataType) {
        this.dispatchFn(authActions.setLoading());
        try {
            let response: AxiosResponse<TokenType> = await axios.post(
                '/auth/register/',
                data,
            );
            this.dispatchFn(authActions.login(response.data));
            this.updateToken();
        } catch (err) {
            this.dispatchFn(authActions.setError('Wrong email or password.'));
            throw err;
        }
    }

    async getUser(): Promise<UserType> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        try {
            let response: AxiosResponse<UserType> = await axios.get(
                '/auth/user/',
                { headers: { Authorization: `Bearer ${token}` } },
            );
            this.dispatchFn(authActions.setUser(response.data));
            return response.data;
        } catch (err: any) {
            if (err.response && err.response.status === 401) {
                this.dispatchFn(authActions.logout());
                throw new NoTokenError('No token');
            }
            throw err;
        }
    }


    async updateUser(userData: UserSettingsWithImage) {
        await axios.put(
            `/auth/user/`,
            userData,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
    }

    async getUserOrganization() {
        let token = await this.getToken();
        if (token !== null) {
            let response: AxiosResponse<Organization> = await axios.get(
                'auth/user/organization/',
                { headers: { Authorization: `Bearer ${token}` } },
            );
            return response.data;
        }
        throw new NoTokenError('No token');
    }
}
