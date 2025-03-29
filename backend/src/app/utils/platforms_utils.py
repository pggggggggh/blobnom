import random
from datetime import datetime
from typing import List, Literal

import httpx
import pytz
from fastapi import HTTPException
from sqlalchemy.orm import Session

from src.app.core.enums import Platform
from src.app.db.models.models import SolvedacToken


async def search_problems(query):
    async with httpx.AsyncClient() as client:
        response = await client.get("https://solved.ac/api/v3/search/problem",
                                    params={"query": query})
        return response.json()["items"]


async def token_validate(handle, platform: Platform, db: Session):
    async with httpx.AsyncClient() as client:
        if platform == Platform.BOJ:
            response = await client.get(f"https://solved.ac/api/v3/user/show?handle={handle}")
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="User not found")
            user_info = response.json()
            if user_info is None:
                raise HTTPException(status_code=404, detail="User not found")
            bio = user_info["bio"]
            solvedac_token = db.query(SolvedacToken).filter(SolvedacToken.token == bio).first()
            if solvedac_token is None or solvedac_token.expires_at < datetime.now(pytz.utc) or solvedac_token.is_used:
                raise HTTPException(status_code=400, detail="Token validation failed")
            solvedac_token.is_used = True
            db.add(solvedac_token)
            db.commit()
            return True
        elif platform == Platform.CODEFORCES:
            response = await client.get(f"https://codeforces.com/api/user.info?handles={handle}")
            print(response)
            data = response.json()
            if data["status"] == "FAILED":
                raise HTTPException(status_code=404, detail="User not found")
            user_info = data["result"][0]
            candi = []
            candi.append(user_info.get("firstName", ""))
            candi.append(user_info.get("lastName", ""))
            for s in candi:
                solvedac_token = db.query(SolvedacToken).filter(SolvedacToken.token == s).first()
                if solvedac_token is None or solvedac_token.expires_at < datetime.now(
                        pytz.utc) or solvedac_token.is_used:
                    continue
                return True
            raise HTTPException(status_code=400, detail="Token validation failed")
        else:
            raise HTTPException(status_code=404, detail="Unknown platform")


