module.exports = function (app) {
    app.post("/goals", async (req, res) => {
      res.status(200).json({ message: "goals" });
    });
    app.get("/goals", async (req, res) => {
      res.send([]);
    });
    app.patch("/goals", async (req, res) => {
      res.status(200).json({ message: "goals" });
    });
    app.delete("/goals", async (req, res) => {
      res.status(200).json({ message: "goals" });
    });
  };
  