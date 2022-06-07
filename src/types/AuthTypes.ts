export type UserType = {
    id: number;
    first_name: string;
    last_name: string;
    verified: boolean;
    img: string;
    last_seen: string;
    role: number;
    email: string;
};

export interface UserSettingsFormType {
    email: string;
    firstName: string;
    changePassword: boolean;
    lastName?: string;
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
};

export interface UserSettingsWithImage extends UserSettingsFormType {
    img?: string;
    imgUpdated: boolean;
}


export type Organization = {
    id: number;
    name: string;
    description: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    created_at: string;
    updated_at: string;
}

export interface Address {
    address1: string;
    address2: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
}

export interface OrganizationBasicInfo {
    id: number;
    name: string;
    description: string;
    website: string;
    billingAddress: Address;
    companyAddressSame: boolean;
    companyAddress?: Address;
}

export interface Contact {
    name: string;
    email: string;
    phone: string;
}

export interface LegalEntity {
    id: number;
    name: string;
    description: string;
}

export interface BusinessFunction {
    id: number;
    label: string;
    entity: string;
}

export interface BusinessLegalEntities {
    legalEntity: LegalEntity[];
    businessFunctions: BusinessFunction[];
}

export interface OrganizationContactInfo {
    primaryContact: Contact;
    showSecondaryContact: boolean;
    secondaryContact?: Contact;
    sameBillingContact: boolean;
    billingContact?: Contact;
}

export type AuthInitialStateType = {
    isAuthenticated: boolean;
    user: UserType | null;
    error: boolean;
    loading: boolean;
    message: string;
    image: string | null;
};

export type LoginDataType = {
    email: string;
    password: string;
};

export type SignUpDataType = {
    email: string;
    password: string;
    confirm_password: string;
};

export type TokenType = {
    access: string;
    refresh: string;
};

export type JWTType = {
    token_type: string;
    exp: number;
    iat: number;
    jti: string;
    user_id: number;
};

export interface BaseResponse {
    status: string;
    message: string;
}
