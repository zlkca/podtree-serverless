const { getRequest } = require("../request");
const { GoogleAuthApi } = require("../const");
const { findUser, saveUser } = require("./user");
const { batchSaveCategories, generateCategories } = require("./category");
const { batchSaveGoals } = require("./goal");

function setAuthRoutes(app) {
  app.get("/google-userinfo", async (req, res) => {
    const access_token = req.query.access_token;
    const rsp = await getRequest(
      `${GoogleAuthApi}/userinfo?access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "content-type": "application/json",
          accept: "application/json",
        },
      }
    );
    const { sub, email, name, picture } = rsp;
    const user = await findUser(sub);
    if (sub && !user) { // new user
      await saveUser(sub, { email, name, picture });
      await generateCategories(sub);
      await generateGoals(sub);
    }
    res.send(rsp);
  });

  app.post("/userinfo", async (req, res) => {
    const { id, email, name, picture } = req.body;
    const user = await findUser(id);
    if (id && !user) { // new user
      await saveUser(id, { email, name, picture });
      await generateCategories(id);
      await generateGoals(id);
    }
    res.send(req.body);
  });
};

module.exports = {
  setAuthRoutes,
}
