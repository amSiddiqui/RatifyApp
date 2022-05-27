import { BaseResponse } from "./AuthTypes"

export type DocumentsResponseType = {
    id: string
    filename: string
}

export interface ContractCreateResponseType extends BaseResponse {
    id: number;
}

export interface Agreement {
    id: number;
    title: string;
    description: string;
    end_date: string | null;
    signed_before: string | null;
    sequence: boolean;
    draft: boolean;
    sent: boolean;
    sent_on: string | null;
    user: number;
    organization: number;
    documents: number[],
    created_at: string;
    updated_at: string;
}

export interface AgreementTemplate {
    id: number;
    name: string;
    description: string;
    category: string;
    documents: number[],
    user: number;
    created_at: string;
    updated_at: string;
    organization: number;
}

export interface Signer {
    id: number;
    step: number;
    color: string;
    type: string;
    name: string;
    email: string;
    job_title: string;
    text_field: boolean;
    every: number;
    approved: boolean;
    declined: boolean;
    last_seen: string | null;
    every_unit: string;
    deleted: boolean;
    agreement: number;
    signed: boolean;
    signed_on: string | null;
    updated_at: string;
    created_at: string;
}

export interface SyncSignerResponse {
    ids: {[uid: string]: number};
}

export interface SingerElementStyleProps {
    step: number;
    color: string;
    type: 'signer' | 'approver' | 'viewer';
    uid: string;
}

export interface SignerElementFormProps {
    uid: string;
    name: string;
    email: string;
    job_title?: string;
    text_field?: boolean;
    every?: number;
    every_unit?: 'days' | 'weeks' | 'months' | 'years' | '0' | string;
}

export interface SignerElement extends SingerElementStyleProps, SignerElementFormProps {
    id: number;
}

export interface InputField {
    id: number;
    type: string;
    x: number;
    y: number;
    placeholder: string;
    required: boolean;
    value: string;
    color: string;
    completed: boolean;
    page: number;
    signer: number;
}

export type GetAgreementResponse = {
    agreement: Agreement;
    signers: Signer[];
    input_fields: InputField[];
}

export type SignerAgreementData = {
    status: 'success' | 'error',
    valid: boolean, 
    data: {
        agreement: Agreement;
        signer: Signer;
        clientName: string;
        clientLogo: string;
    }
}

export type SignerPdfResponse = {
    status: 'success' | 'error',
    valid: boolean,
    data: string;
}

export type SignerPdfThumbnails = {
    status: 'success' | 'error',
    valid: boolean,
    data: {
        [id: string]: string;
    }
}

export type SignerInputElements = {
    status: 'success' | 'error',
    valid: boolean,
    data: InputField[];
}

export type SignerErrorTypes =  'DELETED' | 'EXPIRED' | 'SEQUENCE' | 'UNAUTHORIZED' | 'SERVER';

export type SignerComment = {
    id: number;
    comment: string;
    signer: string;
    signerId: number | null;
    userId: number | null;
    user: string;
    agreement: number;
    created_at: string;
    updated_at: string;
}
