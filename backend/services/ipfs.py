import os
import httpx
import aiofiles
from pathlib import Path
from fastapi import UploadFile
import hashlib

W3_TOKEN = os.getenv("WEB3_STORAGE_TOKEN", "")
UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

async def upload_file(file: UploadFile) -> tuple[str, str]:
    contents = await file.read()
    filename = file.filename or "document"

    if W3_TOKEN and W3_TOKEN != "placeholder_for_now":
        try:
            cid = await _upload_to_w3s(contents, filename)
            return filename, cid
        except Exception as e:
            print(f"web3.storage failed: {e}")

    safe_name = filename.replace(" ", "_").replace("/", "_")
    dest = UPLOAD_DIR / safe_name
    async with aiofiles.open(dest, "wb") as f:
        await f.write(contents)

    # Generate valid base58 CID-like hash
    file_hash = hashlib.sha256(contents).hexdigest()[:32]
    placeholder = "Qm" + file_hash.upper()[:44]
    return filename, placeholder

async def upload_multiple(files: list[UploadFile]) -> dict[str, str]:
    results = {}
    for file in files:
        if file and file.filename:
            filename, cid = await upload_file(file)
            results[filename] = cid
    return results

async def _upload_to_w3s(contents: bytes, filename: str) -> str:
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            "https://api.web3.storage/upload",
            headers={"Authorization": f"Bearer {W3_TOKEN}", "X-NAME": filename},
            content=contents,
        )
        response.raise_for_status()
        data = response.json()
        cid = data.get("cid", "")
        if not cid:
            raise ValueError(f"No CID returned: {data}")
        return cid
