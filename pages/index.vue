<template>
    <UContainer>
        <Header :usd-price="ui.usdPrice" :loading-usd="ui.loadingUsd" @usd-price-change="usdPriceChanged"/>

        <!-- Search and product form -->
        <UForm ref="form" :validate="validate" :state="product" @submit.prevent="addProductClick" class="mt-8 m-auto">
            <UFormGroup label="Producto" name="name" class="mb-3 justify-center"
                :ui="{ error: 'mt-1 text-red-500 dark:text-red-400 text-xs' }">
                <div class="flex items-center gap-3 search-and-add">
                    <UInput ref="searchInput" v-model="product.name" placeholder="Buscar | Agregar" 
                        icon="i-heroicons-magnifying-glass-20-solid" color="gray" variant="outline" trailing-icon="i-heroicons-exclamation-circle-20-solid"
                        @focus="scrollAtFocus" />
                    <UButton :disabled="!product.name"
                        :icon="!ui.showingForm ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'" size="xs"
                        color="primary" square variant="solid" @click="showFormClick" />
                </div>
            </UFormGroup>
            <div v-if="ui.showingForm">
                <div class="grid grid-cols-2 gap-3">
                    <UFormGroup label="Precio en pesos" name="arsPrice" class="mb-3"
                        :ui="{ error: 'mt-1 text-red-500 dark:text-red-400 text-xs' }">
                        <UInput v-model="product.arsPrice" type="number"
                            trailing-icon="i-heroicons-exclamation-circle-20-solid" />
                    </UFormGroup>
                    <UFormGroup label="Lugar/Negocio" name="shop" class="mb-3"
                        :ui="{ error: 'mt-1 text-red-500 dark:text-red-400 text-xs' }">
                        <UInput v-model="product.shop" trailing-icon="i-heroicons-exclamation-circle-20-solid" />
                    </UFormGroup>
                </div>

                <div class="text-center">
                    <UButton type="submit" class="my-2" :disabled="ui.loadingUsd">
                        Agregar
                    </UButton>
                </div>

            </div>
        </UForm>

        <ProductTable :product-list="filteredRows" :loading-products="ui.loadingProducts" @add-product-click="showFormClick" @delete-click="deleteProductClick"/>

        <Modal :showing-modal="ui.showingModal" :product="ui.productToDelete" @cancel-delete="cancelDeleteClick" @confirm-delete="confirmDeleteClick"/>

    </UContainer>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormError } from '@nuxthq/ui/dist/runtime/types'
import { IProduct } from '../typings/product.data'
import { uuid } from 'vue-uuid';

import Header from '../components/header.vue'
import Modal from '../components/modal.vue'
import ProductTable from '../components/productTable.vue'
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
const form = ref()
const searchInput = ref();

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
async function addProductClick() {
    if (!ui.value.showingForm) return;
    if (await form.value!.validate()) {
        // Calculating fields
        product.id = uuid.v4();
        product.date = new Date(Date.now()).toLocaleDateString('es-AR');
        product.usdPrice = Utils.roundNumberTwoDecimals(product.arsPrice / ui.value.usdPrice);
        product.estPrice = Utils.roundNumberTwoDecimals(product.usdPrice * ui.value.usdPrice);
        // Adding product to list
        ui.value.productList.push({ ...product });
        // Saving to local storage
        Utils.setItemToLocalStorage(productListKey, JSON.stringify(ui.value.productList));

        // Clearing form
        Utils.clearObject(product, Utils.initialProduct);
        ui.value.showingForm = false;
    }
}

/**
 * Validates product form
 * @param product 
 */
function validate(product: IProduct): FormError[] {
    const errors = []
    if (!product.name) errors.push({ path: 'name', message: 'Por favor ingresa un nombre válido ' })
    if (!product.arsPrice) errors.push({ path: 'arsPrice', message: 'Por favor ingresa un precio válido' })
    if (!product.shop) errors.push({ path: 'shop', message: 'Por favor ingresa un nombre válido' })
    return errors
}

function usdPriceChanged(event: any) {
    // Calculate estimated price
    ui.value.productList = ui.value.productList.map((p) => ({ ...p, estPrice: Utils.roundNumberTwoDecimals(event.usdPrice * p.usdPrice) }));
}

function showFormClick() {
    ui.value.showingForm = !ui.value.showingForm;
}

function deleteProductClick(event: any) {
    ui.value.showingModal = true;
    ui.value.productToDelete = {...event.product};
}

function confirmDeleteClick() {
    ui.value.showingModal = false;

    // Remove from ui list
    const index = ui.value.productList.findIndex(p => p.id === ui.value.productToDelete.id);
    ui.value.productList.splice(index, 1);

    // Replace local storage
    const stringifiedList = JSON.stringify(ui.value.productList);
    Utils.setItemToLocalStorage(productListKey, stringifiedList);

}

function cancelDeleteClick() {
    ui.value.showingModal = false;
    Utils.clearObject(ui.value.productToDelete, Utils.initialProduct);
}

function scrollAtFocus() {
    searchInput.value.input.scrollIntoView({ behavior: "smooth" });
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
