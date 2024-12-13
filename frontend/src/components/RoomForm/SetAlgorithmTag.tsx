import React, { useMemo } from 'react';
import { MultiSelect } from '@mantine/core';
import { tags } from '../../constants/solvedtag';
import { TagItem, TagOption } from '../../types/SolvedTag';

interface SetAlgorithmTagProps {
    selectedTags: string[];
    setSelectedTags: (tags: string[]) => void;
}

const SetAlgorithmTag = ({ selectedTags, setSelectedTags }) => {
    const data: TagOption[] = useMemo(() => {
        if (!tags || !tags.items) return [];
        return tags.items.map((tag: TagItem) => ({
            value: tag.key,
            label: tag.displayNames.find(name => name.language === 'ko')?.name || tag.key,
            aliases: [tag.key, ...(tag.aliases?.map(aliasObj => aliasObj.alias) || [])],
        }));
    }, []);

    const filter = ({ options, search, limit }: { options: TagOption[]; search: string; limit: number }) => {
        const searchLower = search.toLowerCase();
        return options.filter(option => (
            option.label.toLowerCase().includes(searchLower) ||
            option.aliases.some(alias => alias.toLowerCase().includes(searchLower))
        )).slice(0, limit);
    };

    return (
        <MultiSelect
            label="알고리즘 태그 및 난이도 선택"
            data={data}
            value={selectedTags}
            onChange={setSelectedTags}
            placeholder="태그 선택"
            searchable
            clearable
            nothingFound="태그를 찾을 수 없습니다"
            filter={filter}
            withinPortal
            multiple
        />
    );
};

export default SetAlgorithmTag;
