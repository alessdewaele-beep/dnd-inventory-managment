<script setup>
import { onMounted, ref, computed } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { campaignsService } from "@/shared/services/domain/campaignsService";
import { usersService } from "@/shared/services/domain/usersService";
import CampaignFormDialog from "@/features/adminPanel/components/CampaignFormDialog.vue";

const confirm = useConfirm();
const toast = useToast();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const emptyCampaign = () => ({ name: "", description: "" });
const formVisible = ref(false);
const selectedCampaign = ref(emptyCampaign());

const dmDialog = ref({ visible: false, campaign: null, userId: null });
const playersDialog = ref({ visible: false, campaign: null, addUserId: null });

const userMap = computed(() => {
  const map = {};
  usersService.state.adminUsers.forEach((u) => (map[u.id] = u.username));
  return map;
});

const userOptions = computed(() => usersService.state.adminUsers);

// Players of the campaign in the players dialog.
const currentPlayers = computed(() => {
  const c = playersDialog.value.campaign;
  if (!c) return [];
  return usersService.state.adminUsers.filter((u) => u.campaign_id === c.id);
});

// Users not yet assigned to any campaign (addable).
const assignableUsers = computed(() =>
  usersService.state.adminUsers.filter((u) => !u.campaign_id)
);

function notify(ok, okDetail, service) {
  if (ok) {
    toast.add({ severity: "success", summary: "Success", detail: okDetail, life: 3000 });
  } else {
    toast.add({ severity: "error", summary: "Error", detail: service.state.errorMessage, life: 4000 });
  }
}

// --- CRUD ---
function openCreate() {
  selectedCampaign.value = emptyCampaign();
  formVisible.value = true;
}

function openEdit(campaign) {
  selectedCampaign.value = { id: campaign.id, name: campaign.name, description: campaign.description };
  formVisible.value = true;
}

async function saveCampaign() {
  const c = selectedCampaign.value;
  if (!c.name) {
    toast.add({ severity: "warn", summary: "Name required", life: 3000 });
    return;
  }
  const ok = c.id
    ? await campaignsService.updateCampaign(c.id, { name: c.name, description: c.description })
    : await campaignsService.createCampaign({ name: c.name, description: c.description });
  notify(ok, c.id ? "Campaign updated." : "Campaign created.", campaignsService);
  if (ok) formVisible.value = false;
}

function confirmDelete(event, campaign) {
  confirm.require({
    target: event.currentTarget,
    header: "Delete campaign",
    message: `Are you sure you want to delete "${campaign.name}"?`,
    icon: "pi pi-exclamation-triangle",
    rejectProps: { label: "Cancel", severity: "secondary" },
    acceptProps: { label: "Delete", severity: "danger" },
    accept: async () => {
      const ok = await campaignsService.deleteCampaign(campaign.id);
      notify(ok, "Campaign deleted.", campaignsService);
    },
  });
}

// --- Assign DM ---
function openDm(campaign) {
  dmDialog.value = { visible: true, campaign, userId: campaign.dungeon_master ?? null };
}

async function saveDm() {
  const { campaign, userId } = dmDialog.value;
  const ok = await campaignsService.assignDungeonMaster(campaign.id, userId);
  if (ok) await usersService.fetchAdminUsers();
  notify(ok, "Dungeon master updated.", campaignsService);
  if (ok) dmDialog.value.visible = false;
}

// --- Manage players ---
function openPlayers(campaign) {
  playersDialog.value = { visible: true, campaign, addUserId: null };
}

async function addPlayer() {
  const { campaign, addUserId } = playersDialog.value;
  if (!addUserId) return;
  const ok = await usersService.updateUser(addUserId, { campaign_id: campaign.id });
  notify(ok, "Player added.", usersService);
  if (ok) playersDialog.value.addUserId = null;
}

async function removePlayer(user) {
  const ok = await usersService.updateUser(user.id, { campaign_id: null });
  notify(ok, "Player removed from campaign.", usersService);
}

function playerCount(campaign) {
  return usersService.state.adminUsers.filter((u) => u.campaign_id === campaign.id).length;
}

