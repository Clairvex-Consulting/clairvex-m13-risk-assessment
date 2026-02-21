"""Unit tests for OllamaClient."""

from __future__ import annotations

import json
from unittest.mock import MagicMock, patch

import pytest

from clairvex_m13.llm.client import LLMError, OllamaClient


def _mock_response(body: dict, status_code: int = 200) -> MagicMock:
    """Build a fake httpx.Response-like mock."""
    mock = MagicMock()
    mock.status_code = status_code
    mock.json.return_value = body
    mock.text = json.dumps(body)
    mock.raise_for_status.return_value = None
    return mock


class TestOllamaClientGenerate:
    def test_generate_returns_response_text(self):
        client = OllamaClient()
        expected = "Voici une réponse."
        with patch.object(client._client, "post", return_value=_mock_response({"response": expected})):
            result = client.generate("test prompt")
        assert result == expected

    def test_generate_passes_system_in_payload(self):
        client = OllamaClient()
        with patch.object(client._client, "post", return_value=_mock_response({"response": "ok"})) as mock_post:
            client.generate("prompt", system="sys instruction")
        call_kwargs = mock_post.call_args[1]
        assert call_kwargs["json"]["system"] == "sys instruction"

    def test_generate_raises_llm_error_on_http_error(self):
        import httpx

        client = OllamaClient()
        err_response = MagicMock()
        err_response.status_code = 500
        err_response.text = "Internal Server Error"
        http_err = httpx.HTTPStatusError("error", request=MagicMock(), response=err_response)

        mock_resp = _mock_response({})
        mock_resp.raise_for_status.side_effect = http_err

        with patch.object(client._client, "post", return_value=mock_resp):
            with pytest.raises(LLMError, match="HTTP 500"):
                client.generate("prompt")

    def test_generate_raises_llm_error_on_connection_error(self):
        import httpx

        client = OllamaClient()
        with patch.object(client._client, "post", side_effect=httpx.ConnectError("refused")):
            with pytest.raises(LLMError, match="Cannot reach Ollama"):
                client.generate("prompt")


class TestOllamaClientGenerateJson:
    def _make_client_returning(self, raw_text: str) -> OllamaClient:
        client = OllamaClient()
        with patch.object(client, "generate", return_value=raw_text):
            pass
        # Store for reuse in test methods via patch.object as context manager
        self._raw_text = raw_text
        self._client = client
        return client

    def _run_generate_json(self, client: OllamaClient, raw_text: str) -> dict:
        with patch.object(client, "generate", return_value=raw_text):
            return client.generate_json("prompt")

    def test_parses_plain_json(self):
        client = OllamaClient()
        payload = {"key": "value"}
        result = self._run_generate_json(client, json.dumps(payload))
        assert result == payload

    def test_strips_markdown_fences(self):
        client = OllamaClient()
        payload = {"key": "value"}
        raw = f"```json\n{json.dumps(payload)}\n```"
        result = self._run_generate_json(client, raw)
        assert result == payload

    def test_strips_plain_fences(self):
        client = OllamaClient()
        payload = {"a": 1}
        raw = f"```\n{json.dumps(payload)}\n```"
        result = self._run_generate_json(client, raw)
        assert result == payload

    def test_raises_on_invalid_json(self):
        client = OllamaClient()
        with patch.object(client, "generate", return_value="not json at all"):
            with pytest.raises(LLMError, match="invalid JSON"):
                client.generate_json("prompt")


class TestOllamaClientContextManager:
    def test_context_manager_closes_client(self):
        client = OllamaClient()
        with patch.object(client, "close") as mock_close:
            with client:
                pass
        mock_close.assert_called_once()
