<script setup>
const props = defineProps({
  visible: { type: Boolean, required: true },
  campaign: { type: Object, required: true },
});

const emit = defineEmits(["update:visible", "save", "cancel"]);

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
    class="my-dialog w-full max-w-[560px] mx-4"
  >
    <template #header>
      <span class="font-serif text-lg flex items-center gap-2">
        <i class="pi pi-flag"></i>
        {{ campaign.id ? "Campagne bewerken" : "Nieuwe campagne" }}
      </span>
    </template>

    <div class="flex flex-col gap-4 pt-2">
      <div class="flex flex-col gap-1">
        <label for="c-name" class="text-sm font-medium">Naam</label>
        <p-inputText id="c-name" v-model="campaign.name" placeholder="Naam van de campagne" />
      </div>

      <div class="flex flex-col gap-1">
        <label for="c-desc" class="text-sm font-medium">Beschrijving</label>
        <p-textarea
          id="c-desc"
          v-model="campaign.description"
          autoResize
          rows="3"
          placeholder="Beschrijving"
        />
      </div>

      <div class="flex justify-end gap-2 mt-2">
        <p-button label="Annuleren" severity="secondary" @click="cancel" />
        <p-button
          :label="campaign.id ? 'Opslaan' : 'Aanmaken'"
          icon="pi pi-check"
          class="dt-primary-btn"
          @click="save"
        />
      </div>
    </div>
  </p-dialog>
</template>
