const RoomStatusBadge = ({startsAt, endsAt, now}: { startsAt: string, endsAt: string, now: Date }) => {
    if (dayjs(startsAt).isBefore(now)) {
        return dayjs(endsAt).isBefore(now) ? (
            <Badge variant="gradient" gradient={{from: 'indigo', to: 'blue', deg: 90}} className="font-medium">
                {dayjs(endsAt).to(now, true)} 전 종료
            </Badge>
        ) : (
            <Badge variant="gradient" gradient={{from: 'green', to: 'teal', deg: 90}} className="font-medium">
                {dayjs(endsAt).to(now, true)} 후 종료
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
