from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from serpapi_service import build_dashboard_products

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/products")
def get_products():
    return build_dashboard_products()