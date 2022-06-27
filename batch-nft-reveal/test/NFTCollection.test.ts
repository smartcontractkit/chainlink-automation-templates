import fs from "fs";
import { ethers, deployments, network } from "hardhat";
import { expect } from "chai";
import { NFTCollection, VRFCoordinatorV2Mock } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";

const { HashZero, AddressZero } = ethers.constants;

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
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  const NFT_MINT_COST_ETH: BigNumber = ethers.utils.parseEther(NFT_MINT_COST);

  before(async function () {
    [owner, user] = await ethers.getSigners();
  });

  beforeEach(async function () {
    await deployments.fixture(["mocks", "all"]);
    nftCollection = await ethers.getContract("NFTCollection");
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
  });

  describe("Sale", async function () {
    it("should allow anyone to mint", async function () {
      await expect(
        nftCollection.connect(user).mint(1, {
          value: NFT_MINT_COST_ETH,
        })
      )
        .to.emit(nftCollection, "Transfer")
        .withArgs(AddressZero, user.address, 1);
    });

    it("should require minting at least 1 NFT", async function () {
      await expect(nftCollection.mint(0)).to.be.revertedWith("InvalidAmount");
    });

    it("should fail if user mints more than max supply", async function () {
      // Mint all tokens available
      const TOTAL_COLLECTION_PRICE =
        BigNumber.from(NFT_MAX_SUPPLY).mul(NFT_MINT_COST_ETH);

      await nftCollection.mint(NFT_MAX_SUPPLY, {
        value: TOTAL_COLLECTION_PRICE,
      });

      await expect(nftCollection.mint(1)).to.be.revertedWith(
        "MaxSupplyReached"
      );
    });

    it("should fail if user mints for less than token's cost", async function () {
      const INSUFFICIENT_VALUE_ETH = NFT_MINT_COST_ETH.mul(5).sub(1);
      await expect(
        nftCollection.mint(5, {
          value: INSUFFICIENT_VALUE_ETH,
        })
      ).to.be.revertedWith("InsufficientFunds");
    });
  });

  describe("Reveal", async function () {
    it("should allow reveal when batch size criteria is met", async function () {
      const [upkeepNeeded] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeeded).to.eq(false);

      // Mint enough NFTs to satisfy the batch size criteria
      await nftCollection.mint(NFT_REVEAL_BATCH_SIZE, {
        value: NFT_MINT_COST_ETH.mul(NFT_REVEAL_BATCH_SIZE),
      });

      const [upkeepNeededAfter] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeededAfter).to.eq(true);
    });

    it("should allow reveal when batch time criteria is met", async function () {
      const [upkeepNeeded] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeeded).to.eq(false);

      // Mint 1 NFT to be revealed
      await nftCollection.mint(1, {
        value: NFT_MINT_COST_ETH,
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
        value: NFT_MINT_COST_ETH,
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
        value: NFT_MINT_COST_ETH.mul(NFT_REVEAL_BATCH_SIZE),
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
        value: NFT_MINT_COST_ETH.mul(NFT_REVEAL_BATCH_SIZE),
      });

      await expect(nftCollection.revealPendingMetadata()).to.emit(
        vrfCoordinatorV2Mock,
        "RandomWordsRequested"
      );
    });

    it("should finish batch reveal", async function () {
      // Mint enough NFTs to satisfy the batch size criteria
      await nftCollection.mint(NFT_REVEAL_BATCH_SIZE, {
        value: NFT_MINT_COST_ETH.mul(NFT_REVEAL_BATCH_SIZE),
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
        value: NFT_MINT_COST_ETH.mul(NFT_REVEAL_BATCH_SIZE),
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

  describe("Owner", async function () {
    it("should fail if regular user tries to withdraw funds", async function () {
      await expect(
        nftCollection.connect(user).withdrawProceeds()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should withdraw if owner tries to withdraw funds", async function () {
      await nftCollection.connect(user).mint(1, { value: NFT_MINT_COST_ETH });
      await expect(() =>
        nftCollection.connect(owner).withdrawProceeds()
      ).to.changeEtherBalance(owner, NFT_MINT_COST_ETH);
    });

    it("should allow admin to change reveal batch size", async function () {
      const [upkeepNeeded] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeeded).to.eq(false);

      const NEW_BATCH_SIZE = 10;
      await nftCollection.connect(owner).setRevealBatchSize(NEW_BATCH_SIZE);
      await nftCollection.mint(NEW_BATCH_SIZE, {
        value: NFT_MINT_COST_ETH.mul(NEW_BATCH_SIZE),
      });
      const [upkeepNeededAfter] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeededAfter).to.equal(true);
    });

    it("should allow admin to change reveal interval time", async function () {
      const NEW_NFT_REVEAL_INTERVAL = 2 * parseInt(NFT_REVEAL_INTERVAL);

      await nftCollection.setRevealInterval(NEW_NFT_REVEAL_INTERVAL);
      const [upkeepNeeded] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeeded).to.eq(false);

      // Mint 1 NFT to be revealed
      await nftCollection.mint(1, {
        value: NFT_MINT_COST_ETH,
      });

      // 2 virtual hours pass
      await network.provider.send("evm_increaseTime", [
        parseInt(NFT_REVEAL_INTERVAL) * 2,
      ]);
      await network.provider.send("evm_mine");

      const [upkeepNeededAfter] = await nftCollection.checkUpkeep(HashZero);
      expect(upkeepNeededAfter).to.eq(true);
    });
  });
});
