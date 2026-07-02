// Werkt de eigen username en/of backstory bij. Geeft { user, token } terug;
// token is enkel aanwezig wanneer de username effectief wijzigde.
export default class UpdateProfileUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(data) {
    return this.repository.updateProfile(data);
  }
}
