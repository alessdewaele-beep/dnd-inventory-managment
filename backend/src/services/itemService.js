const itemRepository = require("../repositories/itemRepository");
const userRepository = require("../repositories/userRepository");
const campaignRepository = require("../repositories/campaignRepository");

class ItemService {
  getAllItems() {
    return itemRepository.getAll();
  }

  getItem(id) {
    return itemRepository.getById(id);
  }

  getItemByUserId(userId) {
    return itemRepository.getByUserId(userId);
  }

  // Mag `requester` de inventory van gebruiker `targetUserId` bekijken?
  // Toegestaan als het de gebruiker zelf is, of de DM van diens campaign.
  async canViewInventory(requester, targetUserId) {
    if (requester.id === targetUserId) return true; // eigen inventory
    if (requester.role === "Admin") return true; // admin beheert alles

    const target = await userRepository.findById(targetUserId);
    if (!target || !target.campaign_id) return false;

    const campaign = await campaignRepository.getById(target.campaign_id);
    return !!campaign && campaign.dungeon_master === requester.id;
  }

  createItem(data) {
    return itemRepository.create(data);
  }

  updateItem(id, data) {
    return itemRepository.update(id, data);
  }

  deleteItem(id) {
    return itemRepository.delete(id);
  }
}

module.exports = new ItemService();
