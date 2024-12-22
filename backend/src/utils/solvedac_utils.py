async def fetch_problems(query, client):
    problem_ids = []
    for _ in range(4):
        response = await client.get("https://solved.ac/api/v3/search/problem",
                                    params={"query": query, "sort": "random", "page": 1})
        tmp = response.json()["items"]
        for item in tmp:
            if item["problemId"] not in problem_ids:
                problem_ids.append(item["problemId"])
    return problem_ids


async def get_solved_problem_list(problem_ids, username, db, client):
    paged_problem_ids = [problem_ids[i:i + 25] for i in range(0, len(problem_ids), 25)]

    solved_problem_list = []

    for problem_ids in paged_problem_ids:
        query = "("
        for problem_id in problem_ids:
            if len(query) > 1:
                query += "|"
            query += "id:" + str(problem_id)
        query += ") & @" + username
        response = await client.get("https://solved.ac/api/v3/search/problem",
                                    params={"query": query})
        items = response.json()["items"]
        for item in items:
            solved_problem_list.append(item["problemId"])

    return solved_problem_list
