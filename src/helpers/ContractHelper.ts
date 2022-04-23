import { ApiHelper } from "./ApiHelper";
import { AxiosResponse } from 'axios';
import { NoTokenError } from '../types/ErrorTypes';
import axios from './axiosInstance';

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

}