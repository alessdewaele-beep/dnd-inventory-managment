import DnDRepository from "@/shared/api/repositories/DnDRepository";
import Client from "@/shared/lib/client/Client";

export default class ApiRepository extends DnDRepository {
  async getAllItemsByUserId(userId) {
    return Client.getAll(`items/user/${userId}`);
  }

  async addItem(item) {
    return Client.post(`items`, item);
  }

  async deleteItem(itemId) {
    return Client.delete(`items/${itemId}`);
  }

  async updateItem(item) {
    return Client.put("items", item.id, item);
  }

  // DM: verstuur (kopieer) een item naar spelers uit de eigen campaign.
  async sendItem(itemId, payload) {
    return Client.post(`items/${itemId}/send`, payload);
  }

  // Eigenaar heeft een nieuw item gezien: notificatievlag uitzetten.
  async markItemSeen(itemId) {
    return Client.patch(`items/${itemId}/seen`, null, null);
  }

  // DM: spelers uit de eigen campaign(s).
  async getMyCampaignPlayers() {
    return Client.getAll("users/my-campaign-players");
  }

  async registerUser(user) {
    return Client.post("users/register", user);
  }

  async logInUser(user) {
    return Client.post("users/login", user);
  }

  async getAllUsers() {
    return Client.get("/users");
  }

  // --- Self-service profiel ---
  async getMe() {
    return Client.getAll("users/me");
  }

  async updateProfile(data) {
    return Client.patch("users/me", null, data);
  }

  async changePassword(data) {
    return Client.patch("users/me/password", null, data);
  }

  async getPublicCampaigns() {
    return Client.getAll("campaigns/public");
  }

  // --- Admin: gebruikers ---
  async deleteUser(userId) {
    return Client.delete("users", userId);
  }

  async updateUser(userId, data) {
    return Client.put("users", userId, data);
  }

  // --- Admin: campagnes ---
  async getAllCampaigns() {
    return Client.getAll("campaigns");
  }

  async createCampaign(campaign) {
    return Client.post("campaigns", campaign);
  }

  async updateCampaign(campaignId, data) {
    return Client.put("campaigns", campaignId, data);
  }

  async deleteCampaign(campaignId) {
    return Client.delete("campaigns", campaignId);
  }

  async assignDungeonMaster(campaignId, userId) {
    return Client.post(`campaigns/${campaignId}/dm`, { userId });
  }

  // --- Admin: dashboard ---
  async getAdminStats() {
    return Client.getAll("admin/stats");
  }

  // --- Currency: muntenbeurs van een gebruiker ---
  async getCurrency(userId) {
    return Client.getAll(`currencies/${userId}`);
  }

  async updateCurrency(userId, coins) {
    return Client.put("currencies", userId, coins);
  }
}
