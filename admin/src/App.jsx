import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";

const App = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("admin-theme") || "dark");
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  useEffect(() => {
    localStorage.setItem("admin-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");

  return (
    <div className={`admin-shell min-h-screen ${theme === "dark" ? "admin-theme-dark" : "admin-theme-light"}`}>
      <ToastContainer theme={theme} />
      {token === "" ? (
        <Login setToken={setToken} theme={theme} toggleTheme={toggleTheme} />
      ) : (
        <>
          <Navbar setToken={setToken} theme={theme} toggleTheme={toggleTheme} />
          <div className="admin-layout flex w-full">
            <Sidebar />
            <main className="admin-main min-w-0 flex-1 px-4 py-6 text-base sm:px-6 md:px-10 md:py-8">
              <Routes>
                <Route path="/" element={<Navigate to="/add" replace />} />
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route path="*" element={<Navigate to="/add" replace />} />
              </Routes>
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
