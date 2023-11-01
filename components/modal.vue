<template>
    <div>
        <UModal v-model="ui.showingModal" prevent-close>
            <h3 class="font-bold text-lg uppercase text-center my-5">{{
                ui.currentProduct.name }}</h3>
            <UTabs :items="tabs" :ui="{ list: { rounded: '' } }">
                <template #item="{ item }">
                    <UCard :ui="{ ring: '', body: { padding: 'px-4 py-5 pt-3 sm:p-6 sm:pt-3' } }">
                        <!-- General tab -->
                        <div v-if="item.key === 'general'">
                            <div v-if="!ui.editing">
                                <!-- General info -->
                                <div>
                                    <p><strong>Precio hoy:</strong> ARS$ {{ ui.currentProduct.estPrice }}</p>
                                    <p><strong>Precio antes:</strong> ARS$ {{ ui.currentProduct.history[0].arsPrice }} /
                                        USD$ {{ ui.currentProduct.history[0].usdPrice }}</p>
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
                        <!-- History tab -->
                        <div v-else-if="item.key === 'history'">
                            <div v-if="!(ui.addingPrice || ui.editingPrice)">
                                <!-- History list -->
                                <UTable :columns="columns" :rows="ui.currentProduct.history"
                                    :ui="{ tbody: 'divide-y divide-gray-200 dark:divide-gray-800 block max-h-96 overflow-auto', tr: { base: 'table table-fixed w-full' } }"
                                    @select="selectHistoryClick" />
                                <!-- Footer -->
                                <div class="border-t border-gray-800 mt-4 pt-4 flex">
                                    <UButton class="me-4" variant="solid" icon="i-heroicons-plus" square
                                        @click="addPriceClick"></UButton>
                                </div>
                            </div>

                            <!-- New/edit price form -->
                            <UForm ref="form" v-if="ui.addingPrice || ui.editingPrice" :validate="validatePriceForm"
                                :state="ui.currentHistory" @submit.prevent="submitHistoryForm" class="m-auto">
                                <h3 class="text-primary-500 font-bold text-lg flex justify-center items-center gap-1">
                                    <UIcon :name="ui.addingPrice ? 'i-heroicons-plus' : 'i-heroicons-pencil-square'" />
                                    {{ ui.addingPrice ? 'Nuevo' : 'Editar' }}
                                </h3>
                                <UFormGroup label="Precio (ARS$)" name="arsPrice" class="mb-3 justify-center"
                                    :ui="{ error: 'mt-1 text-red-500 dark:text-red-400 text-xs' }">
                                    <UInput v-model="ui.currentHistory.arsPrice"
                                        trailing-icon="i-heroicons-exclamation-circle-20-solid" />
                                </UFormGroup>
                                <!-- Form footer -->
                                <div class="flex justify-between border-t border-gray-800 mt-4 pt-4">
                                    <div>
                                        <UButton type="submit" variant="solid">Aceptar</UButton>
                                        <UButton color="white" variant="ghost" class="mx-4" @click="cancelPriceForm">
                                            Cancelar
                                        </UButton>
                                    </div>

                                    <UPopover v-if="showPopover">
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
                                                    <UButton color="red" variant="solid" size="xs"
                                                        @click="confirmDeleteHistoryClick">
                                                        Sí, eliminar</UButton>
                                                    <UButton color="white" variant="ghost" class="mx-4"
                                                        @click="cancelDeleteClick(close)">Cancelar</UButton>
                                                </template>
                                            </UCard>
                                        </template>
                                    </UPopover>
                                </div>
                            </UForm>

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
import { uuid } from 'vue-uuid';
import { IProductHistory } from 'typings/product-history.data';


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

