from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))
    APP_ENV: str = os.getenv("APP_ENV", "development")

settings = Settings()