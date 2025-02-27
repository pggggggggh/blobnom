import {Group, Radio, Stack, Text} from "@mantine/core";
import {Platform} from "../../types/Platforms.tsx";
import PlatformIcon from "../PlatformIcon.tsx";
import React from "react";

interface SetPlatformProps {
    label: string
    desc: string
    platformProps: any;
}

const platforms: Platform[] = [Platform.BOJ, Platform.CODEFORCES];

const SetPlatform = ({platformProps, label, desc = ""}: SetPlatformProps) => {

    return (
        <Radio.Group
            {...platformProps}
            required
            label={label}
            description={desc}
        >
            <Group wrap="nowrap">
                {
                    platforms.map((platform) => (
                        <Radio.Card value={platform} p="sm"
                                    style={{
                                        borderColor:
                                            platformProps.value === platform
                                                ? "var(--mantine-primary-color-filled)"
                                                : "var(--mantine-color-default-border)",
                                    }}
                                    onClick={() => {
                                        console.log(platformProps.value)
                                    }}
                        >
                            <Stack align="center" gap={0}>
                                <Radio.Indicator mb="sm"/>
                                <PlatformIcon platform={platform} w={32}/>
                                <Text size="sm">{platform === Platform.BOJ ? "백준" : "코드포스"}</Text>
                            </Stack>
                        </Radio.Card>
                    ))
                }
            </Group>
        </Radio.Group>

    )
}

export default SetPlatform;