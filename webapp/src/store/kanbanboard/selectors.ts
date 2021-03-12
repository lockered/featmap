import { IKanbanBoard } from './types'
import { AppState } from '..'
import { createSelector } from 'reselect'

const getKanbanBoardState = ((state: AppState) => state.kanbanBoards)

export const kanbanBoards = createSelector([getKanbanBoardState], s => {
    return s.items
})

export const getKanbanBoardById = (kb: IKanbanBoard[], id: string) => kb.find(x => x.id === id)

