import {Tooltip} from '@mantine/core';

const HandleComponent = ({user}) => {
    return (
        <>
            {user.role ? (
                <span className="tracking-wide font-light">{user.handle}</span>
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
