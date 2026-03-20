// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SupplierRegistry
 * @notice Soul-bound NFT credential registry for verified suppliers.
 *         Deployed on Arbitrum. Credentials are non-transferable.
 */
contract SupplierRegistry is ERC721, Ownable {

    // ─────────────────────────────────────────────
    // STRUCTS
    // ─────────────────────────────────────────────

    struct Credential {
        address supplier;
        string  companyName;
        string  taxId;
        string  country;
        string  docsIPFSHash;   // Filecoin/IPFS CID of verified documents
        uint256 issuedAt;
        uint256 expiresAt;      // 1 year from issuance
        bool    isActive;
        uint8   tier;           // 1 = Basic, 2 = Standard, 3 = Premium
    }

    // ─────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────

    uint256 private _tokenCounter;

    mapping(uint256 => Credential) public credentials;
    mapping(address => uint256)    public supplierToken;   // wallet → tokenId
    mapping(string  => address)    public taxIdToWallet;   // taxId  → wallet

    // ─────────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────────

    event CredentialIssued(
        address indexed supplier,
        uint256 indexed tokenId,
        string  companyName,
        uint8   tier
    );

    event CredentialRevoked(
        uint256 indexed tokenId,
        string  reason
    );

    event CredentialRenewed(
        uint256 indexed tokenId,
        uint256 newExpiresAt
    );

    // ─────────────────────────────────────────────
    // CONSTRUCTOR
    // ─────────────────────────────────────────────

    constructor() ERC721("VerifyChain Credential", "VCC") Ownable(msg.sender) {}

    // ─────────────────────────────────────────────
    // SOUL-BOUND: block all transfers
    // ─────────────────────────────────────────────

    function transferFrom(address, address, uint256) public pure override {
        revert("VerifyChain: credentials are non-transferable");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("VerifyChain: credentials are non-transferable");
    }

    // ─────────────────────────────────────────────
    // ADMIN: ISSUE CREDENTIAL
    // ─────────────────────────────────────────────

    /**
     * @notice Mint a verified credential to a supplier.
     * @dev Only callable by contract owner (admin backend wallet).
     */
    function issueCredential(
        address _supplier,
        string memory _companyName,
        string memory _taxId,
        string memory _country,
        string memory _docsIPFSHash,
        uint8 _tier
    ) external onlyOwner {
        require(_supplier != address(0), "Invalid supplier address");
        require(supplierToken[_supplier] == 0, "Supplier already has credential");
        require(_tier >= 1 && _tier <= 3, "Invalid tier");

        _tokenCounter++;
        uint256 tokenId = _tokenCounter;

        credentials[tokenId] = Credential({
            supplier:     _supplier,
            companyName:  _companyName,
            taxId:        _taxId,
            country:      _country,
            docsIPFSHash: _docsIPFSHash,
            issuedAt:     block.timestamp,
            expiresAt:    block.timestamp + 365 days,
            isActive:     true,
            tier:         _tier
        });

        supplierToken[_supplier] = tokenId;
        taxIdToWallet[_taxId]    = _supplier;

        _safeMint(_supplier, tokenId);

        emit CredentialIssued(_supplier, tokenId, _companyName, _tier);
    }

    // ─────────────────────────────────────────────
    // ADMIN: REVOKE CREDENTIAL
    // ─────────────────────────────────────────────

    function revokeCredential(uint256 _tokenId, string memory _reason) external onlyOwner {
        require(_exists(_tokenId), "Token does not exist");
        require(credentials[_tokenId].isActive, "Already revoked");

        credentials[_tokenId].isActive = false;

        emit CredentialRevoked(_tokenId, _reason);
    }

    // ─────────────────────────────────────────────
    // ADMIN: RENEW CREDENTIAL
    // ─────────────────────────────────────────────

    function renewCredential(uint256 _tokenId) external onlyOwner {
        require(_exists(_tokenId), "Token does not exist");
        Credential storage cred = credentials[_tokenId];
        require(cred.isActive, "Credential is revoked");

        cred.expiresAt = block.timestamp + 365 days;

        emit CredentialRenewed(_tokenId, cred.expiresAt);
    }

    // ─────────────────────────────────────────────
    // PUBLIC: VERIFY SUPPLIER (free, anyone can call)
    // ─────────────────────────────────────────────

    /**
     * @notice Verify a supplier by wallet address.
     * @return isValid  true if credential exists, active, and not expired
     * @return cred     full credential struct
     */
    function verifySupplier(address _supplier)
        external
        view
        returns (bool isValid, Credential memory cred)
    {
        uint256 tokenId = supplierToken[_supplier];
        if (tokenId == 0) return (false, cred);

        cred    = credentials[tokenId];
        isValid = cred.isActive && block.timestamp < cred.expiresAt;
    }

    /**
     * @notice Verify a supplier by Tax ID string.
     */
    function verifyByTaxId(string memory _taxId)
        external
        view
        returns (bool isValid, Credential memory cred, address supplierWallet)
    {
        supplierWallet = taxIdToWallet[_taxId];
        if (supplierWallet == address(0)) return (false, cred, supplierWallet);

        uint256 tokenId = supplierToken[supplierWallet];
        cred    = credentials[tokenId];
        isValid = cred.isActive && block.timestamp < cred.expiresAt;
    }

    // ─────────────────────────────────────────────
    // VIEW HELPERS
    // ─────────────────────────────────────────────

    function totalSuppliers() external view returns (uint256) {
        return _tokenCounter;
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId > 0 && tokenId <= _tokenCounter;
    }
}
