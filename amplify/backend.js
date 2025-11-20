const { defineBackend } = require("@aws-amplify/backend");
const { auth } = require("./auth/resource");

exports.backend = defineBackend({
  auth,
});