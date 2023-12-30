const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { AuthenticationClient } = require("auth0");
const { auth } = require("express-oauth2-jwt-bearer");

const port = 3000;

const auth0 = new AuthenticationClient({
  domain: "dev-0xmbttk03u0fhdoz.eu.auth0.com",
  clientId: "NtUs7tSZLlKw6HTjO0DGRC2vJ0JnZnAR",
  clientSecret:
    "cY-wWANe9NQvTYfCuiqXEJOIx-lYXZQ3wYDbA0MTkvGyE76N6xLUVt1XZl_MRX51",
});

const checkJwt = auth({
  authRequired: false,
  audience: "https://dev-0xmbttk03u0fhdoz.eu.auth0.com/api/v2/",
  issuerBaseURL: `https://dev-0xmbttk03u0fhdoz.eu.auth0.com/`,
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logger middleware
app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

app.get("/", checkJwt, (req, res) => {
  if (req.auth) {
    return res.json({
      token: req.auth.payload.sub,
      logout: "http://localhost:3000/logout",
    });
  }
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.post("/api/login", async (req, res) => {
  const { login, password } = req.body;

  try {
    const {
      data: { access_token },
    } = await auth0.oauth.passwordGrant({
      audience: "https://dev-0xmbttk03u0fhdoz.eu.auth0.com/api/v2/",
      username: login,
      password,
    });

    if (access_token) {
      return res.json({ token: "Bearer " + access_token });
    }

    throw new Error("Invalid credentials");
  } catch (e) {
    console.log(e);
    return res.status(401).send();
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
