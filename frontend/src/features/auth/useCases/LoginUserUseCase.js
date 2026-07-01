export default class LogInUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(user) {
    const loggedInUser = await this.repository.logInUser(user);
    return loggedInUser;
  }
}
