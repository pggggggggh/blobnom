import {Checkbox, Group, Input, NumberInput, RangeSlider, SimpleGrid, Stack, Text, TextInput} from '@mantine/core';
import React, {useEffect, useState} from 'react';
import {SetAlgorithmTag} from './';
import {marks, tiers} from '../../constants/tierdata';
import {Platform} from "../../types/enum/Platforms.tsx";
import {useTranslation} from "react-i18next";

interface SetRoomQueryProps {
    platform: Platform;
    queryValue: string;
    queryProps: any;
    handleValue: { [key: string]: number };
}

const tierRangeString = (platform: Platform, tierInt: [number, number], selectedTags: string[]) => {
    if (platform == Platform.BOJ)
        return `solvable:true tier:${tiers[tierInt[0]]?.short}..${tiers[tierInt[1]]?.short} ${selectedTags.length > 0 ? `(${selectedTags.map(tag => `#${tag}`).join('|')})` : ''}`;
    return `difficulty:${tierInt[0]}-${tierInt[1]}`
}

const SetRoomQuery = ({platform, queryValue, queryProps, handleValue}: SetRoomQueryProps) => {
    const {t} = useTranslation();

    const [tierRange, setTierRange] = useState<[number, number]>([1, 16]);
    const [contestIdRange, setContestIdRange] = useState<[number, number]>([354, 4000]);
    const [fixedQuery, setFixedQuery] = useState<string>('');
    const [addedQuery, setAddedQuery] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // codeforces
    const [selectedCTypes, setSelectedCTypes] = useState<string[]>([]);
    const [selectedPids, setSelectedPids] = useState<string[]>([]);
    const [onlyOddId, setOnlyOddId] = useState<boolean>(false);


    useEffect(() => {
        if (platform === Platform.BOJ) {
            setTierRange([1, 16]);
            setAddedQuery("")
        } else {
            setTierRange([0, 4000]);
            setAddedQuery(`contestid:${contestIdRange[0]}-${contestIdRange[1]}`)
            setSelectedCTypes(["div1", "div2", "edu", "global", "div3", "div4"])
            setSelectedPids(["A", "B", "C", "D", "E", "F", "G", "H", "I"])
            setOnlyOddId(false)
        }
        setFixedQuery("")
        queryProps.onChange("");
    }, [platform]);

    useEffect(() => {
        const updatedQuery = tierRangeString(platform, tierRange, selectedTags);
        setFixedQuery(updatedQuery)
    }, [tierRange, selectedTags, handleValue]);

    useEffect(() => {
        if (platform === Platform.CODEFORCES) setAddedQuery(`contestid:${contestIdRange[0]}-${contestIdRange[1]}${onlyOddId ? "&odd" : ""} contesttype:${selectedCTypes.join("|")} problemid:${selectedPids.join("|")}`)
    }, [contestIdRange, selectedCTypes, selectedPids, onlyOddId]);

    useEffect(() => {
        queryProps.onChange(fixedQuery + " " + addedQuery)
    }, [fixedQuery, addedQuery]);


    return (
        <Stack>
            {
                platform === Platform.BOJ ?
                    <>
                        <Input.Wrapper label="알고리즘 태그 및 난이도 지정">
                            <SetAlgorithmTag selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>
                            <RangeSlider pt="lg" pb="xl" labelTransitionProps={{
                                transition: 'skew-down',
                                duration: 150,
                                timingFunction: 'linear',

                            }} value={tierRange}
                                         onChange={setTierRange}
                                         minRange={0} min={0} max={30} step={1}
                                         marks={marks}
                                         label={(value) => tiers.find((tier) => tier.value === value)?.label || ""}
                            />
                        </Input.Wrapper>
                        <Input.Wrapper label="solved.ac 쿼리"
                                       description="문제 추첨에 사용될 solved.ac 검색 쿼리입니다. 우측 입력창에 추가 입력이 가능합니다. 한국어 문제만을 원한다면 %ko를 입력하세요.">
                            <SimpleGrid cols={2}>
                                <TextInput
                                    value={fixedQuery}
                                    readOnly
                                />
                                <TextInput
                                    value={addedQuery}
                                    onChange={(e) => setAddedQuery(e.target.value)}
                                />
                            </SimpleGrid>
                        </Input.Wrapper>
                    </> :
                    <>
                        <SimpleGrid cols={2}>
                            <Input.Wrapper label="대회 ID 지정">
                                <Stack gap="xs" align="flex-end">
                                    <Group wrap="nowrap">
                                        <NumberInput
                                            value={contestIdRange[0]}
                                            onChange={(v) => setContestIdRange([v, contestIdRange[1]])}
                                        />
                                        <Text>~</Text>
                                        <NumberInput
                                            value={contestIdRange[1]}
                                            onChange={(v) => setContestIdRange([contestIdRange[0], v])}
                                        />
                                    </Group>
                                    <Checkbox
                                        label="홀수 ID 대회만"
                                        checked={onlyOddId}
                                        onChange={(e) => setOnlyOddId(e.currentTarget.checked)}
                                    />
                                </Stack>
                            </Input.Wrapper>

                            <Input.Wrapper label="난이도 지정">
                                <Group wrap="nowrap">
                                    <NumberInput
                                        value={tierRange[0]}
                                        onChange={(v) => setTierRange([v, tierRange[1]])}
                                    />
                                    <Text>~</Text>
                                    <NumberInput
                                        value={tierRange[1]}
                                        onChange={(v) => setTierRange([tierRange[0], v])}
                                    />
                                </Group>
                            </Input.Wrapper>
                        </SimpleGrid>

                        <Checkbox.Group
                            label={t("대회 종류")}
                            withAsterisk
                            required
                            value={selectedCTypes}
                            onChange={setSelectedCTypes}
                        >
                            <Group mt="xs">
                                <Checkbox value="div1" label="Div. 1"/>
                                <Checkbox value="div2" label="Div. 2"/>
                                <Checkbox value="global" label="Global (Div. 1 + Div. 2)"/>
                                <Checkbox value="edu" label="Educational"/>
                                <Checkbox value="div3" label="Div. 3"/>
                                <Checkbox value="div4" label="Div. 4"/>
                                <Checkbox value="etc" label="etc"/>
                            </Group>
                        </Checkbox.Group>
                        <Checkbox.Group
                            label={t("문제 번호")}
                            withAsterisk
                            required
                            value={selectedPids}
                            onChange={setSelectedPids}
                        >
                            <Group mt="xs">
                                <Checkbox value="A" label="A"/>
                                <Checkbox value="B" label="B"/>
                                <Checkbox value="C" label="C"/>
                                <Checkbox value="D" label="D"/>
                                <Checkbox value="E" label="E"/>
                                <Checkbox value="F" label="F"/>
                                <Checkbox value="G" label="G"/>
                                <Checkbox value="H" label="H"/>
                                <Checkbox value="I" label="I"/>
                            </Group>
                        </Checkbox.Group>
                    </>
            }
        </Stack>

    );
};

export default SetRoomQuery;
