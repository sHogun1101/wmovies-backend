require("dotenv").config;
const express = require("express");
const router = express.Router();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const actorController = require("../services/actorController");
const categoryController = require("../services/categoryController");
const countryController = require("../services/countryController");
const movieController = require("../services/movieController");
const userController = require("../services/userController");
router.use(cors({ credentials: true, origin: "http://localhost:3000" }));
router.use(cookieParser());

// Category
router.post("/insert-category", categoryController.insertCategory);
router.post("/update-category", categoryController.updateCategory);

// Country
router.post("/insert-country", countryController.insertCountry);
router.post("/update-country", countryController.updateCountry);

// Actor
router.post("/insert-actor", actorController.insertActor);
router.post("/update-actor", actorController.updateActor);
router.get("/get-actor/:actor_code", actorController.getActor);

// Movie
router.post("/insert-movie", movieController.insertMovie);
router.post("/update-movie", movieController.updateMovie);
router.post("/get-movie-search", movieController.getMovieFilterSearch);
router.post(
  "/get-movie-type-input-search",
  movieController.getMovieTypeSearchInput
);
router.post("/get-movie-recommended", movieController.getMovieRecommended);
router.get("/get-episode-movie/:code/:ep", movieController.getEpisodeMovie);
router.get(
  "/get-list-movie/:status/:limit/:offset",
  movieController.getTotalMovieFollowStatus
);
router.get(
  "/get-list-movie-table/:date_now/:first_day_week/:last_day_week/:first_day_month/:last_day_month",
  movieController.getBXHViewMovieDayWeekMonth
);

// User
router.post("/insert-user", userController.insertUser);
router.post("/update-user", userController.updateUser);
router.post("/update-movie-view-history", userController.updateMovieHistory);
router.get(
  "/get-movie-history/:user_id/:limit/:offset",
  userController.getMovieHistory
);
router.get(
  "/get-movie-favourite/:user_id/:limit/:offset",
  userController.getMovieFavourite
);
router.get(
  "/get-user-words/:user_id/:limit/:offset",
  userController.getWordsUser
);
router.get(
  "/get-user-couplets/:user_id/:limit/:offset",
  userController.getCoupletsUser
);
router.get(
  "/get-movie-words/:user_id/:code_movie/:limit/:offset",
  userController.getWordsUserFollowMovie
);
router.get(
  "/get-movie-couplets/:user_id/:code_movie/:limit/:offset",
  userController.getCoupletsUserFollowMovie
);
module.exports = router;
