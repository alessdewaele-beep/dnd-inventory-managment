// Fetches the user's own profile (id, username, role, campaign_id,
// campaign_name, backstory) of the logged-in user.
export default class GetMeUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute() {
    return this.repository.getMe();
  }
}
