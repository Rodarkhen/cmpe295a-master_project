import os
import time
import random
from datetime import datetime
from dotenv import load_dotenv
import serpapi
from inventory import STORE_PRODUCTS

load_dotenv()

SERPAPI_KEY = os.getenv("SERPAPI_KEY")

CACHE_TTL = 60 * 60 * 48  # 48 hours
cache = {}


def fetch_competitor_price(query: str):
    now = time.time()

    if query in cache and now - cache[query]["time"] < CACHE_TTL:
        return cache[query]["data"]

    client = serpapi.Client(api_key=SERPAPI_KEY)

    results = client.search({
        "engine": "walmart",
        "store_id": "4065",
        "query": query,
    })

    organic_results = results.get("organic_results", [])

    best_result = None

    for item in organic_results:
        offer = item.get("primary_offer", {})
        price = offer.get("offer_price")

        if price is not None and not item.get("out_of_stock", False):
            best_result = {
                "competitorPrice": float(price),
                "competitorName": item.get("title", "Unknown"),
                "source": "Walmart",
                "rating": item.get("rating"),
                "reviews": item.get("reviews"),
                "thumbnail": item.get("thumbnail"),
                "competitorUrl": item.get("product_page_url"),
            }
            break

    cache[query] = {
        "time": now,
        "data": best_result,
    }

    return best_result


def build_dashboard_products():
    dashboard_products = []

    for product in STORE_PRODUCTS:
        competitor = fetch_competitor_price(product["query"])

        if competitor:
            competitor_price = competitor["competitorPrice"]
        else:
            competitor_price = product["currentPrice"]

        ai_price = competitor_price - random.uniform(0.5, 2.0)
        ai_price = max(product["minPrice"], min(ai_price, product["maxPrice"]))
        ai_price = round(ai_price, 2)

        margin = round(
            ((ai_price - product["supplierCost"]) / ai_price) * 100,
            1
        )

        risk = get_risk(product, ai_price, margin)

        dashboard_products.append({
            "id": product["id"],
            "sku": product["sku"],
            "name": product["name"],
            "category": product["category"],
            "currentPrice": product["currentPrice"],
            "competitorPrice": competitor_price,
            "aiPrice": ai_price,
            "supplierCost": product["supplierCost"],
            "minPrice": product["minPrice"],
            "maxPrice": product["maxPrice"],
            "margin": margin,
            "risk": risk,
            "source": competitor["source"] if competitor else "Fallback",
            "competitorName": competitor["competitorName"] if competitor else "N/A",
            "competitorUrl": competitor.get("competitorUrl") if competitor else None,
            "rating": competitor.get("rating") if competitor else None,
            "reviews": competitor.get("reviews") if competitor else None,
            "thumbnail": competitor.get("thumbnail") if competitor else None,
            "lastUpdated": datetime.now().strftime("%I:%M %p"),
            "explanation": f"AI compared your store price with competitor pricing for {product['name']} and applied manager price limits.",
            "reasons": [
                {"label": "Competitor price", "value": f"${competitor_price:.2f}"},
                {"label": "Supplier cost", "value": f"${product['supplierCost']:.2f}"},
                {"label": "Price limits", "value": "Applied"},
            ],
            "history7d": generate_history(ai_price, 7),
            "history30d": generate_history(ai_price, 7),
            "history1y": generate_year_history(ai_price),
        })

    return dashboard_products


def get_risk(product, ai_price, margin):
    if ai_price <= product["minPrice"] * 1.05:
        return "High"

    if margin < 25:
        return "Medium"

    return "Low"


def generate_history(base_price, count):
    return [
        {
            "date": f"Day {i + 1}",
            "current": round(base_price + random.uniform(-3, 3), 2),
            "ai": round(base_price + random.uniform(-2, 2), 2),
        }
        for i in range(count)
    ]


def generate_year_history(base_price):
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    return [
        {
            "date": month,
            "current": round(base_price + random.uniform(-10, 10), 2),
            "ai": round(base_price + random.uniform(-8, 8), 2),
        }
        for month in months
    ]