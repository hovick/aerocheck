"use client";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("aero_token")}`
    };
  };

  // 1. Authenticate the Admin
  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("aero_token");
      if (!token) return setIsAdmin(false);

      try {
        const res = await fetch(`${API_BASE}/users/me`, { headers: getAuthHeaders() });
        const data = await res.json();
        
        if (data.is_admin) {
          setIsAdmin(true);
          fetchUsers();
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  // 2. Fetch all users from the database
  const fetchUsers = async () => {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: getAuthHeaders() });
    if (res.ok) {
      setUsers(await res.json());
    }
    setLoading(false);
  };

  // 3. Handle saving changes to a user
  const handleSaveUser = async (userId: number, isPremium: boolean, maxAirports: number) => {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_premium: isPremium, max_airports: maxAirports })
    });

    if (res.ok) {
      alert("User privileges updated successfully!");
      fetchUsers(); // Refresh the list
    } else {
      const err = await res.json();
      alert(`Error: ${err.detail}`);
    }
  };

  // --- UI SCREENS ---
  if (isAdmin === null) return <div style={{ padding: "50px", textAlign: "center" }}>Loading secure dashboard...</div>;
  
  if (isAdmin === false) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#111", color: "red", fontFamily: "monospace" }}>
        <h1>403 CRITICAL ERROR: UNAUTHORIZED ACCESS</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", backgroundColor: "#f4f6f9", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", backgroundColor: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #0b1b3d", paddingBottom: "15px", marginBottom: "20px" }}>
          <h1 style={{ color: "#0b1b3d", margin: 0 }}>Altitude Nexus - Command Center</h1>
          <a href="/" style={{ padding: "8px 15px", backgroundColor: "#e2e3e5", color: "#333", textDecoration: "none", borderRadius: "4px", fontSize: "14px", fontWeight: "bold" }}>
            Return to Map
          </a>
        </div>

        {loading ? <p>Loading user database...</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#0b1b3d", color: "white" }}>
                <th style={{ padding: "12px" }}>ID</th>
                <th style={{ padding: "12px" }}>Username</th>
                <th style={{ padding: "12px" }}>Email</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px" }}>Premium Access</th>
                <th style={{ padding: "12px" }}>Airport Limit</th>
                <th style={{ padding: "12px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "12px" }}>{u.id}</td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>{u.username}</td>
                  <td style={{ padding: "12px" }}>{u.email || "N/A"}</td>
                  <td style={{ padding: "12px" }}>
                    {u.is_verified ? <span style={{ color: "green" }}>✔ Verified</span> : <span style={{ color: "red" }}>Unverified</span>}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <input 
                      type="checkbox" 
                      checked={u.is_premium} 
                      onChange={(e) => {
                        const newUsers = [...users];
                        newUsers.find(user => user.id === u.id).is_premium = e.target.checked;
                        setUsers(newUsers);
                      }} 
                    />
                  </td>
                  <td style={{ padding: "12px" }}>
                    <input 
                      type="number" 
                      min="1" 
                      max="1000"
                      value={u.max_airports} 
                      onChange={(e) => {
                        const newUsers = [...users];
                        newUsers.find(user => user.id === u.id).max_airports = parseInt(e.target.value);
                        setUsers(newUsers);
                      }} 
                      style={{ width: "60px", padding: "4px" }}
                    />
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button 
                      onClick={() => handleSaveUser(u.id, u.is_premium, u.max_airports)}
                      style={{ padding: "6px 12px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                    >
                      Save Upgrades
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}