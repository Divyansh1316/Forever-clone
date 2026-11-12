import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext.js";
import axios from "axios";
import { toast } from "react-toastify";

const Login = ({ initialState = "Login" }) => {
  const [currentState, setCurrentState] = useState(initialState);
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === "Sign Up") {
        const response = await axios.post(backendUrl + "/api/user/register", {
          name,
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(backendUrl + "/api/user/login", {
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      const message = error.response?.status === 404
        ? "The login service was not found. Check the backend URL and deployment."
        : error.response?.data?.message || "Unable to sign in. Please try again.";
      toast.error(message);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [navigate, token]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="mx-auto mt-14 flex w-[90%] flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 text-gray-800 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 sm:max-w-96 sm:p-8"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800 dark:bg-zinc-300" />
      </div>
      {currentState === "Login" ? (
        ""
      ) : (
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          type="text"
          className="w-full rounded-md border border-gray-800 bg-white px-3 py-2 focus:border-rose-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
          placeholder="Name"
          required
        />
      )}
      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        className="w-full rounded-md border border-gray-800 bg-white px-3 py-2 focus:border-rose-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
        placeholder="Email"
        required
      />
      <div className="relative w-full">
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type={showPassword ? "text" : "password"}
          autoComplete={currentState === "Login" ? "current-password" : "new-password"}
          className="w-full rounded-md border border-gray-800 bg-white px-3 py-2 pr-16 focus:border-rose-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
          placeholder="Password"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((visible) => !visible)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          className="absolute inset-y-0 right-3 text-xs text-gray-600 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-white"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p className="cursor-pointer">Forgot your password?</p>
        {currentState === "Login" ? (
          <p
            onClick={() => setCurrentState("Sign Up")}
            className="cursor-pointer"
          >
            Create account
          </p>
        ) : (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer"
          >
            Login Here
          </p>
        )}
      </div>
      <button className="mt-4 rounded-md bg-black px-8 py-2 font-light text-white dark:bg-zinc-100 dark:text-zinc-900">
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;
