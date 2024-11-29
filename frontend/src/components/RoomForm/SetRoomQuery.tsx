import { TextInput, Stack } from '@mantine/core';

const SetRoomQuery = ({
    queryValue,
    queryProps,
}: {
    queryValue: string;
    queryProps: any;
}) => {
    return (
        <Stack style={{ gap: '0px' }}>
            <TextInput
                value={queryValue}
                label="solved.ac Query"
                readOnly
                styles={{
                    label: { marginBottom: '8px' },
                    input: {
                        backgroundColor: '#1e1e1e',
                        borderColor: '#333',
                        color: '#555',
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                    },
                }}
            />

            <TextInput
                {...queryProps}
                styles={{
                    label: { marginBottom: '8px' },
                    input: {
                        backgroundColor: '#1e1e1e',
                        borderColor: '#555',
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                    },
                }}
            />
        </Stack>
    );
};

export default SetRoomQuery;
