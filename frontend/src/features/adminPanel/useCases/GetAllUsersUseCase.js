// Fetches the full user list as raw objects
// (id, username, role, campaign_id, created_at) for admin management.
export default class GetAllUsersUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute() {
    return this.repository.getAllUsers();
  }
}
