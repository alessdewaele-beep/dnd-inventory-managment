export default class AddItemUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(item) {
    return this.repository.addItem(item);
  }
}
