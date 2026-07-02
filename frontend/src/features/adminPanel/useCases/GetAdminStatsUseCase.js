export default class GetAdminStatsUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute() {
    return this.repository.getAdminStats();
  }
}
