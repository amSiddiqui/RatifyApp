export type AuthInitialStateType = {
    isAuthenticated: boolean;
    user: JWTType | null;
    error: boolean;
    loading: boolean;
    message: string;
}

export type LoginDataType = {
    email: string;
    password: string;
}

export type SignUpDataType = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
}

export type TokenType = {
    access: string;
    refresh: string;
}

export type UserDataType = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

export type JWTType = {
    token_type: string;
    exp: number;
    iat: number;
    jti: string;
    user_id: number;
}