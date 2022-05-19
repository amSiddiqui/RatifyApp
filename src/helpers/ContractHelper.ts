import { ApiHelper } from './ApiHelper';
import { AxiosResponse } from 'axios';
import { NoTokenError } from '../types/ErrorTypes';
import axios from './axiosInstance';
import {
    Agreement,
    AgreementTemplate,
    ContractCreateResponseType,
    DocumentsResponseType,
    GetAgreementResponse,
    SyncSignerResponse,
} from '../types/ContractTypes';
import { BaseResponse } from '../types/AuthTypes';
import { SignerElement } from '../types/ContractTypes';
import { PdfFormInputType } from '../views/app/contract-agreements/types';

export class ContractHelper extends ApiHelper {
    async getPdfDocument(id: string): Promise<string> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response: AxiosResponse<string> = await axios.get(
            '/contracts/doc/' + id + '/',
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data;
    }

    async getPdfThumbnails(id: string): Promise<{ [id: string]: string }> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response: AxiosResponse<{ [id: string]: string }> = await axios.get(
            '/contracts/thumbnail/' + id + '/',
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data;
    }

    async getPdfCover(id: string): Promise<string> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response: AxiosResponse<string> = await axios.get(
            '/contracts/cover/' + id + '/',
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data;
    }

    async uploadDocument(
        file: File,
        onUploadProgress: (progressEvent: any) => void,
    ) {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let formData = new FormData();
        formData.append('file', file);
        const response = await axios.post<{
            status: string;
            message: string;
            id: number;
        }>('/contracts/new/upload/', formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
                'Content-Disposition':
                    'attachments; filename="' + file.name + '"',
                'Content-Length': file.size,
            },
            onUploadProgress: onUploadProgress,
        });
        return response.data;
    }

    async createAgreement(document_id: number, name?: string) {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let agreementName = '';
        if (name) {
            agreementName = name;
        }
        const response = await axios.post<ContractCreateResponseType>(
            `/contracts/new/`,
            { document_id: document_id, name: agreementName },
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data;
    }

    async updateAgreementTitle(
        id: string,
        title: string,
        description: string,
    ): Promise<BaseResponse> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        const response = await axios.put<BaseResponse>(
            `/contracts/${id}/title/`,
            { title: title, description: description },
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data;
    }

    async updateAgreementDateSequence(
        id: string,
        end_date: string | null,
        signed_before: string | null,
        sequence: boolean,
    ): Promise<BaseResponse> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        const response = await axios.put<BaseResponse>(
            `/contracts/${id}/dates/`,
            {
                end_date: end_date,
                signed_before: signed_before,
                sequence: sequence,
            },
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data;
    }

    async getAgreement(id: string): Promise<GetAgreementResponse> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response: AxiosResponse<GetAgreementResponse> = await axios.get(
            '/contracts/' + id + '/',
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data;
    }

    async syncSigners(
        contract_id: string,
        signers: SignerElement[],
    ): Promise<SyncSignerResponse> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response = await axios.post<SyncSignerResponse>(
            `/contracts/${contract_id}/signers/`,
            { signers },
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data;
    }

    async syncInputField(
        contract_id: string,
        input_fields: PdfFormInputType[],
    ): Promise<SyncSignerResponse> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response = await axios.post<SyncSignerResponse>(
            `/contracts/${contract_id}/inputs/`,
            { input_fields },
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data;
    }

    async getDrafts(): Promise<Agreement[]> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response: AxiosResponse<Agreement[]> = await axios.get(
            '/contracts/drafts/',
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data;
    }

    async getAllDocuments(): Promise<DocumentsResponseType[]> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response: AxiosResponse<DocumentsResponseType[]> = await axios.get(
            '/contracts/doc/',
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data;
    }

    async getAgreementTemplateCategories(): Promise<string[]> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response: AxiosResponse<string[]> = await axios.get(
            '/contracts/templates/categories/',
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data;
    }

    async saveAgreementTemplate(contractId: string, name: string, description: string, category: string):Promise<{id: number}> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response: AxiosResponse<{id: number}> = await axios.post(
            `/contracts/templates/`, {contract_id: contractId, name: name, description, category},
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data;
    }

    async getAgreementTemplates(): Promise<AgreementTemplate[]> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response: AxiosResponse<AgreementTemplate[]> = await axios.get(
            '/contracts/templates/',
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data;
    }

    async sendAgreement(id: string): Promise<{status: string, signer_status: {[id: number]: string}}> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response: AxiosResponse<{status: string, signer_status: {[id: number]: string}}> = await axios.post(
            `contracts/${id}/send/`,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data;
    }
}
