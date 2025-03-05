import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import "./main.css";
import 'mantine-react-table/styles.css';
import '@mantine/notifications/styles.css';

import ReactDOM from 'react-dom/client';
import "dayjs/locale/ko";
import App from "./App.tsx";

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <App/>
    );
}
