import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

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

function ScoreBreakdown({ breakdown }) {
  if (!Array.isArray(breakdown) || breakdown.length === 0) {
    return null;
  }

  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-sm font-semibold text-slate-700">
        Score breakdown
      </summary>
      <div className="mt-3 grid gap-2">
        {breakdown.map((item) => {
          const percentage = item.max ? Math.round((item.score / item.max) * 100) : 0;

          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs text-slate-600">
                <span>{item.label}</span>
                <span>
                  {item.score}/{item.max}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </details>
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
    toast.success("Notes saved successfully!", { position: "bottom-right", autoClose: 2000 });
  };

  const sendMatch = async (matchId) => {
    // Quick validation before sending
    if (!customer.email) {
      toast.error("❌ Customer email is missing. Add email first.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setSendingMatchId(matchId);
      const response = await API.post("/actions/send-match", {
        customerId: customer.id,
        matchId,
      });

      if (response.data.success) {
        alert("SUCCESS BLOCK");
  toast.success(`✅ Match sent to ${customer.email}`);

        

      }
    } catch (sendError) {
      console.error("Send match failed:", sendError.response?.data || sendError.message);
      const errorMsg =
        sendError.response?.data?.message || "Failed to send match";
      toast.error(`❌ ${errorMsg}`, { position: "bottom-right", autoClose: 4000 });
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
                    {match.fitLabel && (
                      <p className="mt-2 text-sm font-semibold text-blue-700">
                        {match.fitLabel}
                      </p>
                    )}
                    {Array.isArray(match.tags) && match.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {match.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {Array.isArray(match.reasons) && match.reasons.length > 0 && (
                      <ul className="mt-3 grid gap-1 text-sm text-slate-700">
                        {match.reasons.slice(0, 3).map((reason) => (
                          <li key={reason}>- {reason}</li>
                        ))}
                      </ul>
                    )}
                    {Array.isArray(match.cautions) && match.cautions.length > 0 && (
                      <ul className="mt-2 grid gap-1 text-sm text-amber-700">
                        {match.cautions.slice(0, 2).map((caution) => (
                          <li key={caution}>- {caution}</li>
                        ))}
                      </ul>
                    )}
                    <ScoreBreakdown breakdown={match.breakdown} />
                    {match.reason && (
                      <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        AI note: {match.reason}
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
