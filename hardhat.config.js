require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("dotenv").config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.8",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80001
    }
  },
  gasReporter: {
    currency: "USD",
    gasPriceApi: `https://api.polygonscan.com/api
    ?module=proxy
    &action=eth_gasPrice
    &apikey=${process.env.GAS_PRICE}`,
    token: 'MATIC',
    coinmarketcap: process.env.API_KEY
  }
};
