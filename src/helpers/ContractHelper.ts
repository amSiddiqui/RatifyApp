import { ApiHelper } from "./ApiHelper";
import { AxiosResponse } from 'axios';
import { NoTokenError } from '../types/ErrorTypes';
import axios from './axiosInstance';
import { DocumentsResponseType } from "../types/ContractTypes";

export class ContractHelper extends ApiHelper {

    async getPdfDocument(id: string): Promise<string> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response: AxiosResponse<string> = await axios.get('/contracts/doc/'+id+'/', {headers: {Authorization: `Bearer ${token}`}});
        return response.data;
    }

    async getPdfThumbnails(id: string): Promise<{[id:string]: string}> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response: AxiosResponse<{[id:string]: string}> = await axios.get('/contracts/thumbnail/'+id+'/', {headers: {Authorization: `Bearer ${token}`}});
        return response.data;
    }

    async getPdfCover(id: string): Promise<string> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response: AxiosResponse<string> = await axios.get('/contracts/cover/'+id+'/', {headers: {Authorization: `Bearer ${token}`}});
        return response.data;
    }


    async uploadDocument(file:File, onUploadProgress: (progressEvent: any) => void) {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let formData = new FormData();
        formData.append('file', file);
        const response = await axios.post<{status: string, message: string, id: number}>('/contracts/new/upload/', formData, 
        {
            headers: {
                Authorization: `Bearer ${token}`, 
                'Content-Type': 'multipart/form-data',
                'Content-Disposition': 'attachments; filename="'+file.name+'"',
                'Content-Length': file.size,
            },
            onUploadProgress: onUploadProgress
        });
        return response.data;
    }

    async getAllDocuments(): Promise<DocumentsResponseType[]> {
        let token = await this.getToken();
        if (token === null) {
            throw new NoTokenError('No token');
        }
        let response: AxiosResponse<DocumentsResponseType[]> = await axios.get('/contracts/doc/', {headers: {Authorization: `Bearer ${token}`}});
        return response.data;
    }
}