// eslint-disable-next-line import/no-cycle
import { DateTime } from 'luxon';
import {
    defaultColor,
    themeColorStorageKey,
    defaultLocale,
    localeOptions,
    defaultDirection,
    themeRadiusStorageKey,
} from '../constants/defaultValues';
import { LocaleTypes } from '../lang';

export const getCurrentColor = () => {
    let currentColor = defaultColor;
    try {
        let tempCurrentColor = localStorage.getItem(themeColorStorageKey);
        if (tempCurrentColor !== null) {
            currentColor = tempCurrentColor;
        }
    } catch (error) {
        console.log(
            '>>>>: src/helpers/Utils.js : getCurrentColor -> error',
            error
        );
        currentColor = defaultColor;
    }
    return currentColor;
};

export const setCurrentColor = (color: string) => {
    try {
        localStorage.setItem(themeColorStorageKey, color);
    } catch (error) {
        console.log(
            '>>>>: src/helpers/Utils.js : setCurrentColor -> error',
            error
        );
    }
};

export const getCurrentLanguage = (): LocaleTypes => {
    let language = defaultLocale as LocaleTypes;
    try {
        language =
            localStorage.getItem('currentLanguage') &&
            localeOptions.filter(
                (x) => x.id === localStorage.getItem('currentLanguage')
            ).length > 0
                ? (localStorage.getItem('currentLanguage') as LocaleTypes)
                : defaultLocale;
    } catch (error) {
        console.log(
            '>>>>: src/helpers/Utils.js : getCurrentLanguage -> error',
            error
        );
    }
    return language;
};

export const setCurrentLanguage = (locale: string) => {
    try {
        localStorage.setItem('currentLanguage', locale);
    } catch (error) {
        console.log(
            '>>>>: src/helpers/Utils.js : setCurrentLanguage -> error',
            error
        );
    }
};

export const getDirection = () => {
    let direction = defaultDirection;

    try {
        if (localStorage.getItem('direction')) {
            const localValue = localStorage.getItem('direction');
            if (localValue === 'rtl' || localValue === 'ltr') {
                direction = localValue;
            }
        }
    } catch (error) {
        console.log(
            '>>>>: src/helpers/Utils.js : getDirection -> error',
            error
        );
        direction = defaultDirection;
    }
    return {
        direction,
        isRtl: direction === 'rtl',
    };
};

export const setDirection = (localValue: 'rtl' | 'ltr') => {
    let direction = 'ltr';
    if (localValue === 'rtl' || localValue === 'ltr') {
        direction = localValue;
    }
    try {
        localStorage.setItem('direction', direction);
    } catch (error) {
        console.log(
            '>>>>: src/helpers/Utils.js : setDirection -> error',
            error
        );
    }
};

export const getCurrentRadius = () => {
    let currentRadius = 'flat';
    try {
        if (localStorage.getItem(themeRadiusStorageKey)) {
            currentRadius = localStorage.getItem(themeRadiusStorageKey)!;
        }
    } catch (error) {
        console.log(
            '>>>>: src/helpers/Utils.js : getCurrentRadius -> error',
            error
        );
        currentRadius = 'flat';
    }
    return currentRadius;
};


export const setCurrentRadius = (radius: string) => {
    try {
        localStorage.setItem(themeRadiusStorageKey, radius);
    } catch (error) {
        console.log(
            '>>>>: src/helpers/Utils.js : setCurrentRadius -> error',
            error
        );
    }
};


export const swap = (arr: any[], i: number, j: number) => {
    if (i === j) {
        return [...arr];
    }
    if (i < 0 || i >= arr.length || j < 0 || j >= arr.length) {
        return [...arr];
    }
    const new_arr = [...arr];
    const temp = new_arr[i];
    new_arr[i] = new_arr[j];
    new_arr[j] = temp;
    return new_arr;
}

export const getRandomStringID = () => {
    return Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
}

export const getLastSeenFromDate = (lastSeen: string) => {
    const dt = DateTime.fromISO(lastSeen);
    // check if dt is less than a day
    const today = DateTime.local();
    // check iff today is less than a day
    if (today.diff(dt, 'days').days < 1) {
        return dt.toFormat('HH:mm');
    }

    return dt.toFormat('dd/MM/yyyy');
}

export const getFormatDateFromIso = (isoDate: string | null) => {
    if (!isoDate) return '';
    return DateTime.fromISO(isoDate).toLocaleString(DateTime.DATE_FULL);
}

export const passwordValidation = (value:string | undefined) => {
    if (typeof value !== 'string') {
        return false;
    }
    if (value.length < 8) {
        return false;
    }
    if (!/[A-Z]/.test(value)) {
        return false;
    }
    if (!/[0-9]/.test(value)) {
        return false;
    }
    return true;
};

export const secondsToHourMinutesSeconds = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsLeft = Math.floor(seconds % 60);
    let finalString = '';
    if (hours > 0) {
        finalString += `${hours}h `;
    }
    if (minutes > 0) {
        finalString += `${minutes}m `;
    }
    finalString += `${secondsLeft}s`;
    return finalString;
}

export const generateSignerLabels = (order: number[], signers: Array<{uid: string, type: string, step: number}>, sorted: boolean) => {
    // sort signer by order
    
    let sortedSigners = signers;
    if (!sorted) {
        sortedSigners = signers.sort((a, b) => {
            return order.indexOf(a.step - 1) - order.indexOf(b.step - 1);
        });
    }

    // const get all approver
    const approvers = sortedSigners.filter((signer) => signer.type === 'approver');
    // const get all signer
    const signersLabels = sortedSigners.filter((signer) => signer.type === 'signer');
    // const get all viewer
    const viewers = sortedSigners.filter((signer) => signer.type === 'viewer');
    const labels: Array<{uid: string, label: string}> = [];
    for (let i = 0; i < approvers.length; i++) {
        labels.push({
            uid: approvers[i].uid,
            label: `Approver ${i + 1}`,
        });
    }
    for (let i = 0; i < signersLabels.length; i++) {
        labels.push({
            uid: signersLabels[i].uid,
            label: `Signer ${i + 1}`,
        });
    }

    for (let i = 0; i < viewers.length; i++) {
        labels.push({
            uid: viewers[i].uid,
            label: `Viewer ${i + 1}`,
        });
    }
    return labels;
}

export const getAgreementBadgeColorFromStatus = (status: string) => {
    switch(status) {
        case 'sent':
            return 'blue';
        case 'error':
            return 'red';
        case 'completed':
            return 'green';
        case 'withdraw':
            return 'orange';
        case 'decline':
            return 'red';
        default:
            return 'gray';
    }
}

export const getAgreementStatusText = (status: string) => {
    switch (status) {
        case  'complete':
            return 'Completed';
        case 'sent':
            return 'In Progress';
        case 'error':
            return 'Error';
        case 'withdraw':
            return 'Withdrawn';
        case 'delete':
            return 'Deleted';
        case 'decline':
            return 'Declined';
        default:
            return 'draft';
    }
}
