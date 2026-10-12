import { expect } from "chai";
import { ethers } from "hardhat";
import { PraiseBoard } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("PraiseBoard", function () {
  let praiseBoard: PraiseBoard;
  let owner: SignerWithAddress;
  let tipper1: SignerWithAddress;
  let tipper2: SignerWithAddress;

  beforeEach(async function () {
    [owner, tipper1, tipper2] = await ethers.getSigners();
    const PraiseBoardFactory = await ethers.getContractFactory("PraiseBoard");
    praiseBoard = await PraiseBoardFactory.deploy() as PraiseBoard;
    await praiseBoard.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await praiseBoard.owner()).to.equal(owner.address);
    });

    it("Should start with 0 tips", async function () {
      expect(await praiseBoard.getTipsCount()).to.equal(0);
    });
  });

  describe("Tipping", function () {
    it("Should receive a tip and emit TipReceived event", async function () {
      const tipAmount = ethers.parseEther("0.1");
      const note = "Great job!";
      
      await expect(praiseBoard.connect(tipper1).sendTip(note, { value: tipAmount }))
        .to.emit(praiseBoard, "TipReceived")
        .withArgs(tipper1.address, tipAmount, note, anyValue);
        
      const tips = await praiseBoard.getTips();
      expect(tips.length).to.equal(1);
      expect(tips[0].sender).to.equal(tipper1.address);
      expect(tips[0].amount).to.equal(tipAmount);
      expect(tips[0].note).to.equal(note);
    });

    it("Should reject zero-value tip", async function () {
      await expect(
        praiseBoard.connect(tipper1).sendTip("Zero tip", { value: 0 })
      ).to.be.revertedWith("Tip amount must be greater than 0");
    });

    it("Should reject empty note", async function () {
      await expect(
        praiseBoard.connect(tipper1).sendTip("", { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Note cannot be empty");
    });

    it("Should reject excessively long note", async function () {
      const longNote = "a".repeat(281);
      await expect(
        praiseBoard.connect(tipper1).sendTip(longNote, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Note is too long");
    });

    it("Should store multiple tips correctly", async function () {
      await praiseBoard.connect(tipper1).sendTip("Tip 1", { value: ethers.parseEther("0.1") });
      await praiseBoard.connect(tipper2).sendTip("Tip 2", { value: ethers.parseEther("0.2") });

      expect(await praiseBoard.getTipsCount()).to.equal(2);
      const tips = await praiseBoard.getTips();
      expect(tips[0].note).to.equal("Tip 1");
      expect(tips[1].note).to.equal("Tip 2");
    });
  });

  describe("Withdrawals", function () {
    it("Should fail if unauthorized user tries to withdraw", async function () {
      await expect(
        praiseBoard.connect(tipper1).withdraw()
      ).to.be.revertedWith("Only owner can call this");
    });

    it("Should succeed for owner and update balances", async function () {
      const tipAmount = ethers.parseEther("1.0");
      await praiseBoard.connect(tipper1).sendTip("Keep it up!", { value: tipAmount });

      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      
      const tx = await praiseBoard.connect(owner).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      
      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      
      expect(finalOwnerBalance).to.equal(initialOwnerBalance + tipAmount - gasUsed);
      expect(await ethers.provider.getBalance(await praiseBoard.getAddress())).to.equal(0);
    });

    it("Should fail if no funds to withdraw", async function () {
      await expect(
        praiseBoard.connect(owner).withdraw()
      ).to.be.revertedWith("No funds to withdraw");
    });
  });
});
