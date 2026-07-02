export default class UpdateCampaignUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(campaignId, data) {
    return this.repository.updateCampaign(campaignId, data);
  }
}
