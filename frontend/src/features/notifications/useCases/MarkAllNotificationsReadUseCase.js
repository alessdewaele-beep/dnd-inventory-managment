export default class MarkAllNotificationsReadUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute() {
    return this.repository.markAllNotificationsRead();
  }
}
