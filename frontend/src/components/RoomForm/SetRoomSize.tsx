import {Select} from '@mantine/core';

const SetRoomSize = ({sizeProps}: {
    sizeProps: { value?: string | number; onChange: (val: string | number) => void }
}) => {
    const sizeOptions = [1, 7, 19, 37, 61, 91, 127];

    return (
        <Select
            required
            label="크기"
            data={sizeOptions.map((size, idx) => ({value: idx.toString(), label: `${size}문제`}))}
            defaultValue="19"
            value={sizeProps.value ? sizeProps.value.toString() : undefined}
            onChange={(val) => sizeProps.onChange(Number(val))}
        />
    );
};

export default SetRoomSize;
