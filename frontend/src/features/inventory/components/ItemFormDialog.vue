<script setup>
import { ref } from "vue";
import { typeIcon } from "@/entities/item/itemIcon";

const props = defineProps({
  visible: { type: Boolean, required: true },
  item: { type: Object, required: true },
  // View mode: no upload/changing of the photo (DM/admin who is looking on).
  readonly: { type: Boolean, default: false },
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

// --- Photo upload ---
// The image is resized client-side and set on the item as a data URI (base64);
// the backend stores that string. This way no external file storage is needed
// and the payload stays small.
const MAX_DIM = 512; // longest side in px
const JPEG_QUALITY = 0.8;

const fileInput = ref(null);
const uploadError = ref("");

const pickFile = () => fileInput.value?.click();

const onFileChange = (event) => {
  const file = event.target.files?.[0];
  // Reset immediately so the same file can be selected again afterwards.
  event.target.value = "";
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    uploadError.value = "Choose an image file.";
    return;
  }
  uploadError.value = "";

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width >= height && width > MAX_DIM) {
        height = Math.round((height * MAX_DIM) / width);
        width = MAX_DIM;
      } else if (height > width && height > MAX_DIM) {
        width = Math.round((width * MAX_DIM) / height);
        height = MAX_DIM;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      // White background: transparent PNGs otherwise turn black in JPEG.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      props.item.image = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    };
    img.onerror = () => {
      uploadError.value = "Could not read the image.";
    };
    img.src = reader.result;
  };
  reader.onerror = () => {
    uploadError.value = "Could not read the file.";
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  props.item.image = null;
  uploadError.value = "";
};

// Enlarged view of the photo (click the preview in this detail screen).
const previewVisible = ref(false);
const openPreview = () => {
  if (props.item.image) previewVisible.value = true;
};

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
      <!-- Photo: preview + upload/remove -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium">Photo</label>
        <div class="flex items-center gap-4">
          <div
            class="flex items-center justify-center rounded-lg border-2 border-gold overflow-hidden bg-ink/5 dark:bg-white/5 shrink-0"
            style="width: 5rem; height: 5rem"
          >
            <img
              v-if="item.image"
              :src="item.image"
              alt="Item photo"
              class="w-full h-full object-cover cursor-zoom-in"
              title="Click to enlarge"
              @click="openPreview"
            />
            <span
              v-else
              class="leading-none"
              style="font-size: 2.25rem"
              :title="item.type"
              >{{ typeIcon(item.type) }}</span
            >
          </div>

          <div v-if="!props.readonly" class="flex flex-col gap-2">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onFileChange"
            />
            <p-button
              :label="item.image ? 'Change photo' : 'Upload photo'"
              icon="pi pi-upload"
              severity="secondary"
              size="small"
              @click="pickFile"
            />
            <p-button
              v-if="item.image"
              label="Remove"
              icon="pi pi-times"
              severity="secondary"
              text
              size="small"
              @click="removeImage"
            />
          </div>
        </div>
        <small v-if="uploadError" class="text-red-500">{{ uploadError }}</small>
      </div>

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

  <!-- Enlarged view of the photo -->
  <p-dialog
    v-model:visible="previewVisible"
    modal
    dismissableMask
    class="my-dialog w-full max-w-[520px] mx-4"
  >
    <template #header>
      <span class="font-serif text-lg flex items-center gap-2">
        <i class="pi pi-image"></i>
        {{ item.name }}
      </span>
    </template>
    <img
      v-if="item.image"
      :src="item.image"
      :alt="item.name"
      class="w-full h-auto rounded-lg"
    />
  </p-dialog>
</template>
