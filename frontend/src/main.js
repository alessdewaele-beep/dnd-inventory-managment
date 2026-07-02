import { createApp } from "vue";
import App from "./app/App.vue";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import ConfirmPopup from "primevue/confirmpopup";
import ConfirmDialog from "primevue/confirmdialog";
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";
import Tag from "primevue/tag";
import "primeicons/primeicons.css";
import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primeuix/themes";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import router from "./router";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import Inputnumber from "primevue/inputnumber";
import MultiSelect from "primevue/multiselect";
import InputIcon from "primevue/inputicon";
import IconField from "primevue/iconfield";
import "./assets/main.css";

// Aura's standaard-primary is emerald-groen; die kleurt overal door in
// focus-randen, geselecteerde opties, highlights ... Hier vervangen we hem
// door de gouden huisstijlkleur (#d9b44a) zodat alles in lijn ligt.
const GoldAura = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#faf4e1",
      100: "#f3e6bb",
      200: "#ebd894",
      300: "#e3c96c",
      400: "#debd52",
      500: "#d9b44a",
      600: "#c39d3f",
      700: "#a8842f",
      800: "#8d6b20",
      900: "#725313",
      950: "#4a350a",
    },
  },
});

const app = createApp(App).use(router);
app.use(PrimeVue, {
  theme: {
    preset: GoldAura,
    options: {
      prefix: "p",
      darkModeSelector: ".dark",
      cssLayer: false,
    },
  },
});
app.use(ConfirmationService);
app.use(ToastService);
app.component("p-confirmpopup", ConfirmPopup);
app.component("p-confirmdialog", ConfirmDialog);
app.component("p-toast", Toast);
app.component("p-tag", Tag);
app.component("p-datatable", DataTable);
app.component("p-column", Column);
app.component("p-button", Button);
app.component("p-dialog", Dialog);
app.component("p-inputText", InputText);
app.component("p-select", Select);
app.component("p-textarea", Textarea);
app.component("p-inputnumber", Inputnumber);
app.component("p-multiselect", MultiSelect);
app.component("p-inputIcon", InputIcon);
app.component("p-iconField", IconField);

app.mount("#app");
