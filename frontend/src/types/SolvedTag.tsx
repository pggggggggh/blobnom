export interface DisplayName {
    language: string;
    name: string;
    short: string;
}

export interface Alias {
    alias: string;
}

export interface TagItem {
    key: string;
    isMeta: boolean;
    bojTagId: number;
    problemCount: number;
    displayNames: DisplayName[];
    aliases: Alias[];
}

export interface SolvedTagData {
    count: number;
    items: TagItem[];
}

export interface TagOption {
    value: string;
    label: string;
    aliases: string[];
}
