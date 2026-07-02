export default class DeleteCampaignUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(campaignId) {
    return this.repository.deleteCampaign(campaignId);
  }
}
