export default class DnDRepository {
  getAllItemsByUserId(userId) {
    throw new Error("method not implemented", userId);
  }

  addItem(item) {
    throw new Error("method not implemented", item.id);
  }

  deleteItem(itemId) {
    throw new Error("method not implemented", itemId);
  }

  updateItem(item) {
    throw new Error("method not implemented", item.id);
  }

  registerUser(user) {
    throw new Error("method not implemented");
  }
  logInUser(user) {
    throw new Error("method not implemented");
  }

  getAllUsers() {
    throw new Error("method not implemented");
  }
}
