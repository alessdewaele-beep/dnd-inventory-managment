const userRepository = require("../repositories/userRepository");
const campaignRepository = require("../repositories/campaignRepository");
const itemRepository = require("../repositories/itemRepository");

class AdminService {
  // Verzamelt alle cijfers voor het admin-dashboard in één keer.
  async getStats() {
    const [
      totalUsers,
      usersByRole,
      totalCampaigns,
      campaignsWithDm,
      totalItems,
      recentUsers,
      recentItems,
    ] = await Promise.all([
      userRepository.countAll(),
      userRepository.countByRole(),
      campaignRepository.countAll(),
      campaignRepository.countWithDm(),
      itemRepository.countAll(),
      userRepository.getRecent(5),
      itemRepository.getRecent(5),
    ]);

    return {
      users: { total: totalUsers, byRole: usersByRole },
      campaigns: { total: totalCampaigns, withDm: campaignsWithDm },
      items: { total: totalItems },
      recentUsers,
      recentItems,
    };
  }
}

module.exports = new AdminService();
