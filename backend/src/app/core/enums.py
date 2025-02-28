import enum


class Role(enum.Enum):
    ADMIN = "admin"
    MEMBER = "member"


class Platform(enum.Enum):
    BOJ = "boj"
    CODEFORCES = "codeforces"


class ModeType(enum.Enum):
    LAND_GRAB_SOLO = "land_grab_solo"
    LAND_GRAB_TEAM = "land_grab_team"
    PRACTICE_LINEAR = "practice_linear"


class PenaltyType(enum.Enum):
    ICPC = "icpc"


class ContestType(enum.Enum):
    CONTEST_BOJ_GENERAL = "contest_boj_general"
