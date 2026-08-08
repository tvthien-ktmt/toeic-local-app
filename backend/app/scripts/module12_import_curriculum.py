"""
MODULE 12.1.3 — Import curriculum_seed.json into curriculum_topics table.
Run from backend/ directory: python app/scripts/module12_import_curriculum.py
"""
import sys, io, os, json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db import SessionLocal, engine, Base
from app.models import CurriculumTopic, Lesson, UserMastery

def main():
    # Create new tables (curriculum_topics, lessons, user_mastery) if they don't exist
    print("Creating Module 12 tables if not exist...")
    Base.metadata.create_all(bind=engine)
    print("  ✅ Tables created: curriculum_topics, lessons, user_mastery")

    # Load seed file
    seed_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "curriculum_seed.json")
    seed_path = os.path.abspath(seed_path)

    if not os.path.exists(seed_path):
        print(f"  ❌ curriculum_seed.json not found at: {seed_path}")
        print("  Run module12_parse_knowledge.py first!")
        return

    with open(seed_path, 'r', encoding='utf-8') as f:
        seed_data = json.load(f)

    print(f"\nLoaded {len(seed_data)} canonical topics from {seed_path}")

    db = SessionLocal()
    try:
        # First pass: create all topics (without prerequisite links)
        id_map = {}  # seed_id -> db_id (they may differ if re-importing)
        existing_count = 0
        created_count = 0

        for entry in seed_data:
            existing = db.query(CurriculumTopic).filter(
                CurriculumTopic.canonical_name == entry["canonical_name"]
            ).first()

            if existing:
                existing_count += 1
                id_map[entry["id"]] = existing.id
                continue

            topic = CurriculumTopic(
                canonical_name=entry["canonical_name"],
                category=entry["category"],
                level=entry["level"],
                parts_json=json.dumps(entry["parts"]),
                prerequisite_topic_id=None,  # Set in second pass
                source_files_json=json.dumps(entry["source_files"]),
                source_count=entry["source_count"],
                agreement_note=entry["agreement_note"],
                mapped_grammar_topics_db_json=json.dumps(entry["mapped_grammar_topics_db"]),
                question_count=entry["question_count_in_db"],
                has_specific_db_topic=entry["has_specific_db_topic"],
                db_coverage_note=entry["db_coverage_note"],
            )
            db.add(topic)
            db.flush()  # Get the auto-generated id
            id_map[entry["id"]] = topic.id
            created_count += 1

        db.commit()
        print(f"\nFirst pass: {created_count} created, {existing_count} already existed")

        # Second pass: set prerequisite_topic_id links
        updated_prereq = 0
        for entry in seed_data:
            if entry.get("prerequisite_topic_id"):
                prereq_seed_id = entry["prerequisite_topic_id"]
                topic_db_id = id_map.get(entry["id"])
                prereq_db_id = id_map.get(prereq_seed_id)

                if topic_db_id and prereq_db_id:
                    topic = db.query(CurriculumTopic).filter(CurriculumTopic.id == topic_db_id).first()
                    if topic and topic.prerequisite_topic_id != prereq_db_id:
                        topic.prerequisite_topic_id = prereq_db_id
                        updated_prereq += 1

        db.commit()
        print(f"Second pass: {updated_prereq} prerequisite links set")

        # Initialize UserMastery records for all topics (status=unknown)
        mastery_created = 0
        for entry in seed_data:
            topic_db_id = id_map.get(entry["id"])
            if not topic_db_id:
                continue
            existing_mastery = db.query(UserMastery).filter(
                UserMastery.curriculum_topic_id == topic_db_id
            ).first()
            if not existing_mastery:
                mastery = UserMastery(
                    curriculum_topic_id=topic_db_id,
                    status="unknown",
                    correct_count=0,
                    total_count=0,
                    mastery_pct=0.0,
                )
                db.add(mastery)
                mastery_created += 1

        db.commit()
        print(f"UserMastery init: {mastery_created} records created (status=unknown)")

        # Verification
        total_topics = db.query(CurriculumTopic).count()
        total_mastery = db.query(UserMastery).count()
        print(f"\n=== IMPORT COMPLETE ===")
        print(f"curriculum_topics: {total_topics} rows")
        print(f"user_mastery: {total_mastery} rows")

        # Print breakdown
        from sqlalchemy import func
        for cat in ["grammar_topic", "question_type", "vocab_topic"]:
            cnt = db.query(CurriculumTopic).filter(CurriculumTopic.category == cat).count()
            print(f"  {cat}: {cnt}")

        print("\n=== DoD 12.1.3 Check ===")
        topics_with_prereq = db.query(CurriculumTopic).filter(
            CurriculumTopic.prerequisite_topic_id != None
        ).count()
        print(f"Topics with prerequisite link: {topics_with_prereq}")

        # List first 5 with prerequisite to verify
        for t in db.query(CurriculumTopic).filter(CurriculumTopic.prerequisite_topic_id != None).limit(5).all():
            prereq = db.query(CurriculumTopic).filter(CurriculumTopic.id == t.prerequisite_topic_id).first()
            print(f"  '{t.canonical_name[:40]}' → prereq: '{prereq.canonical_name[:40] if prereq else None}'")

    finally:
        db.close()

if __name__ == "__main__":
    main()
