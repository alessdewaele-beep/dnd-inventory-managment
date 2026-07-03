// Changes the user's own password; requires the current password.
export default class ChangePasswordUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(currentPassword, newPassword) {
    return this.repository.changePassword({ currentPassword, newPassword });
  }
}
