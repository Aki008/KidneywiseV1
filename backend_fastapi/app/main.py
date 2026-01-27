import base64
import json
import os
from typing import Any, Dict, List, Optional, Tuple

import requests
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None


app = FastAPI(title="Kidney Diet Analyzer MVP", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"]
    if os.getenv("ENVIRONMENT", "development") == "development"
    else ["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"],
)


class IdentifyFoodPayload(BaseModel):
    image: str = Field(..., description="Base64-encoded image (optionally data URI)")
    optional_context_text: Optional[str] = None


class ComputeNutrientsPayload(BaseModel):
    confirmed_dish_name: str
    portion_description: str
    optional_clarifications: Optional[str] = None


class MenuSuggestionsPayload(BaseModel):
    image: str
    optional_context_text: Optional[str] = None
    user_profile: Optional[Dict[str, Any]] = None


class VoiceMealPayload(BaseModel):
    transcript: str
    optional_context_text: Optional[str] = None


FDC_BASE_URL = "https://api.nal.usda.gov/fdc/v1"


def get_openai_client() -> OpenAI:
    if OpenAI is None:
        raise HTTPException(status_code=500, detail="OpenAI SDK not installed.")
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is not set. Please configure your OpenAI API key.",
        )
    return OpenAI(api_key=api_key)


def get_fdc_key() -> str:
    api_key = os.getenv("FDC_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail=(
                "FDC_API_KEY is not set. Get a free USDA FoodData Central API key at "
                "https://fdc.nal.usda.gov/api-key-signup.html"
            ),
        )
    return api_key


def decode_base64_image(image_str: str) -> bytes:
    if image_str.startswith("data:"):
        image_str = image_str.split(",", 1)[1]
    try:
        return base64.b64decode(image_str)
    except base64.binascii.Error as exc:
        raise HTTPException(status_code=400, detail="Invalid base64 image data.") from exc


def parse_json_response(text: str) -> Dict[str, Any]:
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=500, detail="Failed to parse model response.") from exc


def call_openai_vision(prompt: str, image_bytes: bytes) -> Dict[str, Any]:
    client = get_openai_client()
    response = client.responses.create(
        model="gpt-4o-mini",
        input=[
            {
                "role": "system",
                "content": "You are a nutrition assistant. Return only valid JSON.",
            },
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": prompt},
                    {
                        "type": "input_image",
                        "image_base64": base64.b64encode(image_bytes).decode("utf-8"),
                    },
                ],
            },
        ],
    )
    text = response.output_text
    return parse_json_response(text)


def call_openai_json(prompt: str) -> Dict[str, Any]:
    client = get_openai_client()
    response = client.responses.create(
        model="gpt-4o-mini",
        input=[
            {
                "role": "system",
                "content": "You are a nutrition assistant. Return only valid JSON.",
            },
            {"role": "user", "content": prompt},
        ],
    )
    text = response.output_text
    return parse_json_response(text)


def fdc_search(food_query: str) -> List[Dict[str, Any]]:
    api_key = get_fdc_key()
    response = requests.get(
        f"{FDC_BASE_URL}/foods/search",
        params={
            "query": food_query,
            "pageSize": 5,
            "api_key": api_key,
        },
        timeout=20,
    )
    response.raise_for_status()
    return response.json().get("foods", [])


def fdc_food_details(fdc_id: int) -> Dict[str, Any]:
    api_key = get_fdc_key()
    response = requests.get(
        f"{FDC_BASE_URL}/food/{fdc_id}",
        params={"api_key": api_key},
        timeout=20,
    )
    response.raise_for_status()
    return response.json()


def extract_nutrients(food_data: Dict[str, Any]) -> Dict[str, float]:
    nutrient_map = {"potassium_mg": 306, "sodium_mg": 307, "protein_g": 203}
    nutrients = {"potassium_mg": 0.0, "sodium_mg": 0.0, "protein_g": 0.0}
    for nutrient in food_data.get("foodNutrients", []):
        nutrient_id = nutrient.get("nutrient", {}).get("id") or nutrient.get("nutrientId")
        if nutrient_id in nutrient_map.values():
            for key, target_id in nutrient_map.items():
                if nutrient_id == target_id:
                    nutrients[key] = float(nutrient.get("amount", 0.0))
    return nutrients


def portion_to_grams(dish_name: str, portion_description: str, clarifications: Optional[str]) -> Dict[str, Any]:
    prompt = (
        "Convert the portion description into grams for the given dish. "
        "Return JSON with standardized_portion_grams (number), portion_notes, and confidence (low/medium/high). "
        f"Dish: {dish_name}. Portion: {portion_description}. Clarifications: {clarifications or 'none'}."
    )
    result = call_openai_json(prompt)
    grams = result.get("standardized_portion_grams")
    if not isinstance(grams, (int, float)):
        raise HTTPException(status_code=400, detail="Unable to parse portion grams.")
    return result


def build_uncertainty(confidence: str) -> Dict[str, str]:
    if confidence == "high":
        return {"low": "-10%", "high": "+10%"}
    if confidence == "medium":
        return {"low": "-20%", "high": "+25%"}
    return {"low": "-30%", "high": "+40%"}


def has_severe_symptoms(text: str) -> bool:
    severe_keywords = [
        "chest pain",
        "severe pain",
        "shortness of breath",
        "fainting",
        "blood in urine",
        "confusion",
        "unresponsive",
    ]
    lowered = text.lower()
    return any(keyword in lowered for keyword in severe_keywords)


