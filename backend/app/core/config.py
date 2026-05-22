from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(default="PRESUPUESTO GASTOS", alias="APP_NAME")
    app_env: str = Field(default="local", alias="APP_ENV")
    app_timezone: str = Field(default="America/Lima", alias="APP_TIMEZONE")
    database_url: str = Field(
        default="mysql+pymysql://usuario:password@localhost:3306/presupuesto_gastos_db",
        alias="DATABASE_URL",
    )
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default=["http://127.0.0.1:5173", "http://localhost:5173"],
        alias="CORS_ORIGINS",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]

        return value


settings = Settings()
