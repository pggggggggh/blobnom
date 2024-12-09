import enum


class ProblemType(enum.Enum):
    BOJ = "boj"
    CODEFORCES = "codeforces"


class ModeType(enum.Enum):
    LAND_GRAB_SOLO = "land_grab_solo"
    LAND_GRAB_TEAM = "land_grab_team"
    LAND_GRAB_SINGLE = "land_grab_single"
