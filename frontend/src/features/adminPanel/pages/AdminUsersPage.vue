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

    <div class="rounded-xl overflow-hidden border-2 border-gold shadow-xl w-full">
    <p-datatable
      :value="usersService.state.adminUsers"
      :filters="filters"
      :global-filter-fields="['username', 'role']"
      paginator
      :rows="10"
      :rows-per-page-options="[10, 25, 50]"
      removable-sort
      stripedRows
      scrollable
      data-key="id"
      class="my-datatable"
    >
      <template #header>
        <div class="flex items-center justify-end px-4 py-3 bg-ink text-gold dark:bg-black/40">
          <div class="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 w-full sm:w-auto sm:min-w-[16rem]">
            <i class="pi pi-search text-blood shrink-0"></i>
            <p-inputText
              v-model="filters.global.value"
              placeholder="Zoeken…"
              class="!bg-transparent !border-none !text-ink-light !outline-none w-full"
            />
          </div>
        </div>
      </template>

      <template #empty>
        <div class="py-6 text-center opacity-60">Geen gebruikers gevonden.</div>
      </template>

      <p-column field="id" header="ID" sortable style="width: 5rem; min-width: 4rem" />
      <p-column field="username" header="Gebruikersnaam" sortable headerClass="dt-col-left" style="min-width: 10rem" />
      <p-column field="role" header="Rol" sortable style="min-width: 7rem">
        <template #body="{ data }">
          <p-tag :value="data.role" :severity="roleSeverity(data.role)" />
        </template>
      </p-column>
      <p-column header="Campagne" headerClass="dt-col-left" style="min-width: 9rem">
        <template #body="{ data }">
          <span>{{ data.campaign_id ? (campaignMap[data.campaign_id] || `#${data.campaign_id}`) : "—" }}</span>
        </template>
      </p-column>
      <p-column field="created_at" header="Aangemaakt" sortable style="min-width: 8rem">
        <template #body="{ data }">{{ formatDate(data.created_at) }}</template>
      </p-column>
      <p-column header="Acties" style="width: 8rem; min-width: 8rem">
        <template #body="{ data }">
          <div class="flex gap-2">
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
    </div>
  </div>
</template>
