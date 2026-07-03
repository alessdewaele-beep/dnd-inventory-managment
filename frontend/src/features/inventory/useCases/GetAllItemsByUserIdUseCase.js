import Item from "@/entities/item/Item";

export default class GetAllItemsByUserIdUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(userId) {
    const itemsRaw = await this.repository.getAllItemsByUserId(userId);
    const items = [];
    itemsRaw.forEach((item) => {
      items.push(
        new Item(
          item.id,
          item.name,
          item.description,
          item.type,
          item.userId,
          item.quantity,
          item.created_at,
          item.favourite,
          item.is_new
        )
      );
    });
    return items;
  }
}
