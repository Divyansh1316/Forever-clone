import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets.js";

const Sidebar = () => {
  return (
    <aside className="admin-sidebar">
      <nav aria-label="Admin sections" className="flex flex-col gap-2 px-2 pt-6 md:px-4">
        <NavLink
          aria-label="Add product"
          title="Add product"
          className="admin-nav-link flex items-center gap-3 rounded-xl border px-3 py-3 text-sm"
          to="/add"
        >
          <img className="w-5 h-5" src={assets.add_icon} alt="" />
          <span className="hidden md:block">Add product</span>
        </NavLink>

        <NavLink
          aria-label="Products"
          title="Products"
          className="admin-nav-link flex items-center gap-3 rounded-xl border px-3 py-3 text-sm"
          to="/list"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="" />
          <span className="hidden md:block">Products</span>
        </NavLink>

        <NavLink
          aria-label="Orders"
          title="Orders"
          className="admin-nav-link flex items-center gap-3 rounded-xl border px-3 py-3 text-sm"
          to="/orders"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="" />
          <span className="hidden md:block">Orders</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
