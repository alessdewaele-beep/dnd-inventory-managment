// Updates a user's role and/or campaign assignment.
export default class UpdateUserUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(userId, data) {
    return this.repository.updateUser(userId, data);
  }
}
