<template>
    <div class="text-center">
        <h1 class="text-4xl my-3">Precio<span class="text-primary-500">Chispa</span></h1>
        <!-- USD Price -->
        <div class="mb-6">
            <!-- Badge and edit -->
            <div v-if="!ui.editingUsdPrice">
                <UBadge color="gray" size="md" variant="solid" class="me-2">
                    <UIcon v-if="!props.loadingUsd" name="i-heroicons-currency-dollar-20-solid"
                        class="me-1 text-primary-500" />
                    <UIcon v-else name="i-heroicons-arrow-path-20-solid" class="me-1 animate-spin" />
                    {{ ui.usdPrice == 0 ? '' : ui.usdPrice }}
                </UBadge>
                <UButton :disabled="props.loadingUsd" icon="i-heroicons-pencil" size="2xs" color="lime" square
                    variant="soft" @click="editUsdPriceClick" />
            </div>

            <!-- Input and save -->
            <div v-if="(ui.editingUsdPrice || ui.usdPrice == 0) && !props.loadingUsd"
                class="flex flex-row justify-center items-center gap-3 w-32 m-auto">
                <UInput v-model="ui.usdPrice" type="number" class="w-24" size="xs" color="primary"
                    icon="i-heroicons-currency-dollar" />
                <UButton icon="i-heroicons-check" size="2xs" color="primary" square variant="solid"
                    @click="saveUsdPriceClick" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Props
const props = defineProps({
    usdPrice: {
        type: Number,
        required: true
    },
    loadingUsd: {
        type: Boolean,
        required: true
    }
})

// Emits
const emit = defineEmits(['usdPriceChange'])

// Refs
const ui = ref<{
    editingUsdPrice: boolean,
    usdPrice: number
}>(
    {
        editingUsdPrice: false,
        usdPrice: 0
    }
);

// Watchers
watch(() => props.usdPrice,
    (usdPrice) => {
        ui.value.usdPrice = usdPrice;
    }
)


// Methods
function editUsdPriceClick() {
    ui.value.editingUsdPrice = true;
}

function saveUsdPriceClick() {
    ui.value.editingUsdPrice = false;

    emit('usdPriceChange', { usdPrice: ui.value.usdPrice });
}

</script>