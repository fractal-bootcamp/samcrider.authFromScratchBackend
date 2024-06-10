import express from "express";
import config from "../../utils/config";
import bcrypt from "bcrypt";
import { prisma } from "../../utils/client";
import { UserAuthInfo } from "./types";

const authRouter = express.Router();

authRouter.get("/logout", (req, res) => {
  req.session = null;
  res.send("user is logged out");
});

authRouter.post("/hydrate", async (req, res) => {
  // pull hash out of req
  const hashedCookie = req.body.cookie;

  //remove session= from the cookie
  const actualCookie = hashedCookie.slice(8);
  // decode the uri
  const decodedCookie = decodeURIComponent(actualCookie);

  // try to find a user whose cookieHash matches the encrypted cookie
  const foundUser = await prisma.user.findUnique({
    where: {
      cookieHash: decodedCookie,
    },
  });

  if (!foundUser) return console.log("no user, may be signing up/logging in");

  // send back the user if found
  res.status(200).send({ id: foundUser.id, email: foundUser.email });
});

authRouter.post("/login", async (req, res) => {
  // pull out of req
  const email = req.body.email;
  const password = req.body.password;

  // search for the user
  const foundUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!foundUser) throw new Error("no user found");

  // check password -MAY NOT BE CORRECT USAGE-
  const isMatchingPass = await bcrypt.compare(password, foundUser.cookieHash);

  if (!isMatchingPass) throw new Error("passwords don't match");

  // if user, set cookie to their cookiehash
  res.cookie("session", foundUser.cookieHash);
  // send back user info
  res.status(200).send({ id: foundUser.id, email: foundUser.email });
});

authRouter.post("/signup", async (req, res) => {
  // pull out of req
  const email = req.body.email;
  const password = req.body.password;

  // search for user to make sure they don't exist
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (user) res.status(400).send("user already exists");

  // hash the users password with the .env variable cookie secret
  const newCookieHash = await bcrypt.hash(password, Number(config.COOKIE_SALT));

  // create the new user and set their cookieHash
  const newUser: UserAuthInfo = {
    email: email,
    cookieHash: newCookieHash,
  };

  // add user to database
  const addedUser = await prisma.user.create({
    data: newUser,
  });

  // set the cookie
  res.cookie("session", addedUser.cookieHash);
  // send back the user info
  res.status(200).send({ id: addedUser.id, email: addedUser.email });
});

export default authRouter;
