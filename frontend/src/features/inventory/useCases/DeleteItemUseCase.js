export default class DeleteItemUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(itemId) {
    return this.repository.deleteItem(itemId);
  }
}
