export default class GetCampaignPlayersUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  // Geeft de spelers van de campagne(s) die de ingelogde DM leidt.
  async execute() {
    return this.repository.getMyCampaignPlayers();
  }
}
