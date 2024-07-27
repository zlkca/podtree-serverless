module.exports = function (app) {
  app.post("/tasks", async (req, res) => {
    res.status(200).json({ message: "tasks" });
  });
  app.get("/tasks", async (req, res) => {
    res.send([]);
  });
  app.patch("/tasks", async (req, res) => {
    res.status(200).json({ message: "tasks" });
  });
  app.delete("/tasks", async (req, res) => {
    res.status(200).json({ message: "tasks" });
  });
};
