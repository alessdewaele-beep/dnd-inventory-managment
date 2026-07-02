const campaignService = require("../services/campaignService");

class CampaignController {
  async getAll(req, res) {
    const campaigns = await campaignService.getAllCampaigns();
    res.json(campaigns);
  }

  async getAllPublic(req, res) {
    const campaigns = await campaignService.getPublicCampaigns();
    res.json(campaigns);
  }

  async getById(req, res) {
    const campaign = await campaignService.getCampaign(Number(req.params.id));
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  }

  async create(req, res) {
    console.log("create", req.body);
    const { name, description, dungeon_master } = req.body;
    const campaign = await campaignService.createCampaign({
      name,
      description,
      dungeon_master,
    });
    res.status(201).json(campaign);
  }

  async update(req, res) {
    console.log("update", req.body);
    const campaign = await campaignService.updateCampaign(
      Number(req.params.id),
      req.body
    );
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  }

  async delete(req, res) {
    const campaign = await campaignService.deleteCampaign(
      Number(req.params.id)
    );
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  }

  async assignDm(req, res) {
    const campaign = await campaignService.assignDungeonMaster(
      Number(req.params.id),
      req.body.userId ?? null
    );
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  }
}

module.exports = new CampaignController();
