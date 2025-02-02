def elo_update(rating_a, rating_b, result_a, k=64):
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
