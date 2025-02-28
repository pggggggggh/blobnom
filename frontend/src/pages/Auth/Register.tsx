import {Alert, Button, Card, Container, Group, Stepper, Title} from "@mantine/core";
import {useFetchPlatformToken, useRegister} from "../../hooks/hooks.tsx";
import {useForm} from "@mantine/form";
import React, {useState} from "react";
import SetPlatform from "../../components/RoomForm/SetPlatform.tsx";
import {Platform} from "../../types/enum/Platforms.tsx";
import {RegisterForm} from "../../types/RegisterForm.tsx";
import TokenStepComponent from "../../components/Register/TokenStepComponent.tsx";
import RegisterFormComponent from "../../components/Register/RegisterFormComponent.tsx";

export default function Register() {
    const [active, setActive] = useState(0);
    const registerMutation = useRegister();
    const {data: platformTokenData, refetch, isFetching, isError} = useFetchPlatformToken();

    const form = useForm<RegisterForm>({
        initialValues: {
            platform: Platform.BOJ,
            handle: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        validate: (values) => {
            if (active === 1) {
                return {
                    handle: values.handle.trim().length < 2 ? '핸들을 확인해주세요.' : null,
                    email: /^\S+@\S+$/.test(values.email) ? null : '이메일을 확인해주세요.',
                    password: values.password.length < 6 ? '비밀번호는 최소 6자 이상이어야 합니다.' : null,
                    confirmPassword: values.password !== values.confirmPassword ? '비밀번호가 맞지 않습니다.' : null
                };
            }
            return {};
        },
    });

    const nextStep = () =>
        setActive((current) => {
            if (form.validate().hasErrors) {
                return current;
            }
            if (current === 2) {
                onRegister(form.values)
                return current;
            }
            return current + 1;
        });

    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    async function onGetToken() {
        await refetch();
    }


    function onRegister(values) {
        registerMutation.mutate(values);
    }

    return (
        <Container>
            <Card mx="xl" px="xl" pt="lg" pb="xl" shadow="sm" withBorder>
                <Title mb="sm">회원가입</Title>
                {isError && <Alert color="red">토큰 발급 중 오류가 발생했습니다. 잠시 후에 시도해주세요.</Alert>}
                <form>
                    <Stepper active={active} iconSize="32">
                        <Stepper.Step label="가입할 플랫폼 선택">
                            <SetPlatform platformProps={form.getInputProps("platform")} label={"플랫폼 선택"}
                                         desc="가입 후 다른 플랫폼으로도 연동 가능합니다."/>
                        </Stepper.Step>
                        <Stepper.Step label="아이디, 비밀번호 입력">
                            <RegisterFormComponent form={form}/>
                        </Stepper.Step>
                        <Stepper.Step label="플랫폼 계정 인증">
                            <TokenStepComponent onGetToken={onGetToken} isFetching={isFetching}
                                                platform={form.values.platform} tokenData={platformTokenData}
                            />
                        </Stepper.Step>
                    </Stepper>


                    <Group justify="flex-end" mt="xl">
                        {active !== 0 && (
                            <Button variant="default" onClick={prevStep}>
                                이전
                            </Button>
                        )}
                        <Button onClick={nextStep} loading={registerMutation.isPending}>다음</Button>
                    </Group>
                </form>
            </Card>
        </Container>
    );
}
