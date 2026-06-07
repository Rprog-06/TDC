import { useNavigate } from "react-router-dom";

const statusColor = {
  Active: "bg-green-100 text-green-700",
  Matched: "bg-blue-100 text-blue-700",
  Searching: "bg-yellow-100 text-yellow-700",
};

function CustomerCard({ customer }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/customer/${customer.id}`)}
      className="rounded-xl bg-white p-5 text-left shadow transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            {customer.firstName} {customer.lastName}
          </h2>
          <p className="text-sm text-slate-500">
            {customer.designation || customer.profession || "Profile"}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            statusColor[customer.status] || "bg-slate-100 text-slate-700"
          }`}
        >
          {customer.status}
        </span>
      </div>

      <div className="grid gap-2 text-slate-700">
        <p>Age: {customer.age}</p>
        <p>City: {customer.city}</p>
        <p>Marital Status: {customer.maritalStatus || "Not provided"}</p>
      </div>
    </button>
  );
}

export default CustomerCard;
