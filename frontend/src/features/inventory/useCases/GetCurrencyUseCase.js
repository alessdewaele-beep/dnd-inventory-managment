export default class GetCurrencyUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(userId) {
    return this.repository.getCurrency(userId);
  }
}
