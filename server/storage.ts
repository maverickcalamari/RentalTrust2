import bcrypt from "bcryptjs";

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePasswords(supplied: string, stored: string) {
  return await bcrypt.compare(supplied, stored);
}

// Mock in-memory storage as a placeholder
export const storage = {
  users: [],
  properties: [],
  tenants: [],
  units: [],
  payments: [],

  async getUser(id) {
    return this.users.find(u => u.id === id) || null;
  },

  async getUserByUsername(username) {
    return this.users.find(u => u.username === username) || null;
  },

  async createUser(userData) {
    const newUser = { ...userData, id: String(this.users.length + 1) };
    this.users.push(newUser);
    return newUser;
  },

  async getProperty(id) {
    return this.properties.find(p => p.id === id) || null;
  },

  async getPropertiesByLandlord(landlordId) {
    return this.properties.filter(p => p.landlordId === landlordId);
  },

  async createProperty(data) {
    const newProp = { ...data, id: String(this.properties.length + 1) };
    this.properties.push(newProp);
    return newProp;
  },

  async getTenantByUserId(userId) {
    return this.tenants.find(t => t.userId === userId) || null;
  },

  async getDashboardData(landlordId) {
    const properties = this.properties.filter(p => p.landlordId === landlordId);
    const units = this.units.filter(u => properties.map(p => p.id).includes(u.propertyId));
    const tenants = this.tenants.filter(t => units.map(u => u.id).includes(t.unitId));
    const payments = this.payments.filter(p => tenants.map(t => t.id).includes(p.tenantId));

    const now = new Date();
    const upcomingPayments = payments.filter(p => p.status === "pending" && new Date(p.dueDate) > now);
    const overduePayments = payments.filter(p => p.status === "overdue" || (p.status === "pending" && new Date(p.dueDate) < now));

    return {
      propertiesCount: properties.length,
      tenantsCount: tenants.length,
      upcomingPaymentsTotal: upcomingPayments.reduce((sum, p) => sum + Number(p.amount), 0),
      overduePaymentsTotal: overduePayments.reduce((sum, p) => sum + Number(p.amount), 0),
      properties,
      tenantActivity: payments.slice(0, 10),
      monthlyIncome: []
    };
  }
};
