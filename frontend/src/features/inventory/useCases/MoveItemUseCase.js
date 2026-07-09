export default class MoveItemUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  // itemId: the item to move. to: "shared" (personal -> campaign) or
  // "personal" (campaign -> own inventory).
  async execute(itemId, to) {
    return this.repository.moveItem(itemId, to);
  }
}
