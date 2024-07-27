module.exports = function (app) {
    app.post("/users", async (req, res) => {
      res.status(200).json({ message: "users" });
    });
    app.get("/users", async (req, res) => {
      res.send([]);
    });
    app.patch("/users", async (req, res) => {
      res.status(200).json({ message: "users" });
    });
    app.delete("/users", async (req, res) => {
      res.status(200).json({ message: "users" });
    });
  };
  