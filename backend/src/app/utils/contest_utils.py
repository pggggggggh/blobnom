import copy
import math


def elo_update(rating_a, rating_b, result_a, k=192):
    """
    ELO 레이팅 업데이트 함수
    :param rating_a: A 플레이어의 현재 레이팅
    :param rating_b: B 플레이어의 현재 레이팅
    :param result_a: A의 경기 결과 (1: 승리, 0: 패배, 0.5: 무승부)
    :param k: K-팩터 (기본값: 32)
    :return: (A의 새로운 레이팅, B의 새로운 레이팅)
    """
    e_a = 1 / (1 + 10 ** ((rating_b - rating_a) / 400))
    e_b = 1 / (1 + 10 ** ((rating_a - rating_b) / 400))
    result_b = 1 - result_a
    new_rating_a = rating_a + k * (result_a - e_a)
    new_rating_b = rating_b + k * (result_b - e_b)

    return round(new_rating_a), round(new_rating_b)


colors = {
    "gray": "\033[90m",
    "green": "\033[92m",
    "cyan": "\033[96m",
    "blue": "\033[94m",
    "purple": "\033[95m",
    "orange": "\033[38;5;214m",
    "red": "\033[91m",
    "reset": "\033[0m"
}


def codeforces_update(ratings, rank, k=1.8):
    """
    :param ratings:
    :param rank:
    :param k: 현 레이팅과 퍼포먼스와의 변화분을 1/k만큼 반영한다. 낮을수록 레이팅 변화폭이 크다.
    :return:
    """

    n = min(len(ratings), len(rank))
    seeds = []
    for i in range(n):
        seed = 1
        for j in range(n):
            if i == j:
                continue
            p = 1 / (1 + 10 ** ((ratings[i] - ratings[j]) / 400))  # possibility of loss
            seed += p
        seeds.append(seed)

    performance = []
    for i in range(n):
        m = math.sqrt(seeds[i] * rank[i])
        lo = 0
        hi = 5000
        while lo + 0.1 < hi:
            mid = (lo + hi) / 2
            cur_seed = 1
            for j in range(n):
                p = 1 / (1 + 10 ** ((mid - ratings[j]) / 400))
                cur_seed += p
            if cur_seed > m:
                lo = mid
            else:
                hi = mid
        performance.append(lo)
    unadjusted_new_ratings = copy.copy(ratings)
    delta = 0
    for i in range(n):
        unadjusted_new_ratings[i] = ratings[i] + (performance[i] - ratings[i]) / k
        delta += unadjusted_new_ratings[i] - ratings[i]
    adjusted_new_ratings = [round(unadjusted_new_ratings[i] - delta / n) for i in range(n)]
    new_delta = 0
    for i in range(n):
        new_delta += adjusted_new_ratings[i] - ratings[i]

    return {"performance": performance, "ratings": adjusted_new_ratings, "delta": new_delta}
