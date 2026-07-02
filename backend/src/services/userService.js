const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const campaignRepository = require("../repositories/campaignRepository");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config");
const bcrypt = require("bcrypt");
const User = require("../models/User");

class UserService {
  async register(user) {
    if (!user.username || !user.password || !user.campaignId) {
      throw new Error("Alle velden zijn verplicht");
    }
    try {
      console.log(user);
      return await userRepository.createUser(user);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        throw new Error("Username bestaat al");
      }
      throw err;
    }
  }

  async login(username, password) {
    const user = await userRepository.findByUsername(username);
    if (!user) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    return { token, id: user.id, username: user.username, role: user.role };
  }

  async getAll() {
    try {
      const users = [];
      const userRaw = await userRepository.getAll();
      userRaw.forEach((user) => {
        users.push(new User(user.username, user.id, user.role));
      });
      console.log(users);
      return users;
    } catch (err) {
      throw err;
    }
  }

  // Mag `requester` de spelers van deze campaign opvragen?
  // Toegestaan voor de Admin en de DM van die campaign.
  async canViewCampaignPlayers(requester, campaignId) {
    if (requester.role === "Admin") return true;
    const campaign = await campaignRepository.getById(campaignId);
    return !!campaign && campaign.dungeon_master_id === requester.id;
  }

  async getPlayersByCampaign(campaignId) {
    const rows = await userRepository.getByCampaignId(campaignId);
    return rows.map((user) => new User(user.username, user.id, user.role));
  }
}

module.exports = UserService;
