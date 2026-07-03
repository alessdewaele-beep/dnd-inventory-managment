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

  // Bouwt het publieke profielobject (zonder password_hash) en resolvet
  // de campagnenaam op basis van campaign_id.
  async #toProfile(userRow) {
    let campaignName = null;
    if (userRow.campaign_id) {
      const campaign = await campaignRepository.getById(userRow.campaign_id);
      campaignName = campaign ? campaign.name : null;
    }
    return {
      id: userRow.id,
      username: userRow.username,
      role: userRow.role,
      campaign_id: userRow.campaign_id ?? null,
      campaign_name: campaignName,
      backstory: userRow.backstory ?? null,
    };
  }

  // Eigen profiel van de ingelogde gebruiker.
  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) return null;
    return this.#toProfile(user);
  }

  // Self-service update: enkel de eigen username en (voor spelers) backstory.
  // Geeft bij een username-wijziging een nieuwe JWT terug zodat de token
  // in sync blijft met de nieuwe username.
  async updateSelf(requester, data) {
    const current = await userRepository.findById(requester.id);
    if (!current) {
      const err = new Error("Gebruiker niet gevonden");
      err.status = 404;
      throw err;
    }

    const updates = {};
    let usernameChanged = false;

    if (data.username !== undefined) {
      const username = String(data.username).trim();
      if (!username) {
        const err = new Error("Username mag niet leeg zijn");
        err.status = 400;
        throw err;
      }
      if (username !== current.username) {
        updates.username = username;
        usernameChanged = true;
      }
    }

    // Backstory is enkel voor spelers.
    if (data.backstory !== undefined) {
      if (current.role !== "Player") {
        const err = new Error("Alleen spelers hebben een backstory");
        err.status = 403;
        throw err;
      }
      updates.backstory = data.backstory === "" ? null : data.backstory;
    }

    let updated = current;
    if (Object.keys(updates).length > 0) {
      try {
        updated = await userRepository.update(requester.id, updates);
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          const dup = new Error("Deze username is al in gebruik");
          dup.status = 409;
          throw dup;
        }
        throw err;
      }
    }

    const profile = await this.#toProfile(updated);

    // Nieuwe token enkel wanneer de username effectief wijzigde.
    let token;
    if (usernameChanged) {
      token = jwt.sign(
        { id: updated.id, username: updated.username, role: updated.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
    }

    return { user: profile, token };
  }

  // Wachtwoord wijzigen met verificatie van het huidige wachtwoord.
  async changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      const err = new Error("Huidig en nieuw wachtwoord zijn verplicht");
      err.status = 400;
      throw err;
    }
    if (String(newPassword).length < 6) {
      const err = new Error("Nieuw wachtwoord moet minstens 6 tekens zijn");
      err.status = 400;
      throw err;
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      const err = new Error("Gebruiker niet gevonden");
      err.status = 404;
      throw err;
    }

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
      const err = new Error("Huidig wachtwoord is onjuist");
      err.status = 400;
      throw err;
    }

    await userRepository.updatePassword(userId, newPassword);
    return true;
  }

  // Volledige lijst voor het admin-scherm: id, username, role, campaign_id,
  // created_at. Nooit password_hash (repository selecteert die niet).
  async getAll() {
    return userRepository.getAll();
  }

  async deleteUser(id) {
    return userRepository.deleteById(id);
  }

  // Beheert rol en campagne-koppeling van een gebruiker (admin).
  async updateUser(id, data) {
    const allowed = {};
    if (data.role !== undefined) allowed.role = data.role;
    if (data.campaign_id !== undefined) allowed.campaign_id = data.campaign_id;
    const updated = await userRepository.update(id, allowed);
    if (!updated) return null;
    return {
      id: updated.id,
      username: updated.username,
      role: updated.role,
      campaign_id: updated.campaign_id,
    };
  }

  // Mag `requester` de spelers van deze campaign opvragen?
  // Toegestaan voor de Admin en de DM van die campaign.
  async canViewCampaignPlayers(requester, campaignId) {
    if (requester.role === "Admin") return true;
    const campaign = await campaignRepository.getById(campaignId);
    return !!campaign && campaign.dungeon_master === requester.id;
  }

  async getPlayersByCampaign(campaignId) {
    const rows = await userRepository.getByCampaignId(campaignId);
    return rows.map((user) => new User(user.username, user.id, user.role));
  }

  // Alle spelers uit de campagne(s) die `dm` leidt, exclusief de DM zelf.
  // Gebruikt door het DM-scherm om inventories te bekijken en items te sturen.
  async getMyCampaignPlayers(dm) {
    const campaigns = await campaignRepository.getByDungeonMaster(dm.id);
    const seen = new Map();
    for (const campaign of campaigns) {
      const rows = await userRepository.getByCampaignId(campaign.id);
      for (const user of rows) {
        if (user.id !== dm.id) seen.set(user.id, user);
      }
    }
    return [...seen.values()].map(
      (user) => new User(user.username, user.id, user.role)
    );
  }
}

module.exports = UserService;
