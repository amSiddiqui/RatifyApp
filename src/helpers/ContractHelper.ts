import { ApiHelper } from './ApiHelper';
import { AxiosResponse } from 'axios';
import { NoTokenError } from '../types/ErrorTypes';
import axios from './axiosInstance';
import {
    Agreement,
    AgreementProgressType,
    AgreementRowData,
    AgreementTemplate,
    AuditTrailData,
    ContractCreateResponseType,
    DocumentsResponseType,
    GetAgreementResponse,
    Signer,
    SignerAgreementData,
    SignerComment,
    SignerErrorTypes,
    SignerInputElements,
    SignerPdfResponse,
    SignerPdfThumbnails,
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

    async getFinalPdf(id: string) {
        const response:AxiosResponse<string> = await axios.get(
            `/contracts/${id}/final-pdf/`,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
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
        start_date: string | null,
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
                start_date: start_date
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

    async getAllAgreements() {
        let response: AxiosResponse<AgreementRowData[]> = await axios.get(
            `/contracts/`,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
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

    async getSigners(
        contract_id: string
    ) {
        let response: AxiosResponse<{'signers': Signer[]}> = await axios.get(
            `/contracts/${contract_id}/signers/`,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
        return response.data;
    }

    async updateInputFieldSettings(id: number, placeholder: string, required: boolean) {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        await axios.post<BaseResponse>(
            `/contracts/inputs/update/`,
            { id: id, placeholder: placeholder, required: required },
            { headers: { Authorization: `Bearer ${token}` } },
        );
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

    async saveAgreementTemplate(
        contractId: string,
        name: string,
        description: string,
        category: string,
    ): Promise<{ id: number }> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response: AxiosResponse<{ id: number }> = await axios.post(
            `/contracts/templates/`,
            { contract_id: contractId, name: name, description, category },
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

    async sendAgreement(
        id: string,
    ): Promise<{ status: string; signer_status: { [id: number]: string } }> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response: AxiosResponse<{
            status: string;
            signer_status: { [id: number]: string };
        }> = await axios.post(
            `contracts/${id}/send/`,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data;
    }

    async deleteAgreement(id: string, message?: string) {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        await axios.post(`/contracts/${id}/delete/`, {
            message: message || '',
        }, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    async validateSignToken(token: string) {
        let response: AxiosResponse<{
            status: 'success' | 'error' | 'completed';
            valid: boolean;
            errorType: SignerErrorTypes;
            data: {
                signerEmail: string;
                signerName: string;
                organizationName: string;
                signerId: number;
                signerType: string;
                agreementId: number;
                senderEmail: string;
                fieldsCount: number;
                declined: boolean;
            }
        }> = await axios.get(`contracts/sign-token-validate/?token=${token}`);
        return response.data;
    }

    async getSignerData(token: string) {
        let response: AxiosResponse<SignerAgreementData> = await axios.get(
            `contracts/signer/data/?token=${token}`,
        );
        return response.data;
    }

    async getSignerClientLogo(token: string) {
        let response:AxiosResponse<{ status: string, valid: boolean, data: string }> = await axios.get(
            `/contracts/signer/client-logo/?token=${token}`
        );
        return response.data;
    }

    async getSignerPdf(token: string) {
        let response: AxiosResponse<SignerPdfResponse> = await axios.get(
            `contracts/signer/pdf/?token=${token}`,
        );
        return response.data;
    }

    async getSignerPdfThumbnails(token: string) {
        let response: AxiosResponse<SignerPdfThumbnails> = await axios.get(
            `contracts/signer/pdf/thumbnails/?token=${token}`,
        )
        return response.data;
    }

    async getSignerInputElements(token: string) {
        let response: AxiosResponse<SignerInputElements> = await axios.get(
            `contracts/signer/inputs/?token=${token}`,
        );
        return response.data;
    }

    async getSignerOtherInputElements(token:string) {
        let response: AxiosResponse<SignerInputElements> = await axios.get(
            `contracts/signer/other-inputs/?token=${token}`
        );
        return response.data;
    }

    async completeSigningProcess(token: string) {
        await axios.post(
            `contracts/signer/complete/?token=${token}`,
            {},
        );
    }

    async updateSignerResponse(token: string, data:Array<{id: number, completed: boolean, value: string}>) {
        let response: AxiosResponse<{status: string, valid: boolean}> = await axios.post(
            `contracts/signer/sign/`,
            {token, responses: data}
        );
        return response.data;
    }

    async getSignerComments(token: string, type: 'signer' | 'sender') {
        let response: AxiosResponse<{ status: 'success' | 'error', valid: boolean, data: SignerComment[] }>;
        if (type === 'signer') {
            response = await axios.get(
                `contracts/signer/comment/?token=${token}`
            );
        } else {
            let jwtToken = await this.getToken();
            if (jwtToken === null) {
                throw new NoTokenError('No token');
            }
            response = await axios.get(
                `contracts/${token}/comment/`,
                { headers: { Authorization: `Bearer ${jwtToken}` } }
            );
        }
        return response.data;
    }

    async createSignerComment(token: string, comment: string, type: 'signer' | 'sender') {
        let response: AxiosResponse<{ status: 'success' | 'error', valid: boolean, data: SignerComment }>;
        if (type === 'signer') {
            response = await axios.post(
                `contracts/signer/comment/?token=${token}`,
                { comment },
            );
        } else {
            response = await axios.post(
                `contracts/${token}/comment/`,
                { comment },
                { headers: { Authorization: `Bearer ${await this.getToken()}` } },
            );
        }
        return response.data;
    }

    async updateSignerComment(token:string, id: number, comment: string, type: 'signer' | 'sender') {
        let response: AxiosResponse< { status: 'success' | 'error', valid: boolean, data: SignerComment } >;
        if (type === 'signer') {
            response = await axios.put(
                `contracts/signer/comment/${id}/?token=${token}`,
                { comment },
            );
        } else {
            response = await axios.put(
                `contracts/${token}/comment/${id}/`,
                { comment },
                { headers: { Authorization: `Bearer ${await this.getToken()}` } },
            );
        }
        return response.data;
    }

    async deleteSignerComment(token: string, id: number, type: 'signer' | 'sender') {
        let response: AxiosResponse< { status: 'success' | 'error', valid: boolean } >;
        if (type === 'signer') {
            response = await axios.post(
                `contracts/signer/comment/${id}/delete/?token=${token}`,
                {},
            );
        } else {
            response = await axios.delete(
                `contracts/${token}/comment/${id}/`,
                { headers: { Authorization: `Bearer ${await this.getToken()}` } },
            );
        }
        return response.data;
    }

    async getSignerProgress(token: string) {
        let response: AxiosResponse<AgreementProgressType> = await axios.get(
            `contracts/signer/progress/?token=${token}`,
        );
        return response.data;
    }

    async sendDocumentAgain(id: number, name: string, email: string) {
        await axios.post(
            `contracts/signer/send/`,
            { id, name, email },
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
    }

    async getSignerSenderProgress(id: string) {
        let response: AxiosResponse<AgreementProgressType> = await axios.get(
            `contracts/${id}/signers/progress/`,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
        return response.data;
    }

    async updateAgreementTemplate(id: number, {name, category, description}: {name: string, category: string, description: string}) {
        await axios.put(
            `contracts/templates/${id}/`,
            { name, category, description },
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
    }

    async deleteAgreementTemplate(id: number) {
        await axios.delete(
            `contracts/templates/${id}/`,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
    }

    async getAuditTrail(id: string) {
        let response: AxiosResponse<{status: string, data: AuditTrailData[]}> = await axios.get(
            `contracts/${id}/trail/`,
            { headers: { Authorization: `Bearer ${await this.getToken()}` } },
        );
        return response.data;
    }

    async getSignerAuditTrail(token: string) {
        let response: AxiosResponse<{status: string, data: AuditTrailData[], valid: boolean}> = await axios.get(
            `contracts/signer/trail/?token=${token}`,
        );
        return response.data;
    }

    async getSignerDeclineInfo(token: string) {
        let response: AxiosResponse<{ status: string, valid: boolean, data: { declined: boolean, declineMessage: string, signerType: string, senderName: string } }> = await axios.get(
            `contracts/signer/decline/?token=${token}`,
        );
        return response.data;
    }

    async getSignerSuccessInfo(token: string) {
        let response: AxiosResponse<{ status: string, valid: boolean, data: { organizationName: string, signerType: string, senderName: string }}> = await axios.get(
            `contracts/signer/success/?token=${token}`,
        );
        return response.data;
    }

    async signerDecline(token: string, declineMessage: string) {
        await axios.post(
            `contracts/signer/decline/?token=${token}`,
            { message: declineMessage },
        );
    }
} 
