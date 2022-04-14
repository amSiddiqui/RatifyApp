// eslint-disable-next-line import/no-cycle
import {
    defaultColor,
    themeColorStorageKey,
} from "../constants/defaultValues";

export const getCurrentColor = () => {
    let currentColor = defaultColor;
    try {
        let tempCurrentColor = localStorage.getItem(themeColorStorageKey);
        if (tempCurrentColor !== null) {
            currentColor = tempCurrentColor;
        }
    } catch (error) {
        console.log(
            ">>>>: src/helpers/Utils.js : getCurrentColor -> error",
            error
        );
        currentColor = defaultColor;
    }
    return currentColor;
};

export const setCurrentColor = (color:string) => {
    try {
        localStorage.setItem(themeColorStorageKey, color);
    } catch (error) {
        console.log(
            ">>>>: src/helpers/Utils.js : setCurrentColor -> error",
            error
        );
    }
};
