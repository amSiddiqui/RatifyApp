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

export type OrganizationUser = {
    id: number;
    email: string;
    role: 0 | 99 | 1;
    created_at: string;
    first_name: string;
    last_name: string;
    job_title: string;
    user_type: 0 | 1;
    image: string;
}

export type OrganizationUserDataResponse = {
    first_name: string;
    last_name: string;
    password: string;
    confirm_password: string;
}

export type NewUserData = {
    email: string;
    name: string;
    role: string;
    userType: string;
    jobTitle: string;
    legalEntity: string;
    businessFunction: string;
}

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

export type Organization = {
    id: number;
    name: string;
    description: string;
    website: string;
    companyAddressSame: boolean;
    companyAddress: Address | null;
    billingAddress: Address | null;
    primaryContact: Contact | null;
    showSecondaryContact: boolean;
    secondaryContact: Contact | null;
    sameBillingContact: boolean;
    billingContact: Contact | null;
    stepsCompleted: number;
    created_at: string;
    updated_at: string;
}

export type OrganizationNameResponse = {
    name: string;
    description: string;
    stepsCompleted: number;
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
    rememberMe: boolean;
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
