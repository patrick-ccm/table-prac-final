import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'

import 'primevue/resources/themes/aura-dark-cyan/theme.css'

import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import ToastService from 'primevue/toastservice'

const app = createApp(App)
app.directive('tooltip', Tooltip)
app.use(PrimeVue)

app.use(ToastService)

app.mount('#app')
