import {Tooltip} from '@mantine/core';
import {Link} from "@tanstack/react-router";

const HandleComponent = ({user}) => {
    const getRankColor = (rating) => {
        if (rating >= 3000) return "bg-gradient-to-r from-red-700 via-orange-600 to-yellow-400 bg-clip-text text-transparent  drop-shadow-lg";
        if (rating >= 2600) return "text-red-600";
        if (rating >= 2400) return "text-red-600";
        if (rating >= 2100) return "text-orange-500";
        if (rating >= 1900) return "text-purple-500";
        if (rating >= 1600) return "text-blue-500";
        if (rating >= 1400) return "text-cyan-400";
        if (rating >= 1200) return "text-green-500";
        return "text-gray-400";
    };
    return (
        <>
            {user.role ? (
                <Link to={`/members/${user.handle}`}>
                <span className={`tracking-tighter font-bold ${getRankColor(user.rating)}`}>
                    {user.handle}
                </span>
                </Link>
            ) : (
                <span className="inline-flex items-center">
                    <Tooltip label="가입되지 않은 회원입니다." withArrow>
                        <span className="flex items-center line-height-1">
                            ⚠️
                        </span>
                    </Tooltip>
                    <span className="tracking-wide text-slate-400 font-light">{user.handle}</span>
                </span>
            )}
        </>
    );
};

export default HandleComponent;
