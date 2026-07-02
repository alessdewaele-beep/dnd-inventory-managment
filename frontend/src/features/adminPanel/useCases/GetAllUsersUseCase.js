// Haalt de volledige gebruikerslijst op als ruwe objecten
// (id, username, role, campaign_id, created_at) voor het admin-beheer.
export default class GetAllUsersUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute() {
    return this.repository.getAllUsers();
  }
}
