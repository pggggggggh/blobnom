import { TextInput, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import { SetTierRange } from './'
import { tiers } from '../../constants/tierdata';

const tierRangeString = (tierInt: [number, number]) => {
    return `tier:${tiers[tierInt[0]].short}..${tiers[tierInt[1]].short}`
}

const SetRoomQuery = ({
    queryValue,
    queryProps,
}: {
    queryValue: string;
    queryProps: any;
}) => {
    const [tierRange, setTierRange] = useState<[number, number]>([6, 11]);
    const [fixedQuery, setFixedQuery] = useState<string>('');
    useEffect(() => {
        const updatedQuery = tierRangeString(tierRange);
        setFixedQuery(updatedQuery);
    }, [tierRange]);
    return (
        <Stack>
            <SetTierRange value={tierRange} onChange={setTierRange} />
            <Stack style={{ gap: '0px' }}>
                <TextInput
                    value={(queryValue ? `${queryValue} ` : "") + fixedQuery}
                    label="solved.ac Query"
                    readOnly
                    styles={{
                        label: { marginBottom: '8px' },
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
                        label: { marginBottom: '8px' },
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
