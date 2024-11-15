import { getRequest } from "../request.js";
import { GoogleAuthApi } from "../const.js";
import { findUser, saveUser } from "./user.js";
import { generateCategories } from "./category.js";
import { generateGoals } from "./goal.js";

export function setAuthRoutes(app) {
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
    if (sub && !user) {
      // new user
      await saveUser(sub, { email, name, picture });
      await generateCategories(sub);
      await generateGoals(sub);
    }
    res.send(rsp);
  });

  // app.get("/userinfo", async (req, res) => {
  //   const { id, email, name, picture } = req.body;
  //   console.log(`post /userinfo, body: ${req.body}`);
  //   const user = await findUser(id);
  //   console.log(`found user: ${user}`);
  //   if (id && !user) { // new user
  //     try{
  //       await saveUser(id, { email, name, picture });
  //       await generateCategories(id);
  //       await generateGoals(id);
  //     }catch(err){
  //       console.error(err);
  //       res.status(500).json(err);
  //     }
  //     res.status(200).json(req.body);
  //   }else{
  //     res.status(400).json();
  //   }

  // });

  app.post("/userinfo", async (req, res) => {
    const body = req.body; // JSON.parse(req.body);
    console.log(`post /userinfo: ${body}`);
    const id = body.id;
    console.log(`found user id: ${id}`);
    try {
      await saveUser(id, body);
      await generateCategories(id);
      await generateGoals(id);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
    res.status(200).json(req.body);
  });
}

