import {Tooltip} from '@mantine/core';
import {Link} from "@tanstack/react-router";
import {getRatingColor} from "../utils/MemberUtils.tsx";

const HandleComponent = ({user}) => {

    return (
        <>
            {user.role ? (
                <Link to={`/members/${user.handle}`}>
                <span className={`tracking-tighter font-bold ${getRatingColor(user.rating)}`}>
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
