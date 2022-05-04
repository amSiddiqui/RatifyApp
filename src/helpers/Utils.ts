// eslint-disable-next-line import/no-cycle
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
    return Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7);
}