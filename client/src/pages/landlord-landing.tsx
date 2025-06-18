import { useEffect, useState } from "react";
import axios from "axios";
import { Home, Users, FileText, MessageSquare, Building, AlertCircle, BarChart2, Plus, UserPlus } from "lucide-react";

const features = [
  {
    icon: Building,
    title: "Property Management",
    description: "Easily manage all your rental properties in one place.",
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    icon: Users,
    title: "Tenant Screening",
    description: "Review and screen potential tenants quickly and securely.",
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    icon: FileText,
    title: "Financial Reports",
    description: "Generate downloadable reports for income, expenses, and more.",
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    icon: MessageSquare,
    title: "Communication",
    description: "Send announcements and messages directly to tenants.",
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  }
];

export default function LandlordLanding() {
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    axios.get("/api/dashboard").then((res) => {
      setDashboard(res.data);
    });
  }, []);

  if (!dashboard) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Welcome Hero */}
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome back, Landlord!</h1>
          <p className="text-lg text-gray-600">Here’s what’s happening in your portfolio today:</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-primary-600 text-white rounded px-4 py-2 flex items-center gap-2 shadow hover:bg-primary-700">
            <Plus className="w-4 h-4" /> Add Property
          </button>
          <button className="bg-green-600 text-white rounded px-4 py-2 flex items-center gap-2 shadow hover:bg-green-700">
            <UserPlus className="w-4 h-4" /> Add Tenant
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {features.map((feature, idx) => (
          <div key={idx} className={`rounded-lg p-5 shadow flex flex-col items-center ${feature.bgColor}`}>
            <feature.icon className={`w-8 h-8 mb-2 ${feature.color}`} />
            <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
            <p className="text-gray-700 text-sm text-center">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <Building className="text-primary-600 w-6 h-6 mb-2" />
          <h2 className="text-xl font-semibold">Properties</h2>
          <p className="text-2xl font-bold">{dashboard.propertiesCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <Users className="text-green-600 w-6 h-6 mb-2" />
          <h2 className="text-xl font-semibold">Tenants</h2>
          <p className="text-2xl font-bold">{dashboard.tenantsCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <BarChart2 className="text-yellow-600 w-6 h-6 mb-2" />
          <h2 className="text-xl font-semibold">Upcoming Rent</h2>
          <p className="text-2xl font-bold">${dashboard.upcomingPaymentsTotal}</p>
        </div>
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <AlertCircle className="text-red-600 w-6 h-6 mb-2" />
          <h2 className="text-xl font-semibold">Overdue Rent</h2>
          <p className="text-2xl font-bold">${dashboard.overduePaymentsTotal}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <h2 className="text-xl font-semibold mb-3">Recent Activity</h2>
      <ul className="space-y-2">
        {dashboard.tenantActivity.map((item: any, index: number) => (
          <li key={index} className="bg-gray-50 p-3 rounded">
            {item.tenant.user.firstName} paid ${item.amount} on {new Date(item.paymentDate).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
