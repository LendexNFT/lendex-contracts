// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const Asset721 = await hre.ethers.getContractFactory("721Asset");
  const asset721 = await Asset721.deploy();
  const _collateralAssetAddress = asset721.address;

  const Asset1155 = await hre.ethers.getContractFactory("1155Asset");
  const asset1155 = await Asset1155.deploy();
  const _assetToRequest = asset1155.address;
  const _assetAsInterest = asset1155.address;

  const _timeToPay = 1;
  // We get the contract to deploy
  const Loanft = await hre.ethers.getContractFactory("Loanft");
  // address _collateralAssetAddress, address _assetToRequest, address _assetAsInterest, uint256 _assetToRequestId, uint256 _timeToPay
  const loanft = await Loanft.deploy(_collateralAssetAddress, _assetToRequest, _assetAsInterest, 2, _timeToPay);

  await loanft.deployed();

  console.log("Loanft deployed to:", loanft.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
