// server/storage.ts (MongoDB-based version)
import mongoose from "mongoose";
import session from "express-session";
import connectMongo from "connect-mongo";
import bcrypt from "bcryptjs";

import { UserModel } from "./models/User";
import { PropertyModel } from "./models/Property";
import { UnitModel } from "./models/Unit";
import { TenantModel } from "./models/Tenant";
import { PaymentModel } from "./models/Payment";
import { ServiceRequestModel } from "./models/ServiceRequest";
import { NotificationModel } from "./models/Notification";

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePasswords(supplied: string, stored: string) {
  return await bcrypt.compare(supplied, stored);
}

const MongoStore = connectMongo(session);

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/rentaltrust")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

export const storage = {
  sessionStore: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/rentaltrust",
    collectionName: "sessions"
  }),

  // User operations
  async getUser(id: string) {
    return await UserModel.findById(id).lean();
  },

  async getUserByUsername(username: string) {
    return await UserModel.findOne({ username }).lean();
  },

  async createUser(userData) {
    const user = new UserModel(userData);
    await user.save();
    return user.toObject();
  },

  // Property operations
  async getProperty(id: string) {
    return await PropertyModel.findById(id).lean();
  },

  async getPropertiesByLandlord(landlordId: string) {
    return await PropertyModel.find({ landlordId }).lean();
  },

  async createProperty(data) {
    const doc = await PropertyModel.create(data);
    return doc.toObject();
  },

  // ... repeat this pattern for create/update/delete for Units, Tenants, Payments, ServiceRequests, Notifications

  // Tenant portal
  async getTenantByUserId(userId: string) {
    return await TenantModel.findOne({ userId }).populate("unit").lean();
  },

  async getDashboardData(landlordId: string) {
    const properties = await PropertyModel.find({ landlordId }).lean();
    const units = await UnitModel.find({ propertyId: { $in: properties.map(p => p._id) } }).lean();
    const tenants = await TenantModel.find({ unitId: { $in: units.map(u => u._id) } }).lean();
    const tenantIds = tenants.map(t => t._id);
    const payments = await PaymentModel.find({ tenantId: { $in: tenantIds } }).lean();

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
      monthlyIncome: [] // left as an exercise to implement monthly grouping
    };
  }
};
