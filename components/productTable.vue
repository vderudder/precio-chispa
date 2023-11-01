<template>
    <div>
        <UTable :rows="ui.productList" :columns="columns" :loading="ui.loadingProducts" :ui="{
            tr: { active: 'hover:bg-green-50 dark:hover:bg-green-900/30 cursor-pointer' },
            th: { size: 'text-base' },
            td: { base: 'whitespace-normal', size: 'text-base' },
            loadingState: {
                wrapper: 'flex flex-col items-start md:items-center justify-center px-6 py-14 sm:px-14',
                icon: 'w-6 h-6 md:mx-auto text-gray-400 dark:text-gray-500 mb-4 animate-spin'
            },
        }" class="overflow-auto table__height"
            :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Cargando...' }" @select="selectProductClick">

            <!-- Estimated price header -->
            <template #estPrice-header="{ column }">
                <div class="flex flex-row items-center">
                    <span class="text-primary-500 dark:text-primary-400 min-w-fit">{{ column.label }}</span>
                    <UPopover mode="hover" class="ps-1" :ui="{ wrapper: 'flex' }">
                        <UIcon name="i-heroicons-information-circle-20-solid" />
                        <template #panel>
                            <p class="text-xs m-2 font-normal text-gray-300">Precio estimado según el valor
                                promedio del USD hoy</p>
                        </template>
                    </UPopover>
                </div>
            </template>

            <!-- Estimated price column -->
            <template #estPrice-data="{ row }">
                <span class="text-primary-500 dark:text-primary-400">{{ row.estPrice }}</span>
            </template>

            <!-- Usd price header -->
            <template #usdPrice-header="{ column }">
                <div class="flex flex-row items-center">
                    <span class="min-w-fit">{{ column.label }}</span>
                    <UPopover mode="hover" class="ps-1" :ui="{ wrapper: 'flex' }">
                        <UIcon name="i-heroicons-information-circle-20-solid" class="text-gray-400" />
                        <template #panel>
                            <p class="text-xs m-2 font-normal text-gray-300">Precio en USD según el valor
                                promedio del día ingresado</p>
                        </template>
                    </UPopover>
                </div>
            </template>

            <!-- Usd price column -->
            <template #usdPrice-data="{ row }">
                <span>{{ row.history[0].usdPrice }}</span>
            </template>

            <!-- Ars price header -->
            <template #arsPrice-header="{ column }">
                <div class="flex flex-row items-center">
                    <span class="min-w-fit">{{ column.label }}</span>
                    <UPopover mode="hover" class="ps-1" :ui="{ wrapper: 'flex' }">
                        <UIcon name="i-heroicons-information-circle-20-solid" class="text-gray-400" />
                        <template #panel>
                            <p class="text-xs m-2 font-normal text-gray-300">Precio en ARS del día ingresado</p>
                        </template>
                    </UPopover>
                </div>
            </template>

            <!-- Ars price column -->
            <template #arsPrice-data="{ row }">
                <span>{{ row.history[0].arsPrice }}</span>
            </template>

            <!-- Date column -->
            <template #date-data="{ row }">
                <span>{{ row.history[0].date }}</span>
            </template>

            <!-- Empty state -->
            <template #empty-state>
                <div class="flex flex-col items-start md:items-center justify-center px-6 py-14 sm:px-14">
                    <UIcon name="i-heroicons-face-frown-20-solid"
                        class="w-6 h-6 md:mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <p>No se encontraron productos</p>
                    <UButton label="¡Agregar ahora!" variant="soft" @click="addProductClick" class="mt-4" />
                </div>
            </template>
        </UTable>

        <Modal :showing-modal="ui.showingModal" :product="ui.currentProduct" @close-modal="closeModal"
            @confirm-edit="confirmEditClick" @confirm-delete="deleteClick" @edited-history="editedHistory" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IProduct } from '../typings/product.data'
import { Utils } from '../utils/utils';

// Form columns config
const columns = [
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
        label: 'Precio (USD$)',
        class: 'product-table__min-width'
    },
    {
        key: 'arsPrice',
        label: 'Precio antes (ARS$)',
        class: 'product-table__min-width'
    },
]

// Props
const props = defineProps({
    productList: {
        type: Array,
        required: true
    },
    loadingProducts: {
        type: Boolean,
        required: true
    }
})

// Emits
const emit = defineEmits(['addProductClick', 'productEdited', 'productDeleted', 'historyEdited'])

// Refs
const ui = ref<{
    productList: IProduct[],
    loadingProducts: boolean,
    showingModal: boolean,
    currentProduct: IProduct
}>(
    {
        productList: [],
        loadingProducts: true,
        showingModal: false,
        currentProduct: { ...Utils.initialProduct }
    }
);

// Watchers
watch(() => props.productList,
    (productList) => {
        ui.value.productList = productList as IProduct[];
    }
);
watch(() => props.loadingProducts,
    (loadingProducts) => {
        ui.value.loadingProducts = loadingProducts;
    }
);

// Methods

function selectProductClick(row: IProduct) {
    ui.value.showingModal = true;
    ui.value.currentProduct = { ...row };

}

function addProductClick() {
    emit('addProductClick');
}

function closeModal() {
    ui.value.showingModal = false;
}

function confirmEditClick(event: any) {
    emit('productEdited', { product: event.product })

}

function deleteClick(event: any) {
    ui.value.showingModal = false;

    emit('productDeleted', { product: event.product })
}

function editedHistory(event: any) {
    emit('historyEdited', { history: event.history, productId: event.productId, isRemoving: event.isRemoving })
}

</script>