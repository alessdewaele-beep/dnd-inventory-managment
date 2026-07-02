export default class CreateCampaignUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(campaign) {
    return this.repository.createCampaign(campaign);
  }
}
