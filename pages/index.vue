<template>
    <UContainer>
        <!-- Header -->
        <div class="text-center">
            <h1 class="text-4xl my-3">Precio<span class="text-primary-500">Chispa</span></h1>
            <!-- USD Price -->
            <div class="mb-6">
                <!-- Badge and edit -->
                <div v-if="!ui.editingUsdPrice">
                    <UBadge color="gray" size="md" variant="solid" class="me-2">
                        <UIcon v-if="!ui.loadingUsd" name="i-heroicons-currency-dollar-20-solid"
                            class="me-1 text-primary-500" />
                        <UIcon v-else name="i-heroicons-arrow-path-20-solid" class="me-1 animate-spin" />
                        {{ ui.usdPrice == 0 ? '' : ui.usdPrice }}
                    </UBadge>
                    <UButton :disabled="ui.loadingUsd" icon="i-heroicons-pencil" size="2xs" color="lime" square
                        variant="soft" @click="editUsdPriceClick" />
                </div>

                <!-- Input and save -->
                <div v-if="(ui.editingUsdPrice || ui.usdPrice == 0) && !ui.loadingUsd"
                    class="flex flex-row justify-center items-center gap-3 w-32 m-auto">
                    <UInput v-model="ui.usdPrice" type="number" class="w-24" size="xs" color="primary"
                        icon="i-heroicons-currency-dollar" />
                    <UButton icon="i-heroicons-check" size="2xs" color="primary" square variant="solid"
                        @click="saveUsdPriceClick" />
                </div>
            </div>
        </div>

        <!-- Search and product form -->
        <UForm ref="form" :validate="validate" :state="product" @submit.prevent="addProductClick" class="mt-8 m-auto">
            <UFormGroup label="Producto" name="name" class="mb-3 justify-center" required
                :ui="{ error: 'mt-1 text-red-500 dark:text-red-400 text-xs' }">
                <div class="flex items-center gap-3 search-and-add">
                    <UInput placeholder="Buscar | Agregar" v-model="product.name" ref="searchInput"
                        icon="i-heroicons-magnifying-glass-20-solid" color="gray" variant="outline"
                        @focus="scrollAtFocus" />
                    <UButton :disabled="!product.name"
                        :icon="!ui.showingForm ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'" size="xs"
                        color="primary" square variant="solid" @click="showFormClick" />
                </div>
            </UFormGroup>
            <div v-if="ui.showingForm">
                <div class="grid grid-cols-2 gap-3">
                    <UFormGroup label="Precio en pesos" name="arsPrice" class="mb-3" required
                        :ui="{ error: 'mt-1 text-red-500 dark:text-red-400 text-xs' }">
                        <UInput v-model="product.arsPrice" type="number"
                            trailing-icon="i-heroicons-exclamation-circle-20-solid" />
                    </UFormGroup>
                    <UFormGroup label="Lugar/Negocio" name="shop" class="mb-3" required
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

        <!-- Delete modal -->
        <UModal v-model="ui.showingModal" @focusout="cancelDeleteClick">
            <UCard>
                <template #header>
                    <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-exclamation-circle-20-solid" class="me-1 text-red-400" />
                        <strong>Eliminar producto</strong>
                    </div>
                </template>
                ¿Estás seguro?

                <template #footer>
                    <UButton color="red" variant="solid" @click="confirmDeleteClick">Sí, eliminar</UButton>
                    <UButton color="white" variant="ghost" class="mx-4" @click="cancelDeleteClick">Cancelar</UButton>
                </template>
            </UCard>
        </UModal>

    </UContainer>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormError } from '@nuxthq/ui/dist/runtime/types'
import { IProduct } from '../typings/product.data'
import { uuid } from 'vue-uuid';

defineShortcuts({
    escape: {
        usingInput: true,
        handler: () => { cancelDeleteClick(); }
    }
})

// Key to set productList in localstorage
const productListKey = 'product-list';

// Initial product with cleared values
const initialProduct: IProduct = {
    id: '',
    name: '',
    estPrice: 0,
    shop: '',
    date: '',
    usdPrice: 0,
    arsPrice: 0,
};

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
const product: IProduct = reactive({ ...initialProduct })

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
        productToDelete: { ...initialProduct },
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
        product.usdPrice = roundNumberTwoDecimals(product.arsPrice / ui.value.usdPrice);
        product.estPrice = roundNumberTwoDecimals(product.usdPrice * ui.value.usdPrice);
        // Adding product to list
        ui.value.productList.push({ ...product });
        // Saving to local storage
        setItemToLocalStorage(productListKey, JSON.stringify(ui.value.productList));
        // Clearing form
        clearObject(product, initialProduct);
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

function editUsdPriceClick() {
    ui.value.editingUsdPrice = true;
}

function saveUsdPriceClick() {
    ui.value.editingUsdPrice = false;
    // Calculate estimated price
    ui.value.productList = ui.value.productList.map((p) => ({ ...p, estPrice: roundNumberTwoDecimals(ui.value.usdPrice * p.usdPrice) }));
}

function showFormClick() {
    ui.value.showingForm = !ui.value.showingForm;
}

function deleteProductClick(product: IProduct) {
    ui.value.showingModal = true;
    ui.value.productToDelete = { ...product };
}

function confirmDeleteClick() {
    // Remove from ui list
    const index = ui.value.productList.findIndex(p => p.id === ui.value.productToDelete.id);
    ui.value.productList.splice(index, 1);

    // Replace local storage
    const stringifiedList = JSON.stringify(ui.value.productList);
    setItemToLocalStorage(productListKey, stringifiedList);
    ui.value.showingModal = false;

}

function cancelDeleteClick() {
    clearObject(ui.value.productToDelete, initialProduct);
    ui.value.showingModal = false;
}

function scrollAtFocus() {
    searchInput.value.input.scrollIntoView({ behavior: "smooth" });
}

// Utils - TODO: Move to utils directory
function setItemToLocalStorage(key: string, value: string) {
    localStorage.setItem(key, value)
}

function getItemFromLocalStorage(key: string) {
    const item = localStorage.getItem(key)
    if (item) return JSON.parse(item)
}

function roundNumberTwoDecimals(num: number) {
    return Math.round(num * 100) / 100
}

/**
 * Clears object
 * @param {*} current Current item
 * @param {*} initial Item with inital/cleared values
 */
function clearObject(current: any, initial: any) {
    Object.assign(current, initial);
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
    const productList = getItemFromLocalStorage(productListKey)
    if (productList) {
        ui.value.productList = productList.map((p: IProduct) => ({ ...p, estPrice: roundNumberTwoDecimals(ui.value.usdPrice * p.usdPrice) }));
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
    min-width: 10.5rem
}
</style>
