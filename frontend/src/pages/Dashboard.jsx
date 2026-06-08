
import { useNavigate } from "react-router-dom";

import CustomerCard from "../components/Customercard";
// import customers from "../data/customers";
import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
const [search, setSearch] = useState("");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/customers");
      console.log(res.data)
      setCustomers(res.data);
    } catch (error) {
      console.error(error);
      setError("Unable to load customers.");
    } finally {
      setLoading(false);
    }
  };

  fetchCustomers();
}, []);

  const filteredCustomers = customers.filter((customer) => {
    const searchableText = [
      customer.firstName,
      customer.lastName,
      customer.city,
      customer.status,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search.toLowerCase());
  });

  const activeProfiles = customers.filter(
    (customer) => customer.status === "Active"
  ).length;
  const matchedProfiles = customers.filter(
    (customer) => customer.status === "Matched"
  ).length;

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-left md:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            The Date Crew
          </p>
          <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">
            Matchmaker Dashboard
          </h1>
        </div>

        <button
          onClick={logout}
          className="w-fit rounded-lg bg-red-500 px-4 py-2 font-semibold text-white shadow hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-gray-500">Customers</h3>
          <p className="text-3xl font-bold">{customers.length}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-gray-500">Active Profiles</h3>
          <p className="text-3xl font-bold">{activeProfiles}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-gray-500">Matched Profiles</h3>
          <p className="text-3xl font-bold">{matchedProfiles}</p>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search customer by name, city, or status..."
        className="mb-8 w-full rounded-lg border border-slate-300 bg-white p-3 shadow-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {loading && (
          <p className="rounded-lg bg-white p-6 text-slate-600 shadow">
            Loading customers...
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-6 text-red-700 shadow">
            {error}
          </p>
        )}

        {filteredCustomers.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}

        {!loading && !error && filteredCustomers.length === 0 && (
          <p className="rounded-lg bg-white p-6 text-slate-600 shadow">
            No customers found.
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
