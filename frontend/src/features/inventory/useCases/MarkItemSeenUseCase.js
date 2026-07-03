export default class MarkItemSeenUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(itemId) {
    return this.repository.markItemSeen(itemId);
  }
}
