export default class GetUnreadCountUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute() {
    const { count } = await this.repository.getUnreadNotificationCount();
    return count ?? 0;
  }
}
