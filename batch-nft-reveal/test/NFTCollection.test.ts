import fs from "fs";
import { ethers, deployments, network } from "hardhat";
import { expect } from "chai";
import { NFTCollection, VRFCoordinatorV2Mock } from "../typechain";

const { parseEther } = ethers.utils;
const { HashZero } = ethers.constants;

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

describe("NFTCollection", async function () {
  let nftCollection: NFTCollection;
  let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;

  beforeEach(async function () {
    await deployments.fixture(["mocks", "all"]);
    nftCollection = await ethers.getContract("NFTCollection");
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
  });

  // todo: describe("Sale", async function () {});

  describe("Reveal", async function () {
    it("should allow reveal when batch size criteria is met", async function () {
      const [upkeepNeeded] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeeded).to.eq(false);

      // Mint enough NFTs to satisfy the batch size criteria
      await nftCollection.mint(NFT_REVEAL_BATCH_SIZE, {
        value: ethers.utils
          .parseEther(NFT_MINT_COST)
          .mul(NFT_REVEAL_BATCH_SIZE),
      });

      const [upkeepNeededAfter] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeededAfter).to.eq(true);
    });

    it("should allow reveal when batch time criteria is met", async function () {
      const [upkeepNeeded] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeeded).to.eq(false);

      // Mint 1 NFT to be revealed
      await nftCollection.mint(1, {
        value: parseEther(NFT_MINT_COST),
      });

      await network.provider.send("evm_increaseTime", [
        parseInt(NFT_REVEAL_INTERVAL),
      ]);
      await network.provider.send("evm_mine");

      const [upkeepNeededAfter] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeededAfter).to.eq(true);
    });

    it("should not allow reveal when no criteria is met", async function () {
      const [upkeepNeeded] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeeded).to.eq(false);

      // Mint 1 NFT to be revealed
      await nftCollection.mint(1, {
        value: parseEther(NFT_MINT_COST),
      });

      const [upkeepNeededAfter] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeededAfter).to.eq(false);
    });

    it("should not allow reveal when no tokens are pending reveal", async function () {
      expect(await nftCollection.totalSupply()).to.eq(0);

      const [upkeepNeeded] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeeded).to.eq(false);
    });

    it("should not allow reveal when reveal is already requested", async function () {
      // Mint enough NFTs to satisfy the batch size criteria
      await nftCollection.mint(NFT_REVEAL_BATCH_SIZE, {
        value: ethers.utils
          .parseEther(NFT_MINT_COST)
          .mul(NFT_REVEAL_BATCH_SIZE),
      });

      await nftCollection.revealPendingMetadata();

      const [upkeepNeeded] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeeded).to.eq(false);

      await expect(nftCollection.revealPendingMetadata()).to.be.revertedWith(
        "RevealCriteriaNotMet"
      );
    });

    it("should request batch reveal", async function () {
      // Mint enough NFTs to satisfy the batch size criteria
      await nftCollection.mint(NFT_REVEAL_BATCH_SIZE, {
        value: ethers.utils
          .parseEther(NFT_MINT_COST)
          .mul(NFT_REVEAL_BATCH_SIZE),
      });

      await expect(nftCollection.revealPendingMetadata()).to.emit(
        vrfCoordinatorV2Mock,
        "RandomWordsRequested"
      );
    });

    it("should finish batch reveal", async function () {
      // Mint enough NFTs to satisfy the batch size criteria
      await nftCollection.mint(NFT_REVEAL_BATCH_SIZE, {
        value: ethers.utils
          .parseEther(NFT_MINT_COST)
          .mul(NFT_REVEAL_BATCH_SIZE),
      });

      const revealTx = await nftCollection.revealPendingMetadata();
      const { events } = await revealTx.wait();
      const requestEvent = events?.find(
        (e) => e.event === "BatchRevealRequested"
      );
      const requestId = requestEvent?.args?.requestId;

      await expect(
        vrfCoordinatorV2Mock.fulfillRandomWords(
          requestId,
          nftCollection.address
        )
      )
        .to.emit(nftCollection, "BatchRevealFinished")
        .withArgs(1, parseInt(NFT_REVEAL_BATCH_SIZE) + 1);
    });
  });

  describe("Metadata", async function () {
    it("should show unrevealed message", async function () {
      const expectedUri = fs.readFileSync(
        "./test/data/unrevealed_metadata.txt",
        "utf8"
      );
      const uri = await nftCollection.tokenURI(1);
      expect(uri).to.equal(expectedUri);
    });

    it("should show randomness when revealed", async function () {
      // Mint enough NFTs to satisfy the batch size criteria
      await nftCollection.mint(NFT_REVEAL_BATCH_SIZE, {
        value: ethers.utils
          .parseEther(NFT_MINT_COST)
          .mul(NFT_REVEAL_BATCH_SIZE),
      });

      const revealTx = await nftCollection.revealPendingMetadata();
      const { events } = await revealTx.wait();
      const requestEvent = events?.find(
        (e) => e.event === "BatchRevealRequested"
      );
      const requestId = requestEvent?.args?.requestId;

      await vrfCoordinatorV2Mock.fulfillRandomWords(
        requestId,
        nftCollection.address
      );

      const expectedUri = fs.readFileSync(
        "./test/data/revealed_metadata.txt",
        "utf8"
      );
      const uri = await nftCollection.tokenURI(1);
      expect(uri).to.equal(expectedUri);
    });
  });

  // todo: describe("Owner", async function () {});
});
