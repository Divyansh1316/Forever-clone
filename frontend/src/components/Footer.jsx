import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-24 text-sm">
        <div>
          <img src={assets.logo} className="mb-5 w-32 dark:brightness-0 dark:invert" alt="Forever" />
          <p className="w-full md:w-2/3 text-gray-600">
            Shop thoughtfully selected fashion and everyday essentials, with a simple experience from discovery through delivery.
          </p>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/collection">Collections</Link></li>
            <li><Link to="/orders">My orders</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">SHOPPING</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li><Link to="/collection">Browse collections</Link></li>
            <li><Link to="/favorites">Saved favorites</Link></li>
            <li><Link to="/cart">Your cart</Link></li>
          </ul>
        </div>
      </div>

      <div>
        <hr />
        <p className="py-5 text-sm text-center">
          © {new Date().getFullYear()} Forever. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
