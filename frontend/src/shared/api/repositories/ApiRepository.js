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

  async registerUser(user) {
    return Client.post("users/register", user);
  }

  async logInUser(user) {
    return Client.post("users/login", user);
  }

  async getAllUsers() {
    return Client.get("/users");
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

  async resetUserPassword(userId) {
    return Client.post(`users/${userId}/reset-password`, {});
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
}
