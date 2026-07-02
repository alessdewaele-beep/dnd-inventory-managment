export default class DeleteUserUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(userId) {
    return this.repository.deleteUser(userId);
  }
}
