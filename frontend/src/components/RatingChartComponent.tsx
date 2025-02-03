import ReactApexChart from "react-apexcharts";
import {ContestHistory} from "../types/MemberDetails.tsx";
import {getRatingColor} from "../utils/MemberUtils.tsx";

const RatingChartComponent = ({contestHistory}: { contestHistory: ContestHistory[] }) => {
    if (contestHistory.length === 0) {
        return <div style={{textAlign: "center", padding: "20px", color: "white"}}>대회 참가 기록이 없습니다.</div>;
    }

    const seriesData = contestHistory.map((contest) => ({
        x: new Date(contest.started_at).getTime(),
        y: contest.rating_after,
        contestId: contest.contest_id,
    }));

    const times = seriesData.map((data) => data.x);
    const ratings = seriesData.map((data) => data.y);

    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);

    const timeMargin = contestHistory.length > 1 ? (maxTime - minTime) * 0.2 : 86400000 * 10;
    const ratingMargin = contestHistory.length > 1 ? 400 : 200;

    const chartOptions = {
        chart: {
            animations: {enabled: false},
            type: "line",
            toolbar: {show: false},
            zoom: {enabled: false},
            background: "transparent",
            events: {
                markerClick: function (event, chartContext, {dataPointIndex}) {
                    const contestId = contestHistory[dataPointIndex]?.contest_id;
                    if (contestId) {
                        window.location.href = `/contests/${contestId}`;
                    }
                },
            },
        },
        theme: {mode: "dark"},
        xaxis: {
            tooltip: {enabled: false},
            axisTicks: {show: false},
            type: "datetime",
            labels: {
                datetimeUTC: false,
                format: "yyyy-MM-dd",
                style: {fontSize: "12px", fontWeight: "light", fontFamily: "Pretendard, sans-serif"},
            },
            min: minTime - timeMargin,
            max: maxTime + timeMargin,
        },
        yaxis: {
            labels: {
                formatter: (value) => Math.round(value),
                style: {fontSize: "12px", fontWeight: "light", fontFamily: "Pretendard, sans-serif"},
            },
            min: minRating - ratingMargin,
            max: maxRating + ratingMargin,
        },
        annotations: {
            yaxis: [
                {y: 0, y2: 1200, fillColor: "#9e9e9e"},
                {y: 1200, y2: 1400, fillColor: "#2e7d32"},
                {y: 1400, y2: 1600, fillColor: "#26a69a"},
                {y: 1600, y2: 1900, fillColor: "#1976d2"},
                {y: 1900, y2: 2100, fillColor: "#9c27b0"},
                {y: 2100, y2: 2400, fillColor: "#ef6c00"},
                {y: 2400, y2: 10000, fillColor: "#b71c1c"},
            ],
        },
        tooltip: {
            theme: "dark",
            custom: ({series, seriesIndex, dataPointIndex, w}) => {
                const rating = series[seriesIndex][dataPointIndex];
                const contest_history = contestHistory[dataPointIndex];
                const date = new Date(w.globals.seriesX[seriesIndex][dataPointIndex]).toLocaleString();
                const rating_change = contest_history.rating_after - contest_history.rating_before;

                return `<div style="padding: 8px; background: #222; color: white; border-radius: 5px;">
                        <strong>${contest_history.contest_name}</strong><br/>
                        <span>${date}</span><br/>
                        ${contest_history.is_rated ?
                    `<span>Rating: <span class=${getRatingColor(contest_history.rating_before)}>${contest_history.rating_before}</span>→<span class=${getRatingColor(rating)}>${rating}</span></span><br/>` :
                    `<span>Unrated</span><br/>`
                }
                        <span>Final Rank: ${contest_history.final_rank}</span><br/>
                        <span>Performance: <span class=${getRatingColor(contest_history.performance)}>${contest_history.performance}</span></span><br/>
                    </div>`;
            },
            x: {show: false},
        },
        stroke: {curve: "straight"},
        markers: {size: contestHistory.length === 1 ? 6 : 4}, // 데이터가 하나뿐이면 마커 크기 증가
    };

    const chartSeries = [{name: "Rating", data: seriesData}];

    return (
        <div style={{width: "100%"}}>
            <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={400}/>
        </div>
    );
};

export default RatingChartComponent;
