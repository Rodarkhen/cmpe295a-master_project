from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

products = [
    {
        "id": 1,
        "name": "Wireless Headphones",
        "currentPrice": 89.99,
        "aiPrice": 94.99,
        "minPrice": 79.99,
        "maxPrice": 119.99,
        "margin": 32,
        "risk": "Low",
    },
    {
        "id": 2,
        "name": "Smart Watch",
        "currentPrice": 299.99,
        "aiPrice": 279.99,
        "minPrice": 249.99,
        "maxPrice": 349.99,
        "margin": 28,
        "risk": "Medium",
    },
]

@app.get("/products")
def get_products():
    for p in products:
        change = random.uniform(-1.5, 1.5)
        p["currentPrice"] = round(p["currentPrice"] + change, 2)

    return products