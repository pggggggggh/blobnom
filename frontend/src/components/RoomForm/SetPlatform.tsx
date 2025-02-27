import {Group, Radio, Stack, Text} from "@mantine/core";
import {Platform} from "../../types/Platforms.tsx";
import PlatformIcon from "../PlatformIcon.tsx";
import React from "react";

interface SetPlatformProps {
    platformProps: any;
}

const SetPlatform = ({platformProps}: SetPlatformProps) => {
    return (
        <Radio.Group
            {...platformProps}
            required
            label="문제 출처"
        >
            <Group wrap="nowrap">
                <Radio.Card value={Platform.BOJ} p="sm"
                            style={{
                                borderColor:
                                    platformProps.value === Platform.BOJ
                                        ? "var(--mantine-primary-color-filled)"
                                        : "var(--mantine-color-default-border)",
                            }}>
                    <Stack align="center" gap={0}>
                        <Radio.Indicator mb="sm"/>
                        <PlatformIcon platform={Platform.BOJ} w={32}/>
                        <Text size="sm">BAEKJOON ONLINE JUDGE</Text>
                    </Stack>
                </Radio.Card>
                <Radio.Card value={Platform.CODEFORCES} p="sm"
                            style={{
                                borderColor:
                                    platformProps.value === Platform.CODEFORCES
                                        ? "var(--mantine-primary-color-filled)"
                                        : "var(--mantine-color-default-border)",
                            }}>
                    <Stack align="center" gap={0}>
                        <Radio.Indicator mb="sm"/>
                        <PlatformIcon platform={Platform.CODEFORCES} w={32}/>
                        <Text size="sm">Codeforces</Text>
                    </Stack>
                </Radio.Card>
            </Group>
        </Radio.Group>

    )
}

export default SetPlatform;