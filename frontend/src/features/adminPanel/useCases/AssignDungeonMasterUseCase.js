// Assigns a user as DM to a campaign (userId may be null to unassign).
// The backend immediately sets that user's role to 'DM'.
export default class AssignDungeonMasterUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(campaignId, userId) {
    return this.repository.assignDungeonMaster(campaignId, userId);
  }
}
