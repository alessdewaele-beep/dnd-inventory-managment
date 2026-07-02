// Vraagt de backend een tijdelijk wachtwoord te genereren; de call geeft het
// wachtwoord eenmalig terug zodat de admin het kan doorgeven.
export default class ResetUserPasswordUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(userId) {
    return this.repository.resetUserPassword(userId);
  }
}
