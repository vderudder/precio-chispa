# PrecioChispa

PrecioChispa is a web application designed to help you keep track of product prices in Argentina, a country facing economic instability and significant inflation.

### Tech stack
- [Nuxt 3](https://nuxt.com/)
- [NuxtLabs UI](https://ui.nuxtlabs.com/getting-started)

## Features

- Add products and their local prices in Argentine pesos (ARS).
- Automatically convert local prices to USD using the average blue market exchange rate using [Bluelytics API](https://bluelytics.com.ar/#!/api).
- Track the evolution of product prices in ARS over time based on USD fluctuations.

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/vderudder/precio-chispa.git
   cd precio-chispa
   ```
   
2. Make sure to install the dependencies:

   ```bash
  	# npm
    npm install
    ```
   ```bash
    # pnpm
    pnpm install
    ```
   ```bash
    # yarn
    yarn install
    ```

## Development Server

Start the development server on `http://localhost:3000`:
    
```bash
# npm
npm run dev
```

```bash
# pnpm
pnpm run dev
```
```bash
# yarn
yarn dev
```


## Authors

- [@vderudder](https://github.com/vderudder)
