export default class DnDRepository {
  getAllItemsByUserId(userId) {
    throw new Error("method not implemented", userId);
  }

  addItem(item) {
    throw new Error("method not implemented", item.id);
  }

  deleteItem(itemId) {
    throw new Error("method not implemented", itemId);
  }

  updateItem(item) {
    throw new Error("method not implemented", item.id);
  }

  sendItem(itemId, payload) {
    throw new Error("method not implemented", itemId);
  }

  markItemSeen(itemId) {
    throw new Error("method not implemented", itemId);
  }

  getMyCampaignPlayers() {
    throw new Error("method not implemented");
  }

  registerUser(user) {
    throw new Error("method not implemented");
  }
  logInUser(user) {
    throw new Error("method not implemented");
  }

  getAllUsers() {
    throw new Error("method not implemented");
  }

  // --- Self-service profile ---
  getMe() {
    throw new Error("method not implemented");
  }

  updateProfile(data) {
    throw new Error("method not implemented", data);
  }

  changePassword(data) {
    throw new Error("method not implemented", data);
  }

  getPublicCampaigns() {
    throw new Error("method not implemented");
  }

  // --- Admin: users ---
  deleteUser(userId) {
    throw new Error("method not implemented", userId);
  }

  updateUser(userId, data) {
    throw new Error("method not implemented", userId);
  }

  // --- Admin: campaigns ---
  getAllCampaigns() {
    throw new Error("method not implemented");
  }

  createCampaign(campaign) {
    throw new Error("method not implemented");
  }

  updateCampaign(campaignId, data) {
    throw new Error("method not implemented", campaignId);
  }

  deleteCampaign(campaignId) {
    throw new Error("method not implemented", campaignId);
  }

  assignDungeonMaster(campaignId, userId) {
    throw new Error("method not implemented", campaignId);
  }

  // --- Admin: dashboard ---
  getAdminStats() {
    throw new Error("method not implemented");
  }

  // --- Currency ---
  getCurrency(userId) {
    throw new Error("method not implemented", userId);
  }

  updateCurrency(userId, coins) {
    throw new Error("method not implemented", userId);
  }
}
