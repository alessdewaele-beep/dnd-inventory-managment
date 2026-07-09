export default class GetSharedCurrencyUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  // Returns { campaignId, currency } for the own campaign's shared purse.
  async execute() {
    const { campaignId, currency } = await this.repository.getSharedCurrency();
    return { campaignId: campaignId ?? null, currency };
  }
}
