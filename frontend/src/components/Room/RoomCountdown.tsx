import {Box, Text} from "@mantine/core";

const RoomCountdown = ({timeBefore}: { timeBefore: string }) => {
    return (
        <Box
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: "-1"
            }}
        >
            <Text size="80">
                {timeBefore}
            </Text>
        </Box>
    )
}

export default RoomCountdown;