@app.post("/identify_food")
async def identify_food(
    request: Request,
    image: Optional[UploadFile] = File(None),
    optional_context_text: Optional[str] = Form(None),
):
    if image:
        image_bytes = await image.read()
    else:
        payload = IdentifyFoodPayload(**await request.json())
        image_bytes = decode_base64_image(payload.image)
        optional_context_text = payload.optional_context_text

    prompt = (
        "Identify the most likely dishes in this image. "
        "Return JSON with keys: candidates (list of {name, confidence, rationale}), "
        "followup_questions (1-3 questions), visible_components (list), safety_notes (list). "
        "Do not include nutrient numbers."
    )
    if optional_context_text:
        prompt += f" Context: {optional_context_text}."

    result = call_openai_vision(prompt, image_bytes)
    return {
        "candidates": result.get("candidates", []),
        "followup_questions": result.get("followup_questions", []),
        "visible_components": result.get("visible_components", []),
        "safety_notes": result.get("safety_notes", ["Estimates only; confirm with a dietitian."]),
    }


@app.post("/compute_nutrients")
async def compute_nutrients(payload: ComputeNutrientsPayload):
    portion_result = portion_to_grams(
        payload.confirmed_dish_name,
        payload.portion_description,
        payload.optional_clarifications,
    )
    grams = float(portion_result["standardized_portion_grams"])

    search_results = fdc_search(payload.confirmed_dish_name)
    if not search_results:
        raise HTTPException(
            status_code=404,
            detail="No USDA FDC matches found. Provide a more specific dish or ingredients.",
        )

    top_match = search_results[0]
    fdc_id = top_match.get("fdcId")
    food_details = fdc_food_details(fdc_id)
    nutrients_per_100g = extract_nutrients(food_details)

    multiplier = grams / 100.0
    nutrient_estimates = {
        key: round(value * multiplier, 2) for key, value in nutrients_per_100g.items()
    }

    return {
        "standardized_portion_grams": grams,
        "nutrient_estimates": nutrient_estimates,
        "uncertainty": build_uncertainty(portion_result.get("confidence", "low")),
        "data_sources": [
            {
                "fdc_id": fdc_id,
                "description": food_details.get("description"),
                "fdc_link": f"https://fdc.nal.usda.gov/fdc-app.html#/food-details/{fdc_id}/nutrients",
            }
        ],
        "disclaimers": [
            "This is an estimate and not medical advice.",
            "Nutrient values are sourced from USDA FoodData Central and scaled to the portion.",
        ],
    }


@app.post("/menu_suggestions")
async def menu_suggestions(
    request: Request,
    image: Optional[UploadFile] = File(None),
    optional_context_text: Optional[str] = Form(None),
    user_profile: Optional[str] = Form(None),
):
    if image:
        image_bytes = await image.read()
    else:
        payload = MenuSuggestionsPayload(**await request.json())
        image_bytes = decode_base64_image(payload.image)
        optional_context_text = payload.optional_context_text
        user_profile = json.dumps(payload.user_profile or {})

    prompt = (
        "Extract menu items from the image. Return JSON with keys: extracted_menu_items (list). "
        "Only include items that are readable."
    )
    if optional_context_text:
        prompt += f" Context: {optional_context_text}."

    vision_result = call_openai_vision(prompt, image_bytes)
    items = vision_result.get("extracted_menu_items", [])

    profile_note = f"User profile: {user_profile or 'none'}"
    suggestions_prompt = (
        "Given these menu items, recommend kidney-friendlier options. "
        "Return JSON with recommended_items (list of {item, why_kidney_friendly, suggested_modifications}), "
        "avoid_or_caution_items (list of {item, why}), questions_to_ask_restaurant (list). "
        "Do not include nutrient numbers. "
        f"Menu items: {items}. {profile_note}"
    )
    suggestion_result = call_openai_json(suggestions_prompt)

    return {
        "extracted_menu_items": items,
        "recommended_items": suggestion_result.get("recommended_items", []),
        "avoid_or_caution_items": suggestion_result.get("avoid_or_caution_items", []),
        "questions_to_ask_restaurant": suggestion_result.get("questions_to_ask_restaurant", []),
    }


@app.post("/voice_meal")
async def voice_meal(payload: VoiceMealPayload):
    if has_severe_symptoms(payload.transcript):
        return {
            "parsed": None,
            "nutrient_estimate": None,
            "escalation_message": "If you are experiencing severe symptoms, contact your care team immediately.",
        }
    prompt = (
        "Parse the meal transcript into JSON with keys: dish_name, portion_description, "
        "needs_clarification (boolean), followup_questions (list). "
        "Do not include nutrient numbers. "
        f"Transcript: {payload.transcript}. Context: {payload.optional_context_text or 'none'}."
    )
    result = call_openai_json(prompt)

    if result.get("needs_clarification"):
        return {
            "parsed": result,
            "nutrient_estimate": None,
        }

    compute_payload = ComputeNutrientsPayload(
        confirmed_dish_name=result.get("dish_name", ""),
        portion_description=result.get("portion_description", ""),
        optional_clarifications=None,
    )
    nutrient_estimate = await compute_nutrients(compute_payload)
    return {
        "parsed": result,
        "nutrient_estimate": nutrient_estimate,
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
