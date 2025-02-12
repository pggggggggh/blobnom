import {Group, NumberInput, RangeSlider, Text} from '@mantine/core';
import {marks, tiers} from '../../constants/tierdata';
import {Platform} from "../../types/Platforms.tsx";


interface SetTierRangeProps {
    platform: Platform;
    value: [number, number];
    onChange: (value: [number, number]) => void;
}


function SetTierRange({platform, value, onChange}: SetTierRangeProps) {


    return (
        <>
            {
                platform === Platform.BOJ ?
                    <RangeSlider pb="xl" labelTransitionProps={{
                        transition: 'skew-down',
                        duration: 150,
                        timingFunction: 'linear',

                    }} value={value}
                                 onChange={onChange}
                                 minRange={0} min={0} max={30} step={1}
                                 marks={marks}
                                 label={(value) => tiers.find((tier) => tier.value === value)?.label || ""}
                    /> :
                    <Group>
                        <NumberInput
                            value={value[0]}
                            onChange={(v) => onChange([v, value[1]])}
                        />
                        <Text>~</Text>
                        <NumberInput
                            value={value[1]}
                            onChange={(v) => onChange([value[0], v])}
                        />
                    </Group>
            }

        </>
    );
}

export default SetTierRange;