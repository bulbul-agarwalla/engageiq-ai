"""Trend analysis and anomaly detection on engagement time-series."""

from __future__ import annotations

import math
from typing import List


class TrendAnalyzer:
    """Detects trends and anomalies in engagement time-series data."""

    def compute_trend(self, scores: List[float]) -> float:
        """Compute trend slope for a list of engagement scores.

        Args:
            scores: Ordered list of engagement scores.

        Returns:
            Slope of the linear trend (positive = improving, negative = declining).
        """
        n = len(scores)
        if n < 2:
            return 0.0

        x = list(range(n))
        x_mean = sum(x) / n
        y_mean = sum(scores) / n

        numerator = sum((x[i] - x_mean) * (scores[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))

        if denominator == 0:
            return 0.0

        return round(numerator / denominator, 4)

    def detect_anomalies(self, scores: List[float], z_threshold: float = 2.0) -> List[int]:
        """Detect anomalous scores using Z-score thresholding.

        Args:
            scores: Ordered list of engagement scores.
            z_threshold: Z-score above which a point is flagged as anomalous.

        Returns:
            List of indices where anomalies were detected.
        """
        n = len(scores)
        if n < 3:
            return []

        mean = sum(scores) / n
        variance = sum((s - mean) ** 2 for s in scores) / n
        std_dev = math.sqrt(variance)

        if std_dev == 0.0:
            return []

        anomalies = []
        for i, score in enumerate(scores):
            z_score = abs(score - mean) / std_dev
            if z_score >= z_threshold:
                anomalies.append(i)

        return anomalies
