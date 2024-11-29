import { RangeSlider } from '@mantine/core';
import { tiers, marks } from '../../constants/tierdata';


function setTierRange() {
    return (
        <>
            <RangeSlider py="xl" labelTransitionProps={{
                transition: 'skew-down',
                duration: 150,
                timingFunction: 'linear',
            }} minRange={0} min={0} max={30} step={1} defaultValue={[marks[1].value, marks[3].value]} marks={marks} label={(value) => tiers.find((tier) => tier.value === value)?.label || ""} />
        </>
    );
}

export default setTierRange;