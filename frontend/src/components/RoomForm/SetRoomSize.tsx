import { Select } from '@mantine/core';

const SetRoomSize = ({ sizeProps }: { sizeProps: { value?: string | number; onChange: (val: string | number) => void } }) => {
    const sizeOptions = [1, 7, 19, 37, 61, 91, 127];

    return (
        <Select
            py="lg"
            label="크기"
            data={sizeOptions.map((size) => ({ value: size.toString(), label: `${size}문제` }))}
            defaultValue="19"
            value={sizeProps.value ? sizeProps.value.toString() : undefined}
            onChange={(val) => sizeProps.onChange(Number(val))}
            styles={{
                input: {
                    backgroundColor: '#1e1e1e',
                    borderColor: '#555',
                },
                dropdown: {
                    backgroundColor: '#1e1e1e',
                },
            }}
        />
    );
};

export default SetRoomSize;
