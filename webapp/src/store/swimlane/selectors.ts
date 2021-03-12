import { AppState } from "..";
import { createSelector } from 'reselect'
import { ISwimlane } from "./types";

const getSwimlaneState = ((state: AppState) => state.swimlanes)

export const swimlanes = createSelector([getSwimlaneState], s => {
    return sortSwimlanes(s.items)
})

export const sortSwimlanes = ( sl: ISwimlane[]) => {
    return sl.sort(function(a,b) {
        return a.rank === b.rank ? 0 : +(a.rank > b.rank) || -1
    })
}

export const filterSwimlanesOnBoard = (sl: ISwimlane[], boardId: string) => {
    return sl.filter(f => f.boardId === boardId)
}
