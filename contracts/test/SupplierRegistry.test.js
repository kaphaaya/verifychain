const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SupplierRegistry", function () {
  let registry, owner, supplier, buyer, other;

  beforeEach(async () => {
    [owner, supplier, buyer, other] = await ethers.getSigners();
    const SupplierRegistry = await ethers.getContractFactory("SupplierRegistry");
    registry = await SupplierRegistry.deploy();
  });

  // ─── MINTING ───────────────────────────────────────────────────
  describe("issueCredential", () => {
    it("owner can issue a credential", async () => {
      await expect(
        registry.issueCredential(
          supplier.address,
          "Acme Supplies Ltd",
          "CAC-123456",
          "Nigeria",
          "ipfs://QmTestHash",
          2
        )
      )
        .to.emit(registry, "CredentialIssued")
        .withArgs(supplier.address, 1, "Acme Supplies Ltd", 2);

      expect(await registry.ownerOf(1)).to.equal(supplier.address);
    });

    it("non-owner cannot issue credential", async () => {
      await expect(
        registry.connect(other).issueCredential(
          supplier.address, "Test", "TAX-1", "Nigeria", "ipfs://hash", 1
        )
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });

    it("cannot issue duplicate credential to same supplier", async () => {
      await registry.issueCredential(supplier.address, "Acme", "CAC-1", "NG", "ipfs://h", 1);
      await expect(
        registry.issueCredential(supplier.address, "Acme", "CAC-1", "NG", "ipfs://h", 1)
      ).to.be.revertedWith("Supplier already has credential");
    });

    it("rejects invalid tier", async () => {
      await expect(
        registry.issueCredential(supplier.address, "X", "Y", "Z", "ipfs://h", 4)
      ).to.be.revertedWith("Invalid tier");
    });
  });

  // ─── SOUL-BOUND ───────────────────────────────────────────────
  describe("soul-bound enforcement", () => {
    beforeEach(async () => {
      await registry.issueCredential(
        supplier.address, "Acme", "CAC-1", "Nigeria", "ipfs://h", 2
      );
    });

    it("blocks transferFrom", async () => {
      await expect(
        registry.connect(supplier).transferFrom(supplier.address, other.address, 1)
      ).to.be.revertedWith("VerifyChain: credentials are non-transferable");
    });

    it("blocks safeTransferFrom", async () => {
      await expect(
        registry.connect(supplier)["safeTransferFrom(address,address,uint256,bytes)"](
          supplier.address, other.address, 1, "0x"
        )
      ).to.be.revertedWith("VerifyChain: credentials are non-transferable");
    });
  });

  // ─── VERIFY ───────────────────────────────────────────────────
  describe("verifySupplier", () => {
    beforeEach(async () => {
      await registry.issueCredential(
        supplier.address, "Acme Supplies", "CAC-123", "Nigeria", "ipfs://QmDoc", 2
      );
    });

    it("returns valid=true for active supplier", async () => {
      const [isValid, cred] = await registry.verifySupplier(supplier.address);
      expect(isValid).to.equal(true);
      expect(cred.companyName).to.equal("Acme Supplies");
      expect(cred.tier).to.equal(2);
    });

    it("returns valid=false for unknown address", async () => {
      const [isValid] = await registry.verifySupplier(other.address);
      expect(isValid).to.equal(false);
    });

    it("verifyByTaxId works", async () => {
      const [isValid, cred, wallet] = await registry.verifyByTaxId("CAC-123");
      expect(isValid).to.equal(true);
      expect(wallet).to.equal(supplier.address);
      expect(cred.companyName).to.equal("Acme Supplies");
    });
  });

  // ─── REVOKE ───────────────────────────────────────────────────
  describe("revokeCredential", () => {
    beforeEach(async () => {
      await registry.issueCredential(
        supplier.address, "Acme", "CAC-1", "Nigeria", "ipfs://h", 1
      );
    });

    it("owner can revoke", async () => {
      await expect(registry.revokeCredential(1, "Fraud detected"))
        .to.emit(registry, "CredentialRevoked")
        .withArgs(1, "Fraud detected");

      const [isValid] = await registry.verifySupplier(supplier.address);
      expect(isValid).to.equal(false);
    });

    it("non-owner cannot revoke", async () => {
      await expect(
        registry.connect(other).revokeCredential(1, "test")
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });
  });

  // ─── RENEW ────────────────────────────────────────────────────
  describe("renewCredential", () => {
    it("owner can renew and extend expiry", async () => {
      await registry.issueCredential(
        supplier.address, "Acme", "CAC-1", "Nigeria", "ipfs://h", 1
      );
      const before = (await registry.credentials(1)).expiresAt;
      await registry.renewCredential(1);
      const after = (await registry.credentials(1)).expiresAt;
      expect(after).to.be.greaterThan(before);
    });
  });
});
