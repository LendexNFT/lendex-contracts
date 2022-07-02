const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Loan Contract", function () {
  let loan;
  let collateral;
  let interest;
  let requested;
  let owner;
  let borrower;
  let lender;
  let fee = ethers.utils.parseUnits("1", "ether");

  beforeEach(async () => {
    [owner, borrower, lender] = await ethers.getSigners();

    const Collateral = await ethers.getContractFactory("MyAsset");
    collateral = await Collateral.deploy();
    await collateral.deployed();

    const Interest = await ethers.getContractFactory("GameToken");
    interest = await Interest.deploy();
    await interest.deployed();

    const Requested = await ethers.getContractFactory("RockToken");
    requested = await Requested.deploy();
    await requested.deployed();

    await collateral.connect(borrower).safeMint(1);
    await interest.mint(borrower.address, 2, 2, 0x0);
    await requested.mint(lender.address, 1, 3, 0x0);
  });

  it("Should deploy successfully", async function () {
    const Loan = await ethers.getContractFactory("Loanft");
    loan = await Loan.connect(borrower).deploy(
      borrower.address,
      collateral.address,
      requested.address,
      interest.address,
      1,
      2,
      fee,
      owner.address
    );
    await loan.deployed();

    console.log("Loan Contract: ", loan.address);

    expect(loan.address).to.not.be.null;
  });

  it("Should deploy fail if timeToPay is zero", async function () {
    const Loan = await ethers.getContractFactory("Loanft");

    await expect(
      Loan.connect(borrower).deploy(
        borrower.address,
        collateral.address,
        requested.address,
        interest.address,
        1,
        0,
        fee,
        owner.address
      )
    ).to.be.revertedWith("time can't be zero");
  });

  it("Should deploy fail if loan_fee is zero", async function () {
    const Loan = await ethers.getContractFactory("Loanft");

    await expect(
      Loan.connect(borrower).deploy(
        borrower.address,
        collateral.address,
        requested.address,
        interest.address,
        1,
        2,
        0,
        owner.address
      )
    ).to.be.revertedWith("loan fee can't be zero");
  });

  describe("Loan Contract functions", function () {
    beforeEach(async () => {
      const Loan = await ethers.getContractFactory("Loanft");
      loan = await Loan.connect(borrower).deploy(
        borrower.address,
        collateral.address,
        requested.address,
        interest.address,
        1,
        2,
        fee,
        owner.address
      );
      await loan.deployed();

      //execute setApprovalForAll
      collateral.connect(borrower).setApprovalForAll(loan.address, true);
      interest.connect(borrower).setApprovalForAll(loan.address, true);
      requested.connect(lender).setApprovalForAll(loan.address, true);
    });

    it("Should create new borrow order successfully", async function () {
      const receipt = await loan.connect(borrower).borrowOrder(1, 2);
      console.log("-->> ", receipt);
    })
  });
});
