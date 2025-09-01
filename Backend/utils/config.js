const { JWT_SECRET = "dev-secret" } = process.env;

console.log(JWT_SECRET);

module.exports = {
  JWT_SECRET,
};
