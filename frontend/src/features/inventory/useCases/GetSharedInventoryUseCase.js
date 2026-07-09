import Item from "@/entities/item/Item";

export default class GetSharedInventoryUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  // Returns { campaignId, items: Item[] } for the own campaign's shared
  // inventory. campaignId is null when the user has no campaign context.
  async execute() {
    const { campaignId, items } = await this.repository.getSharedInventory();
    const mapped = (items ?? []).map(
      (item) =>
        new Item(
          item.id,
          item.name,
          item.description,
          item.type,
          item.userId,
          item.quantity,
          item.created_at,
          item.favourite,
          item.is_new,
          item.image
        )
    );
    return { campaignId: campaignId ?? null, items: mapped };
  }
}
