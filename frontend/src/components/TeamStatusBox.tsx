import { useState } from 'react';

function TeamStatusBox({ roomDetail, userColors }) {
    const [showAll, setShowAll] = useState(true);

    const toggleView = () => {
        setShowAll(prev => !prev);
    };

    const teamsToShow = showAll
        ? roomDetail.team_info
        : roomDetail.team_info.slice(0, 1);

    return (
        <div
            className="p-2 fixed bottom-4 right-4 bg-zinc-900 opacity-75 text-white shadow-lg rounded-sm max-h-100 overflow-y-auto z-0">
            <button
                onClick={toggleView}
                className="absolute bottom-2 right-2 p-1 bg-transparent border-none rounded focus:outline-none"
                aria-label="Toggle view mode"
                style={{ fontSize: '0.8rem' }}
            >
                {showAll ? '▼' : '▲'}
            </button>

            <div className="pr-8">
                {teamsToShow.map((team, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1 mt-1 ml-2">
                        <div
                            style={{ backgroundColor: userColors[team.team_index][0] }}
                            className="w-4 h-4 rounded-sm"
                        ></div>
                        <span className="font-light">
                            {team.users.map((user, idx) => (
                                <span key={user.name}>
                                    <span
                                        className={
                                            team.users.length > 1 &&
                                            user.indiv_solved_cnt > 0 &&
                                            idx === 0
                                                ? 'font-bold'
                                                : ''
                                        }
                                    >
                                      <a
                                          href={`https://www.acmicpc.net/status?user_id=${user.name}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="no-underline text-white"
                                      >
                                        {user.name}
                                      </a>
                                    </span>
                                    {team.users.length > 1 && `(${user.indiv_solved_cnt})`}
                                    {idx < team.users.length - 1 && ', '}
                                </span>
                            ))}
                            &nbsp;: <span className="font-bold">{team.adjacent_solved_count}</span> ({team.total_solved_count})
                        </span>
                </div>
                ))}
            </div>
        </div>
    );
}

export default TeamStatusBox;
