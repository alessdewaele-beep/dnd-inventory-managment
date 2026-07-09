const notificationRepository = require("../repositories/notificationRepository");
const userRepository = require("../repositories/userRepository");
const campaignRepository = require("../repositories/campaignRepository");

class NotificationService {
  // --- Read side (notifications page + badge) ---
  list(userId) {
    return notificationRepository.getByUserId(userId);
  }

  unreadCount(userId) {
    return notificationRepository.countUnread(userId);
  }

  markRead(id, userId) {
    return notificationRepository.markRead(id, userId);
  }

  markAllRead(userId) {
    return notificationRepository.markAllRead(userId);
  }

  // --- Write side (called from item/currency flows) ---
  // These must never break the action that triggered them, so every method
  // swallows its own errors (a failed notification just gets logged).

  async #safeCreate(userId, type, message) {
    try {
      await notificationRepository.create({ userId, type, message });
    } catch (err) {
      console.error("notification create failed", err.message);
    }
  }

  // A DM/admin added a (personal) item to `ownerId`'s inventory.
  notifyItemAdded(ownerId, actor, itemName) {
    return this.#safeCreate(
      ownerId,
      "item_added",
      `${actor.username} added "${itemName}" to your inventory.`
    );
  }

  notifyItemUpdated(ownerId, actor, itemName) {
    return this.#safeCreate(
      ownerId,
      "item_updated",
      `${actor.username} updated "${itemName}" in your inventory.`
    );
  }

  notifyItemDeleted(ownerId, actor, itemName) {
    return this.#safeCreate(
      ownerId,
      "item_deleted",
      `${actor.username} removed "${itemName}" from your inventory.`
    );
  }

  // A DM/admin reduced the coins in `ownerId`'s purse.
  notifyCurrencyRemoved(ownerId, actor) {
    return this.#safeCreate(
      ownerId,
      "currency_removed",
      `${actor.username} took some coins from your purse.`
    );
  }

  // Someone added an item to the campaign's shared inventory: notify every
  // campaign member except the person who added it.
  async notifySharedItemAdded(campaignId, actor, itemName) {
    try {
      const campaign = await campaignRepository.getById(campaignId);
      const members = await userRepository.getByCampaignId(campaignId);
      const ids = new Set(members.map((m) => m.id));
      if (campaign?.dungeon_master) ids.add(campaign.dungeon_master);
      ids.delete(actor.id);
      if (ids.size === 0) return;

      const message = `${actor.username} added "${itemName}" to the shared inventory.`;
      await notificationRepository.createMany(
        [...ids].map((userId) => ({
          userId,
          type: "shared_item_added",
          message,
        }))
      );
    } catch (err) {
      console.error("shared notification failed", err.message);
    }
  }
}

module.exports = new NotificationService();
