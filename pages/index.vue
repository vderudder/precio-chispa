<template>
    <UContainer>
        <Header :usd-price="ui.usdPrice" :loading-usd="ui.loadingUsd" @usd-price-change="usdPriceChanged" />

        <ProductForm :product="product" :usd-price="ui.usdPrice" :showing-form="ui.showingForm"
            @add-product-click="addProductClick" @search-product="setSearchValue" />

        <ProductTable :product-list="filteredRows" :loading-products="ui.loadingProducts" @add-product-click="showFormClick"
            @delete-click="deleteProductClick" />

        <Modal :showing-modal="ui.showingModal" :product="ui.productToDelete" @cancel-delete="cancelDeleteClick"
            @confirm-delete="confirmDeleteClick" />

    </UContainer>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { IProduct } from '../typings/product.data'

import Header from '../components/header.vue'
import Modal from '../components/modal.vue'
import ProductTable from '../components/productTable.vue'
import ProductForm from '../components/productForm.vue'
import { Utils } from '../utils/utils';

defineShortcuts({
    escape: {
        usingInput: true,
        handler: () => { cancelDeleteClick(); }
    }
})

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
            return String(value).toLowerCase().includes(product.name.toLowerCase())
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
    ui.value.productList.push({ ...event.product });
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
    ui.value.productList = ui.value.productList.map((p) => ({ ...p, estPrice: Utils.roundNumberTwoDecimals(event.usdPrice * p.usdPrice) }));
}

/**
 * Toggles the product form
 */
function showFormClick() {
    ui.value.showingForm = !ui.value.showingForm;
}

/**
 * Shows modal and sets a temporal product to delete
 * @param event Emitted event from product table
 */
function deleteProductClick(event: any) {
    ui.value.showingModal = true;
    console.log(ui.value.productToDelete)
    ui.value.productToDelete = { ...event.product };
    console.log(ui.value.productToDelete)

}

/**
 * Finally delete product from list, closes modal
 */
function confirmDeleteClick() {
    ui.value.showingModal = false;
    console.log(ui.value.productToDelete)

    // Remove from ui list
    const index = ui.value.productList.findIndex(p => p.id === ui.value.productToDelete.id);
    ui.value.productList.splice(index, 1);

    // Replace local storage
    const stringifiedList = JSON.stringify(ui.value.productList);
    Utils.setItemToLocalStorage(productListKey, stringifiedList);

}

/**
 * Cancels deleting operation, closes modal
 */
function cancelDeleteClick() {
    ui.value.showingModal = false;
    Utils.clearObject(ui.value.productToDelete, Utils.initialProduct);
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
        ui.value.productList = productList.map((p: IProduct) => ({ ...p, estPrice: Utils.roundNumberTwoDecimals(ui.value.usdPrice * p.usdPrice) }));
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
