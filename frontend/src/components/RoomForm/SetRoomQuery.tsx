import {Checkbox, Group, NumberInput, Stack, Text, TextInput} from '@mantine/core';
import {useEffect, useState} from 'react';
import {SetAlgorithmTag, SetTierRange} from './';
import {tiers} from '../../constants/tierdata';

const tierRangeString = (tierInt: [number, number], selectedTags: string[]) => {
    return `solvable:true tier:${tiers[tierInt[0]].short}..${tiers[tierInt[1]].short} ${selectedTags.length > 0 ? `(${selectedTags.map(tag => `#${tag}`).join('|')})` : ''}`;
}

const SetRoomQuery = ({
                          queryValue,
                          queryProps,
                          handleValue,
                          unfreezeOffsetMinutesProps,
                      }: {
    queryValue: string;
    queryProps: any;
    handleValue: { [key: string]: number };
    unfreezeOffsetMinutesProps: any;
}) => {
    const [tierRange, setTierRange] = useState<[number, number]>([1, 16]);
    const [fixedQuery, setFixedQuery] = useState<string>('');
    const [addedQuery, setAddedQuery] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const [alwaysShowTier, setAlwaysShowTier] = useState<boolean>(false);

    useEffect(() => {
        const updatedQuery = tierRangeString(tierRange, selectedTags);
        // const exclude = Object.keys(handleValue)
        //     .map(key => `!@${key}`)
        //     .join(' ');
        setFixedQuery(updatedQuery)
        console.log(selectedTags);
    }, [tierRange, selectedTags, handleValue]);

    useEffect(() => {
        queryProps.onChange(fixedQuery + addedQuery)
    }, [fixedQuery, addedQuery]);

    const toggleAlwaysShowTier = (value: boolean) => {
        setAlwaysShowTier(value)
        if (value === true) unfreezeOffsetMinutesProps.onChange(null);
        else unfreezeOffsetMinutesProps.onChange(0);
    }

    return (
        <Stack>
            <SetAlgorithmTag selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>
            <SetTierRange value={tierRange} onChange={setTierRange}/>
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
        </Stack>
    );
};

export default SetRoomQuery;
