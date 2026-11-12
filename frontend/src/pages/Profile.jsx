import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext.js";
import Title from "../components/Title";

const Profile = () => {
  const { backendUrl, token, theme, setTheme, navigate } = useContext(ShopContext);
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    axios.get(backendUrl + "/api/user/profile", { headers: { token } })
      .then((response) => { if (response.data.success) setProfile(response.data.profile); })
      .catch(() => navigate("/login"));
  }, [backendUrl, token, navigate]);
  return <section className="border-t pt-12 min-h-64"><Title text1="MY" text2="PROFILE" />
    {profile && <div className="mt-8 max-w-md space-y-4 text-gray-700 dark:text-gray-200">
      <p><span className="font-medium">Name:</span> {profile.name}</p><p><span className="font-medium">Email:</span> {profile.email}</p>
      <label className="flex items-center gap-4" htmlFor="profile-theme">Appearance
        <select id="profile-theme" value={theme} onChange={(event) => setTheme(event.target.value)} className="border rounded p-2 bg-white dark:bg-zinc-800">
          <option value="system">Device</option><option value="light">Light</option><option value="dark">Dark</option>
        </select>
      </label>
    </div>}
  </section>;
};
export default Profile;