onMounted(() => {
  campaignsService.fetchAllCampaigns();
  usersService.fetchAdminUsers();
});
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div>
        <h2 class="font-serif text-2xl mb-1">Campaigns</h2>
        <p class="text-sm opacity-70">Manage campaigns, DMs and players.</p>
      </div>
      <p-button label="New campaign" icon="pi pi-plus" @click="openCreate" />
    </div>

    <p v-if="campaignsService.state.errorMessage" class="text-blood mb-4">
      {{ campaignsService.state.errorMessage }}
    </p>

    <div class="rounded-xl overflow-hidden border-2 border-gold shadow-xl w-full">
    <p-datatable
      :value="campaignsService.state.allCampaigns"
      :filters="filters"
      :global-filter-fields="['name', 'description']"
      paginator
      :rows="10"
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
              placeholder="Search…"
              class="!bg-transparent !border-none !text-ink-light !outline-none w-full"
            />
          </div>
        </div>
      </template>

      <template #empty>
        <div class="py-6 text-center opacity-60">No campaigns found.</div>
      </template>

      <p-column field="id" header="ID" sortable style="width: 5rem; min-width: 4rem">
        <template #body="{ data }">
          <span class="rt-label">ID</span>
          <span>{{ data.id }}</span>
        </template>
      </p-column>
      <p-column field="name" header="Name" sortable headerClass="dt-col-left" style="min-width: 9rem">
        <template #body="{ data }">
          <span class="rt-label">Name</span>
          <span>{{ data.name }}</span>
        </template>
      </p-column>
      <p-column field="description" header="Description" headerClass="dt-col-left" style="min-width: 12rem">
        <template #body="{ data }">
          <span class="rt-label">Description</span>
          <span class="opacity-80 line-clamp-2">{{ data.description || "—" }}</span>
        </template>
      </p-column>
      <p-column header="Dungeon master" headerClass="dt-col-left" style="min-width: 10rem">
        <template #body="{ data }">
          <span class="rt-label">Dungeon master</span>
          <span v-if="data.dungeon_master" class="flex items-center gap-2">
            <i class="pi pi-user opacity-60"></i>{{ userMap[data.dungeon_master] || `#${data.dungeon_master}` }}
          </span>
          <span v-else class="opacity-50">None</span>
        </template>
      </p-column>
      <p-column header="Players" style="width: 6rem; min-width: 6rem">
        <template #body="{ data }">
          <span class="rt-label">Players</span>
          <p-tag :value="String(playerCount(data))" severity="secondary" />
        </template>
      </p-column>
      <p-column header="Actions" style="width: 13rem; min-width: 13rem">
        <template #body="{ data }">
          <span class="rt-label">Actions</span>
          <div class="flex gap-2">
            <p-button icon="pi pi-pencil" size="small" severity="secondary" title="Edit" @click="openEdit(data)" />
            <p-button icon="pi pi-crown" size="small" severity="secondary" title="Assign DM" @click="openDm(data)" />
            <p-button icon="pi pi-users" size="small" severity="secondary" title="Players" @click="openPlayers(data)" />
            <p-button icon="pi pi-trash" size="small" severity="danger" title="Delete" @click="confirmDelete($event, data)" />
          </div>
        </template>
      </p-column>
    </p-datatable>
    </div>

    <CampaignFormDialog
      v-model:visible="formVisible"
      :campaign="selectedCampaign"
      @save="saveCampaign"
      @cancel="formVisible = false"
    />

    <!-- Assign DM -->
    <p-dialog
      v-model:visible="dmDialog.visible"
      modal
      class="my-dialog w-full max-w-[460px] mx-4"
      header="Assign dungeon master"
    >
      <div v-if="dmDialog.campaign" class="flex flex-col gap-4 pt-2">
        <p class="text-sm opacity-80">
          Choose the DM for <strong>{{ dmDialog.campaign.name }}</strong>. The chosen user will automatically receive the DM role.
        </p>
        <p-select
          v-model="dmDialog.userId"
          :options="userOptions"
          option-label="username"
          option-value="id"
          placeholder="Choose a user"
          show-clear
          class="w-full"
        />
        <div class="flex justify-end gap-2">
          <p-button label="Cancel" severity="secondary" @click="dmDialog.visible = false" />
          <p-button label="Save" icon="pi pi-check" class="dt-primary-btn" @click="saveDm" />
        </div>
      </div>
    </p-dialog>

    <!-- Manage players -->
    <p-dialog
      v-model:visible="playersDialog.visible"
      modal
      class="my-dialog w-full max-w-[520px] mx-4"
      header="Manage players"
    >
      <div v-if="playersDialog.campaign" class="flex flex-col gap-4 pt-2">
        <p class="text-sm opacity-80">
          Players assigned to <strong>{{ playersDialog.campaign.name }}</strong>.
        </p>

        <ul class="divide-y divide-gold/20 max-h-56 overflow-auto">
          <li
            v-for="p in currentPlayers"
            :key="p.id"
            class="flex items-center justify-between py-2 text-sm"
          >
            <span class="flex items-center gap-2">
              <i class="pi pi-user opacity-60"></i>{{ p.username }}
              <p-tag :value="p.role" severity="secondary" />
            </span>
            <p-button icon="pi pi-times" size="small" severity="danger" text title="Remove" @click="removePlayer(p)" />
          </li>
          <li v-if="!currentPlayers.length" class="py-2 text-sm opacity-60">No players yet.</li>
        </ul>

        <div class="flex items-end gap-2 border-t border-gold/20 pt-3">
          <div class="flex-1 flex flex-col gap-1">
            <label class="text-sm font-medium">Add player</label>
            <p-select
              v-model="playersDialog.addUserId"
              :options="assignableUsers"
              option-label="username"
              option-value="id"
              placeholder="Choose an available user"
              class="w-full"
            />
          </div>
          <p-button icon="pi pi-plus" label="Add" :disabled="!playersDialog.addUserId" @click="addPlayer" />
        </div>

        <div class="flex justify-end">
          <p-button label="Close" severity="secondary" @click="playersDialog.visible = false" />
        </div>
      </div>
    </p-dialog>
  </div>
</template>
