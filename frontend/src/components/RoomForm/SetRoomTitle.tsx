import {TextInput} from '@mantine/core';

const SetRoomTitle = ({titleProps}: { titleProps: any }) => {
    return (
        <TextInput {...titleProps} label="방제" placeholder="방 제목" required/>
    );
};

export default SetRoomTitle;
