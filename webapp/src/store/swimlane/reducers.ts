import { ISwimlane } from "./types";
import { Actions, ActionTypes } from "./actions";
import { sortSwimlanes, filterSwimlanesOnBoard } from './selectors'
import { Rank } from "../../core/lexorank";


export interface State {
    items: ISwimlane[]
}

export const initialState: State = {
    items: []
}

export function reducer(state: State = initialState, action: Actions) {
    switch(action.type) {
        case ActionTypes.CREATE_SWIMLANE: {
            const ms = action.payload
            const ll = sortSwimlanes(filterSwimlanesOnBoard(state.items, ms.boardId))
            ms.rank = ll.length === 0 ? Rank("", "").rank : Rank(ll[ll.length - 1].rank, "").rank
            return {
                ...state,
                items: [...state.items, ms]
            }
        }
        default:{
                return state
            }
    }
}