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

  // Appoints a user as DM of a campaign. The user is given the role
  // 'DM'; any previous DM (who does not manage another campaign) falls back
  // to 'Player'. userId may be null to unassign the DM.
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
