export default class SendItemUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  // itemId: the DM's source item to copy.
  // recipientIds: array of player ids. quantity: amount per recipient.
  async execute(itemId, recipientIds, quantity) {
    return this.repository.sendItem(itemId, { recipientIds, quantity });
  }
}
