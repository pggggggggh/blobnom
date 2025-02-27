import {Avatar, Group, Menu} from "@mantine/core";
import {Link} from "@tanstack/react-router";
import {MemberSummary} from "../../types/MemberSummary.tsx";

const MemberAvatar = ({member}: { member: MemberSummary }) => {
    return (
        <Group align="center">
            <Menu shadow="md" width={200}>
                <Menu.Target>
                    <Avatar
                        name={member.handle}
                        color="initials"
                        alt="유저 프로필"
                        className="cursor-pointer"
                    />
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item component={Link} to={`members/${member.handle}`}>
                        내 정보
                    </Menu.Item>
                    <Menu.Item color="" component={Link} to="members/settings">
                        계정 연동
                    </Menu.Item>
                    <Menu.Item color="red" component={Link} to="/logout">
                        로그아웃
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Group>
    )
}

export default MemberAvatar;