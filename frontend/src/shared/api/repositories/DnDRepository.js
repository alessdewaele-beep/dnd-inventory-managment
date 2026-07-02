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

  registerUser(user) {
    throw new Error("method not implemented");
  }
  logInUser(user) {
    throw new Error("method not implemented");
  }

  getAllUsers() {
    throw new Error("method not implemented");
  }

  getPublicCampaigns() {
    throw new Error("method not implemented");
  }

  // --- Admin: gebruikers ---
  deleteUser(userId) {
    throw new Error("method not implemented", userId);
  }

  updateUser(userId, data) {
    throw new Error("method not implemented", userId);
  }

  resetUserPassword(userId) {
    throw new Error("method not implemented", userId);
  }

  // --- Admin: campagnes ---
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
}
