import { ISwimlane } from "./types"
import { action } from "typesafe-actions"

export enum ActionTypes {
    CREATE_SWIMLANE = 'CREATE_SWIMLANE',
    LOAD_SWIMLANES = 'LOAD_SWIMLANES',
    MOVE_SWIMLANE = 'MOVE_SWIMLANE'
}

export interface createSwimlane { type: ActionTypes.CREATE_SWIMLANE, payload: ISwimlane }
export const createSwimlane = (x: ISwimlane) => action(ActionTypes.CREATE_SWIMLANE, x)

export interface loadSwimlanes  { type: ActionTypes.LOAD_SWIMLANES, payload: ISwimlane[] }
export const loadSwimlanes = (x: ISwimlane[]) => action(ActionTypes.LOAD_SWIMLANES, x)

interface moveSwimlanePayload { id: string, index: number, ts: string, by: string }
export interface moveSwimlane { type: ActionTypes.MOVE_SWIMLANE, payload: moveSwimlanePayload }
export const moveSwimlane = (x: moveSwimlanePayload) => action(ActionTypes.MOVE_SWIMLANE, x)

export type Actions = createSwimlane | loadSwimlanes | moveSwimlane