const columns = [
    {
        key: 'date',
        label: 'Fecha',
    },
    {
        key: 'usdPrice',
        label: 'Precio (USD$)'
    },
    {
        key: 'arsPrice',
        label: 'Precio (ARS$)'
    },
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
const emit = defineEmits(['closeModal', 'confirmEdit', 'confirmDelete', 'editedHistory'])

// Refs
const ui = ref<{
    addingPrice: boolean,
    editingPrice: boolean,
    editing: boolean,
    showingModal: boolean,
    currentProduct: IProduct,
    currentHistory: IProductHistory
}>(
    {
        addingPrice: false,
        editingPrice: false,
        editing: false,
        showingModal: false,
        currentProduct: { ...Utils.initialProduct },
        currentHistory: { ...Utils.initialHistory }
    }
);

// Computed

// Show popover based on edit/new mode and history list length
const showPopover = computed(() => {
    // It's adding a new price, dont show
    if (ui.value.addingPrice == true) return false;

    // It's editing a price
    else if (ui.value.editingPrice == true) {
        // Dont show if there's only one history item
        if (ui.value.currentProduct.history.length == 1 && ui.value.currentProduct.history[0].id == ui.value.currentHistory.id) return false;
        // Show if it has more
        else if (ui.value.currentProduct.history.length > 1) return true;
    }
})

// Watchers
watch(() => props.showingModal,
    (showingModal) => {
        ui.value.showingModal = showingModal;
    }
);
watch(() => props.product as IProduct,
    (product) => {
        ui.value.currentProduct = { ...product, history: [...product.history] };
    }
);

// Methods

/**
 * Closes modal
 */
function closeModal() {
    ui.value.showingModal = false;
    ui.value.editing = false;
    ui.value.addingPrice = false;
    ui.value.editingPrice = false;
    emit('closeModal')
}

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

/**
 * Validates price form for history
 * @param history 
 */
function validatePriceForm(history: IProductHistory): FormError[] {
    const errors = []
    if (!history.arsPrice) errors.push({ path: 'arsPrice', message: 'Por favor ingresa un precio válido ' })
    return errors
}

// GENERAL TAB METHODS -----

// Change to edit product mode
function startEditClick() {
    ui.value.editing = true;
}

// Confirm product edit
function editProductClick() {
    ui.value.editing = false;
    emit('confirmEdit', { product: ui.value.currentProduct })
}

// Exit edit product mode
function cancelEditClick() {
    ui.value.editing = false;
}

// Confirm delete
function confirmDeleteClick(close: () => any) {
    ui.value.showingModal = false;
    emit('confirmDelete', { product: ui.value.currentProduct })
    close();
}

// Exit delete product
function cancelDeleteClick(close: () => any) {
    close();
}

// ------- END GENERAL TAB METHODS

// HISTORY TAB METHODS -----------

// Show form to add new price
function addPriceClick() {
    ui.value.addingPrice = true;
    ui.value.currentHistory = Utils.initialHistory;
}

// Exit edit/add form to show table
function cancelPriceForm() {
    if (ui.value.addingPrice == true) ui.value.addingPrice = false;
    else if (ui.value.editingPrice == true) ui.value.editingPrice = false;
}

// Select history from table, enter edit mode
function selectHistoryClick(row: IProductHistory) {
    ui.value.editingPrice = true;
    ui.value.currentHistory = { ...row }
}

// Submit new/edited history
async function submitHistoryForm() {
    // New price
    if (ui.value.addingPrice) {
        ui.value.addingPrice = false;
        let usdPriceNow = 0;

        // Getting avg blue dollar price for today
        try {
            const data = await $fetch<{ blue: { value_avg: string } }>(`https://api.bluelytics.com.ar/v2/latest`)
            usdPriceNow = Number(data.blue.value_avg);
        } catch (error) {
            usdPriceNow = 0;
        }

        ui.value.currentHistory.id = uuid.v4();
        ui.value.currentHistory.date = new Date(Date.now()).toLocaleDateString('es-AR');
        ui.value.currentHistory.usdPrice = Utils.roundNumberTwoDecimals(ui.value.currentHistory.arsPrice / usdPriceNow);

        ui.value.currentProduct.history.unshift(ui.value.currentHistory)

        emit('editedHistory', { history: ui.value.currentHistory, productId: ui.value.currentProduct.id, isRemoving: false })

        Utils.clearObject(ui.value.currentHistory, Utils.initialHistory);

    }
    // Edit price
    else if (ui.value.editingPrice) {
        ui.value.editingPrice = false;

        const date = ui.value.currentHistory.date.split('/').reverse().join('-');
        let usdPriceAtDate = 0;

        // Getting avg blue dollar price for that date
        try {
            const data = await $fetch<{ blue: { value_avg: string } }>(`https://api.bluelytics.com.ar/v2/historical?day=${date}`)
            usdPriceAtDate = Number(data.blue.value_avg);
        } catch (error) {
            usdPriceAtDate = 0;
        }

        // Update usd price
        ui.value.currentHistory.usdPrice = Utils.roundNumberTwoDecimals(ui.value.currentHistory.arsPrice / usdPriceAtDate);

        // Replace with edited history
        const index = ui.value.currentProduct.history.findIndex(h => h.id == ui.value.currentHistory.id)
        ui.value.currentProduct.history[index] = ui.value.currentHistory;

        emit('editedHistory', { history: ui.value.currentHistory, productId: ui.value.currentProduct.id, isRemoving: false })

    }
}

// Confirm delete for a history item
function confirmDeleteHistoryClick() {
    ui.value.editingPrice = false;
    const index = ui.value.currentProduct.history.findIndex(h => h.id == ui.value.currentHistory.id)
    ui.value.currentProduct.history.splice(index, 1);

    emit('editedHistory', { history: ui.value.currentHistory, productId: ui.value.currentProduct.id, isRemoving: true })
}

// ------- END HISTORY TAB METHODS
</script>