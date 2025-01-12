import dayjs from "dayjs";

export const getDiffTime = (startDate: Date, endDate: Date) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const diff = end.diff(start, 'second');

    if (diff <= 0) {
        return "00:00:00";
    } else {
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
};