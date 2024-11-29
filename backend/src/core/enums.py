import enum


class ProblemType(enum.Enum):
    BOJ = "boj"
    CODEFORCES = "codeforces"


class ModeType(enum.Enum):
    LAND_GRAB_SOLO = "land_grab_solo"
    LAND_GRAB_MULT = "land_grab_mult"
