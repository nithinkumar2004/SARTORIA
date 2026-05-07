import base64
import os
from datetime import timedelta
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required environment variables.")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
app = FastAPI(title="Sartoria Forge Worker")

class Generate3DRequest(BaseModel):
    product_id: str
    front_image_url: str
    back_image_url: str

# Minimal placeholder GLB content encoded as base64.
PLACEHOLDER_GLB_B64 = (
    "AAAAAAABAAEAAAAIAAAABAAAAAgAAAABBAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB"
)

@app.post("/generate-3d")
async def generate_3d(payload: Generate3DRequest):
    # In production this worker would invoke the Style3D/Rodin pipeline and a segmenter like SAM.
    product_id = payload.product_id

    try:
        glb_bytes = base64.b64decode(PLACEHOLDER_GLB_B64)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Invalid placeholder GLB: {exc}")

    upload_path = f"digital-twins/{product_id}.glb"
    result = supabase.storage.from_("digital-twins").upload(
        upload_path,
        glb_bytes,
        content_type="model/gltf-binary"
    )

    if result.error:
        raise HTTPException(status_code=500, detail=result.error.message)

    signed_url = supabase.storage.from_("digital-twins").create_signed_url(upload_path, timedelta(days=30))
    if signed_url.error:
        raise HTTPException(status_code=500, detail=signed_url.error.message)

    model_url = signed_url.data.signed_url

    update_product = supabase.table("products").update({"status": "completed"}).eq("id", product_id).execute()
    if update_product.error:
        raise HTTPException(status_code=500, detail=update_product.error.message)

    update_asset = supabase.table("assets").update({
        "model_3d_url": model_url,
        "metadata": {"generated_by": "mock-worker", "front_image_url": payload.front_image_url, "back_image_url": payload.back_image_url}
    }).eq("product_id", product_id).execute()

    if update_asset.error:
        raise HTTPException(status_code=500, detail=update_asset.error.message)

    return {
        "product_id": product_id,
        "model_3d_url": model_url,
        "status": "completed"
    }
