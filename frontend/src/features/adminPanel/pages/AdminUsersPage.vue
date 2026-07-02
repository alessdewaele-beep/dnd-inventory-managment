<script setup>
import { onMounted, ref, computed } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { usersService } from "@/shared/services/domain/usersService";
import { campaignsService } from "@/shared/services/domain/campaignsService";

const confirm = useConfirm();
const toast = useToast();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

// Toont het gegenereerde wachtwoord eenmalig na een reset.
const resetDialog = ref({ visible: false, username: "", password: "" });

// campaign_id -> campagnenaam, om leesbare namen in de tabel te tonen.
const campaignMap = computed(() => {
  const map = {};
  campaignsService.state.allCampaigns.forEach((c) => (map[c.id] = c.name));
  return map;
});

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("nl-BE");
}

function confirmDelete(event, user) {
  confirm.require({
    target: event.currentTarget,
    header: "Gebruiker verwijderen",
    message: `Weet je zeker dat je "${user.username}" wilt verwijderen? Ook diens items worden verwijderd.`,
    icon: "pi pi-exclamation-triangle",
    rejectProps: { label: "Annuleren", severity: "secondary" },
    acceptProps: { label: "Verwijderen", severity: "danger" },
    accept: async () => {
      const ok = await usersService.deleteUser(user.id);
      if (ok) {
        toast.add({ severity: "success", summary: "Verwijderd", detail: `${user.username} is verwijderd.`, life: 3000 });
      } else {
        toast.add({ severity: "error", summary: "Fout", detail: usersService.state.errorMessage, life: 4000 });
      }
    },
  });
}

async function resetPassword(user) {
  const result = await usersService.resetPassword(user.id);
  if (result?.password) {
    resetDialog.value = { visible: true, username: result.username, password: result.password };
  } else {
    toast.add({ severity: "error", summary: "Fout", detail: usersService.state.errorMessage, life: 4000 });
  }
}

async function copyPassword() {
  try {
    await navigator.clipboard.writeText(resetDialog.value.password);
    toast.add({ severity: "success", summary: "Gekopieerd", life: 2000 });
  } catch {
    // Klembord niet beschikbaar; gebruiker kan handmatig kopiëren.
  }
}

function roleSeverity(role) {
  if (role === "Admin") return "warn";
  if (role === "DM") return "info";
  return "secondary";
}

onMounted(() => {
  usersService.fetchAdminUsers();
  campaignsService.fetchAllCampaigns();
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="font-serif text-2xl mb-1">Gebruikers</h2>
        <p class="text-sm opacity-70">Beheer gebruikers, wachtwoorden en rollen.</p>
      </div>
    </div>

    <p v-if="usersService.state.errorMessage" class="text-blood mb-4">
      {{ usersService.state.errorMessage }}
    </p>

    <p-datatable
      :value="usersService.state.adminUsers"
      :filters="filters"
      :global-filter-fields="['username', 'role']"
      paginator
      :rows="10"
      :rows-per-page-options="[10, 25, 50]"
      removable-sort
      data-key="id"
      class="my-datatable"
    >
      <template #header>
        <div class="flex justify-end">
          <p-iconField>
            <p-inputIcon class="pi pi-search" />
            <p-inputText v-model="filters.global.value" placeholder="Zoeken…" />
          </p-iconField>
        </div>
      </template>

      <template #empty>
        <div class="py-6 text-center opacity-60">Geen gebruikers gevonden.</div>
      </template>

      <p-column field="id" header="ID" sortable style="width: 5rem" />
      <p-column field="username" header="Gebruikersnaam" sortable />
      <p-column field="role" header="Rol" sortable>
        <template #body="{ data }">
          <p-tag :value="data.role" :severity="roleSeverity(data.role)" />
        </template>
      </p-column>
      <p-column header="Campagne">
        <template #body="{ data }">
          <span>{{ data.campaign_id ? (campaignMap[data.campaign_id] || `#${data.campaign_id}`) : "—" }}</span>
        </template>
      </p-column>
      <p-column field="created_at" header="Aangemaakt" sortable>
        <template #body="{ data }">{{ formatDate(data.created_at) }}</template>
      </p-column>
      <p-column header="Acties" style="width: 12rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <p-button
              icon="pi pi-key"
              size="small"
              severity="secondary"
              title="Wachtwoord resetten"
              @click="resetPassword(data)"
            />
            <p-button
              icon="pi pi-trash"
              size="small"
              severity="danger"
              title="Verwijderen"
              @click="confirmDelete($event, data)"
            />
          </div>
        </template>
      </p-column>
    </p-datatable>

    <!-- Tijdelijk wachtwoord na reset -->
    <p-dialog
      v-model:visible="resetDialog.visible"
      modal
      class="my-dialog w-full max-w-[460px] mx-4"
      :header="`Nieuw wachtwoord voor ${resetDialog.username}`"
    >
      <div class="flex flex-col gap-3 pt-2">
        <p class="text-sm opacity-80">
          Geef dit tijdelijke wachtwoord door aan de gebruiker. Het wordt maar één keer getoond.
        </p>
        <div class="flex items-center gap-2">
          <code class="flex-1 px-3 py-2 rounded-lg bg-black/5 dark:bg-white/10 font-mono text-lg tracking-wide">
            {{ resetDialog.password }}
          </code>
          <p-button icon="pi pi-copy" severity="secondary" @click="copyPassword" />
        </div>
        <div class="flex justify-end">
          <p-button label="Sluiten" @click="resetDialog.visible = false" />
        </div>
      </div>
    </p-dialog>
  </div>
</template>
