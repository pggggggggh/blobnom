import {PasswordInput, Stack, TextInput} from "@mantine/core";
import React from "react";

const RegisterFormComponent = ({form}: { form: any }) => {
    return (
        <Stack gap="md">
            <TextInput
                {...form.getInputProps('handle')}
                label="핸들(Handle)"
                placeholder={`${form.values.platform.toUpperCase()} 아이디와 동일`}
                required
                autoComplete="new-password"
            />
            <TextInput
                {...form.getInputProps('email')}
                label="이메일"
                placeholder="이메일 입력"
                required
                autoComplete="new-password"
            />
            <PasswordInput
                {...form.getInputProps('password')}
                label="비밀번호"
                placeholder="비밀번호 입력"
                required
                autoComplete="new-password"
            />
            <PasswordInput
                {...form.getInputProps('confirmPassword')}
                label="비밀번호 확인"
                placeholder="비밀번호 확인"
                required

                autoComplete="new-password"
            />
        </Stack>
    )
}

export default RegisterFormComponent;