import random

from src.app.utils.contest_utils import codeforces_update, elo_update

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


def generate_biased_rankings(num_contests, n):
    rank_data = []
    for _ in range(num_contests):
        ranks = list(range(1, n + 1))
        biased_ranks = []
        weights = [1 / n for _ in range(n)]

        for i in range(n):
            if i < 3:  # 앞쪽 3명은 반드시 1~3등
                possible_ranks = ranks[:3]
                possible_weights = weights[:3]
            elif i < 6:
                possible_ranks = ranks[:6]
                possible_weights = weights[:6]
            else:
                possible_ranks = ranks
                possible_weights = weights

            chosen = random.choices(possible_ranks, weights=possible_weights, k=1)[0]
            biased_ranks.append(chosen)
            idx = ranks.index(chosen)
            del ranks[idx]
            del weights[idx]

        rank_data.append(biased_ranks)

    return rank_data


def get_color_text(ratings):
    res = ""
    for rating in ratings:
        if rating < 1200:
            color = colors["gray"]
        elif rating < 1400:
            color = colors["green"]
        elif rating < 1600:
            color = colors["cyan"]
        elif rating < 1900:
            color = colors["blue"]
        elif rating < 2100:
            color = colors["purple"]
        elif rating < 2400:
            color = colors["orange"]
        else:
            color = colors["red"]
        res += f"{color}{rating}{colors['reset']} "
    return res


def test_elo_rating():
    rank_data = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [2, 5, 1, 3, 7, 6, 8, 4, 9],
        [1, 3, 2, 4, 5, 6, 9, 7, 8],
        [2, 3, 4, 1, 3, 6, 7, 9, 8],
        [3, 4, 2, 1, 6, 7, 5, 8, 9],
        [5, 2, 1, 4, 4, 6, 7, 8, 9],
        [1, 3, 5, 2, 4, 6, 9, 7, 8],
        [5, 1, 2, 3, 4, 6, 9, 7, 8],
        [1, 3, 2],
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 3, 2, 5, 4, 6, 9, 7, 8],
    ]
    ratings = [1400 for i in range(len(rank_data[0]))]
    new_rating = ratings
    print()

    for rank in rank_data:
        n = len(rank)
        for i in range(n):
            orig_rating = ratings[i]
            for j in range(n):
                if i == j:
                    continue
                result = 0
                if rank[i] < rank[j]:
                    result = 1
                elif rank[i] > rank[j]:
                    result = 0
                else:
                    result = 0.5
                a_new_rating, b_new_rating = elo_update(orig_rating, ratings[j], result, k=320 / math.sqrt(n))
                new_rating[i] += a_new_rating - orig_rating
        ratings = new_rating
        print(rank)
        print(get_color_text(ratings))
        print()

    assert new_rating[0] > 2100


def test_codeforces_rating():
    num_contests = 50
    n = 8

    rank_data = generate_biased_rankings(num_contests, n)
    ratings = [1400 for i in range(len(rank_data[0]))]

    print()
    for idx, rank in enumerate(rank_data):
        print("game", idx + 1)
        res = codeforces_update(ratings, rank, 1.5)
        for i in range(len(res["ratings"])):
            ratings[i] = res["ratings"][i]
        print("rank:      :", end='')
        for r in rank:
            print(f"   {r}", end=' ')
        print()
        # print("performance:", get_color_text([round(p) for p in res["performance"]]))
        print("rating:     ", get_color_text(ratings))
        print()

    assert ratings[0] > 2100
