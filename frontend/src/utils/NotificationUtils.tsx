import blobnom from "../assets/blobnom.png";

export const requestNotificationPermission = async () => {
    console.log(Notification.permission)
    if (Notification.permission !== "granted") {
        await Notification.requestPermission();
    }
};

export const showNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
        new Notification(title, {
            body,
            icon: blobnom,
        });
    } else {
        console.warn("Notification permission not granted.");
    }
};
