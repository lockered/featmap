import { IKanbanBoard } from "./types";
import { Actions, ActionTypes } from "./actions";


export interface State {
    items: IKanbanBoard[]
}

export const initialState: State = {
    items: []
}

export function reducer(state: State = initialState, action: Actions) {
    switch (action.type) {
        case ActionTypes.CREATE_KANBANBOARD: {
            const kanbanboard = action.payload
            return {
                ...state,
                items: [...state.items, kanbanboard]
            }
        }
        case ActionTypes.LOAD_KANBANBOARDS: {
            const kanbanboard = action.payload.map(x => ({ ...x, kind: "kanbanboard" } as IKanbanBoard)) // tag them appropriately            
            return {
                ...state,
                items: kanbanboard
            }
        }
        default: {
            return state
        }
    }
}