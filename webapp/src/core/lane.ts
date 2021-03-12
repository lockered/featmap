
import { ISwimlane } from "../store/swimlane/types";

export interface ILane {
    workspaceId: string
    id: string
    title: string
    description: string
    rank: string
    createdAt: string
    createdBy: string
    createdByName: string
    lastModified: string
    lastModifiedByName: string
}

export type EntityTypes = ISwimlane