const campaignRepository = require("../repositories/campaignRepository");
const userRepository = require("../repositories/userRepository");

class CampaignService {
  getAllCampaigns() {
    return campaignRepository.getAll();
  }

  getPublicCampaigns() {
    return campaignRepository.getAllPublic();
  }

  getCampaign(id) {
    return campaignRepository.getById(id);
  }

  createCampaign(data) {
    return campaignRepository.create(data);
  }

  updateCampaign(id, data) {
    return campaignRepository.update(id, data);
  }

  deleteCampaign(id) {
    return campaignRepository.delete(id);
  }

  // Wijst een gebruiker aan als DM van een campagne. De gebruiker krijgt rol
  // 'DM'; een eventuele vorige DM (die geen andere campagne beheert) valt terug
  // naar 'Player'. userId mag null zijn om de DM los te koppelen.
  async assignDungeonMaster(campaignId, userId) {
    const campaign = await campaignRepository.getById(campaignId);
    if (!campaign) return null;

    const previousDmId = campaign.dungeon_master;
    const nextDmId = userId ? Number(userId) : null;

    if (previousDmId && previousDmId !== nextDmId) {
      const stillDm = await campaignRepository.countByDungeonMaster(
        previousDmId,
        campaignId
      );
      if (stillDm === 0) {
        await userRepository.update(previousDmId, { role: "Player" });
      }
    }

    const updated = await campaignRepository.update(campaignId, {
      dungeon_master: nextDmId,
    });

    if (nextDmId) {
      await userRepository.update(nextDmId, { role: "DM" });
    }

    return updated;
  }
}

module.exports = new CampaignService();
