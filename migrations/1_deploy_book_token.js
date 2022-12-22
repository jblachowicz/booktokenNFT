const BookToken = artifacts.require("BookToken");

module.exports = function(deployer) {
  deployer.deploy(BookToken);
};
