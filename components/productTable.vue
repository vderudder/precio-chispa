<template>
    <div>
        <UTable :rows="ui.productList" :columns="columns" :loading="ui.loadingProducts" :ui="{
            tr: { active: 'hover:bg-green-50 dark:hover:bg-green-900/30 cursor-pointer' },
            th: { size: 'text-base' },
            td: { size: 'text-base' },
            loadingState: {
                wrapper: 'flex flex-col items-start md:items-center justify-center px-6 py-14 sm:px-14',
                icon: 'w-6 h-6 md:mx-auto text-gray-400 dark:text-gray-500 mb-4 animate-spin'
            },
        }" class="overflow-auto table__height"
            :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Cargando...' }" @select="selectProductClick">
            <template #estPrice-data="{ row }">
                <span class="text-primary-500 dark:text-primary-400">{{ row.estPrice }}</span>
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

        <Modal :showing-modal="ui.showingModal" :product="ui.currentProduct" @cancel-edit="cancelEditClick"
            @confirm-edit="confirmEditClick" @confirm-delete="deleteClick"/>
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
        label: 'Precio antes (USD$)',
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
const emit = defineEmits(['addProductClick', 'productEdited', 'productDeleted'])

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

function cancelEditClick() {
    ui.value.showingModal = false;
}

function confirmEditClick(event: any) {
    ui.value.showingModal = false;

    emit('productEdited', { product: event.product })

}

function deleteClick(event: any) {
    ui.value.showingModal = false;

    emit('productDeleted', { product: event.product })
}

</script>