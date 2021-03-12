package main

import (
	"github.com/pkg/errors"
)

// KanbanRepository ...
type KanbanRepository interface {
	GetKanbanBoard(workspaceID string, boardID string) (*KanbanBoard, error)
	FindKanbanBoardsByWorkspace(workspaceID string) ([]*KanbanBoard, error)
	StoreKanbanBoard(x *KanbanBoard)

	GetSwimLane(workspaceID string, swimlaneID string) (*SwimLane, error)
	FindSwimlanesByBoard(workspaceID string, boardID string) ([]*SwimLane, error)
	StoreSwimLane(x *SwimLane)
}

// KanbanBoard

func (a *repo) GetKanbanBoard(workspaceID string, boardID string) (*KanbanBoard, error) {
	x := &KanbanBoard{}
	if err := a.tx.Get(x, "SELECT * FROM kanbanboards WHERE workspace_id = $1 AND id = $2", workspaceID, boardID); err != nil {
		return nil, errors.Wrap(err, "no boards found")
	}
	return x, nil
}

func (a *repo) FindKanbanBoardsByWorkspace(workspaceID string) ([]*KanbanBoard, error) {
	x := []*KanbanBoard{}
	err := a.tx.Select(&x, "SELECT * FROM kanbanboards WHERE workspace_id = $1", workspaceID)
	if err != nil {
		return nil, errors.Wrap(err, "no boards found")
	}
	return x, nil
}

const storeKanbanBoardQuery = "INSERT INTO kanbanboards (workspace_id, id, title, created_at, created_by_name, description, last_modified, last_modified_by_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (workspace_id, id) DO UPDATE SET title = $3, description = $6, last_modified = $7, last_modified_by_name = $8"

func (a *repo) StoreKanbanBoard(x *KanbanBoard) {
	a.tx.MustExec(storeKanbanBoardQuery,
		x.WorkspaceID,
		x.ID,
		x.Title,
		x.CreatedAt,
		x.CreatedByName,
		x.Description,
		x.LastModified,
		x.LastModifiedByName)
}

// SwimLane

func (a *repo) GetSwimLane(workspaceID string, swimlaneID string) (*SwimLane, error) {
	x := &SwimLane{}

	return x, nil
}

const storeSwimLaneQuery = "INSERT INTO swimlanes (workspace_id, board_id, id, title, rank, created_at, created_by_name, description, last_modified, last_modified_by_name, color) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (workspace_id, id) DO UPDATE SET title = $4, description = $8, last_modified = $9, last_modified_by_name = $10, color = $11"

func (a *repo) StoreSwimLane(x *SwimLane) {
	a.tx.MustExec(storeSwimLaneQuery,
		x.WorkspaceID,
		x.BoardID,
		x.ID,
		x.Title,
		x.Rank,
		x.CreatedAt,
		x.CreatedByName,
		x.Description,
		x.LastModified,
		x.LastModifiedByName,
		x.Color)
}

func (a *repo) FindSwimlanesByBoard(workspaceID string, boardID string) ([]*SwimLane, error) {
	x := []*SwimLane{}
	err := a.tx.Select(&x, "SELECT * FROM swimlanes WHERE workspace_id = $1 AND board_id = $2", workspaceID, boardID)
	if err != nil {
		return nil, errors.Wrap(err, "no no swimlanes found")
	}
	return x, nil
}
