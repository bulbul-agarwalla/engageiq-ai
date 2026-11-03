"""Map engagement dips to lecture segments to identify difficult topics."""

from __future__ import annotations

from typing import Any, Dict, List, Tuple


class DifficultyCorrelator:
    """Maps engagement dips to lecture timestamps to flag difficult segments."""

    def correlate(
        self, engagement_timeline: List[Tuple[float, float]], threshold: float = 40.0
    ) -> List[Dict[str, Any]]:
        """Find lecture segments where engagement dropped below threshold.

        Args:
            engagement_timeline: List of (timestamp_seconds, score) tuples.
            threshold: Engagement score below which a segment is flagged.

        Returns:
            List of dicts with keys: start, end, mean_score, drop_pct, point_count.
        """
        if not engagement_timeline:
            return []

        # Ensure timeline is sorted chronologically
        timeline = sorted(engagement_timeline, key=lambda p: p[0])

        flagged_segments: List[Dict[str, Any]] = []
        current_segment_points: List[Tuple[float, float]] = []

        for ts, score in timeline:
            if score < threshold:
                current_segment_points.append((ts, score))
            else:
                if current_segment_points:
                    flagged_segments.append(
                        self._build_segment_dict(current_segment_points, threshold)
                    )
                    current_segment_points = []

        if current_segment_points:
            flagged_segments.append(self._build_segment_dict(current_segment_points, threshold))

        return flagged_segments

    @staticmethod
    def _build_segment_dict(points: List[Tuple[float, float]], threshold: float) -> Dict[str, Any]:
        """Summarize points in a dip segment."""
        scores = [p[1] for p in points]
        mean_score = round(sum(scores) / len(scores), 2)
        drop_pct = (
            round(((threshold - mean_score) / threshold) * 100.0, 2) if threshold > 0 else 0.0
        )
        return {
            "start": points[0][0],
            "end": points[-1][0],
            "mean_score": mean_score,
            "drop_pct": drop_pct,
            "point_count": len(points),
        }
