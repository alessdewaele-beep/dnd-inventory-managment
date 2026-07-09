export default class TransferCurrencyUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  // direction: "toShared" (personal -> party) or "toPersonal" (party ->
  // personal). coins: { pp, gp, sp, cp }. Returns { personal, shared }.
  async execute(direction, coins) {
    return this.repository.transferCurrency(direction, coins);
  }
}
