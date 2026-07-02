export default class GetAllCampaignsUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute() {
    return this.repository.getAllCampaigns();
  }
}
