import axios from './axiosInstance';
import { AxiosResponse } from 'axios';
import {
    TokenType,
    SignUpDataType,
    UserType,
    Organization,
    UserSettingsWithImage,
    OrganizationBasicInfo,
    OrganizationContactInfo,
    LegalEntity,
    BusinessFunction,
    OrganizationNameResponse,
} from '../types/AuthTypes';
import { authActions } from '../redux/auth-slice';
import { LoginDataType } from '../types/AuthTypes';
import { ApiHelper } from './ApiHelper';
import { NoTokenError } from '../types/ErrorTypes';

export class AuthHelper extends ApiHelper {
    async loginRequest({ email, password, rememberMe }: LoginDataType) {
        this.dispatchFn(authActions.setLoading());
        try {
            let response: AxiosResponse<TokenType> = await axios.post(
                '/auth/token/',
                { email, password, rememberMe },
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

    async updateUserName(firstName: string, lastName: string) {
        await axios.put(
            `/auth/user/name/`,
            {firstName, lastName},
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );

        this.dispatchFn(authActions.setUserName({first_name: firstName, last_name: lastName}));
    }

    async getOrganization() {
        let token = await this.getToken();
        if (token !== null) {
            let response: AxiosResponse<Organization> = await axios.get(
                '/auth/user/organization/',
                { headers: { Authorization: `Bearer ${token}` } },
            );
            return response.data;
        }
        throw new NoTokenError('No token');
    }

    async getOrganizationLegalEntities() {
        let response: AxiosResponse<{legalEntity: LegalEntity[], businessFunction: BusinessFunction[]}> = await axios.get(
            `/auth/user/organization/entity/`,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
        return response.data;
    }

    async updateOrganizationName(data: {name: string, description: string} ) {
        await axios.put(
            `/auth/user/organization/name/`,
            data,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
    }

    async updateOrganizationLegalEntitiesAndBusinessFunction(data: {legalEntity: LegalEntity[], businessFunction: BusinessFunction[]}) {
        await axios.put(
            `/auth/user/organization/entity/`,
            data,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
    }

    async updateOrganizationLegalEntities(data: {legalEntity: LegalEntity[], skip: boolean}) {
        await axios.put(
            `/auth/user/organization/legal-entities/`,
            data,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
    }

    async updateOrganizationBusinessFunction(data: { businessFunction: BusinessFunction[], skip: boolean }) {
        await axios.put(
            `/auth/user/organization/business-function/`,
            data,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
    }
    
    
    async getOrganizationName() {
        let response: AxiosResponse<OrganizationNameResponse> = await axios.get(
            `/auth/user/organization/name/`,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        )
        return response.data;
    }

    async updateOrganizationBasicInfo(data: OrganizationBasicInfo) {
        await axios.put(
            `/auth/user/organization/basic/`,
            data,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
    }

    async updateOrganizationContact(data: OrganizationContactInfo) {
        await axios.put(
            `/auth/user/organization/contact/`,
            data,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
    }

    async getOrganizationLogo() {
        let response: AxiosResponse<string> = await axios.get(
            `/auth/user/organization/logo/`,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
        return response.data;
    }

    async updateOrganizationLogo(logo: string) {
        await axios.put(
            `/auth/user/organization/logo/`,
            {img: logo},
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
    }

    async deleteOrganizationLogo() {
        await axios.delete(
            `/auth/user/organization/logo/`,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
    }

    async getUserVerified() {
        let response: AxiosResponse<{verified: boolean, last_verification_sent: string}> = await axios.get(
            `/auth/user/verified/`,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        )
        return response.data;
    }

    async sendVerificationLink() {
        await axios.post(
            `/auth/user/resend-verification/`,
            {},
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
    }

    async deleteProfileImage() {
        await axios.delete(
            `/auth/user/image/`,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
    }

    async generatePasswordResetLink(email: string) {
        await axios.post(
            `/auth/user/forgot-password/`,
            { email },
        );
    }

    async resetPassword(data: {token: string, password: string, confirm_password: string}) {
        let response:AxiosResponse<{email: string}> = await axios.post(
            `/auth/user/reset-password/`,
            data,
        );

        return response.data;
    }
}
