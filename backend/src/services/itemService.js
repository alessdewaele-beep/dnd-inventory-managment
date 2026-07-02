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

  // De DM stuurt (een kopie van) een van zijn eigen items naar spelers uit
  // zijn campaign. Het bronitem blijft ongewijzigd; per ontvanger wordt een
  // nieuw item aangemaakt met het gekozen aantal.
  async sendItemToPlayers(dm, itemId, recipientIds, quantity) {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      return { error: "Ongeldig aantal", status: 400 };
    }
    if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
      return { error: "Geen ontvangers geselecteerd", status: 400 };
    }

    const source = await itemRepository.getById(itemId);
    if (!source) return { error: "Item niet gevonden", status: 404 };
    if (source.userId !== dm.id) {
      return { error: "Je kan enkel je eigen items versturen", status: 403 };
    }

    // Bouw de set van geldige ontvangers: spelers uit de campagne(s) die deze
    // DM leidt, exclusief de DM zelf.
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
        error: "Eén of meer ontvangers zitten niet in jouw campaign",
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
