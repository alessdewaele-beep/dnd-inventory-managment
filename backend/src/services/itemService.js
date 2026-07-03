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

  // May `requester` view the inventory of user `targetUserId`?
  // Allowed if it is the user themselves, or the DM of their campaign.
  async canViewInventory(requester, targetUserId) {
    if (requester.id === targetUserId) return true; // own inventory
    if (requester.role === "Admin") return true; // admin manages everything

    const target = await userRepository.findById(targetUserId);
    if (!target || !target.campaign_id) return false;

    const campaign = await campaignRepository.getById(target.campaign_id);
    return !!campaign && campaign.dungeon_master === requester.id;
  }

  // `creator` is the logged-in user. If someone other than the owner adds
  // the item (e.g. an admin), the owner receives a notification.
  createItem(data, creator) {
    const is_new = Number(data.userId) !== creator.id;
    return itemRepository.create({ ...data, is_new });
  }

  // The owner marks a new item as seen (hover in the inventory).
  async markItemSeen(requester, itemId) {
    const item = await itemRepository.getById(itemId);
    if (!item) return { error: "Item not found", status: 404 };
    if (item.userId !== requester.id) {
      return {
        error: "Only the owner can mark an item as seen",
        status: 403,
      };
    }
    if (item.is_new) await itemRepository.markSeen(itemId);
    return { item: { ...item, is_new: 0 } };
  }

  // The DM sends (a copy of) one of their own items to players from their
  // campaign. The source item stays unchanged; a new item is created per
  // recipient with the chosen quantity.
  async sendItemToPlayers(dm, itemId, recipientIds, quantity) {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      return { error: "Invalid quantity", status: 400 };
    }
    if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
      return { error: "No recipients selected", status: 400 };
    }

    const source = await itemRepository.getById(itemId);
    if (!source) return { error: "Item not found", status: 404 };
    if (source.userId !== dm.id) {
      return { error: "You can only send your own items", status: 403 };
    }

    // Build the set of valid recipients: players from the campaign(s) that this
    // DM leads, excluding the DM themselves.
    const campaigns = await campaignRepository.getByDungeonMaster(dm.id);
    const validPlayerIds = new Set();
    for (const campaign of campaigns) {
      const players = await userRepository.getByCampaignId(campaign.id);
      for (const player of players) {
        if (player.id !== dm.id) validPlayerIds.add(player.id);
      }
    }

    const targets = recipientIds.map(Number);
    const invalid = targets.filter((id) => !validPlayerIds.has(id));
    if (invalid.length > 0) {
      return {
        error: "One or more recipients are not in your campaign",
        status: 403,
      };
    }

    const created = [];
    for (const userId of targets) {
      const item = await itemRepository.create({
        name: source.name,
        description: source.description,
        type: source.type,
        quantity: qty,
        favourite: 0,
        userId,
        image: source.image, // sent item keeps its photo
        is_new: true, // recipient gets a notification in their inventory
      });
      created.push(item);
    }
    return { created };
  }

  updateItem(id, data) {
    return itemRepository.update(id, data);
  }

  deleteItem(id) {
    return itemRepository.delete(id);
  }
}

module.exports = new ItemService();
