import { createApp } from "vue";
import App from "./app/App.vue";
import PrimeVue from "primevue/config";
import "primeicons/primeicons.css";
import Aura from "@primeuix/themes/aura";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import router from "./router";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import Inputnumber from "primevue/inputnumber";
import InputIcon from "primevue/inputicon";
import IconField from "primevue/iconfield";
import "./assets/main.css";

const app = createApp(App).use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: "p",
      darkModeSelector: ".dark",
      cssLayer: false,
    },
  },
});
app.component("p-datatable", DataTable);
app.component("p-column", Column);
app.component("p-button", Button);
app.component("p-dialog", Dialog);
app.component("p-inputText", InputText);
app.component("p-select", Select);
app.component("p-textarea", Textarea);
app.component("p-inputnumber", Inputnumber);
app.component("p-inputIcon", InputIcon);
app.component("p-iconField", IconField);

app.mount("#app");
