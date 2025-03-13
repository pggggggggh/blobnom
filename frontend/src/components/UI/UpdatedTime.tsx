import {Skeleton, Stack, Text} from "@mantine/core";
import dayjs from "dayjs";
import {useTranslation} from "react-i18next";

const UpdatedTime = ({updated_at}: { updated_at: string | undefined }) => {
    const {t} = useTranslation();

    if (!updated_at) {
        return (
            <Stack gap={0} mt="sm" w="100%" justify="flex-end" align="flex-end">
                <Skeleton height={16} width={100} radius="sm"/>
            </Stack>
        );
    }

    return (
        <Stack gap={0} mt="sm" w="100%" justify="flex-end" align="flex-end">
            <Text size="xs" c="dimmed">
                {t("updated", {t: dayjs(updated_at).format("HH:mm")})}
            </Text>
        </Stack>
    );
};

export default UpdatedTime;