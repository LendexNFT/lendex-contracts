const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Factory Contract", function () {
  let factory;

  beforeEach(async () => {
    const Factory = await ethers.getContractFactory("FactoryLoans");
    factory = await Factory.deploy();
    await factory.deployed();
  });

  it("Should deploy successfully", async function () {
    console.log("Factory Contract: ", factory.address);
    
    expect(factory.address).to.not.be.null;
  });

  it("Should owner set new commission wallet", async function () {
    const newCommissionWallet = "0x88968C5bB7a2EaD6F59907c327821f18E2861359";
    await factory.setCommissionWallet(newCommissionWallet);
    
    const currentWallet = await factory.COMMISSION_WALLET();
    expect(newCommissionWallet).to.equal(currentWallet);
  });

  it("Should fail set new commission wallet if it is not owner", async function () {
    const [owner, noOwner] = await ethers.getSigners();
    const newCommissionWallet = "0x88968C5bB7a2EaD6F59907c327821f18E2861359";
   
    await expect(
      factory.connect(noOwner).setCommissionWallet(newCommissionWallet)
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it("Should owner set new fee", async function () {
    const newFee = ethers.utils.parseUnits("0.5", "ether");
    await factory.setFee(newFee);
    const currentFee = await factory.fee();
    
    expect(newFee).to.equal(currentFee);
  });

  it("Should fail set new fee if it is not owner", async function () {
    const [owner, noOwner] = await ethers.getSigners();
    const newFee = ethers.utils.parseUnits("0.5", "ether");

    await expect(
      factory.connect(noOwner).setFee(newFee)
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  describe('Create Loan', () => {
    let collateral;
    let interest;
    let requested;
    let owner;
    let  borrower;
    let lender;

    beforeEach(async () => {
      [owner, borrower, lender] = await ethers.getSigners();
      // Deployed Collateral, interest and requested assets contracts
      const Collateral =  await ethers.getContractFactory("MyAsset");
      collateral = await Collateral.deploy();
      await collateral.deployed();

      const Interest =  await ethers.getContractFactory("GameToken");
      interest = await Interest.deploy();
      await interest.deployed();

      const Requested =  await ethers.getContractFactory("RockToken");
      requested = await Requested.deploy();
      await requested.deployed();

      await collateral.connect(borrower).safeMint(1);
      await interest.mint(borrower.address, 2, 2, 0x0);
      await requested.mint(lender.address, 0, 3, 0x0);
    });

    it("Should borrower mint assets successfully", async function () {
      const ownerOf = await collateral.ownerOf(1);
      const balanceOf = await interest.balanceOf(borrower.address, 2);

      expect(borrower.address).to.equal(ownerOf);
      expect(balanceOf).to.equal(2);
    });

    it("Should borrower can create loan successfully", async function () {
      // IERC721 _collateralAsset,
      // IERC1155 _interestAsset,
      // IERC1155 _requestAsset,
      // uint256 _requestAssetId,
      // uint256 _amountAssetRequested,
      // uint256 _timeToPay
      const receipt =  await factory.connect(borrower).createLoan(
        collateral.address,
        interest.address,
        requested.address,
        0,
        1,
        2
      )
      expect(receipt).to.have.a.property('hash');
    });
  });
});


