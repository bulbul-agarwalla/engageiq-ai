"""Seed rich interactive engagement logs for demo and UI verification."""

import os
import sys
from datetime import datetime, timedelta
import random

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.config.settings import EngagementState, UserRole, settings
from src.models import Course, EngagementLog, Session as SessionModel, User

def seed_rich_data():
    engine = create_engine(settings.database_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    # Ensure teacher
    teacher = db.query(User).filter_by(role=UserRole.TEACHER).first()
    if not teacher:
        teacher = User(name="Dr. Angela Smith", email="asmith@nst.edu", role=UserRole.TEACHER)
        db.add(teacher)
        db.commit()

    # Ensure demo teacher alias exists
    mock_teacher = db.query(User).filter_by(email="mock_teacher@engageiq.ai").first()
    if not mock_teacher:
        mock_teacher = User(name="Dr. Angela Smith", email="mock_teacher@engageiq.ai", role=UserRole.TEACHER)
        db.add(mock_teacher)
        db.commit()

    # Ensure students
    students = db.query(User).filter_by(role=UserRole.STUDENT).all()
    if len(students) < 5:
        for i in range(1, 6):
            st = User(name=f"Student {i}", email=f"student{i}@nst.edu", role=UserRole.STUDENT)
            db.add(st)
        db.commit()
        students = db.query(User).filter_by(role=UserRole.STUDENT).all()

    # Ensure demo student alias exists
    mock_student = db.query(User).filter_by(email="mock_student@engageiq.ai").first()
    if not mock_student:
        mock_student = User(name="Alex Rivera", email="mock_student@engageiq.ai", role=UserRole.STUDENT)
        db.add(mock_student)
        db.commit()

    # Ensure Course
    course = db.query(Course).filter_by(teacher_id=teacher.id).first()
    if not course:
        course = Course(name="Data Structures & Algorithms", code="CS201", teacher_id=teacher.id)
        db.add(course)
        db.commit()

    # Link course to mock_teacher as well
    course2 = db.query(Course).filter_by(teacher_id=mock_teacher.id).first()
    if not course2:
        course2 = Course(name="Machine Learning Systems", code="CS405", teacher_id=mock_teacher.id)
        db.add(course2)
        db.commit()

    # Create 3 recent sessions
    now = datetime.now()
    sessions = []
    for days_ago in [5, 3, 1]:
        start = (now - timedelta(days=days_ago)).replace(hour=10, minute=0, second=0, microsecond=0)
        end = start + timedelta(minutes=45)
        sess = SessionModel(course_id=course.id, start_time=start, end_time=end, status="completed")
        db.add(sess)
        sess2 = SessionModel(course_id=course2.id, start_time=start, end_time=end, status="completed")
        db.add(sess2)
        sessions.extend([sess, sess2])
    db.commit()

    all_students = students + [mock_student]

    # Generate timeline points across 40 minutes for each session
    print("Generating timeline engagement logs...")
    log_count = 0
    for sess in sessions:
        sess_start = sess.start_time
        for minute in range(0, 40):
            ts = sess_start + timedelta(minutes=minute)
            
            # Simulate a class-wide attention dip around minute 22-26
            is_dip_period = 20 <= minute <= 26

            for student in all_students:
                if is_dip_period:
                    score = random.uniform(20.0, 45.0)
                    state = random.choice([EngagementState.DISTRACTED, EngagementState.DROWSY, EngagementState.CONFUSED])
                else:
                    # Regular student engagement
                    if student.email == "student1@nst.edu":
                        # Student 1 is struggling (at-risk)
                        score = random.uniform(25.0, 48.0)
                        state = EngagementState.DISTRACTED
                    else:
                        score = random.uniform(65.0, 95.0)
                        state = EngagementState.ENGAGED if score > 75 else EngagementState.PASSIVE

                log = EngagementLog(
                    session_id=sess.id,
                    user_id=student.id,
                    timestamp=ts,
                    score=round(score, 1),
                    state=state,
                    gaze="forward" if score > 60 else "away",
                    drowsiness=0.1 if score > 50 else 0.8,
                    expression="engaged" if score > 70 else "bored",
                )
                db.add(log)
                log_count += 1

    db.commit()
    print(f"Successfully generated {log_count} engagement logs across {len(sessions)} lecture sessions!")
    db.close()

if __name__ == "__main__":
    seed_rich_data()
