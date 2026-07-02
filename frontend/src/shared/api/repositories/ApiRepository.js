import DnDRepository from "@/shared/api/repositories/DnDRepository";
import Client from "@/shared/lib/client/Client";

export default class ApiRepository extends DnDRepository {
  async getAllItemsByUserId(userId) {
    return Client.getAll(`items/user/${userId}`);
  }

  async addItem(item) {
    return Client.post(`items`, item);
  }

  async deleteItem(itemId) {
    return Client.delete(`items/${itemId}`);
  }

  async updateItem(item) {
    return Client.put("items", item.id, item);
  }

  async registerUser(user) {
    return Client.post("users/register", user);
  }

  async logInUser(user) {
    return Client.post("users/login", user);
  }

  async getAllUsers() {
    return Client.get("/users");
  }

  async getPublicCampaigns() {
    return Client.getAll("campaigns/public");
  }
}
