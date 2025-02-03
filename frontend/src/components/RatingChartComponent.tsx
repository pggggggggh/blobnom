import ReactApexChart from "react-apexcharts";
import {ContestHistory} from "../types/MemberDetails.tsx";
import {getRatingColor} from "../utils/MemberUtils.tsx";

const RatingChartComponent = ({contestHistory}: { contestHistory: ContestHistory[] }) => {
    // ApexCharts에 들어갈 {x, y} 포맷의 데이터로 변환
    const seriesData = contestHistory.map((contest) => ({
        x: new Date(contest.started_at).getTime(),
        y: contest.rating_after,
        contestId: contest.contest_id, // 추가: contest ID 저장
    }));

    const times = seriesData.map((data) => data.x);
    const ratings = seriesData.map((data) => data.y);

    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);

    const timeMargin = (maxTime - minTime) * 0.2;

    const chartOptions = {
        chart: {
            animations: {
                enabled: false,
            },
            type: "line",
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
            background: "transparent",
            events: {
                markerClick: function (event, chartContext, {dataPointIndex}) {
                    const contestId = contestHistory[dataPointIndex].contest_id;
                    if (contestId) {
                        window.location.href = `/contests/${contestId}`;
                    }
                },
            },
        },
        theme: {
            mode: "dark",
        },
        xaxis: {
            tooltip: {
                enabled: false,
            },
            axisTicks: {
                show: false,
            },
            type: "datetime",
            labels: {
                datetimeUTC: false,
                format: "yyyy-MM-dd HH:mm",
                style: {
                    fontSize: "10px",
                    fontWeight: "light",
                    fontFamily: "Pretendard, sans-serif",
                },
            },
            min: minTime - timeMargin,
            max: maxTime + timeMargin,
        },
        yaxis: {
            labels: {
                formatter: (value) => Math.round(value),
                style: {
                    fontSize: "12px",
                    fontWeight: "light",
                    fontFamily: "Pretendard, sans-serif",
                },
            },
            min: minRating - 400,
            max: maxRating + 400,
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
                const rating_change = contest_history.rating_after - contest_history.rating_before

                return `<div style="padding: 8px; background: #222; color: white; border-radius: 5px;">
                    <strong>${contest_history.contest_name}</strong><br/>
                    <span>${date}</span><br/>
                    <span>Rating: <span class=${getRatingColor(rating)}>${rating}</span> (${rating_change == 0 ? '' : (rating_change > 0 ? '+' : '-')}${Math.abs(rating_change)})</span><br/>
                    <span>Final Rank: ${contest_history.final_rank}</span><br/>
                    <span>Performance: <span class=${getRatingColor(contest_history.performance)}>${contest_history.performance}</span></span><br/>
                </div>`;
            },
            x: {
                show: false,
            },
        },
        stroke: {
            curve: "straight",
        },
        markers: {
            size: 4,
        },
    };

    const chartSeries = [
        {
            name: "Rating",
            data: seriesData,
        },
    ];

    return (
        <div style={{width: "100%"}}>
            <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={400}/>
        </div>
    );
};

export default RatingChartComponent;
