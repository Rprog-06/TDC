import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API from "../services/api";

const statusColor = {
  Active: "bg-green-500",
  Matched: "bg-blue-500",
  Searching: "bg-yellow-500",
};

function DetailRow({ label, value }) {
  return (
    <p>
      <strong>{label}:</strong> {value || "Not provided"}
    </p>
  );
}

function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [matches, setMatches] = useState([]);
  const [notes, setNotes] = useState(localStorage.getItem(`notes-${id}`) || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingMatchId, setSendingMatchId] = useState(null);
  const [loadingReasonIds, setLoadingReasonIds] = useState([]);
  const [reasonErrors, setReasonErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const [customerRes, matchesRes] = await Promise.all([
          API.get(`/customers/${id}`),
          API.get(`/matches/${id}`),
        ]);

        setCustomer(customerRes.data);
        setMatches(matchesRes.data);
      } catch (fetchError) {
        console.error(fetchError);
        setError("Unable to load customer details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const loadAiReasonForMatch = async (matchId) => {
    try {
      setLoadingReasonIds((prev) => [...prev, matchId]);
      setReasonErrors((prev) => ({ ...prev, [matchId]: "" }));

      const matchRes = await API.get(`/matches/${id}?ai=true&matchId=${matchId}`);
      const updatedMatch = matchRes.data;

      setMatches((prevMatches) =>
        prevMatches.map((match) =>
          match.id === updatedMatch.id ? updatedMatch : match
        )
      );
    } catch (loadError) {
      console.error(loadError);
      setReasonErrors((prev) => ({
        ...prev,
        [matchId]: "Unable to generate AI reason for this match.",
      }));
    } finally {
      setLoadingReasonIds((prev) => prev.filter((id) => id !== matchId));
    }
  };

  const saveNotes = () => {
    localStorage.setItem(`notes-${id}`, notes);
    alert("Notes Saved");
  };

  const sendMatch = async (matchId) => {
    try {
      setSendingMatchId(matchId);
      await API.post("/actions/send-match", {
        customerId: customer.id,
        matchId,
      });
      alert("Match Sent");
    } catch (sendError) {
      console.error(sendError);
      alert("Unable to send match");
    } finally {
      setSendingMatchId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-8 text-left">
        <p className="rounded-lg bg-white p-6 shadow">Loading customer...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-slate-100 p-8 text-left">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-4 rounded-lg bg-slate-900 px-4 py-2 text-white"
        >
          Back
        </button>
        <h1 className="text-3xl font-bold">{error || "Customer Not Found"}</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-left md:p-8">
      <div className="rounded-xl bg-white p-6 shadow md:p-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 rounded-lg bg-slate-900 px-4 py-2 text-white"
        >
          Back to Dashboard
        </button>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Customer Profile
            </p>
            <h1 className="text-3xl font-bold">
              {customer.firstName} {customer.lastName}
            </h1>
          </div>
          <span
            className={`w-fit rounded-full px-3 py-1 text-white ${
              statusColor[customer.status] || "bg-slate-500"
            }`}
          >
            {customer.status}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <DetailRow label="Gender" value={customer.gender} />
          <DetailRow label="DOB" value={customer.dob} />
          <DetailRow label="City" value={customer.city} />
          <DetailRow label="Country" value={customer.country} />
          <DetailRow label="Height" value={customer.height && `${customer.height} cm`} />
          <DetailRow label="Email" value={customer.email} />
          <DetailRow label="Phone" value={customer.phone} />
          <DetailRow label="College" value={customer.college} />
          <DetailRow label="Degree" value={customer.degree} />
          <DetailRow
            label="Income"
            value={
              customer.income &&
              `Rs. ${Number(customer.income).toLocaleString("en-IN")}`
            }
          />
          <DetailRow label="Company" value={customer.company} />
          <DetailRow label="Designation" value={customer.designation} />
          <DetailRow label="Marital Status" value={customer.maritalStatus} />
          <DetailRow
            label="Languages"
            value={Array.isArray(customer.languages) && customer.languages.join(", ")}
          />
          <DetailRow label="Siblings" value={String(customer.siblings ?? "")} />
          <DetailRow label="Caste" value={customer.caste} />
          <DetailRow label="Religion" value={customer.religion} />
          <DetailRow label="Want Kids" value={customer.wantKids} />
          <DetailRow label="Relocate" value={customer.relocate} />
          <DetailRow label="Pets" value={customer.pets} />
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="mb-4 text-xl font-bold">Matchmaker Notes</h2>

          <textarea
            rows="5"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3"
          />

          <button
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            onClick={saveNotes}
          >
            Save Notes
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Suggested Matches</h2>
          </div>

          <div className="grid gap-3">
            {matches.map((match) => (
              <div key={match.id} className="rounded-lg border bg-white p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-bold">
                      {match.firstName} {match.lastName || ""}
                    </h3>
                    <p>Age: {match.age}</p>
                    <p>City: {match.city}</p>
                    {match.reason && (
                      <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        {match.reason}
                      </p>
                    )}
                    {reasonErrors[match.id] && (
                      <p className="mt-2 text-sm text-rose-700">
                        {reasonErrors[match.id]}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 md:items-end">
                    <p className="w-fit rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                      {match.score}% Match
                    </p>
                    {!match.reason ? (
                      <button
                        onClick={() => loadAiReasonForMatch(match.id)}
                        disabled={loadingReasonIds.includes(match.id)}
                        className="w-fit rounded-lg bg-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                      >
                        {loadingReasonIds.includes(match.id)
                          ? "Loading Reason..."
                          : "Load AI Reason"}
                      </button>
                    ) : null}
                    <button
                      onClick={() => sendMatch(match.id)}
                      disabled={sendingMatchId === match.id}
                      className="w-fit rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {sendingMatchId === match.id ? "Sending..." : "Send Match"}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {matches.length === 0 && (
              <p className="text-slate-600">No strong matches found yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetails;
