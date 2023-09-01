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

        <!-- Product table -->
        <div v-if="ui.productList">
            <UTable :rows="filteredRows" :columns="columns" :loading="ui.loadingProducts" :ui="{
                th: { size: 'text-base' },
                td: { size: 'text-base' },
                loadingState: {
                    wrapper: 'flex flex-col items-start md:items-center justify-center px-6 py-14 sm:px-14',
                    icon: 'w-6 h-6 md:mx-auto text-gray-400 dark:text-gray-500 mb-4 animate-spin'
                },
            }" class="overflow-auto table__height"
                :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Cargando...' }">

                <template #estPrice-data="{ row }">
                    <span class="text-primary-500 dark:text-primary-400">{{ row.estPrice }}</span>
                </template>

                <!-- Delete button -->
                <template #actions-data="{ row }">
                    <UButton color="gray" variant="ghost" icon="i-heroicons-trash" @click="deleteProductClick(row)" />
                </template>

                <!-- Empty state -->
                <template #empty-state>
                    <div class="flex flex-col items-start md:items-center justify-center px-6 py-14 sm:px-14">
                        <UIcon name="i-heroicons-face-frown-20-solid"
                            class="w-6 h-6 md:mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                        <p>No se encontraron productos</p>
                        <UButton label="¡Agregar ahora!" variant="soft" @click="showFormClick" class="mt-4" />
                    </div>
                </template>
            </UTable>
        </div>

        <Modal :showing-modal="ui.showingModal" :product="ui.productToDelete" @cancel-delete="cancelDeleteClick" @confirm-delete="confirmDeleteClick"/>

    </UContainer>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormError } from '@nuxthq/ui/dist/runtime/types'
import { IProduct } from '../typings/product.data'
import { uuid } from 'vue-uuid';
import Modal from '../components/modal.vue'
import { Utils } from '../utils/utils';

defineShortcuts({
    escape: {
        usingInput: true,
        handler: () => { cancelDeleteClick(); }
    }
})

// Key to set productList in localstorage
const productListKey = 'product-list';

// Form columns config
const columns = [
    {
        key: 'actions'
    },
    {
        key: 'name',
        label: 'Producto'
    },
    {
        key: 'estPrice',
        label: 'Precio hoy (ARS$)',
        class: 'product-table__highlighted-text product-table__min-width'
    },
    {
        key: 'shop',
        label: 'Lugar/Negocio'
    },
    {
        key: 'date',
        label: 'Fecha'
    },
    {
        key: 'usdPrice',
        label: 'Precio antes (USD$)',
        class: 'product-table__min-width'
    },
    {
        key: 'arsPrice',
        label: 'Precio antes (ARS$)',
        class: 'product-table__min-width'
    },
]

// Reactive
const product: IProduct = reactive({ ...Utils.initialProduct })

// Refs
const ui = ref<{
    productList: IProduct[],
    loadingUsd: boolean,
    loadingProducts: boolean,
    editingUsdPrice: boolean,
    showingForm: boolean,
    showingModal: boolean,
    productToDelete: IProduct,
    usdPrice: number
}>(
    {
        productList: [],
        loadingUsd: true,
        loadingProducts: true,
        editingUsdPrice: false,
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

function deleteProductClick(product: IProduct) {
    ui.value.showingModal = true;
    ui.value.productToDelete = { ...product };
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
