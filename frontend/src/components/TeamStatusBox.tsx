import {useState} from 'react';
import HandleComponent from "./HandleComponent.tsx";
import {TeamInfo} from "../types/RoomDetail.tsx";

function TeamStatusBox({roomDetail, userColors}) {
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
                style={{fontSize: '0.8rem'}}
            >
                {showAll ? '▼' : '▲'}
            </button>

            <div className="pr-8">
                {teamsToShow.map((team: TeamInfo, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1 mt-1 ml-2">
                        <div
                            style={{backgroundColor: userColors[team.team_index][0]}}
                            className="w-4 h-4 rounded-sm"
                        />
                        <span className="font-light flex items-center">
        {team.users.map((player_info, idx) => (
            <span key={player_info.user.handle} className="inline-flex items-center space-x-1">
                {player_info.is_active && (
                    <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                )}
                <span
                    className={`${
                        team.users.length > 1 &&
                        player_info.indiv_solved_cnt > 0 &&
                        idx === 0
                            ? 'font-bold'
                            : ''
                    }`}
                >
                    <a
                        href={`https://www.acmicpc.net/status?user_id=${player_info.user.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline text-white"
                    >
                        <HandleComponent user={player_info.user} linkToProfile={false}/>
                    </a>
                </span>
                {team.users.length > 1 && `(${player_info.indiv_solved_cnt})`}
                {idx < team.users.length - 1 && ', '}
            </span>
        ))}&nbsp;:&nbsp;<span
                            className="font-bold">{team.adjacent_solved_count}</span> ({team.total_solved_count})</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TeamStatusBox;
