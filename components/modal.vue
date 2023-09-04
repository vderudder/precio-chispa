<template>
    <div>
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
    </div>
</template>

<script setup lang="ts">
import { Utils } from '../utils/utils';
import { IProduct } from '../typings/product.data'

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
const emit = defineEmits(['cancelDelete', 'confirmDelete'])

// Refs
const ui = ref<{
    showingModal: boolean,
    product: IProduct
}>(
    {
        showingModal: false,
        product: { ...Utils.initialProduct }
    }
);

// Watchers
watch(() => props.showingModal,
    (showingModal) => {
        ui.value.showingModal = showingModal;
    }
);
watch(() => props.product,
    (product) => {
        ui.value.product = product as IProduct;
    }
);


// Methods
function confirmDeleteClick() {
    ui.value.showingModal = false;
    emit('confirmDelete', { product: ui.value.product })
    Utils.clearObject(ui.value.product, Utils.initialProduct);

}

function cancelDeleteClick() {
    ui.value.showingModal = false;
    emit('cancelDelete', { product: ui.value.product })
    Utils.clearObject(ui.value.product, Utils.initialProduct);


}
</script>