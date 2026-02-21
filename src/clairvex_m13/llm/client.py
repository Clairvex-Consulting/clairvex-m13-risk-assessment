"""Ollama client for local Mistral 7B inference."""

from __future__ import annotations

import json
import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)

_DEFAULT_BASE_URL = "http://localhost:11434"
_DEFAULT_MODEL = "mistral"
_DEFAULT_TIMEOUT = 300.0


class LLMError(Exception):
    """Raised when the LLM request fails."""


class OllamaClient:
    """HTTP client for the Ollama REST API.

    Args:
        base_url: Base URL of the running Ollama instance.
        model: Ollama model name (default: ``mistral``).
        timeout: Request timeout in seconds (default: 300).
    """

    def __init__(
        self,
        base_url: str = _DEFAULT_BASE_URL,
        model: str = _DEFAULT_MODEL,
        timeout: float = _DEFAULT_TIMEOUT,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.model = model
        self._client = httpx.Client(timeout=timeout)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def generate(self, prompt: str, system: str | None = None) -> str:
        """Send a generation request and return the response text.

        Args:
            prompt: User prompt text.
            system: Optional system instruction prepended to the prompt.

        Returns:
            The model's response as a plain string.

        Raises:
            LLMError: When the Ollama API returns an error.
        """
        payload: dict[str, Any] = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
        }
        if system:
            payload["system"] = system

        logger.debug("Sending prompt to Ollama (%s)", self.model)
        try:
            response = self._client.post(
                f"{self.base_url}/api/generate",
                json=payload,
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise LLMError(
                f"Ollama API returned HTTP {exc.response.status_code}: {exc.response.text}"
            ) from exc
        except httpx.RequestError as exc:
            raise LLMError(f"Cannot reach Ollama at {self.base_url}: {exc}") from exc

        data = response.json()
        return data.get("response", "")

    def generate_json(self, prompt: str, system: str | None = None) -> dict:
        """Generate a response and parse it as JSON.

        The model is instructed to reply with valid JSON only.  The method
        strips markdown code fences if the model wraps the output in them.

        Args:
            prompt: User prompt text.
            system: Optional system instruction.

        Returns:
            Parsed JSON object.

        Raises:
            LLMError: When the response cannot be parsed as JSON.
        """
        json_system = (system or "") + (
            "\n\nRéponds UNIQUEMENT avec un objet JSON valide, sans texte supplémentaire, "
            "sans balise markdown, sans explication."
        )
        raw = self.generate(prompt, system=json_system.strip())
        return self._parse_json(raw)

    def close(self) -> None:
        """Close the underlying HTTP client."""
        self._client.close()

    def __enter__(self) -> "OllamaClient":
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_json(text: str) -> dict:
        """Extract and parse JSON from a model response string."""
        text = text.strip()
        # Strip optional markdown code fences
        if text.startswith("```"):
            lines = text.splitlines()
            # Remove first line (```json or ```) and last line (```)
            inner = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
            text = inner.strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError as exc:
            raise LLMError(f"Model returned invalid JSON: {exc}\nRaw response:\n{text}") from exc
