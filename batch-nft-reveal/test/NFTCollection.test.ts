import fs from "fs";
import { ethers, deployments, network } from "hardhat";
import { expect } from "chai";
import { BigNumberish, ContractTransaction } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { NFTCollection, VRFCoordinatorV2Mock } from "../typechain";

const { parseEther } = ethers.utils;
const { AddressZero, HashZero } = ethers.constants;

const NFT_NAME = "Your Collection Name";
const NFT_SYMBOL = "ABC";
const NFT_MAX_SUPPLY = "1000";
const NFT_MINT_COST = "0.1";
const NFT_REVEAL_BATCH_SIZE = "5";
const NFT_REVEAL_INTERVAL = "3600";

// Set env variables for test deploy
Object.assign(process.env, {
  NFT_NAME,
  NFT_SYMBOL,
  NFT_MAX_SUPPLY,
  NFT_MINT_COST,
  NFT_REVEAL_BATCH_SIZE,
  NFT_REVEAL_INTERVAL,
});

function mint(
  nftCollection: NFTCollection,
  amount: BigNumberish
): Promise<ContractTransaction> {
  return nftCollection.mint(amount, {
    value: parseEther(NFT_MINT_COST).mul(amount),
  });
}

async function revealBatch(
  nftCollection: NFTCollection,
  vrfCoordinatorV2Mock: VRFCoordinatorV2Mock
): Promise<ContractTransaction> {
  const revealTx = await nftCollection.revealPendingMetadata();
  const { events } = await revealTx.wait();
  const requestEvent = events?.find((e) => e.event === "BatchRevealRequested");
  const requestId = requestEvent?.args?.requestId;

  return vrfCoordinatorV2Mock.fulfillRandomWords(
    requestId,
    nftCollection.address
  );
}

describe("NFTCollection", async function () {
  let nftCollection: NFTCollection;
  let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  before(async function () {
    [owner, user] = await ethers.getSigners();
  });

  beforeEach(async function () {
    await deployments.fixture(["mocks", "all"]);
    nftCollection = await ethers.getContract("NFTCollection");
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
  });

  describe("Sale", async function () {
    it("should transfer token to minter", async function () {
      await expect(mint(nftCollection, 1))
        .to.emit(nftCollection, "Transfer")
        .withArgs(AddressZero, owner.address, 1);
    });

    it("should require minting at least 1 token", async function () {
      await expect(mint(nftCollection, 0)).to.be.revertedWith("InvalidAmount");
    });

    it("should fail if max supply is reached", async function () {
      await mint(nftCollection, 1);
      await expect(mint(nftCollection, NFT_MAX_SUPPLY)).to.be.revertedWith(
        "MaxSupplyReached"
      );
    });

    it("should require paying the cost for each minted token", async function () {
      await expect(nftCollection.mint(1, {})).to.be.revertedWith(
        "InsufficientFunds"
      );
      await expect(
        nftCollection.mint(2, {
          value: parseEther(NFT_MINT_COST),
        })
      ).to.be.revertedWith("InsufficientFunds");
    });
  });

  describe("Reveal", async function () {
    it("should not allow reveal when no tokens are pending reveal", async function () {
      expect(await nftCollection.totalSupply()).to.eq(0);

      const [upkeepNeeded] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeeded).to.eq(false);
    });

    it("should not allow reveal when no criteria is met", async function () {
      await mint(nftCollection, 1);

      const [upkeepNeededAfter] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeededAfter).to.eq(false);
    });

    it("should allow reveal when batch size criteria is met", async function () {
      const [upkeepNeeded] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeeded).to.eq(false);

      await mint(nftCollection, NFT_REVEAL_BATCH_SIZE);

      const [upkeepNeededAfter] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeededAfter).to.eq(true);
    });

    it("should allow reveal when batch time criteria is met", async function () {
      const [upkeepNeeded] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeeded).to.eq(false);

      await mint(nftCollection, 1);

      await network.provider.send("evm_increaseTime", [
        parseInt(NFT_REVEAL_INTERVAL),
      ]);
      await network.provider.send("evm_mine");

      const [upkeepNeededAfter] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeededAfter).to.eq(true);
    });

    it("should not reveal when it is already requested", async function () {
      await mint(nftCollection, NFT_REVEAL_BATCH_SIZE);

      await nftCollection.revealPendingMetadata();

      const [upkeepNeeded] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeeded).to.eq(false);

      await expect(nftCollection.revealPendingMetadata()).to.be.revertedWith(
        "RevealInProgress"
      );
    });

    it("should request batch reveal", async function () {
      await mint(nftCollection, NFT_REVEAL_BATCH_SIZE);

      await expect(nftCollection.revealPendingMetadata()).to.emit(
        vrfCoordinatorV2Mock,
        "RandomWordsRequested"
      );
    });

    it("should finish batch reveal", async function () {
      await mint(nftCollection, NFT_REVEAL_BATCH_SIZE);

      await expect(revealBatch(nftCollection, vrfCoordinatorV2Mock))
        .to.emit(nftCollection, "BatchRevealFinished")
        .withArgs(1, parseInt(NFT_REVEAL_BATCH_SIZE) + 1);
    });
  });

  describe("Metadata", async function () {
    it("should show unrevealed message", async function () {
      await mint(nftCollection, 1);

      const expectedUri = fs.readFileSync(
        "./test/data/unrevealed_metadata.txt",
        "utf8"
      );
      const uri = await nftCollection.tokenURI(1);
      expect(uri).to.equal(expectedUri);
    });

    it("should show randomness when revealed", async function () {
      await mint(nftCollection, NFT_REVEAL_BATCH_SIZE);

      await revealBatch(nftCollection, vrfCoordinatorV2Mock);

      const expectedUri = fs.readFileSync(
        "./test/data/revealed_metadata.txt",
        "utf8"
      );
      const uri = await nftCollection.tokenURI(1);
      expect(uri).to.equal(expectedUri);
    });

    it("should revert when getting tokenUri on nonexitent token", async function () {
      await expect(nftCollection.tokenURI(1)).to.be.revertedWith(
        "NonExistentToken"
      );
    });
  });

  describe("Owner", async function () {
    it("should fail if regular user tries to withdraw funds", async function () {
      await expect(
        nftCollection.connect(user).withdrawProceeds()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should succeed if owner tries to withdraw funds", async function () {
      await mint(nftCollection, 1);
      await expect(() =>
        nftCollection.connect(owner).withdrawProceeds()
      ).to.changeEtherBalance(owner, parseEther(NFT_MINT_COST));
    });

    it("should allow owner to change reveal batch size", async function () {
      const newBatchSize = parseInt(NFT_REVEAL_BATCH_SIZE) * 2;
      await nftCollection.connect(owner).setRevealBatchSize(newBatchSize);

      await mint(nftCollection, NFT_REVEAL_BATCH_SIZE);
      const [upkeepNeeded] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeeded).to.eq(false);

      await mint(nftCollection, NFT_REVEAL_BATCH_SIZE);
      const [upkeepNeededAfter] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeededAfter).to.equal(true);
    });

    it("should allow owner to change reveal interval time", async function () {
      const newRevealInterval = parseInt(NFT_REVEAL_INTERVAL) / 2;
      await nftCollection.setRevealInterval(newRevealInterval);

      await mint(nftCollection, 1);
      const [upkeepNeeded] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeeded).to.eq(false);

      await network.provider.send("evm_increaseTime", [newRevealInterval]);
      await network.provider.send("evm_mine");

      const [upkeepNeededAfter] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeededAfter).to.eq(true);
    });
  });
});
