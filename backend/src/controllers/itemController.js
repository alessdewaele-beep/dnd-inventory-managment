const itemService = require("../services/itemService");

class ItemController {
  async getAll(req, res) {
    const items = await itemService.getAllItems();
    res.json(items);
  }

  async getById(req, res) {
    const item = await itemService.getItem(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  }

  async getByUserId(req, res) {
    const userId = Number(req.params.userId);
    const allowed = await itemService.canViewInventory(req.user, userId);
    if (!allowed) return res.status(403).json({ error: "Onvoldoende rechten" });

    const items = await itemService.getItemByUserId(userId);
    if (!items) return res.status(404).json({ message: "Items not found" });
    res.json(items);
  }

  async create(req, res) {
    console.log("create", req.body);
    const { name, description, type, quantity, favourite, userId } = req.body;
    const item = await itemService.createItem(
      {
        name,
        description,
        type,
        quantity,
        favourite,
        userId,
      },
      req.user
    );
    res.status(201).json(item);
  }

  async markSeen(req, res) {
    const result = await itemService.markItemSeen(
      req.user,
      Number(req.params.id)
    );
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    res.json(result.item);
  }

  async send(req, res) {
    const itemId = Number(req.params.id);
    const { recipientIds, quantity } = req.body;
    const result = await itemService.sendItemToPlayers(
      req.user,
      itemId,
      recipientIds,
      quantity
    );
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    res.status(201).json(result.created);
  }

  async update(req, res) {
    console.log("update", req.body);
    // De notificatievlag wordt enkel via /items/:id/seen aangepast; zo kan een
    // verouderde kopie aan de clientkant ze niet per ongeluk terugzetten.
    const { is_new, ...data } = req.body;
    const item = await itemService.updateItem(Number(req.params.id), data);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  }

  async delete(req, res) {
    const item = await itemService.deleteItem(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  }
}

module.exports = new ItemController();
