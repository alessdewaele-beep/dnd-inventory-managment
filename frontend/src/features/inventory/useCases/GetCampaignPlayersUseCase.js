export default class GetCampaignPlayersUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  // Returns the players of the campaign(s) the logged-in DM leads.
  async execute() {
    return this.repository.getMyCampaignPlayers();
  }
}
