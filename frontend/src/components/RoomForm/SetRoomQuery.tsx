import {Checkbox, Group, Input, NumberInput, Stack, Text, TextInput} from '@mantine/core';
import React, {useEffect, useState} from 'react';
import {SetAlgorithmTag, SetTierRange} from './';
import {tiers} from '../../constants/tierdata';
import {Platform} from "../../types/Platforms.tsx";

const tierRangeString = (platform: Platform, tierInt: [number, number], selectedTags: string[]) => {
    if (platform == Platform.BOJ)
        return `solvable:true tier:${tiers[tierInt[0]]?.short}..${tiers[tierInt[1]]?.short} ${selectedTags.length > 0 ? `(${selectedTags.map(tag => `#${tag}`).join('|')})` : ''}`;
    return `difficulty:${tierInt[0]}-${tierInt[1]}`
}

const SetRoomQuery = ({
                          platform,
                          queryValue,
                          queryProps,
                          handleValue,
                          unfreezeOffsetMinutesProps,
                      }: {
    platform: Platform;
    queryValue: string;
    queryProps: any;
    handleValue: { [key: string]: number };
    unfreezeOffsetMinutesProps: any;
}) => {
    const [tierRange, setTierRange] = useState<[number, number]>([1, 16]);
    const [contestIdRange, setContestIdRange] = useState<[number, number]>([354, 4000]);
    const [fixedQuery, setFixedQuery] = useState<string>('');
    const [addedQuery, setAddedQuery] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const [alwaysShowTier, setAlwaysShowTier] = useState<boolean>(false);

    useEffect(() => {
        if (platform === Platform.BOJ) {
            setTierRange([1, 16]);
            setAddedQuery("")
        } else {
            setTierRange([0, 4000]);
            setAddedQuery(`contestid:${contestIdRange[0]}-${contestIdRange[1]}`)
        }
        setFixedQuery("")
        queryProps.onChange("");
    }, [platform]);

    useEffect(() => {
        const updatedQuery = tierRangeString(platform, tierRange, selectedTags);
        setFixedQuery(updatedQuery)
    }, [tierRange, selectedTags, handleValue]);


    useEffect(() => {
        setAddedQuery(`contestid:${contestIdRange[0]}-${contestIdRange[1]}`)
    }, [contestIdRange]);

    useEffect(() => {
        queryProps.onChange(fixedQuery + " " + addedQuery)
    }, [fixedQuery, addedQuery]);


    const toggleAlwaysShowTier = (value: boolean) => {
        setAlwaysShowTier(value)
        if (value === true) unfreezeOffsetMinutesProps.onChange(null);
        else unfreezeOffsetMinutesProps.onChange(0);
    }

    return (
        <Input.Wrapper label={platform === Platform.BOJ ? "알고리즘 태그 및 난이도 지정" : "난이도 범위 지정"}>
            <Stack>
                {
                    platform === Platform.BOJ &&
                    <SetAlgorithmTag selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>
                }
                <SetTierRange platform={platform} value={tierRange} onChange={setTierRange}/>
                {
                    platform === Platform.CODEFORCES &&
                    <Group>
                        <Input.Wrapper label="대회 번호 지정">
                            <Group>
                                <NumberInput
                                    value={contestIdRange[0]}
                                    onChange={(v) => setContestIdRange([v, contestIdRange[1]])}
                                />
                                <Text>~</Text>
                                <NumberInput
                                    value={contestIdRange[1]}
                                    onChange={(v) => setContestIdRange([contestIdRange[1], v])}
                                />
                            </Group>
                        </Input.Wrapper>
                    </Group>
                }

                <Group gap="xs" justify="space-between">
                    <Checkbox
                        checked={alwaysShowTier}
                        onChange={(event) => toggleAlwaysShowTier(event.currentTarget.checked)}
                        label="난이도 항상 표시"
                    />
                    <Group gap="xs" style={{visibility: alwaysShowTier ? 'hidden' : 'visible'}}>
                        <Text size="sm">
                            종료
                        </Text>
                        <NumberInput
                            {...unfreezeOffsetMinutesProps}
                            min={0}
                            size={"xs"}
                            w={80}
                        />
                        <Text size="sm">
                            분 전부터 난이도 표시
                        </Text>
                    </Group>

                </Group>
                {
                    platform === Platform.BOJ &&
                    <Stack style={{gap: '0px'}}>
                        <TextInput
                            value={fixedQuery}
                            label="solved.ac 고급 쿼리"
                            readOnly
                            disabled
                        />
                        <TextInput
                            value={addedQuery}
                            onChange={(e) => setAddedQuery(e.target.value)}
                        />
                    </Stack>
                }
            </Stack>
        </Input.Wrapper>

    );
};

export default SetRoomQuery;
