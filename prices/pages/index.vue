<template>
    <div>
        <h1>Preciomatic</h1>

        <form ref="productForm" @submit.prevent="addProduct()">
            <input type="text" placeholder="Producto" v-model="product.name" required>
            <input type="text" placeholder="Precio en pesos" v-model="product.arsPrice" required>
            <input type="text" placeholder="Precio actual dolar" v-model="product.usdPrice" required>
            <input type="text" placeholder="Lugar" v-model="product.shop" required>
            <button type="submit">Agregar</button>
        </form>

        <div v-for="(p, index) of productList" :key="index">
            <div>
                <p>Fecha: {{ p.date }}</p>
                <p>Producto: {{ p.name }}</p>
                <p>Precio en pesos: {{ p.arsPrice }}</p>
                <p>Precio dolar: {{ p.usdPrice }}</p>
                <p>Lugar: {{ p.shop }}</p>
            </div>

        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

// Initial product with cleared values
const initialProduct = {
    date: '',
    name: '',
    arsPrice: '',
    usdPrice: '',
    shop: ''
};

// Form product input
const product = reactive({ ...initialProduct })

// Product list
const productList = ref([])

// functions that mutate state and trigger updates
function addProduct() {
    product.date = new Date(Date.now()).toLocaleDateString('es-AR');
    productList.value.push({ ...product });
    clearForm(product, initialProduct)
}

/**
 * Clears form input values
 * @param {*} current Current item
 * @param {*} initial Item with inital/cleared values
 */
function clearForm(current, initial) {
    Object.assign(current, initial);
}

</script>