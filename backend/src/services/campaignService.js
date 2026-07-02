const campaignRepository = require("../repositories/campaignRepository");

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
}

module.exports = new CampaignService();
