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
    send: boolean;
    user: number;
    organization: number;
    documents: number[],
    created_at: string;
    updated_at: string;
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
    value: string;
    color: string;
    page: number;
    signer: number;
}

export type GetAgreementResponse = {
    agreement: Agreement;
    signers: Signer[];
    input_fields: InputField[];
}