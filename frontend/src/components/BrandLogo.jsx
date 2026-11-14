import React from "react";
import { assets } from "../assets/assets";

const BrandLogo = ({ className = "" }) => (
  <span className={`forever-logo ${className}`}>
    <img src={assets.logo} className="forever-logo-image dark:brightness-0 dark:invert" alt="Forever" />
    <span className="forever-logo-dot" aria-hidden="true" />
  </span>
);

export default BrandLogo;
