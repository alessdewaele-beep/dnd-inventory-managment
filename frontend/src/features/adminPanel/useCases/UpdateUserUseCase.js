// Werkt rol en/of campagne-koppeling van een gebruiker bij.
export default class UpdateUserUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(userId, data) {
    return this.repository.updateUser(userId, data);
  }
}
