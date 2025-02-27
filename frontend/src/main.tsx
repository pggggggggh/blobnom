import ReactDOM from 'react-dom/client';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import "./main.css";
import "dayjs/locale/ko";
import '@mantine/notifications/styles.css';
import App from "./App.tsx";

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <App/>
    );
}
