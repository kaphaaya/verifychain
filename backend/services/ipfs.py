"""
Document storage service.
Uploads to web3.storage using the current HTTP API.
Falls back to local storage if token not configured.
"""
import os
import httpx
import aiofiles
import tempfile
from pathlib import Path
from fastapi import UploadFile

W3_TOKEN = os.getenv("WEB3_STORAGE_TOKEN", "")
UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


async def upload_file(file: UploadFile) -> tuple[str, str]:
    """
    Upload a single file. Returns (filename, cid_or_path).
    Tries web3.storage first, falls back to local storage.
    """
    contents = await file.read()
    filename = file.filename or "document"

    if W3_TOKEN and W3_TOKEN != "placeholder_for_now":
        try:
            cid = await _upload_to_w3s(contents, filename)
            return filename, cid
        except Exception as e:
            print(f"web3.storage upload failed: {e} — falling back to local")

    # Local fallback — save file and return a reference
    safe_name = filename.replace(" ", "_").replace("/", "_")
    dest = UPLOAD_DIR / safe_name
    async with aiofiles.open(dest, "wb") as f:
        await f.write(contents)

    return filename, f"local://{safe_name}"


async def upload_multiple(files: list[UploadFile]) -> dict[str, str]:
    """Upload multiple files. Returns {filename: cid} dict."""
    results = {}
    for file in files:
        if file and file.filename:
            filename, cid = await upload_file(file)
            results[filename] = cid
    return results


async def _upload_to_w3s(contents: bytes, filename: str) -> str:
    """Upload to web3.storage and return the IPFS CID."""
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            "https://api.web3.storage/upload",
            headers={
                "Authorization": f"Bearer {W3_TOKEN}",
                "X-NAME": filename,
            },
            content=contents,
        )
        response.raise_for_status()
        data = response.json()
        cid = data.get("cid", "")
        if not cid:
            raise ValueError(f"No CID returned: {data}")
        return cid


def get_document_url(cid: str) -> str:
    """Convert a CID or local path to a viewable URL."""
    if not cid:
        return ""
    if cid.startswith("local://"):
        filename = cid.replace("local://", "")
        return f"/api/supplier/docs/{filename}"
    if cid.startswith("ipfs://"):
        cid = cid.replace("ipfs://", "")
    return f"https://w3s.link/ipfs/{cid}"
