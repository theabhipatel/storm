// MongoDB init: creates the `notification` database with a service user.
// Executed automatically on first container start.
db = db.getSiblingDB("notification");
db.createUser({
  user: "notification",
  pwd: "notification_pw",
  roles: [{ role: "readWrite", db: "notification" }],
});
db.createCollection("messages");
