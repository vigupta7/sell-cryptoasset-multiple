const { time,loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Assigment", function () {

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployAssignment() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Assignment = await ethers.getContractFactory("Assignment");
    const assign = await Assignment.deploy();

    return { assign, owner, otherAccount };
  }

  describe("Creation", function () {
    it("Should be able to create new asset with a unique token id ", async function () {
      const { assign } = await loadFixture(deployAssignment);
      //create asset with 0.1 eth price
      await expect(assign.createAsset(101,"100000000000000000",'Test1','Test Asset 1')).not.to.be.reverted;
    });

    it("Should fail if asset with same Id is given for creation", async function () {
      const { assign } = await loadFixture(deployAssignment);
      await expect(assign.createAsset(101,"100000000000000000",'Test1','Test Asset 1')).not.to.be.reverted;
      await expect(assign.createAsset(101,"100000000000000000",'Test1','Test Asset 1')).to.be.revertedWith("Asset Id already exists");
    });

    it("Should fail if Asset price given as 0 on creation", async function () {
      const { assign } = await loadFixture(deployAssignment);
      await expect(assign.createAsset(101,0,'Test1','Test Asset 1')).to.be.revertedWith("Invalid Price");
    });

    it("Should emit NewAssetAdded Event", async function () {
      const { assign,owner } = await loadFixture(deployAssignment);
      await expect(assign.createAsset(101,"100000000000000000","Test1","Test Asset 1")).to.emit(assign, "NewAssetAdded")
      .withArgs(owner.address,101, "Test1","100000000000000000");
    });
  }); 
  
  describe("Purchase", function () {

    it("Should be able to purchase 10% stake of already created asset ", async function () {
      const { assign, otherAccount } = await loadFixture(deployAssignment);
      //create asset with 0.1 eth price
      await expect(assign.createAsset(101,"100000000000000000","Test1","Test Asset 1")).not.to.be.reverted;
      //purchase asset with 0.01 eth price
      await expect(assign.connect(otherAccount).purchaseAsset(101,{ value: "10000000000000000" })).not.to.be.reverted;
      // otherAccount address should get 10% stake
      const stake = await assign.getuserStakePercent(otherAccount.address,101);
      await expect(stake.toNumber()).to.equal(10);
    });

    it("Should fail on purchase if asset id is not earlier created", async function () {
      const { assign } = await loadFixture(deployAssignment);
      await expect(assign.purchaseAsset(101,{ value: "10000000000000000" })).to.be.rejectedWith("Invalid Asset Id");
    });

    it("Should fail if asset is purchased by its creator", async function () {
      const { assign, owner } = await loadFixture(deployAssignment);

      await expect(assign.createAsset(101,"100000000000000000",'Test1','Test Asset 1')).not.to.be.reverted;
      await expect(assign.connect(owner).purchaseAsset(101,{ value: "10000000000000000" })).to.be.revertedWith("Asset creator prohibited");
    });

    it("Should fail if Asset price given as 0 for purchase", async function () {
      const { assign,otherAccount } = await loadFixture(deployAssignment);
      await expect(assign.createAsset(101,"100000000000000000",'Test1','Test Asset 1')).not.to.be.reverted;
      await expect(assign.connect(otherAccount).purchaseAsset(101,{ value: 0 })).to.be.revertedWith("Invalid Amount");
    });

    it("Should fail if Asset is already sold", async function () {
      const { assign,otherAccount } = await loadFixture(deployAssignment);
      //create asset with 0.1 eth price
      await expect(assign.createAsset(101,"100000000000000000","Test1","Test Asset 1")).not.to.be.reverted;
      //purchase asset with 0.1 eth price
      await expect(assign.connect(otherAccount).purchaseAsset(101,{ value: "100000000000000000" })).not.to.be.reverted;
      // again try to purchase with 0.1 eth
      await expect(assign.connect(otherAccount).purchaseAsset(101,{ value: "100000000000000000" })).to.be.revertedWith("Asset is sold");
    });

    it("Should fail if asset purchase value is higher than available", async function () {
      const { assign,otherAccount } = await loadFixture(deployAssignment);
      //create asset with 0.1 eth price
      await expect(assign.createAsset(101,"100000000000000000","Test1","Test Asset 1")).not.to.be.reverted;
      //purchase asset with 0.01 eth price
      await expect(assign.connect(otherAccount).purchaseAsset(101,{ value: "10000000000000000" })).not.to.be.reverted;
      // try to purchase with 0.1 eth
      await expect(assign.connect(otherAccount).purchaseAsset(101,{ value: "100000000000000000" })).to.be.revertedWith("Amount higher then available asset price");
    });

    it("Should emit AssetPurchased Event", async function () {
      const { assign,otherAccount } = await loadFixture(deployAssignment);
      //create asset with 0.1 eth price
      await expect(assign.createAsset(101,"100000000000000000","Test1","Test Asset 1")).not.to.be.reverted;
      //purchase asset with 0.01 eth price
      await expect(assign.connect(otherAccount).purchaseAsset(101,{ value: "10000000000000000" })).to.emit(assign, "AssetPurchased")
      .withArgs(otherAccount.address,101, 10);

    });
  });
  
});