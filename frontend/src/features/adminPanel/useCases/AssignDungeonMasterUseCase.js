// Koppelt een gebruiker als DM aan een campagne (userId mag null zijn om los
// te koppelen). De backend zet meteen de rol van die gebruiker op 'DM'.
export default class AssignDungeonMasterUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(campaignId, userId) {
    return this.repository.assignDungeonMaster(campaignId, userId);
  }
}
