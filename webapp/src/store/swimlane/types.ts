import { ILane } from "../../core/lane";


export interface ISwimlane extends ILane{
    kind: "swimlane"
    boardId: string
}