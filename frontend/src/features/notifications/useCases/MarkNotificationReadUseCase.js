export default class MarkNotificationReadUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(id) {
    return this.repository.markNotificationRead(id);
  }
}
