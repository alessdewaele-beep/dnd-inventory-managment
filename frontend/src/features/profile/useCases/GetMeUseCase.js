// Haalt het eigen profiel op (id, username, role, campaign_id,
// campaign_name, backstory) van de ingelogde gebruiker.
export default class GetMeUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute() {
    return this.repository.getMe();
  }
}
