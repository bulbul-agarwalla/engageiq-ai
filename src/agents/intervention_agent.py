"""LLM-powered agent that suggests pedagogical interventions based on engagement data."""

from __future__ import annotations

import json
from typing import Any, Dict, List

from src.config.settings import settings
from src.reports.intervention_suggestions import InterventionItem


class InterventionAgent:
    """Recommends pedagogical interventions based on classroom engagement telemetry."""

    def __init__(self, groq_api_key: str | None = None) -> None:
        self.api_key = groq_api_key if groq_api_key is not None else settings.groq_api_key

    def suggest(self, session_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate targeted interventions for a session.

        Attempts LLM generation if groq_api_key is configured.
        Falls back to rule-based pedagogical heuristics otherwise.
        """
        if self.api_key and self.api_key.strip():
            try:
                suggestions = self._suggest_with_llm(session_data)
                if suggestions and len(suggestions) >= 3:
                    return suggestions
            except Exception:
                # Graceful degradation on LLM failure
                pass

        return self._suggest_with_rules(session_data)

    def _suggest_with_llm(self, session_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Call Groq LLM to generate recommendations."""
        from langchain_groq import ChatGroq

        llm = ChatGroq(
            model=settings.groq_model,
            groq_api_key=self.api_key,
            temperature=0.2,
        )

        prompt = (
            "You are an expert pedagogical assistant analyzing a lecture's student engagement data.\n"
            f"Session data: {json.dumps(session_data, default=str)}\n\n"
            "Provide 3 to 5 clear, concrete pedagogical interventions for the instructor.\n"
            "Return ONLY a valid JSON array of objects, with each object having:\n"
            '- "type": one of "pacing", "activity", "checkin", "break", "review"\n'
            '- "message": clear instruction for the teacher\n'
            '- "priority": "high", "medium", or "low"\n'
            '- "confidence": float between 0.5 and 1.0\n'
        )

        response = llm.invoke(prompt)
        content = response.content
        if isinstance(content, str):
            content = content.strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            raw_list = json.loads(content.strip())
            validated = [InterventionItem(**item).model_dump() for item in raw_list]
            return validated
        return []

    def _suggest_with_rules(self, session_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Pedagogical rule engine providing guaranteed suggestions."""
        class_avg = session_data.get("class_average", 0.0)
        distraction_moments = session_data.get("distraction_moments", [])
        state_distribution = {
            item.get("state", "").lower(): item.get("count", 0)
            for item in session_data.get("state_distribution", [])
        }
        total_logs = sum(state_distribution.values()) or 1

        suggestions: List[Dict[str, Any]] = []

        # 1. Critical class-wide average
        if class_avg < 50.0:
            suggestions.append(
                InterventionItem(
                    type="review",
                    message="Overall engagement dropped below 50%. Dedicate the next 10 minutes to reviewing core concepts and clarifying student doubts.",
                    priority="high",
                    confidence=0.95,
                ).model_dump()
            )
        elif class_avg < 70.0:
            suggestions.append(
                InterventionItem(
                    type="pacing",
                    message="Class average is moderate. Integrate more interactive checks for understanding such as quick think-pair-share exercises.",
                    priority="medium",
                    confidence=0.85,
                ).model_dump()
            )

        # 2. Distraction ratio
        distracted_count = state_distribution.get("distracted", 0)
        if (distracted_count / total_logs) > 0.25:
            suggestions.append(
                InterventionItem(
                    type="activity",
                    message="High student distraction detected. Conduct a 2-minute live poll or quiz to re-anchor student attention.",
                    priority="high",
                    confidence=0.90,
                ).model_dump()
            )

        # 3. Drowsiness / fatigue
        drowsy_count = state_distribution.get("drowsy", 0)
        if (drowsy_count / total_logs) > 0.15:
            suggestions.append(
                InterventionItem(
                    type="break",
                    message="Noticeable fatigue patterns observed. Allow a 3-minute screen/stretch break to refresh classroom energy.",
                    priority="high",
                    confidence=0.92,
                ).model_dump()
            )

        # 4. Specific timeline dips
        if distraction_moments:
            worst = distraction_moments[0]
            elapsed = worst.get("elapsed_minutes", 0)
            score = worst.get("engagement", 0.0)
            suggestions.append(
                InterventionItem(
                    type="checkin",
                    message=f"Significant engagement drop to {score}% occurred at minute {elapsed}. Check syllabus notes around that segment for difficult concepts.",
                    priority="medium",
                    confidence=0.88,
                ).model_dump()
            )

        # Ensure at least 3 suggestions
        default_pool = [
            InterventionItem(
                type="checkin",
                message="Pause for 60 seconds after introducing key slides to ask a cold-call check-in question.",
                priority="low",
                confidence=0.80,
            ).model_dump(),
            InterventionItem(
                type="pacing",
                message="Vary your vocal pitch and switch between whiteboard sketches and slides to maintain visual interest.",
                priority="low",
                confidence=0.75,
            ).model_dump(),
            InterventionItem(
                type="activity",
                message="Ask students to post their biggest takeaway in chat or shared notes before moving to the next module.",
                priority="low",
                confidence=0.78,
            ).model_dump(),
        ]

        for default_item in default_pool:
            if len(suggestions) >= 3:
                break
            if not any(s["message"] == default_item["message"] for s in suggestions):
                suggestions.append(default_item)

        return suggestions
