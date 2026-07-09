import Notification from "@/entities/notification/Notification";

export default class GetNotificationsUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute() {
    const raw = await this.repository.getNotifications();
    return (raw ?? []).map(
      (n) =>
        new Notification(n.id, n.type, n.message, !!n.is_read, n.created_at)
    );
  }
}
