export default class UpdateSharedCurrencyUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(coins) {
    return this.repository.updateSharedCurrency(coins);
  }
}
