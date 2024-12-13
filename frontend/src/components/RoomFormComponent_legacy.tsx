import {
    Box,
    Button,
    Checkbox,
    Container,
    Group,
    RangeSlider,
    Select,
    Stack,
    Text,
    TextInput,
    Title
} from '@mantine/core';
import {DateTimePicker} from '@mantine/dates';
import {useState} from 'react';

const RoomFormComponent_legacy = () => {
    const [rangeValue, setRangeValue] = useState([0]);

    const marks = [
        {value: 0, label: 'Bronze V'},
        {value: 20, label: 'Silver V'},
        {value: 40, label: 'Gold V'},
        {value: 60, label: 'Platinum V'},
        {value: 80, label: 'Diamond V'},
        {value: 100, label: 'Ruby V'},
    ];

    return (
        <Container size="sm">
            <Stack gap="md">
                <Title order={3}>방 만들기</Title>

                <TextInput
                    label="방제"
                    placeholder="방 제목을 입력하세요"
                />

                <Checkbox
                    label="공개방 여부"
                />

                <TextInput
                    label="BOJ Handles"
                    placeholder="콤마로 구분, ex: plast changhw"
                />

                <Box>
                    <Text size="sm" mb={8}>본셰 난이도 범위</Text>
                    <RangeSlider
                        marks={marks}
                        defaultValue={[20, 80]}
                        step={20}
                        min={0}
                        max={100}
                        label={(value) => marks.find(mark => mark.value === value)?.label}
                    />
                </Box>

                <Group gap="sm" align="flex-start">
                    <TextInput
                        label="문제 수의 범위"
                        placeholder="최소"
                        style={{width: '100px'}}
                    />
                    <Text style={{marginTop: '32px'}}>-</Text>
                    <TextInput
                        label=" "
                        placeholder="최대"
                        style={{width: '100px'}}
                    />
                </Group>

                <TextInput
                    label="solved.ac Query"
                    placeholder="*1..30 solvable:true"
                />

                <Select
                    label="크기"
                    placeholder="19문제"
                    data={[
                        {value: '19', label: '19문제'},
                        {value: '20', label: '20문제'},
                        {value: '21', label: '21문제'},
                    ]}
                />

                <DateTimePicker
                    label="종료 시각"
                    placeholder="종료 시각을 선택하세요"
                    defaultValue={new Date()}
                />

                <Button fullWidth color="blue">
                    방 만들기
                </Button>
            </Stack>
        </Container>
    );
};

export default RoomFormComponent_legacy;