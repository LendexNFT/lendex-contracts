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
  let hacker;
  let fee = ethers.utils.parseUnits("1", "ether");

  beforeEach(async () => {
    [owner, borrower, lender, hacker] = await ethers.getSigners();

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
        1,
        2,
        0,
        owner.address
      )
    ).to.be.revertedWith("loan fee can't be zero");
  });

  it("Should deploy fail if _amountAssetRequested is zero", async function () {
    const Loan = await ethers.getContractFactory("Loanft");

    await expect(
      Loan.connect(borrower).deploy(
        borrower.address,
        collateral.address,
        requested.address,
        interest.address,
        1,
        0,
        2,
        fee,
        owner.address
      )
    ).to.be.revertedWith("Amount can't be zero");
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
        1,
        2,
        fee,
        owner.address
      );
      await loan.deployed();

      //execute setApprovalForAll
      collateral.connect(borrower).setApproval(loan.address);
      interest.connect(borrower).setApproval(loan.address);
      requested.connect(lender).setApproval(loan.address);
    });

    describe('BorrowOrder', () => {

      it("Should create new borrow order successfully", async function () {
        await expect(loan.connect(borrower).borrowOrder(1, 2, 2, { value: fee }))
        .to.emit(loan, "BorrowOrderEvent").withArgs(await loan.borrowerAddress(), 1, 2);
      });

      it("Should Reverted if the interest amount is zero", async function () {
        await expect(loan.connect(hacker).borrowOrder(1, 2, 0, { value: fee}))
        .to.be.revertedWith("The number of assets as interest cannot be zero");
      });

      it("Should Reverted if is not the borrowerAdmin try to deposit a collateral", async function () {
        await expect(loan.connect(hacker).borrowOrder(1, 2, 2, { value: fee}))
        .to.be.revertedWith("Token must be staked by borrower!");
      });

      it("Should Reverted if the borrower has not interest asset balance", async function () {
        await interest.connect(borrower).safeTransferFrom(borrower.address, hacker.address, 2, 2, 0x0)
        
        await expect(loan.connect(borrower).borrowOrder(1, 2, 2, { value: fee}))
        .to.be.revertedWith("You need to have at least one!");
      });

      it("Should Reverted if the borrower not pay the fee", async function () {
        await expect(loan.connect(borrower).borrowOrder(1, 2, 2, { value: 0 }))
        .to.be.revertedWith("You have to pay the Loan fee");
      });

      it("Should Commission wallet increment balance", async function () {
        commission_wallet = await loan.COMMISSION_WALLET();
        const currentBalance = async () => await ethers.provider.getBalance(commission_wallet);
        const currentBalanceFormatted = ethers.utils.formatUnits(await currentBalance());
        
        await loan.connect(borrower).borrowOrder(1, 2, 2, { value: fee })

        const expectedBalance = ethers.utils.formatUnits(await currentBalance());
        expect(Number(expectedBalance)).greaterThan(Number(currentBalanceFormatted));
      });

      it("Should get the collateral asset deposited on contract", async function () {
        await loan.connect(borrower).borrowOrder(1, 2, 2, { value: fee })
        
        const collateralContractBalance = await collateral.balanceOf(loan.address);
        const ownerOfCollateral = await collateral.ownerOf(1);
        
        expect(loan.address).to.equal(ownerOfCollateral);
        expect(Number(collateralContractBalance)).greaterThanOrEqual(1);
      });

      it("Should get the interest asset deposited on contract", async function () {
        await loan.connect(borrower).borrowOrder(1, 2, 2, { value: fee })
        const interestContractBalance = await interest.balanceOf(loan.address, 2);
        
        expect(Number(interestContractBalance)).greaterThanOrEqual(1);
      });
    });

    describe('LendOrder', () => {

      it("Should create new lend order successfully", async function () {
        await expect(loan.connect(lender).lendOrder({ value: fee }))
        .to.emit(loan, "LendingOrderEvent").withArgs(lender.address, await loan.assetToRequestId(), requested.address);
      });

      it("Should Reverted if not have requested asset balance", async function () {
        await requested.connect(lender).safeTransferFrom(lender.address, hacker.address, 1, 3, 0x0)
    
        await expect(loan.connect(lender).lendOrder({ value: fee}))
        .to.be.revertedWith("You need to have the required amount!");
      });

      it("Should Reverted if the lender not pay the fee", async function () {
        await expect(loan.connect(lender).lendOrder({ value: 0 }))
        .to.be.revertedWith("You have to pay the Loan fee");
      });

      it("Should Reverted if the lender is the borrower too", async function () {
        await requested.connect(lender).safeTransferFrom(lender.address, borrower.address, 1, 3, 0x0)
    
        await expect(loan.connect(borrower).lendOrder({ value: fee }))
        .to.be.revertedWith("You cannot be the lender if you are the borrower");
      });

      it("Should Commission wallet increment balance", async function () {
        commission_wallet = await loan.COMMISSION_WALLET();
        const currentBalance = async () => await ethers.provider.getBalance(commission_wallet);
        const currentBalanceFormatted = ethers.utils.formatUnits(await currentBalance());
        
        await loan.connect(lender).lendOrder({ value: fee })

        const expectedBalance = ethers.utils.formatUnits(await currentBalance());
        expect(Number(expectedBalance)).greaterThan(Number(currentBalanceFormatted));
      });

      it("Should lendOrder send the asset to the borrower", async function () {
        const getBalance = async () => await requested.balanceOf(borrower.address, await loan.assetToRequestId());
        const borrowBalance = await getBalance();
        
        await loan.connect(lender).lendOrder({ value: fee });
        const expectedBalance = await getBalance();
      
        expect(Number(expectedBalance)).greaterThan(Number(borrowBalance));
      });

      it("Should get the pay time for the order", async function () {
        await loan.connect(lender).lendOrder({ value: fee });
        const orderTime = await loan.currentTimeFillOrder();
       
        expect(new Date(Number(orderTime))).greaterThan(new Date(1657142047));
      });
    });

    describe("OrderComplete", () => {
      beforeEach(async () => {
        await loan.connect(borrower).borrowOrder(1, 2, 2, { value: fee })
        await loan.connect(lender).lendOrder({ value: fee })
        requested.connect(borrower).setApproval(loan.address);
      });

      it("Should complete order successfully", async function () {
        await expect(loan.connect(borrower).orderComplete())
        .to.emit(loan, "OrderCompletedEvent");
      });

      it("Should reverted transaction if is not the borrower", async function () {
        await expect(loan.connect(hacker).orderComplete())
        .to.be.revertedWith("You cannot complete the order");
      });

      it("Should reverted transaction if the borrower has not asset to requested", async function () {
        await requested.connect(borrower).safeTransferFrom(borrower.address, hacker.address, 1, 1, 0x0)
    
        await expect(loan.connect(borrower).orderComplete())
        .to.be.revertedWith("You need to have the required amount!");
      });

      it("Should call pay in time if the current time is not greater than time to pay", async function () {
        await expect(loan.connect(borrower).orderComplete())
        .to.emit(loan, "PayInTimeEvent").withArgs(borrower.address, requested.address, collateral.address);
      });

      it("Should call not pay in time if the current time is greater than time to pay", async function () {
        const sevenDays = 7 * 24 * 60 * 60;
        await network.provider.send("evm_increaseTime", [sevenDays])
        await ethers.provider.send("evm_mine");

        await expect(loan.connect(borrower).orderComplete())
        .to.emit(loan, "PayLateEvent").withArgs(requested.address, interest.address, collateral.address);
      });
      
    });

    describe('Cancel Loan', () => {
      beforeEach(async () => {
        await loan.connect(borrower).borrowOrder(1, 2, 2, { value: fee })
      });

      it("Should Cancel Loan Correctly", async function () {
        await expect(loan.connect(borrower).cancelOrder())
        .to.emit(loan, "CancelLoan").withArgs(loan.address, borrower.address);
      });

      it("Should fail Cancel Loan if lendOrder was executed", async function () {
        await loan.connect(lender).lendOrder({ value: fee });

        await expect(loan.connect(borrower).cancelOrder())
        .to.be.revertedWith("If the order is fulfilled you can't cancel the Loan");
      });

      it("Should fail Cancel Loan if is not the borrower try to cancel", async function () {
        await expect(loan.connect(hacker).cancelOrder())
        .to.be.revertedWith("You cannot Cancel the Loan");
      })
    })
  });
});
