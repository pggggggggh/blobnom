import {create} from 'zustand';

interface SearchState {
    search: string;
    page: number;
    activeOnly: boolean;
    myRoomOnly: boolean;
    setSearch: (value: string) => void;
    setPage: (page: number) => void;
    setActiveOnly: (checked: boolean) => void;
    setMyRoomOnly: (checked: boolean) => void;
}

export const useSearchStore = create<SearchState>()((set) => ({
    search: '',
    page: 1,
    activeOnly: false,
    myRoomOnly: false,

    setSearch: (value) => set({search: value, page: 1}),
    setPage: (page) => set({page}),
    setActiveOnly: (checked) => set({activeOnly: checked, page: 1}),
    setMyRoomOnly: (checked) => set({myRoomOnly: checked, page: 1}),
}));
