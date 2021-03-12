import { IKanbanBoard } from "./types"
import { action } from 'typesafe-actions'
import { v4 as uuid } from 'uuid'
import { Dispatch } from "react";
import { API_GET_KANBANBOARDS, API_CREATE_KANBANBOARD } from "../../api"
import { AllActions } from "..";

export enum ActionTypes {
    CREATE_KANBANBOARD = 'CREATE_KANBANBOARD',
    LOAD_KANBANBOARDS = 'LOAD_KANBANBOARDS',
}

export interface createKanbanBoard { type: ActionTypes.CREATE_KANBANBOARD, payload: IKanbanBoard }
export const createKanbanBoard = (x: IKanbanBoard) => action(ActionTypes.CREATE_KANBANBOARD, x)

export interface loadKanbanBoards{ type: ActionTypes.LOAD_KANBANBOARDS, payload: IKanbanBoard[] }
export const loadKanbanBoards = (x: IKanbanBoard[]) => action(ActionTypes.LOAD_KANBANBOARDS, x)

export type Actions = createKanbanBoard | loadKanbanBoards

export const loadKanbanBordsRequest = (dispatch: Dispatch<AllActions>) => {
    return (workspaceId: string) => {

        return API_GET_KANBANBOARDS(workspaceId)
            .then(response => {
                if (response.ok) {
                    response.json().then((data: IKanbanBoard[]) => {
                        dispatch(loadKanbanBoards(data))
                    })
                }
            }
            )
    }
}

export const createKanbanBordRequest = (dispatch: Dispatch<AllActions>) => {
    return (workspaceId: string, title: string) => {

        const kanbanId = uuid()

        return API_CREATE_KANBANBOARD(workspaceId, kanbanId, title)
            .then(response => {
                if (response.ok) {
                    response.json().then((data: IKanbanBoard) => {
                        dispatch(createKanbanBoard(data))
                    })
                }
            }
            )
    }
}

