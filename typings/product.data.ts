import { IProductHistory } from "./product-history.data";

export interface IProduct {
    id: string;
    name: string,
    estPrice: number,
    arsPrice: number,
    shop: string,
    history: IProductHistory[]
}