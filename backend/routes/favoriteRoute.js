import express from "express";
import authUser from "../middleware/auth.js";
import { getFavorites, updateFavorite } from "../controllers/favoriteController.js";

const favoriteRouter = express.Router();

favoriteRouter.get("/", authUser, getFavorites);
favoriteRouter.post("/", authUser, updateFavorite);

export default favoriteRouter;
