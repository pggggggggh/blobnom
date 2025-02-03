import httpx


async def search_problems(query):
    async with httpx.AsyncClient() as client:
        response = await client.get("https://solved.ac/api/v3/search/problem",
                                    params={"query": query})
        return response.json()["items"]


async def fetch_user_info(handle):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://solved.ac/api/v3/user/show?handle={handle}")
        if response.status_code == 404:
            return None
        return response.json()


async def fetch_problems(query):
    async with httpx.AsyncClient() as client:
        problem_ids = []
        problems = []
        for _ in range(3):
            response = await client.get("https://solved.ac/api/v3/search/problem",
                                        params={"query": query, "sort": "random", "page": 1})
            tmp = response.json()["items"]
            for item in tmp:
                if item["problemId"] not in problem_ids:
                    problems.append({"id": item["problemId"], "difficulty": item["level"]})
                    problem_ids.append(item["problemId"])
        return problems


async def get_solved_problem_list(problem_ids, username):
    async with httpx.AsyncClient() as client:
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
