import { Color } from "../../core/misc";

export interface IKanbanBoard {
    kind: "kanbanboard"
    workspaceId: string
    id: string
    title: string
    description: string
    createdAt: string
    createdBy: string
    createdByName: string
    lastModified: string
    lastModifiedByName: string
    color: Color
    annotations: string
}
