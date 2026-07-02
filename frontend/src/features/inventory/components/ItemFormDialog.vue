<script setup>
const props = defineProps({
  visible: { type: Boolean, required: true },
  item: { type: Object, required: true },
});

const emit = defineEmits(["update:visible", "save", "cancel"]);

const typeOptions = [
  { label: "Weapon (melee)", value: "weapon melee" },
  { label: "Weapon (ranged)", value: "weapon ranged" },
  { label: "Armor (light)", value: "armor light" },
  { label: "Armor (medium)", value: "armor medium" },
  { label: "Armor (heavy)", value: "armor heavy" },
  { label: "Potion", value: "potion" },
  { label: "Jewelry", value: "jewelry" },
  { label: "Misc", value: "misc" },
];

const close = () => emit("update:visible", false);
const cancel = () => {
  close();
  emit("cancel");
};
const save = () => emit("save");
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
        <i class="pi pi-sparkles"></i>
        {{ item.id ? "Edit item" : "Add item" }}
      </span>
    </template>

    <div class="flex flex-col gap-4 pt-2">
      <div class="flex flex-col gap-1">
        <label for="name" class="text-sm font-medium">Name</label>
        <p-inputText id="name" v-model="item.name" placeholder="Enter name" />
      </div>

      <div class="flex flex-col gap-1">
        <label for="description" class="text-sm font-medium">Description</label>
        <p-textarea
          v-model="item.description"
          autoResize
          rows="3"
          placeholder="Enter description"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label for="type" class="text-sm font-medium">Type</label>
        <p-select
          id="type"
          v-model="item.type"
          :options="typeOptions"
          placeholder="Select type"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label for="quantity" class="text-sm font-medium">Quantity</label>
        <p-inputnumber v-model="item.quantity" placeholder="Enter quantity" class="w-full" />
      </div>

      <div class="flex justify-end gap-2 mt-2">
        <p-button label="Cancel" severity="secondary" @click="cancel" />
        <p-button
          v-if="!item.id"
          label="Add"
          icon="pi pi-check"
          class="dt-primary-btn"
          @click="save"
        />
        <p-button
          v-else
          label="Update"
          icon="pi pi-check"
          class="dt-primary-btn"
          @click="save"
        />
      </div>
    </div>
  </p-dialog>
</template>
