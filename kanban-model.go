package main

import "time"

// KanbanBoard ...
type KanbanBoard struct {
	WorkspaceID        string    `db:"workspace_id" json:"workspaceId"`
	ID                 string    `db:"id" json:"id"`
	Title              string    `db:"title" json:"title"`
	Description        string    `db:"description" json:"description"`
	CreatedByName      string    `db:"created_by_name" json:"createdByName"`
	CreatedAt          time.Time `db:"created_at" json:"createdAt"`
	LastModified       time.Time `db:"last_modified" json:"lastModified"`
	LastModifiedByName string    `db:"last_modified_by_name" json:"lastModifiedByName"`
	ExternalLink       string    `db:"external_link" json:"externalLink"`
	Annotations        string    `db:"annotations" json:"annotations"`
}

// SwimLane ...
type SwimLane struct {
	WorkspaceID        string    `db:"workspace_id" json:"workspaceId"`
	BoardID            string    `db:"board_id" json:"boardId"`
	ID                 string    `db:"id" json:"id"`
	Title              string    `db:"title" json:"title"`
	Description        string    `db:"description" json:"description"`
	Rank               string    `db:"rank" json:"rank"`
	CreatedByName      string    `db:"created_by_name" json:"createdByName"`
	CreatedAt          time.Time `db:"created_at" json:"createdAt"`
	LastModified       time.Time `db:"last_modified" json:"lastModified"`
	LastModifiedByName string    `db:"last_modified_by_name" json:"lastModifiedByName"`
	Color              string    `db:"color" json:"color"`
}
