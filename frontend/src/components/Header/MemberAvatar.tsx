import {Avatar, Group, Menu} from "@mantine/core";
import {Link} from "@tanstack/react-router";
import {MemberSummary} from "../../types/MemberSummary.tsx";
import {useTranslation} from "react-i18next";

const MemberAvatar = ({member}: { member: MemberSummary }) => {
    const {t} = useTranslation();

    return (
        <Group align="center">
            <Menu shadow="md" width={200}>
                <Menu.Target>
                    <Avatar
                        name={member.handle}
                        color="initials"
                        className="cursor-pointer"
                    />
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item component={Link} to={`members/${member.handle}`}>
                        {t("내 정보")}
                    </Menu.Item>
                    <Menu.Item color="" component={Link} to="members/settings">
                        {t("계정 연동")}
                    </Menu.Item>
                    <Menu.Item color="red" component={Link} to="/logout">
                        {t("로그아웃")}
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Group>
    )
}

export default MemberAvatar;