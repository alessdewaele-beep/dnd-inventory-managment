export default class SendItemUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  // itemId: het te kopiëren bronitem van de DM.
  // recipientIds: array van speler-id's. quantity: aantal per ontvanger.
  async execute(itemId, recipientIds, quantity) {
    return this.repository.sendItem(itemId, { recipientIds, quantity });
  }
}
