import dayjs from "dayjs";
import {Badge} from "@mantine/core";
import {useTranslation} from "react-i18next";

const RoomStatusBadge = ({startsAt, endsAt, now}: { startsAt: string, endsAt: string, now: Date }) => {
    const {t} = useTranslation();

    if (dayjs(startsAt).isBefore(now)) {
        return dayjs(endsAt).isBefore(now) ? (
            <Badge variant="gradient" gradient={{from: 'indigo', to: 'blue', deg: 90}} className="font-medium">
                {t("ended", {t: dayjs(endsAt).to(now, true)})}
            </Badge>
        ) : (
            <Badge variant="gradient" gradient={{from: 'green', to: 'teal', deg: 90}} className="font-medium">
                {t("ends", {t: dayjs(endsAt).to(now, true)})}
            </Badge>
        );
    } else {
        return (
            <Badge variant="gradient" gradient={{from: 'red', to: 'pink', deg: 90}} className="font-medium">
                {dayjs(startsAt).to(now, true)} 후 시작
            </Badge>
        );
    }
};


export default RoomStatusBadge;