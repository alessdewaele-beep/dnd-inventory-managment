// Icon per notification type, shown on the notifications page.
const TYPE_ICON = {
  item_added: "pi pi-plus-circle",
  item_updated: "pi pi-pencil",
  item_deleted: "pi pi-trash",
  currency_removed: "pi pi-wallet",
  shared_item_added: "pi pi-users",
};

class Notification {
  constructor(id, type, message, isRead, createdAt) {
    this.id = id;
    this.type = type;
    this.message = message;
    this.is_read = isRead;
    this.created_at = createdAt;
  }

  get icon() {
    return TYPE_ICON[this.type] ?? "pi pi-bell";
  }

  isUnread() {
    return !this.is_read;
  }
}

export default Notification;
