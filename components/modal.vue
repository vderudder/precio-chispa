<template>
    <div>
        <UModal v-model="ui.showingModal" prevent-close>
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <UIcon name="i-heroicons-pencil-square-20-solid" class="me-1 text-xl text-green-400" />
                            <strong>Editar</strong>
                        </div>
                        <UPopover>
                            <UButton color="gray" variant="ghost" icon="i-heroicons-trash"
                                :ui="{ color: { gray: { ghost: 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800' } } }">
                            </UButton>
                            <template v-slot:panel="{ close }">
                                <UCard>
                                    <div class="flex items-center gap-2">
                                        <UIcon name="i-heroicons-exclamation-circle-20-solid"
                                            class="me-1 text-xl text-red-400" />
                                        <strong>¿Estás seguro?</strong>
                                    </div>
                                    <template #footer>
                                        <UButton color="red" variant="solid" size="xs" @click="confirmDeleteClick(close)">
                                            Sí, eliminar</UButton>
                                        <UButton color="white" variant="ghost" class="mx-4"
                                            @click="cancelDeleteClick(close)">Cancelar</UButton>
                                    </template>
                                </UCard>
                            </template>
                        </UPopover>
                    </div>
                </template>
                <UForm ref="form" :validate="validate" :state="ui.currentProduct" @submit.prevent="editProductClick"
                    class="m-auto">
                    <UFormGroup label="Producto" name="name" class="mb-3 justify-center"
                        :ui="{ error: 'mt-1 text-red-500 dark:text-red-400 text-xs' }">
                        <UInput v-model="ui.currentProduct.name" trailing-icon="i-heroicons-exclamation-circle-20-solid" />
                    </UFormGroup>
                    <UFormGroup label="Precio en pesos" name="arsPrice" class="mb-3"
                        :ui="{ error: 'mt-1 text-red-500 dark:text-red-400 text-xs' }">
                        <UInput v-model="ui.currentProduct.arsPrice" type="number" step="any" min="0"
                            trailing-icon="i-heroicons-exclamation-circle-20-solid" />
                    </UFormGroup>
                    <UFormGroup label="Lugar/Negocio" name="shop" class=""
                        :ui="{ error: 'mt-1 text-red-500 dark:text-red-400 text-xs' }">
                        <UInput v-model="ui.currentProduct.shop" trailing-icon="i-heroicons-exclamation-circle-20-solid" />
                    </UFormGroup>

                    <div class="border-t border-gray-800 mt-4 pt-4">
                        <UButton type="submit" variant="solid">Aceptar</UButton>
                        <UButton color="white" variant="ghost" class="mx-4" @click="cancelEditClick">Cancelar</UButton>
                    </div>
                </UForm>
            </UCard>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { Utils } from '../utils/utils';
import { IProduct } from '../typings/product.data'
import { FormError } from '@nuxthq/ui/dist/runtime/types/form';

defineShortcuts({
    escape: {
        usingInput: true,
        handler: () => { cancelEditClick(); }
    }
})

// Props
const props = defineProps({
    showingModal: {
        type: Boolean,
        required: true
    },
    product: {
        type: Object,
        required: true
    }
})

// // Emits
const emit = defineEmits(['cancelEdit', 'confirmEdit', 'confirmDelete'])

// Refs
const ui = ref<{
    showingModal: boolean,
    currentProduct: IProduct
}>(
    {
        showingModal: false,
        currentProduct: { ...Utils.initialProduct }
    }
);

// Watchers
watch(() => props.showingModal,
    (showingModal) => {
        ui.value.showingModal = showingModal;
    }
);
watch(() => props.product as IProduct,
    (product) => {
        ui.value.currentProduct = product;
    }
);

// Methods

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

function editProductClick() {
    ui.value.showingModal = false;
    emit('confirmEdit', { product: ui.value.currentProduct })
}

function cancelEditClick() {
    ui.value.showingModal = false;
    emit('cancelEdit')
}

function confirmDeleteClick(close: () => any) {
    ui.value.showingModal = false;
    close();
    emit('confirmDelete', { product: ui.value.currentProduct })
}

function cancelDeleteClick(close: () => any) {
    close();
}
</script>