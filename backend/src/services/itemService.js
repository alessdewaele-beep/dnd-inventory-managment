const itemRepository = require("../repositories/itemRepository");
const userRepository = require("../repositories/userRepository");
const campaignRepository = require("../repositories/campaignRepository");
const notificationService = require("./notificationService");

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

  // Resolves which campaign's shared inventory `requester` belongs to.
  // The JWT does not carry the campaign, so it is looked up from the DB:
  // a DM leads campaign(s) (first one wins), a player belongs to one via
  // users.campaign_id. Returns null when there is no campaign context
  // (e.g. an admin, or a player not assigned to a campaign yet).
  async resolveMyCampaignId(requester) {
    const led = await campaignRepository.getByDungeonMaster(requester.id);
    if (led.length > 0) return led[0].id;

    const user = await userRepository.findById(requester.id);
    return user?.campaign_id ?? null;
  }

  // May `requester` view/modify the shared inventory of `campaignId`?
  // Allowed for the Admin, the DM of that campaign, or any player member.
  async canAccessCampaignInventory(requester, campaignId) {
    if (requester.role === "Admin") return true;

    const campaign = await campaignRepository.getById(campaignId);
    if (!campaign) return false;
    if (campaign.dungeon_master === requester.id) return true; // DM

    const user = await userRepository.findById(requester.id);
    return !!user && user.campaign_id === campaignId; // player member
  }

  // The shared inventory for the requester's own campaign, plus the resolved
  // campaign id (null when the requester has no campaign context).
  async getSharedInventory(requester) {
    const campaignId = await this.resolveMyCampaignId(requester);
    if (!campaignId) return { campaignId: null, items: [] };
    const items = await itemRepository.getByCampaignId(campaignId);
    return { campaignId, items };
  }

  // `creator` is the logged-in user. When `campaign_id` is present the item
  // is added to that campaign's shared inventory (owned by no single player);
  // otherwise it is a personal item. If someone other than the owner adds a
  // personal item (e.g. an admin), the owner receives a notification.
  async createItem(data, creator) {
    if (data.campaign_id != null) {
      const campaignId = Number(data.campaign_id);
      const allowed = await this.canAccessCampaignInventory(creator, campaignId);
      if (!allowed) return { error: "Insufficient permissions", status: 403 };
      const item = await itemRepository.create({
        ...data,
        userId: null,
        campaign_id: campaignId,
        is_new: false,
      });
      // Shared inventory: tell every other campaign member about the addition.
      await notificationService.notifySharedItemAdded(campaignId, creator, item.name);
      return { item };
    }

    const is_new = Number(data.userId) !== creator.id;
    const item = await itemRepository.create({
      ...data,
      campaign_id: null,
      is_new,
    });
    // Someone other than the owner (admin/DM) added a personal item: notify.
    if (is_new) {
      await notificationService.notifyItemAdded(Number(data.userId), creator, item.name);
    }
    return { item };
  }

  // Moves an item between a player's personal inventory and their campaign's
  // shared inventory. `to` is "shared" or "personal".
  async moveItem(requester, itemId, to) {
    const item = await itemRepository.getById(itemId);
    if (!item) return { error: "Item not found", status: 404 };

    if (to === "shared") {
      // Only the owner may share one of their own personal items.
      if (item.userId !== requester.id) {
        return { error: "You can only share your own items", status: 403 };
      }
      const campaignId = await this.resolveMyCampaignId(requester);
      if (!campaignId) {
        return { error: "You are not part of a campaign", status: 400 };
      }
      const updated = await itemRepository.update(itemId, {
        userId: null,
        campaign_id: campaignId,
        is_new: false,
      });
      return { item: updated };
    }

    if (to === "personal") {
      if (!item.campaign_id) {
        return { error: "Item is not in a shared inventory", status: 400 };
      }
      const allowed = await this.canAccessCampaignInventory(
        requester,
        item.campaign_id
      );
      if (!allowed) return { error: "Insufficient permissions", status: 403 };
      const updated = await itemRepository.update(itemId, {
        userId: requester.id,
        campaign_id: null,
        is_new: false,
      });
      return { item: updated };
    }

    return { error: "Invalid move target", status: 400 };
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
      await notificationService.notifyItemAdded(userId, dm, item.name);
    }
    return { created };
  }

  // `actor` is the logged-in user. When someone other than the owner edits a
  // personal item (a DM/admin), the owner is notified.
  async updateItem(id, data, actor) {
    const before = await itemRepository.getById(id);
    const item = await itemRepository.update(id, data);
    if (item && actor && item.userId != null && item.userId !== actor.id) {
      await notificationService.notifyItemUpdated(item.userId, actor, item.name);
    }
    // `before` kept for symmetry / future diffing; the notification uses the
    // updated name so a rename is reflected.
    void before;
    return item;
  }

  async deleteItem(id, actor) {
    const item = await itemRepository.delete(id);
    if (item && actor && item.userId != null && item.userId !== actor.id) {
      await notificationService.notifyItemDeleted(item.userId, actor, item.name);
    }
    return item;
  }
}

module.exports = new ItemService();
