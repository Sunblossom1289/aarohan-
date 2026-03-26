#!/usr/bin/env python3
"""Reset all student counseling and test credits to 0.

Usage:
  python reset_student_credits.py --yes

This script is intentionally standalone and does not read environment variables
or any repo configuration files.
"""

import argparse
import sys
from urllib.parse import urlparse

from pymongo import MongoClient

MONGODB_URI = "mongodb+srv://gayushman4004an_db_user:r4tHt4@aarohan.nz64ssr.mongodb.net/aarohan?retryWrites=true&w=majority"
DB_NAME = "aarohan"

def derive_db_name(uri: str) -> str:
    parsed = urlparse(uri)
    path = (parsed.path or "").strip("/")
    if path:
        return path
    return "aarohan"


def get_connection_settings() -> tuple[str, str]:
    mongo_uri = MONGODB_URI
    db_name = DB_NAME or derive_db_name(mongo_uri)
    return mongo_uri, db_name


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Set every student's counselingCredits and testCredits to 0."
    )
    parser.add_argument(
        "--yes",
        action="store_true",
        help="Skip interactive confirmation.",
    )
    args = parser.parse_args()

    try:
        mongo_uri, db_name = get_connection_settings()
    except ValueError as exc:
        print(f"Error: {exc}")
        return 1

    client = None
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=10000)
        db = client[db_name]
        students = db["students"]

        non_zero_count = students.count_documents(
            {
                "$or": [
                    {"counselingCredits": {"$ne": 0}},
                    {"testCredits": {"$ne": 0}},
                ]
            }
        )

        total_count = students.count_documents({})

        print(f"Database: {db_name}")
        print(f"Students found: {total_count}")
        print(f"Students with non-zero credits: {non_zero_count}")

        if not args.yes:
            confirm = input(
                "Type YES to continue and reset all student counseling/test credits to 0: "
            ).strip()
            if confirm != "YES":
                print("Aborted. No changes were made.")
                return 0

        result = students.update_many(
            {},
            {
                "$set": {
                    "counselingCredits": 0,
                    "testCredits": 0,
                }
            },
        )

        print("\nReset complete.")
        print(f"Matched students: {result.matched_count}")
        print(f"Modified students: {result.modified_count}")
        return 0
    except Exception as exc:
        print(f"Error: {exc}")
        return 1
    finally:
        if client is not None:
            client.close()


if __name__ == "__main__":
    sys.exit(main())
