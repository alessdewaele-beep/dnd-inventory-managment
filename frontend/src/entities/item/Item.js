class Item {
  constructor(
    id = null,
    name,
    description,
    type,
    userId,
    quantity,
    createdAt,
    favourite = false
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.quantity = quantity;
    this.type = type;
    this.userId = userId;
    this.created_at = createdAt;
    this.favourite = favourite;
  }

  isFavourite() {
    return this.favourite;
  }
  setFavourite(favourite) {
    this.favourite = favourite;
  }
}

export default Item;
