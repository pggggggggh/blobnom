import {Stack, TextInput} from '@mantine/core';
import {useEffect, useState} from 'react';
import {SetAlgorithmTag, SetTierRange} from './';
import {tiers} from '../../constants/tierdata';

const tierRangeString = (tierInt: [number, number], selectedTags: string[]) => {
    return `tier:${tiers[tierInt[0]].short}..${tiers[tierInt[1]].short} ${selectedTags.length > 0 ? `(${selectedTags.map(tag => `#${tag}`).join('|')})` : ''}`;
}

const SetRoomQuery = ({
                          queryValue,
                          queryProps,
                          handleValue
                      }: {
    queryValue: string;
    queryProps: any;
    handleValue: { [key: string]: number };
}) => {
    const [tierRange, setTierRange] = useState<[number, number]>([1, 16]);
    const [fixedQuery, setFixedQuery] = useState<string>('');
    const [addedQuery, setAddedQuery] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

    return (
        <Stack>
            <SetAlgorithmTag selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>
            <SetTierRange value={tierRange} onChange={setTierRange}/>
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
