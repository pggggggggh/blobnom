import React from "react";
import ReactApexChart from "react-apexcharts";

const RatingChartComponent = ({contestHistory}) => {
    // ApexCharts에 들어갈 {x, y} 포맷의 데이터로 변환
    const seriesData = contestHistory.map((contest) => ({
        x: new Date(contest.started_at).getTime(),
        y: contest.rating_after,
    }));

    const times = seriesData.map((data) => data.x);
    const ratings = seriesData.map((data) => data.y);

    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);

    const timeMargin = (maxTime - minTime) * 0.5;


    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: "line",
            toolbar: {
                show: false,
            },
        },
        theme: {
            mode: 'dark',
        },
        xaxis: {
            axisTicks: {
                show: false,
            },
            type: "datetime",
            labels: {
                show: false,
                datetimeUTC: false,
                format: "yyyy-MM-dd HH:mm",
            },
            min: minTime - timeMargin,
            max: maxTime + timeMargin,

        },
        yaxis: {
            min: 0,
            max: 3000,
        },
        annotations: {
            yaxis: [
                {
                    y: 0,
                    y2: 1200,
                    fillColor: "#9e9e9e",
                },
                {
                    y: 1200,
                    y2: 1400,
                    fillColor: "#2e7d32",
                },
                {
                    y: 1400,
                    y2: 1600,
                    fillColor: "#26a69a",
                },
                {
                    y: 1600,
                    y2: 1900,
                    fillColor: "#1976d2",
                },
                {
                    y: 1900,
                    y2: 2100,
                    fillColor: "#9c27b0",
                },
                {
                    y: 2100,
                    y2: 2400,
                    fillColor: "#ef6c00",
                },
                {
                    y: 2400,
                    y2: 10000,
                    fillColor: "#b71c1c",
                },
            ],
        },
        tooltip: {
            theme: "dark",
            custom: ({series, seriesIndex, dataPointIndex, w}) => {
                const rating = series[seriesIndex][dataPointIndex];
                const name = contestHistory[dataPointIndex].contest_name;
                const rank = contestHistory[dataPointIndex].final_rank;
                const performance = contestHistory[dataPointIndex].performance;
                const date = new Date(w.globals.seriesX[seriesIndex][dataPointIndex]).toLocaleString();

                return `<div style="padding: 8px; background: #222; color: white; border-radius: 5px;">
                    <strong>${name}</strong><br/>
                    <strong>${date}</strong><br/>
                    <span>Rating: ${rating}</span><br/>
                    <span>Performance: ${performance}</span><br/>
                    <span>Final Rank: ${rank}</span>
                </div>`;
            },
            x: {
                show: false,
            },
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
            <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type="line"
                height={400}
            />
        </div>
    );
};

export default RatingChartComponent;
