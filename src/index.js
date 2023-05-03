const express = require("express");
const axios = require("axios");
const app = express();
const querystring = require("querystring");
const cors = require("cors");

app.use(cors());
require("dotenv").config();

const SCOPE =
  "playlist-modify-private user-read-playback-state user-library-modify user-library-read playlist-modify-public user-top-read playlist-modify-private playlist-read-collaborative";
const REDIRECT_URI = "http://localhost:8080/account";
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;

app.listen(8080, () => {
  console.log("App is listening on port 8080");
});

app.use(cors({ origin: ["http://localhost:3000"] }));

app.get("/getcode", async (req, res) => {
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: CLIENT_ID,
        scope: SCOPE,
        redirect_uri: REDIRECT_URI,
      })
  );
});

app.get("/account", async (req, res) => {
  const spotifyResponse = await axios.post(
    "https://accounts.spotify.com/api/token",
    querystring.stringify({
      grant_type: "authorization_code",
      code: req.query.code,
      redirect_uri: REDIRECT_URI,
    }),
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (spotifyResponse.status === 200) {
    const { access_token, refresh_token } = spotifyResponse.data;
    const queryParams = querystring.stringify({
      access_token: access_token,
      refresh_token: refresh_token,
    });
    res.redirect("http://localhost:3000/callback?" + queryParams);
  } else {
    res.redirect("http://localhost:3000/error");
    console.log(spotifyResponse.data);
    console.log(spotifyResponse.status);
  }
});

app.get("/refresh", async (req, res) => {
  var refresh_token = req.query.refresh_token;

  const spotifyResponse = await axios.post(
    "https://accounts.spotify.com/api/token",
    querystring.stringify({
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    }),
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      },
    }
  );

  if (spotifyResponse.status === 200) {
    console.log(spotifyResponse.data);
  } else {
    res.redirect("http://localhost:3000/error");
    console.log(spotifyResponse.data);
    console.log(spotifyResponse.status);
  }
});
