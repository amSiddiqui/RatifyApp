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
        case 'complete':
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
        case 'expire':
            return 'Expired';
        case 'end':
            return 'Ended';
        default:
            return 'draft';
    }
}

export const getPaginationArray = (total: number, page: number, limit: number): number[] => {
    const pages:number[] = [];
    if (total <= limit) {
        // make an array from 1 to total
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
        return pages;
    }

    pages.push(1);
    if (page < limit - 2) {
        for (let i = 2; i <= limit - 2; i++) {
            pages.push(i);
        }
        pages.push(-1);
        pages.push(total);
        return pages;
    }

    if (page >= (total - limit + 3)) {
        pages.push(-1);
        for (let i = total - limit + 3; i <= total; i++) {
            pages.push(i);
        }

        return pages;
    }

    let remaining = limit - 5;
    pages.push(-1);

    let lower = Math.floor(remaining / 2);
    let upper = Math.ceil(remaining / 2);

    for (let i = page - lower; i <= page + upper; i++) {
        pages.push(i);
    }

    pages.push(-1);
    pages.push(total);
    return pages;
}

export const isTouchDevice = () => {  
    // @ts-ignore
    const msMaxTouchPoints = navigator.msMaxTouchPoints;

    return (('ontouchstart' in window) ||  
      (navigator.maxTouchPoints > 0) ||  
      (msMaxTouchPoints && msMaxTouchPoints > 0));  
} 


export const documentViewerBreakpoint = [
    { bp: 645, scale: 0.9, topOffset: 5 },
    { bp: 625, scale: 0.85, topOffset: 10 },
    { bp: 500, scale: 0.7, topOffset: 20 },
    { bp: 428, scale: 0.6, topOffset: 30 },
    { bp: 375, scale: 0.55, topOffset: 40 },
    { bp: 328, scale: 0.5, topOffset: 50 },
    { bp: 291, scale: 0.45, topOffset: 60 },
    { bp: 0, scale: 0.4, topOffset: 70 },
];