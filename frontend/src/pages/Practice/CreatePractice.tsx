import {
    Button,
    Card,
    Container,
    InputWrapper,
    NumberInput,
    Slider,
    Stack,
    TagsInput,
    Text,
    TextInput,
    Title
} from "@mantine/core";
import React from "react";
import {useForm} from "@mantine/form";
import {Platform} from "../../types/enum/Platforms.tsx";
import {useTranslation} from "react-i18next";
import {useCreatePractice} from "../../hooks/hooks.tsx";

function CreatePractice() {
    const {t} = useTranslation();

    const form = useForm({
        initialValues: {
            platform: Platform.BOJ,
            title: '',
            difficulty: 1,
            problemIds: [],
            duration: 120,
        },
        validate: {
            title: (value) => value.length < 1 || value.length > 1000 ? t('제목을 확인해주세요.') : null,
            problemIds: (value) => {
                const regex = /^[0-9]{4,5}$/;
                if (value.some(id => !regex.test(id))) return t('문제 번호를 확인해주세요.')
                return null;
            }
        }
    })

    const mutation = useCreatePractice();

    return (
        <Container py="lg">
            <Card mx="xl" px="xl" pt="lg" pb="xl" shadow="sm" withBorder>
                <Title>연습 만들기</Title>
                <Text c="dimmed" mb="sm">연습 셋을 만듭니다. 현재는 BOJ만 지원합니다.</Text>
                <form
                    onSubmit={form.onSubmit((values) => {
                        return mutation.mutate(values);
                    })}
                >
                    <Stack>
                        <TextInput
                            label="연습 제목"
                            placeholder="연습 제목"
                            required
                            key={form.key("title")}
                            {...form.getInputProps("title")} />
                        <InputWrapper
                            label="난이도"
                            required
                            mb="md"
                        >
                            <Slider
                                label={(value) => `Lv. ${value}`}
                                marks={[
                                    {value: 1, label: 'Lv. 1'},
                                    {value: 2, label: 'Lv. 2'},
                                    {value: 3, label: 'Lv. 3'},
                                    {value: 4, label: 'Lv. 4'},
                                    {value: 5, label: 'Lv. 5'},
                                    {value: 6, label: 'Lv. 6'},
                                    {value: 7, label: 'Lv. 7'},
                                ]}
                                min={1}
                                max={7}
                                key={form.key("difficulty")}
                                {...form.getInputProps("difficulty")}
                            />
                        </InputWrapper>
                        <TagsInput
                            label="문제 번호"
                            description="입력한 순서대로 A,B,C..번이 됩니다."
                            required
                            placeholder="문제 번호 입력"
                            key={form.key("problemIds")}
                            {...form.getInputProps("problemIds")} />
                        <NumberInput
                            label="진행 기간"
                            min={5}
                            max={525600}
                            suffix={t("분")}
                            key={form.key("duration")}
                            {...form.getInputProps("duration")}
                        />
                        <Button type="submit" loading={mutation.isPending} ml="auto">
                            생성
                        </Button>
                    </Stack>
                </form>
            </Card>
        </Container>
    )
}

export default CreatePractice;