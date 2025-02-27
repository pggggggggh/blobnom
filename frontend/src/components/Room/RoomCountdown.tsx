import {Box, Text} from "@mantine/core";

const RoomCountdown = ({timeBefore}: { timeBefore: string }) => {
    return (
        <Box
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            }}
        >
            <Text size="150">
                {timeBefore}
            </Text>
        </Box>
    )
}

export default RoomCountdown;