async def fetch_problems(query, num_problems, platform):
    async with httpx.AsyncClient(timeout=20) as client:
        problem_ids = set()
        problems = []

        if platform == Platform.BOJ:
            if query.startswith(
                    "problemset:"):  # problemset:1001,1002,1003 .., ignores already-solved problems by players
                query2 = query.split()[0]
                problemIds = query[len("problemset:"):].split(",")
                for problemId in problemIds:
                    response = await client.get("https://solved.ac/api/v3/problem/lookup",
                                                params={"problemIds": [problemId]})
                    item = response.json()[0]
                    if item["problemId"] not in problem_ids:
                        problems.append({"id": item["problemId"], "difficulty": item["level"]})
                        problem_ids.add(item["problemId"])
                    if len(problems) >= num_problems:
                        break
            else:
                for _ in range(5):
                    response = await client.get("https://solved.ac/api/v3/search/problem",
                                                params={"query": query, "sort": "random", "page": 1})
                    items = response.json()["items"]
                    for item in items:
                        if item["problemId"] not in problem_ids:
                            problems.append({"id": item["problemId"], "difficulty": item["level"]})
                            problem_ids.add(item["problemId"])
                        if len(problems) >= num_problems:
                            break
                    if len(problems) >= num_problems:
                        break
        else:
            diff_s = None
            diff_e = None
            cid_s = None
            cid_e = None
            ctypes = [List[Literal['div1', 'div2', 'global', 'div3', 'div4', 'edu', 'etc']]]
            cid_only_odd = False
            pids = set()
            forbidden_handles = []
            try:
                for splitted_query in query.split():
                    if splitted_query.startswith("difficulty:"):
                        q = splitted_query[len("difficulty:"):]
                        pos = q.index("-")
                        diff_s = int(q[:pos])
                        diff_e = int(q[pos + 1:])
                    elif splitted_query.startswith("contestid:"):
                        q = splitted_query[len("contestid:"):]
                        if q.endswith("&odd"):
                            cid_only_odd = True
                            q = q[:-len("&odd")]
                        pos = q.index("-")
                        cid_s = int(q[:pos])
                        cid_e = int(q[pos + 1:])
                    elif splitted_query.startswith("!@:"):
                        handle = splitted_query[len("!@:"):]
                        forbidden_handles.append(handle)
                    elif splitted_query.startswith("contesttype:"):
                        ctypes = splitted_query[len("contesttype:"):].split('|')
                    elif splitted_query.startswith("problemid:"):
                        pids = set(splitted_query[len("problemid:"):].split('|'))
            except (ValueError, TypeError):
                raise Exception(
                    "Invalid query, codeforces query must be like: 'difficulty:(integer)-(integer) contestid:(integer)-(integer){&odd}' contesttype:div1|div2 problemid:A|B|C")

            response = await client.get("https://codeforces.com/api/contest.list?gym=false")
            tmp = response.json()["result"]
            contest_name = {x["id"]: x["name"] for x in tmp}

            response = await client.get("https://codeforces.com/api/problemset.problems")
            all_problems = response.json()["result"]["problems"]
            random.shuffle(all_problems)

            forbidden_problems = set()
            for handle in forbidden_handles:
                response = await client.get(f"https://codeforces.com/api/user.status?handle={handle}")
                results = response.json()["result"]
                for result in results:
                    problem = result["problem"]
                    forbidden_problems.add(str(problem["contestId"] + problem["index"]))

            for problem in all_problems:
                if "rating" not in problem:
                    continue
                if diff_s and diff_e:
                    if int(problem["rating"]) < diff_s or int(problem["rating"]) > diff_e:
                        continue
                if cid_s and cid_e:
                    if int(problem["contestId"]) < cid_s or int(problem["contestId"]) > cid_e:
                        continue
                if cid_only_odd and int(problem["contestId"]) % 2 == 0:
                    continue
                if problem["index"][0] not in pids:
                    continue

                chk = False
                name = contest_name[problem["contestId"]].lower()

                for x in ctypes:
                    if x == 'div1' and "div. 1" in name:
                        chk = True
                    elif x == 'div2' and "div. 2" in name:
                        chk = True
                    elif x == 'div3' and "div. 3" in name:
                        chk = True
                    elif x == 'div4' and "div. 4" in name:
                        chk = True
                    elif x == 'edu' and "educational" in name:
                        chk = True
                    elif x == 'global' and ("div. 1 + div. 2" in name or "global" in name):
                        chk = True
                    elif x == 'etc':
                        if all(kw not in name for kw in
                               ["div. 1", "div. 2", "div. 3", "div. 4", "educational", "global", "div. 1 + div. 2"]):
                            chk = True
                    if chk:
                        break

                if not chk:
                    continue

                problem_id = str(problem["contestId"]) + problem["index"]

                if problem_id not in forbidden_problems:
                    problems.append({"id": problem_id, "difficulty": problem["rating"]})

                if len(problems) >= num_problems:
                    break

        return problems


async def get_solved_problem_list(problem_ids, handle, platform):
    async with httpx.AsyncClient() as client:
        solved_problems = set()

        if platform == Platform.BOJ:
            paged_problem_ids = [problem_ids[i:i + 25] for i in range(0, len(problem_ids), 25)]

            for problem_ids in paged_problem_ids:
                query = "("
                for problem_id in problem_ids:
                    if len(query) > 1:
                        query += "|"
                    query += "id:" + str(problem_id)
                query += ") & @" + handle
                response = await client.get("https://solved.ac/api/v3/search/problem",
                                            params={"query": query})
                items = response.json()["items"]
                for item in items:
                    solved_problems.add(str(item["problemId"]))
        else:
            response = await client.get(f"https://codeforces.com/api/user.status?handle={handle}")
            results = response.json()["result"]
            for result in results:
                problem = result["problem"]
                pid = str(problem["contestId"]) + problem["index"]
                if pid in problem_ids:
                    solved_problems.add(pid)

        return list(solved_problems)
