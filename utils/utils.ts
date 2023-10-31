import { IProductHistory } from "typings/product-history.data";
import { IProduct } from "typings/product.data";

export namespace Utils {

    // Initial product with cleared values
    export const initialProduct: IProduct = {
        id: '',
        name: '',
        arsPrice: 0,
        estPrice: 0,
        shop: '',
        history: []
    };

    // Initial history with cleared values
    export const initialHistory: IProductHistory = {
        id: '',
        date: '',
        arsPrice: 0,
        usdPrice: 0,
    }

    /**
     * Clears object
     * @param {*} current Current item
     * @param {*} initial Item with inital/cleared values
     */
    export function clearObject(current: any, initial: any) {
        Object.assign(current, initial);
    }
    
    /**
     * Saves item to lacal storage
     * @param key Key name for that item
     * @param value The item itself
     */
    export function setItemToLocalStorage(key: string, value: string) {
        localStorage.setItem(key, value)
    }

    /**
     * Returns item from local storage
     * @param key Key name for that item
     * @returns 
     */
    export function getItemFromLocalStorage(key: string) {
        const item = localStorage.getItem(key)
        if (item) return JSON.parse(item)
    }

    /**
     * Takes a number and rounds it to two decimals
     * @param num 
     * @returns 
     */
    export function roundNumberTwoDecimals(num: number) {
        return Math.round(num * 100) / 100
    }

    
}
