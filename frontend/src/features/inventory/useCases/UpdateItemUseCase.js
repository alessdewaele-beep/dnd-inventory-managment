export default class UpdateItemUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(item) {
    return this.repository.updateItem(item);
  }
}
