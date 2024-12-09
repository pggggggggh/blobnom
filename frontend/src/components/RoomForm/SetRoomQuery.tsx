import {Stack, TextInput} from '@mantine/core';
import {useEffect, useState} from 'react';
import {SetAlgorithmTag, SetTierRange} from './';
import {tiers} from '../../constants/tierdata';

const tierRangeString = (tierInt: [number, number], selectedTags: string[]) => {
    return `tier:${tiers[tierInt[0]].short}..${tiers[tierInt[1]].short} ${selectedTags.map(tag => `#${tag} `).join(' ')}`;
}

const SetRoomQuery = ({
                          queryValue,
                          queryProps,
                      }: {
    queryValue: string;
    queryProps: any;
}) => {
    const [tierRange, setTierRange] = useState<[number, number]>([1, 16]);
    const [fixedQuery, setFixedQuery] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    useEffect(() => {
        const updatedQuery = tierRangeString(tierRange, selectedTags);
        setFixedQuery(updatedQuery);
        console.log(selectedTags);
    }, [tierRange, selectedTags]);

    return (
        <Stack>
            <SetAlgorithmTag selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>
            <SetTierRange value={tierRange} onChange={setTierRange}/>
            <Stack style={{gap: '0px'}}>
                <TextInput
                    value={(queryValue ? `${queryValue} ` : "") + fixedQuery}
                    label="solved.ac 고급 쿼리"
                    readOnly
                    styles={{
                        input: {
                            backgroundColor: '#1e1e1e',
                            borderColor: '#333',
                            color: '#555',
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                        },
                    }}
                />
                <TextInput
                    {...queryProps}
                    styles={{
                        label: {marginBottom: '8px'},
                        input: {
                            backgroundColor: '#1e1e1e',
                            borderColor: '#555',
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                        },
                    }}
                />
            </Stack>
        </Stack>
    );
};

export default SetRoomQuery;
