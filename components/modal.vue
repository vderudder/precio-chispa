<template>
    <div>
        <UModal v-model="ui.showingModal" prevent-close>
            <UTabs :items="tabs">
                <template #item="{ item }">
                    <UCard>
                        <!-- General tab -->
                        <div v-if="item.key === 'general'">
                            <div v-if="!ui.editing">
                                <!-- General info -->
                                <div>
                                    <h3 class="font-bold text-lg uppercase border-b border-gray-800 mb-4 pb-2">{{
                                        ui.currentProduct.name }}</h3>
                                    <p><strong>Precio hoy:</strong> ARS$ {{ ui.currentProduct.estPrice }}</p>
                                    <p><strong>Precio antes:</strong> ARS$ {{ ui.currentProduct.arsPrice }}</p>
                                    <p><strong>Precio:</strong> USD$ {{ ui.currentProduct.usdPrice }}</p>
                                    <p><strong>Negocio:</strong> {{ ui.currentProduct.shop }}</p>
                                </div>
                                <!-- Footer -->
                                <div class="border-t border-gray-800 mt-4 pt-4 flex">
                                    <UButton class="me-4" variant="solid" @click="startEditClick">Editar</UButton>
                                    <!-- Popover to delete product -->
                                    <UPopover>
                                        <UButton color="gray" variant="ghost"
                                            :ui="{ color: { gray: { ghost: 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800' } } }">
                                            Eliminar
                                        </UButton>
                                        <template v-slot:panel="{ close }">
                                            <UCard>
                                                <div class="flex items-center gap-2">
                                                    <UIcon name="i-heroicons-exclamation-circle-20-solid"
                                                        class="me-1 text-xl text-red-400" />
                                                    <strong>¿Estás seguro?</strong>
                                                </div>
                                                <template #footer>
                                                    <UButton color="red" variant="solid" size="xs"
                                                        @click="confirmDeleteClick(close)">
                                                        Sí, eliminar</UButton>
                                                    <UButton color="white" variant="ghost" class="mx-4"
                                                        @click="cancelDeleteClick(close)">Cancelar</UButton>
                                                </template>
                                            </UCard>
                                        </template>
                                    </UPopover>
                                </div>
                            </div>

                            <!-- Edit form -->
                            <UForm ref="form" v-if="ui.editing" :validate="validate" :state="ui.currentProduct"
                                @submit.prevent="editProductClick" class="m-auto">
                                <p class="italic text-sm text-gray-500 mb-3">Para editar precio, ir a Historial</p>
                                <UFormGroup label="Producto" name="name" class="mb-3 justify-center"
                                    :ui="{ error: 'mt-1 text-red-500 dark:text-red-400 text-xs' }">
                                    <UInput v-model="ui.currentProduct.name"
                                        trailing-icon="i-heroicons-exclamation-circle-20-solid" />
                                </UFormGroup>
                                <UFormGroup label="Lugar/Negocio" name="shop" class=""
                                    :ui="{ error: 'mt-1 text-red-500 dark:text-red-400 text-xs' }">
                                    <UInput v-model="ui.currentProduct.shop"
                                        trailing-icon="i-heroicons-exclamation-circle-20-solid" />
                                </UFormGroup>
                                <!-- Edit form footer -->
                                <div class="border-t border-gray-800 mt-4 pt-4">
                                    <UButton type="submit" variant="solid">Aceptar</UButton>
                                    <UButton color="white" variant="ghost" class="mx-4" @click="cancelEditClick">Cancelar
                                    </UButton>
                                </div>
                            </UForm>
                        </div>
                        <div v-else-if="item.key === 'history'">
                            Esto es el historial
                        </div>
                        <div v-else-if="item.key === 'graph'">
                            Esto es el grafico
                        </div>

                    </UCard>
                </template>
            </UTabs>
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
        handler: () => { closeModal(); }
    }
})

const tabs = [
    {
        key: 'general',
        label: 'General'
    },
    {
        key: 'history',
        label: 'Historial'
    },
    {
        key: 'graph',
        label: "Gráfico"
    }
]

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
const emit = defineEmits(['closeModal', 'confirmEdit', 'confirmDelete'])

// Refs
const ui = ref<{
    editing: boolean,
    showingModal: boolean,
    currentProduct: IProduct
}>(
    {
        editing: false,
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
    if (!product.shop) errors.push({ path: 'shop', message: 'Por favor ingresa un nombre válido' })
    return errors
}

function startEditClick() {
    ui.value.editing = true;
}

function editProductClick() {
    ui.value.editing = false;
    emit('confirmEdit', { product: ui.value.currentProduct })
}

function cancelEditClick() {
    ui.value.editing = false;
}

function confirmDeleteClick(close: () => any) {
    ui.value.showingModal = false;
    emit('confirmDelete', { product: ui.value.currentProduct })
    close();
}

function closeModal() {
    ui.value.showingModal = false;
    ui.value.editing = false;
    emit('closeModal')
}

function cancelDeleteClick(close: () => any) {
    close();
}
</script>