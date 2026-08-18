from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Field annotations are REQUIRED
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int  # Automatically converts "587" from env to an integer
    MAIL_SERVER: str
    MAIL_FROM_NAME: str
    ACCESS_TOKEN_EXPIRE_MINUTES:int
    ENVIRONMENT:str
    FRONTEND_URL:str
    # This tells Pydantic to read from the .env file automatically
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    

settings = Settings()