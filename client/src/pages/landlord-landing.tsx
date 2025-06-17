import { useEffect, useState } from "react";
import axios from "axios";

export default function LandlordLanding() {
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    axios.get("/api/dashboard").then((res) => {
      setDashboard(res.data);
    }).catch(err => {
      console.error("Failed to load dashboard:", err);
    });
  }, []);

  if (!dashboard) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Welcome, Landlord</h1>

      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Properties</h2>
          <p>{dashboard.propertiesCount}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Tenants</h2>
          <p>{dashboard.tenantsCount}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Upcoming Rent</h2>
          <p>${dashboard.upcomingPaymentsTotal}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Overdue Rent</h2>
          <p>${dashboard.overduePaymentsTotal}</p>
        </div>
      </div>

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
