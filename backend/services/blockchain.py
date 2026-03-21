"""
Blockchain service — all web3.py interactions with the SupplierRegistry contract.
"""
from web3 import Web3
import os

RPC_URL           = os.getenv("ARBITRUM_SEPOLIA_RPC", "https://sepolia-rollup.arbitrum.io/rpc")
CONTRACT_ADDRESS  = os.getenv("CONTRACT_ADDRESS", "")
ADMIN_PRIVATE_KEY = os.getenv("ADMIN_PRIVATE_KEY", "")

CONTRACT_ABI = [
    {
        "inputs": [
            {"name": "_supplier",     "type": "address"},
            {"name": "_companyName",  "type": "string"},
            {"name": "_taxId",        "type": "string"},
            {"name": "_country",      "type": "string"},
            {"name": "_docsIPFSHash", "type": "string"},
            {"name": "_tier",         "type": "uint8"},
        ],
        "name": "issueCredential",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [
            {"name": "_tokenId", "type": "uint256"},
            {"name": "_reason",  "type": "string"},
        ],
        "name": "revokeCredential",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"name": "_tokenId", "type": "uint256"}],
        "name": "renewCredential",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"name": "_supplier", "type": "address"}],
        "name": "verifySupplier",
        "outputs": [
            {"name": "isValid", "type": "bool"},
            {
                "components": [
                    {"name": "supplier",     "type": "address"},
                    {"name": "companyName",  "type": "string"},
                    {"name": "taxId",        "type": "string"},
                    {"name": "country",      "type": "string"},
                    {"name": "docsIPFSHash", "type": "string"},
                    {"name": "issuedAt",     "type": "uint256"},
                    {"name": "expiresAt",    "type": "uint256"},
                    {"name": "isActive",     "type": "bool"},
                    {"name": "tier",         "type": "uint8"},
                ],
                "name": "cred",
                "type": "tuple",
            },
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"name": "_taxId", "type": "string"}],
        "name": "verifyByTaxId",
        "outputs": [
            {"name": "isValid", "type": "bool"},
            {
                "components": [
                    {"name": "supplier",     "type": "address"},
                    {"name": "companyName",  "type": "string"},
                    {"name": "taxId",        "type": "string"},
                    {"name": "country",      "type": "string"},
                    {"name": "docsIPFSHash", "type": "string"},
                    {"name": "issuedAt",     "type": "uint256"},
                    {"name": "expiresAt",    "type": "uint256"},
                    {"name": "isActive",     "type": "bool"},
                    {"name": "tier",         "type": "uint8"},
                ],
                "name": "cred",
                "type": "tuple",
            },
            {"name": "supplierWallet", "type": "address"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "totalSuppliers",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
]


def get_w3():
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    return w3


def get_contract():
    w3 = get_w3()
    if not CONTRACT_ADDRESS:
        raise ValueError("CONTRACT_ADDRESS not set in environment")
    return w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS),
        abi=CONTRACT_ABI,
    )


def verify_supplier_onchain(wallet: str) -> dict:
    contract = get_contract()
    wallet   = Web3.to_checksum_address(wallet)
    is_valid, cred = contract.functions.verifySupplier(wallet).call()
    return {
        "isValid":      is_valid,
        "supplier":     cred[0],
        "companyName":  cred[1],
        "taxId":        cred[2],
        "country":      cred[3],
        "docsIPFSHash": cred[4],
        "issuedAt":     cred[5],
        "expiresAt":    cred[6],
        "isActive":     cred[7],
        "tier":         cred[8],
    }


def verify_by_taxid_onchain(tax_id: str) -> dict:
    contract = get_contract()
    is_valid, cred, wallet = contract.functions.verifyByTaxId(tax_id).call()
    return {
        "isValid":        is_valid,
        "supplierWallet": wallet,
        "companyName":    cred[1],
        "taxId":          cred[2],
        "country":        cred[3],
        "issuedAt":       cred[5],
        "expiresAt":      cred[6],
        "tier":           cred[8],
    }


def get_total_suppliers() -> int:
    return get_contract().functions.totalSuppliers().call()


def _send_tx(fn):
    w3      = get_w3()
    account = w3.eth.account.from_key(ADMIN_PRIVATE_KEY)
    nonce   = w3.eth.get_transaction_count(account.address)
    latest       = w3.eth.get_block('latest')
    base_fee     = latest['baseFeePerGas']
    max_priority = w3.to_wei(1, 'gwei')
    max_fee      = base_fee * 2 + max_priority
    tx = fn.build_transaction({
        'from':                account.address,
        'nonce':               nonce,
        'gas':                 500_000,
        'maxFeePerGas':        max_fee,
        'maxPriorityFeePerGas': max_priority,
        'chainId':             421614,
    })
    signed  = w3.eth.account.sign_transaction(tx, private_key=ADMIN_PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    return receipt.transactionHash.hex(), receipt.status


def mint_credential(supplier_wallet, company_name, tax_id, country, docs_ipfs_hash, tier):
    contract = get_contract()
    fn = contract.functions.issueCredential(
        Web3.to_checksum_address(supplier_wallet),
        company_name, tax_id, country, docs_ipfs_hash, tier,
    )
    return _send_tx(fn)


def revoke_credential(token_id: int, reason: str):
    return _send_tx(get_contract().functions.revokeCredential(token_id, reason))


def renew_credential(token_id: int):
    return _send_tx(get_contract().functions.renewCredential(token_id))
