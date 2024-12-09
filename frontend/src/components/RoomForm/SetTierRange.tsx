import {RangeSlider} from '@mantine/core';
import {marks, tiers} from '../../constants/tierdata';


interface SetTierRangeProps {
    value: [number, number];
    onChange: (value: [number, number]) => void;
}


function SetTierRange({value, onChange}: SetTierRangeProps) {
    return (
        <>
            <RangeSlider pb="xl" labelTransitionProps={{
                transition: 'skew-down',
                duration: 150,
                timingFunction: 'linear',

            }} value={value}
                         onChange={onChange}
                         minRange={0} min={0} max={30} step={1} defaultValue={[marks[1].value, marks[3].value]}
                         marks={marks} label={(value) => tiers.find((tier) => tier.value === value)?.label || ""

            }/>
        </>
    );
}

export default SetTierRange;