<template>
    <UForm ref="form" :validate="validate" :state="product" @submit.prevent="addProductClick" class="mt-8 m-auto">
        <UFormGroup label="Producto" name="name" class="mb-3 justify-center"
            :ui="{ error: 'mt-1 text-red-500 dark:text-red-400 text-xs' }">
            <div class="flex items-center gap-3 search-and-add">
                <UInput ref="searchInput" v-model="product.name" placeholder="Buscar | Agregar"
                    icon="i-heroicons-magnifying-glass-20-solid" color="gray" variant="outline"
                    trailing-icon="i-heroicons-exclamation-circle-20-solid" @focus="scrollAtFocus" @keyup="searchProduct" />
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
                <UButton type="submit" class="my-2" :disabled="ui.usdPrice == 0">
                    Agregar
                </UButton>
            </div>

        </div>
    </UForm>
</template>

<script setup lang="ts">
import { FormError } from '@nuxthq/ui/dist/runtime/types';
import { IProduct } from 'typings/product.data';
import { Utils } from '../utils/utils';
import { uuid } from 'vue-uuid';


let product: IProduct = reactive({ ...Utils.initialProduct })

const form = ref()
const searchInput = ref();
const ui = ref<{
    usdPrice: number,
    showingForm: boolean,
}>(
    {
        usdPrice: 0,
        showingForm: false,
    }
);

// Props
const props = defineProps({
    product: {
        type: Object,
        required: true
    },
    usdPrice: {
        type: Number,
        required: true
    },
    showingForm: {
        type: Boolean,
        required: true
    }
})

// Emits
const emit = defineEmits(['addProductClick', 'searchProduct'])

// Watchers
watch(() => props.product,
    (prod) => {
        product = prod as IProduct;
    }
);
watch(() => props.usdPrice,
    (usdPrice) => {
        ui.value.usdPrice = usdPrice;
    }
);
watch(() => props.showingForm,
    (showingForm) => {
        ui.value.showingForm = showingForm;
    }
);

// Methods

function searchProduct() {
    emit('searchProduct', { searchValue: product.name })
}

/**
 * Toggles the product form
 */
 function showFormClick() {
    ui.value.showingForm = !ui.value.showingForm;
}

/**
 * Validates form and creates new product
 */
async function addProductClick() {
    if (!ui.value.showingForm) return;
    if (await form.value!.validate()) {
        // Calculating fields
        product.id = uuid.v4();
        product.date = new Date(Date.now()).toLocaleDateString('es-AR');
        product.usdPrice = Utils.roundNumberTwoDecimals(product.arsPrice / ui.value.usdPrice);
        product.estPrice = Utils.roundNumberTwoDecimals(product.usdPrice * ui.value.usdPrice);

        ui.value.showingForm = false;

        emit('addProductClick', { product })
        Utils.clearObject(product, Utils.initialProduct);

    }
}

/**
 * Scroll to input when focusing it
 */
function scrollAtFocus() {
    searchInput.value.input.scrollIntoView({ behavior: "smooth" });
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
</script>