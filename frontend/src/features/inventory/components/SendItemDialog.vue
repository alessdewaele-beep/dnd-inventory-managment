<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  visible: { type: Boolean, required: true },
  // The source item the DM sends (or null if none has been chosen yet).
  item: { type: Object, default: null },
  // Players from the DM's campaign: [{ id, username, role }].
  players: { type: Array, required: true },
});

const emit = defineEmits(["update:visible", "confirm"]);

const recipientIds = ref([]);
const quantity = ref(1);
const error = ref("");

// Reset the fields every time the dialog opens for a (new) item.
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
    error.value = "Choose at least one player.";
    return;
  }
  if (!quantity.value || quantity.value < 1) {
    error.value = "Quantity must be at least 1.";
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
        Send item
      </span>
    </template>

    <div class="flex flex-col gap-4 pt-2">
      <p v-if="props.item" class="text-sm">
        You are sending a copy of
        <span class="font-semibold">{{ props.item.name }}</span>
        to the selected players. Your own item is kept.
      </p>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium">Players</label>
        <p-multiselect
          v-model="recipientIds"
          :options="props.players"
          option-label="username"
          option-value="id"
          placeholder="Choose players"
          filter
          class="w-full"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium">Quantity (per player)</label>
        <p-inputnumber
          v-model="quantity"
          :min="1"
          showButtons
          placeholder="Quantity"
          class="w-full"
        />
      </div>

      <p v-if="error" class="text-sm text-blood">{{ error }}</p>

      <div class="flex justify-end gap-2 mt-2">
        <p-button label="Cancel" severity="secondary" @click="close" />
        <p-button
          label="Send"
          icon="pi pi-send"
          class="dt-primary-btn"
          @click="confirm"
        />
      </div>
    </div>
  </p-dialog>
</template>
