<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  visible: { type: Boolean, required: true },
  // Het bronitem dat de DM verstuurt (of null als er nog geen gekozen is).
  item: { type: Object, default: null },
  // Spelers uit de campaign van de DM: [{ id, username, role }].
  players: { type: Array, required: true },
});

const emit = defineEmits(["update:visible", "confirm"]);

const recipientIds = ref([]);
const quantity = ref(1);
const error = ref("");

// Reset de velden telkens de dialog opent voor een (nieuw) item.
watch(
  () => props.visible,
  (open) => {
    if (open) {
      recipientIds.value = [];
      quantity.value = 1;
      error.value = "";
    }
  }
);

const close = () => emit("update:visible", false);

const confirm = () => {
  if (recipientIds.value.length === 0) {
    error.value = "Kies minstens één speler.";
    return;
  }
  if (!quantity.value || quantity.value < 1) {
    error.value = "Aantal moet minstens 1 zijn.";
    return;
  }
  emit("confirm", {
    recipientIds: [...recipientIds.value],
    quantity: quantity.value,
  });
};
</script>

<template>
  <p-dialog
    :visible="props.visible"
    @update:visible="(value) => emit('update:visible', value)"
    modal
    class="my-dialog w-full max-w-[600px] mx-4"
  >
    <template #header>
      <span class="font-serif text-lg flex items-center gap-2">
        <i class="pi pi-send"></i>
        Item versturen
      </span>
    </template>

    <div class="flex flex-col gap-4 pt-2">
      <p v-if="props.item" class="text-sm">
        Je stuurt een kopie van
        <span class="font-semibold">{{ props.item.name }}</span>
        naar de gekozen spelers. Jouw eigen item blijft behouden.
      </p>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium">Spelers</label>
        <p-multiselect
          v-model="recipientIds"
          :options="props.players"
          option-label="username"
          option-value="id"
          placeholder="Kies spelers"
          filter
          class="w-full"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium">Aantal (per speler)</label>
        <p-inputnumber
          v-model="quantity"
          :min="1"
          showButtons
          placeholder="Aantal"
          class="w-full"
        />
      </div>

      <p v-if="error" class="text-sm text-blood">{{ error }}</p>

      <div class="flex justify-end gap-2 mt-2">
        <p-button label="Annuleren" severity="secondary" @click="close" />
        <p-button
          label="Versturen"
          icon="pi pi-send"
          class="dt-primary-btn"
          @click="confirm"
        />
      </div>
    </div>
  </p-dialog>
</template>
