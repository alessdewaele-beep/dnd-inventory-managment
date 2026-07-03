export default class UpdateCurrencyUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(userId, coins) {
    return this.repository.updateCurrency(userId, coins);
  }
}
