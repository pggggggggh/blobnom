import os

from sqlalchemy.orm import Session

from src.app.core.enums import Platform, Role
from src.app.db.models.models import Member, User
from src.app.db.session import get_db
from src.app.utils.security_utils import hash_password


def create_member_script():
    db: Session = next(get_db())
    member = Member(
        handle="blobnom",
        email="blobnom@blobnom.xyz",
        password=hash_password(os.environ.get("DEFAULT_PWD")),
        role=Role.ADMIN
    )
    db.add(member)
    db.flush()
    user = User(
        handle=member.handle,
        platform=Platform.BOJ
    )
    user2 = User(
        handle=member.handle,
        platform=Platform.CODEFORCES
    )
    user.member = member
    user2.member = member
    db.add(user)
    db.add(user2)
    db.flush()
    db.commit()
    print("fin")


if __name__ == "__main__":
    create_member_script()
