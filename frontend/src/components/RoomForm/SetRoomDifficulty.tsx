import {Checkbox, Group, NumberInput, Text} from "@mantine/core";
import React, {useState} from "react";

interface SetRoomQueryProps {
    unfreezeOffsetMinutesProps: any,
}

const SetRoomDifficulty = ({unfreezeOffsetMinutesProps}: SetRoomQueryProps) => {
    const [alwaysShowTier, setAlwaysShowTier] = useState<boolean>(false);

    const toggleAlwaysShowTier = (value: boolean) => {
        setAlwaysShowTier(value)
        if (value) unfreezeOffsetMinutesProps.onChange(null);
        else unfreezeOffsetMinutesProps.onChange(0);
    }

    return (
        <Group gap="xs" justify="space-between">
            <Checkbox
                checked={alwaysShowTier}
                onChange={(event) => toggleAlwaysShowTier(event.currentTarget.checked)}
                label="난이도 항상 표시"
            />
            <Group gap="xs" style={{visibility: alwaysShowTier ? 'hidden' : 'visible'}}>
                <Text size="sm">
                    종료
                </Text>
                <NumberInput
                    {...unfreezeOffsetMinutesProps}
                    min={0}
                    size={"xs"}
                    w={80}
                />
                <Text size="sm">
                    분 전부터 난이도 표시
                </Text>
            </Group>

        </Group>
    )
}

export default SetRoomDifficulty;