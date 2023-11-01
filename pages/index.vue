<template>
    <UContainer>
        <Header :usd-price="ui.usdPrice" :loading-usd="ui.loadingUsd" @usd-price-change="usdPriceChanged" />

        <ProductForm :product="product" :usd-price="ui.usdPrice" :showing-form="ui.showingForm"
            @add-product-click="addProductClick" @search-product="setSearchValue" />

        <ProductTable :product-list="filteredRows" :loading-products="ui.loadingProducts" @add-product-click="showFormClick"
            @product-edited="editProductClick" @product-deleted="deleteProductClick" @history-edited="updateHistory" />

    </UContainer>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { IProduct } from '../typings/product.data'

import Header from '../components/header.vue'
import ProductTable from '../components/productTable.vue'
import ProductForm from '../components/productForm.vue'
import { Utils } from '../utils/utils';
import { IProductHistory } from 'typings/product-history.data'

// Key to set productList in localstorage
const productListKey = 'product-list';

// Reactive
const product: IProduct = reactive({ ...Utils.initialProduct })

// Refs
const ui = ref<{
    productList: IProduct[],
    loadingUsd: boolean,
    loadingProducts: boolean,
    showingForm: boolean,
    showingModal: boolean,
    productToDelete: IProduct,
    usdPrice: number
}>(
    {
        productList: [],
        loadingUsd: true,
        loadingProducts: true,
        showingForm: false,
        showingModal: false,
        productToDelete: { ...Utils.initialProduct },
        usdPrice: 0
    }
);

//Computed
const filteredRows = computed(() => {
    if (!product.name) {
        return ui.value.productList
    }

    return ui.value.productList.filter((p) => {
        return Object.values(p).some((value) => {
            return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(product.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
        })
    })
})

// Methods

/**
 * Updates product name to be correctly filtered
 * @param event Emitted event from product form
 */
function setSearchValue(event: any) {
    product.name = event.searchValue;
}

/**
 * Creates product
 * @param event Emitted event from product form
 */
function addProductClick(event: any) {
    // Adding product to list
    ui.value.productList.unshift({ ...event.product });
    // Saving to local storage
    Utils.setItemToLocalStorage(productListKey, JSON.stringify(ui.value.productList));

    // Clearing form
    Utils.clearObject(product, Utils.initialProduct);
    ui.value.showingForm = false;
}

/**
 * Updates estimated price for all products when usd price change
 * @param event Emitted event from header
 */
function usdPriceChanged(event: any) {
    // Calculate estimated price
    ui.value.productList = ui.value.productList.map((p) => ({ ...p, estPrice: Utils.roundNumberTwoDecimals(event.usdPrice * p.history[0].usdPrice) }));
}

/**
 * Toggles the product form
 */
function showFormClick() {
    ui.value.showingForm = !ui.value.showingForm;
}

/**
 * Replaces product with one edited in product list
 * @param event Emitted event from product table
 */
function editProductClick(event: any) {
    const index = ui.value.productList.findIndex(p => p.id == event.product.id)

    // Re-evaluate price only when price field is edited
    if (ui.value.productList[index].arsPrice != event.product.arsPrice) {
        event.product.usdPrice = Utils.roundNumberTwoDecimals(event.product.arsPrice / ui.value.usdPrice);
        event.product.estPrice = Utils.roundNumberTwoDecimals(event.product.usdPrice * ui.value.usdPrice);
    }

    ui.value.productList.splice(index, 1, event.product);

    // Saving to local storage
    Utils.setItemToLocalStorage(productListKey, JSON.stringify(ui.value.productList));

    // Clearing form
    Utils.clearObject(product, Utils.initialProduct);
    ui.value.showingModal = false;
}

/**
  * Remove product from list
  * @param event Emitted event from modal in product table
  */
function deleteProductClick(event: any) {
    const index = ui.value.productList.findIndex(p => p.id == event.product.id)
    ui.value.productList.splice(index, 1);

    // Saving to local storage
    Utils.setItemToLocalStorage(productListKey, JSON.stringify(ui.value.productList));

    // Clearing form
    Utils.clearObject(product, Utils.initialProduct);
    ui.value.showingModal = false;
}

 
 /**
  * Updates history list for a product, whether it's a new one, edited or removed
  * @param event Emitted event from modal in product table
  */
function updateHistory(event: any) {
    const currentHistory = event.history as IProductHistory;
    const productIndex = ui.value.productList.findIndex(p => p.id == event.productId);
    const isRemoving = event.isRemoving

    if (productIndex >= 0) {
        const historyIndex = ui.value.productList[productIndex].history.findIndex(h => h.id == currentHistory.id);

        // Remove history
        if (historyIndex >= 0 && isRemoving == true) ui.value.productList[productIndex].history.splice(historyIndex, 1);
        // Edit history, replace it
        else if (historyIndex >= 0 && isRemoving == false) ui.value.productList[productIndex].history.splice(historyIndex, 1, currentHistory);
        // New history, add it
        else if (historyIndex < 0) ui.value.productList[productIndex].history.unshift(currentHistory);

        // Update estimated price
        ui.value.productList[productIndex].estPrice = Utils.roundNumberTwoDecimals(ui.value.productList[productIndex].history[0].usdPrice * ui.value.usdPrice);

        // Saving to local storage
        Utils.setItemToLocalStorage(productListKey, JSON.stringify(ui.value.productList));
    }

}

onMounted(async () => {
    ui.value.loadingUsd = true;
    ui.value.loadingProducts = true;

    // Getting avg blue dollar price
    try {
        const data = await $fetch<{ blue: { value_avg: string } }>('https://api.bluelytics.com.ar/v2/latest')
        ui.value.loadingUsd = false;
        ui.value.usdPrice = Number(data.blue.value_avg);
    } catch (error) {
        ui.value.usdPrice = 0;
    }

    //  Calculating estimated price when page mounts
    const productList = Utils.getItemFromLocalStorage(productListKey)
    if (productList) {
        ui.value.productList = productList.map((p: IProduct) => ({ ...p, estPrice: Utils.roundNumberTwoDecimals(ui.value.usdPrice * p.history[0].usdPrice) }));
    }
    ui.value.loadingProducts = false;
})


</script>

<style >
.product-table__highlighted-text {
    color: #22c55e !important;
    font-weight: bold;
}

.table__height {
    height: 100vh;
}

.search-and-add> :first-child {
    flex-grow: 1;
}

.product-table__min-width {
    min-width: 11rem
}
</style>
