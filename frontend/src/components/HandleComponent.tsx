import {Tooltip} from '@mantine/core';
import {Link} from "@tanstack/react-router";
import {getRatingColor} from "../utils/MiscUtils.tsx";
import {MemberSummary} from "../types/MemberSummary.tsx";

const HandleComponent = ({member, linkToProfile = true}: { member: MemberSummary, linkToProfile?: boolean }) => {
    return (
        <>
            {member.role ? (
                linkToProfile ?
                    <Link to={`/members/${member.handle}`}>
                        <span className={`tracking-tighter font-bold ${getRatingColor(member.rating)}`}>
                            {member.handle}
                        </span>
                    </Link> :
                    <span className={`tracking-tighter font-bold ${getRatingColor(member.rating)}`}>
                        {member.handle}
                    </span>
            ) : (
                <span className="inline-flex items-center">
                    <Tooltip label="가입되지 않은 회원입니다." withArrow>
                        <span className="flex items-center line-height-1">
                            ⚠️
                        </span>
                    </Tooltip>
                    <span className="tracking-wide text-slate-400 font-light">{member.handle}</span>
                </span>
            )}
        </>
    );
};

export default HandleComponent;
