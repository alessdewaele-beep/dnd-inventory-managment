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

  // DM: send (copy) an item to players from the own campaign.
  async sendItem(itemId, payload) {
    return Client.post(`items/${itemId}/send`, payload);
  }

  // Owner has seen a new item: turn off the notification flag.
  async markItemSeen(itemId) {
    return Client.patch(`items/${itemId}/seen`, null, null);
  }

  // DM: players from the own campaign(s).
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

  // --- Self-service profile ---
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

  // --- Admin: users ---
  async deleteUser(userId) {
    return Client.delete("users", userId);
  }

  async updateUser(userId, data) {
    return Client.put("users", userId, data);
  }

  // --- Admin: campaigns ---
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

  // --- Currency: a user's coin purse ---
  async getCurrency(userId) {
    return Client.getAll(`currencies/${userId}`);
  }

  async updateCurrency(userId, coins) {
    return Client.put("currencies", userId, coins);
  }
}
