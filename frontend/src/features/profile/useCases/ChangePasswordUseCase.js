// Wijzigt het eigen wachtwoord; vereist het huidige wachtwoord.
export default class ChangePasswordUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(currentPassword, newPassword) {
    return this.repository.changePassword({ currentPassword, newPassword });
  }
}
