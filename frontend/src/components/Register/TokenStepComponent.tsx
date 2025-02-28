import {ActionIcon, Alert, Button, CopyButton, Stack, TextInput} from "@mantine/core";
import {IconCopy, IconInfoCircle} from "@tabler/icons-react";
import {Platform} from "../../types/enum/Platforms.tsx";
import React from "react";

interface TokenStepComponentProps {
    onGetToken: any;
    isFetching: boolean;
    platform: Platform;
    tokenData: any;
}

const TokenStepComponent = ({onGetToken, isFetching, platform, tokenData}: TokenStepComponentProps) => {
    return (
        <Stack gap="md">
            <Button fullWidth onClick={onGetToken} variant="outline" loading={isFetching}>
                계정 인증 토큰 발급
            </Button>

            <Alert icon={<IconInfoCircle size={16}/>} color="blue" variant="light">
                {platform === Platform.CODEFORCES ? (
                    <>이 토큰을 코드포스 프로필 → SETTINGS → SOCIAL의 First Name이나 Last Name란에 붙여넣어주세요.
                        인증 후 원래대로 돌려놓아도 됩니다.</>
                ) : (
                    <>이 토큰을 solved.ac 프로필 - <b>프로필 편집</b>란에 붙여넣어주세요. 인증 후 원래대로 돌려놓아도 됩니다.</>
                )}
            </Alert>

            {tokenData && (
                <TextInput
                    label="계정 인증 토큰"
                    readOnly
                    value={tokenData.token}
                    rightSection={
                        <CopyButton value={tokenData.token} timeout={2000}>
                            {({copied, copy}) => (
                                <ActionIcon color={copied ? 'teal' : 'gray'}
                                            onClick={copy}>
                                    <IconCopy/>
                                </ActionIcon>
                            )}
                        </CopyButton>
                    }
                />
            )}
        </Stack>
    )
}

export default TokenStepComponent;